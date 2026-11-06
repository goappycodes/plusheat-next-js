import "server-only";
import { unstable_cache } from "next/cache";
import snapshot from "@/data/zoho-price-snapshot.json";

/**
 * Zoho API client (Billing / Subscriptions + CRM).
 *
 * Same data centre and organisation as the WordPress integration
 * (zoho_custom.php): accounts.zoho.com, www.zohoapis.com, org 677567221.
 *
 * Access tokens are cached for 50 minutes (Zoho issues them for 60) in the
 * Next.js data cache, so a deployment mints at most ~1 token per hour per
 * credential set — per-request minting trips Zoho's token throttle (code 14),
 * which is the bug zoho_custom.php had to work around.
 */

const ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com";
const API_URL = process.env.ZOHO_API_URL || "https://www.zohoapis.com";
const ORG_ID = process.env.ZOHO_ORG_ID || "677567221";

type Cred = "billing" | "crm";

function credentials(which: Cred) {
  if (which === "billing") {
    return {
      clientId: process.env.ZOHO_BILLING_CLIENT_ID,
      clientSecret: process.env.ZOHO_BILLING_CLIENT_SECRET,
      refreshToken: process.env.ZOHO_BILLING_REFRESH_TOKEN,
    };
  }
  return {
    clientId: process.env.ZOHO_CRM_CLIENT_ID,
    clientSecret: process.env.ZOHO_CRM_CLIENT_SECRET,
    refreshToken: process.env.ZOHO_CRM_LEADS_REFRESH_TOKEN,
  };
}

export function zohoConfigured(which: Cred = "billing") {
  // ZOHO_OFFLINE=true: use the price snapshot / coupon fallbacks (local UI work).
  if (process.env.ZOHO_OFFLINE === "true") return false;
  const c = credentials(which);
  return Boolean(c.clientId && c.clientSecret && c.refreshToken);
}

async function mintToken(which: Cred): Promise<string> {
  const c = credentials(which);
  if (!c.clientId || !c.clientSecret || !c.refreshToken) {
    throw new Error(`Zoho ${which} credentials are not configured`);
  }
  const params = new URLSearchParams({
    refresh_token: c.refreshToken,
    client_id: c.clientId,
    client_secret: c.clientSecret,
    grant_type: "refresh_token",
  });
  const res = await fetch(`${ACCOUNTS_URL}/oauth/v2/token?${params}`, {
    method: "POST",
    cache: "no-store",
  });
  const json = (await res.json()) as { access_token?: string; error?: string };
  if (!json.access_token) throw new Error(`Zoho token error: ${json.error ?? res.status}`);
  return json.access_token;
}

const cachedToken = unstable_cache(async (which: Cred) => mintToken(which), ["zoho-access-token-v1"], {
  revalidate: 3000,
  tags: ["zoho-token"],
});

// Per-instance guards so a burst of requests never turns into a burst of token
// mints: one in-flight mint per credential, a 5-minute back-off after Zoho
// refuses ("Access Denied" = token throttle), and at most one forced re-mint
// a minute.
const memo: Partial<Record<Cred, { token: string; at: number }>> = {};
const inflight: Partial<Record<Cred, Promise<string>>> = {};
const failUntil: Partial<Record<Cred, number>> = {};
const lastForced: Partial<Record<Cred, number>> = {};

async function accessToken(which: Cred, force = false): Promise<string> {
  const now = Date.now();
  if ((failUntil[which] ?? 0) > now) throw new Error(`Zoho ${which} token backing off`);
  const m = memo[which];
  if (force && (lastForced[which] ?? 0) > now - 60_000) force = false;
  if (!force && m && now - m.at < 45 * 60 * 1000) return m.token;
  if (inflight[which]) return inflight[which]!;

  if (force) lastForced[which] = now;
  const p = (force ? mintToken(which) : cachedToken(which))
    .then((token) => {
      memo[which] = { token, at: Date.now() };
      return token;
    })
    .catch((e) => {
      failUntil[which] = Date.now() + 5 * 60 * 1000;
      throw e;
    })
    .finally(() => {
      delete inflight[which];
    });
  inflight[which] = p;
  return p;
}

export interface ZohoResponse {
  code: number;
  message: string;
  [key: string]: unknown;
}

/** Calls a Zoho API with the cached token; retries once with a fresh token on auth errors. */
export async function zohoRequest<T extends ZohoResponse>(
  which: Cred,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const doCall = async (token: string) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: init.method ?? "GET",
      cache: "no-store",
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json;charset=UTF-8",
        ...(which === "billing" ? { "X-com-zoho-subscriptions-organizationid": ORG_ID } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const text = await res.text();
    let json: T;
    try {
      json = JSON.parse(text) as T;
    } catch {
      json = { code: res.status, message: text.slice(0, 300) } as T;
    }
    return { status: res.status, json };
  };

  const first = await doCall(await accessToken(which));
  const { status } = first;
  let { json } = first;
  // 401 / code 57 = the cached token is no longer valid: re-mint once.
  if (status === 401 || json.code === 57) {
    ({ json } = await doCall(await accessToken(which, true)));
  }
  return json;
}

/* ------------------------------------------------------------------ */
/* Billing: plan prices                                                */
/* ------------------------------------------------------------------ */

export interface PriceBook {
  /** plan_code -> recurring price before VAT, as stored in Zoho */
  exVat: Record<string, number>;
  source: "zoho" | "snapshot";
  fetchedAt: string;
}

interface ZohoPlan {
  plan_code: string;
  recurring_price: number;
  status: string;
}

async function fetchPriceBook(): Promise<PriceBook> {
  const exVat: Record<string, number> = {};
  for (let page = 1; page < 20; page++) {
    const res = await zohoRequest<ZohoResponse & { plans?: ZohoPlan[]; page_context?: { has_more_page?: boolean } }>(
      "billing",
      `/billing/v1/plans?per_page=200&page=${page}`,
    );
    if (res.code !== 0) throw new Error(`Zoho plans: ${res.code} ${res.message}`);
    for (const p of res.plans ?? []) exVat[p.plan_code.trim()] = Number(p.recurring_price);
    if (!res.page_context?.has_more_page) break;
  }
  return { exVat, source: "zoho", fetchedAt: new Date().toISOString() };
}

function snapshotPriceBook(): PriceBook {
  const exVat: Record<string, number> = {};
  for (const [code, p] of Object.entries(snapshot.plans as Record<string, { exVat: number }>)) {
    exVat[code] = p.exVat;
  }
  return { exVat, source: "snapshot", fetchedAt: snapshot.fetchedAt };
}

const cachedPriceBook = unstable_cache(fetchPriceBook, ["zoho-price-book-v1"], {
  revalidate: 3600,
  tags: ["zoho-prices"],
});

/**
 * All Zoho plan prices (cached for an hour). Falls back to the snapshot in
 * src/data/zoho-price-snapshot.json when Zoho is not configured or fails, so
 * pages always render.
 */
export async function getPriceBook(): Promise<PriceBook> {
  if (!zohoConfigured("billing")) return snapshotPriceBook();
  try {
    const book = await cachedPriceBook();
    // Zoho wins; the snapshot only fills a code Zoho did not return.
    return { ...book, exVat: { ...snapshotPriceBook().exVat, ...book.exVat } };
  } catch (e) {
    console.error("[zoho] price book failed, using snapshot", e);
    return snapshotPriceBook();
  }
}

/* ------------------------------------------------------------------ */
/* Billing: coupons                                                    */
/* ------------------------------------------------------------------ */

export interface CouponInfo {
  code: string;
  discountBy: "percentage" | "flat" | string;
  value: number;
  type: "one_time" | "duration" | "forever" | string;
  duration: number;
  status: string;
}

/** Known values (checked in Zoho 2026-11-06), used only when Zoho is unreachable. */
const COUPON_FALLBACK: Record<string, Omit<CouponInfo, "code">> = {
  MF2: { discountBy: "percentage", value: 16.67, type: "one_time", duration: -1, status: "active" },
  MHP3: { discountBy: "percentage", value: 50, type: "duration", duration: 3, status: "active" },
  "3MFAP": { discountBy: "percentage", value: 25, type: "one_time", duration: -1, status: "active" },
  "1MFAP": { discountBy: "percentage", value: 8.334, type: "one_time", duration: -1, status: "active" },
  "1MFEAP": { discountBy: "percentage", value: 8.33, type: "one_time", duration: -1, status: "active" },
};

const cachedCoupon = unstable_cache(
  async (code: string): Promise<CouponInfo | null> => {
    const res = await zohoRequest<
      ZohoResponse & {
        coupon?: { discount_by: string; discount_value: number; type: string; duration: number; status: string };
      }
    >("billing", `/billing/v1/coupons/${encodeURIComponent(code)}`);
    if (res.code !== 0 || !res.coupon) return null;
    return {
      code,
      discountBy: res.coupon.discount_by,
      value: Number(res.coupon.discount_value),
      type: res.coupon.type,
      duration: Number(res.coupon.duration),
      status: res.coupon.status,
    };
  },
  ["zoho-coupon-v1"],
  { revalidate: 86400, tags: ["zoho-coupons"] },
);

/** zoho_get_coupon(): the coupon as Zoho holds it (cached for a day). */
export async function getCoupon(code: string): Promise<CouponInfo | null> {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  const fallback = COUPON_FALLBACK[c] ? { code: c, ...COUPON_FALLBACK[c] } : null;
  if (!zohoConfigured("billing")) return fallback;
  try {
    return (await cachedCoupon(c)) ?? fallback;
  } catch (e) {
    console.error("[zoho] coupon failed", c, e);
    return fallback;
  }
}

/* ------------------------------------------------------------------ */
/* Billing: hosted pages                                               */
/* ------------------------------------------------------------------ */

export interface HostedPageResponse extends ZohoResponse {
  hostedpage?: { hostedpage_id: string; url: string; status?: string };
}

export async function createNewSubscriptionHostedPage(payload: unknown) {
  return zohoRequest<HostedPageResponse>("billing", "/billing/v1/hostedpages/newsubscription", {
    method: "POST",
    body: payload,
  });
}

export interface HostedPageDetails extends ZohoResponse {
  data?: {
    subscription?: {
      subscription_id: string;
      subscription_number: string;
      status: string;
      interval_unit: string;
      start_date: string;
      sub_total: number;
      amount: number;
      plan: { name: string; plan_code: string; price: number; total: number; quantity: number };
      addons?: { name: string; price: number; total: number }[];
      coupon?: { coupon_code: string; discount_amount?: number };
      customer?: {
        first_name: string;
        last_name: string;
        email: string;
        cf_reference_number?: string;
        billing_address?: { street: string; city: string; zip: string; state: string };
      };
    };
  };
  status?: string;
}

export async function getHostedPage(id: string) {
  return zohoRequest<HostedPageDetails>("billing", `/billing/v1/hostedpages/${encodeURIComponent(id)}`);
}

/* ------------------------------------------------------------------ */
/* CRM: leads                                                          */
/* ------------------------------------------------------------------ */

export interface LeadInput {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  description: string;
  leadStatus: string;
  leadSource: string;
  leadForm: string;
  initialLeadSource: string;
  audience: string;
  clickId: string; // "Google - xxx" / "Meta - xxx" / "Microsoft Bing - xxx"
}

/** create_lead_in_crm(): upsert a Lead (fires CRM workflows). */
export async function upsertCrmLead(l: LeadInput) {
  if (!zohoConfigured("crm") || process.env.ZOHO_CRM_LEADS_ENABLED !== "true") {
    return { skipped: true };
  }
  const data: Record<string, string> = {
    Phone: l.phone,
    First_Name: l.firstName,
    Last_Name: l.lastName,
    Email: l.email,
    Lead_Status: l.leadStatus,
    Lead_Source: l.leadSource,
    Lead_Form: l.leadForm,
    Description: l.description,
    Initial_Lead_Source: l.initialLeadSource,
    Audience: l.audience,
    GCLID_Value: l.clickId,
    User_Click_IDs: l.clickId,
  };
  if (l.clickId) data["$gclid"] = l.clickId.replace(/^[^-]+ - /, "");
  return zohoRequest("crm", "/crm/v2/Leads/upsert", {
    method: "POST",
    body: { trigger: ["workflow"], data: [data] },
  });
}
