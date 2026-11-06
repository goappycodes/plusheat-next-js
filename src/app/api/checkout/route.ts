import { NextRequest, NextResponse } from "next/server";
import { levelFromName, planById } from "@/lib/catalog";
import {
  AboutYou,
  formatPostcode,
  friendlyZohoError,
  normalisePhone,
  ukToday,
  validateAboutYou,
} from "@/lib/checkout";
import { pageConfig, planCoupon } from "@/lib/offers";
import { createNewSubscriptionHostedPage, upsertCrmLead, zohoConfigured } from "@/lib/zoho";

/**
 * POST /api/checkout — replaces zoho_custom.php.
 *
 * Re-derives the plan, plan code and coupon on the server from the plan ID
 * (never trusting prices or codes from the browser), then creates a Zoho
 * Billing hosted page (hostedpages/newsubscription). Zoho's hosted page takes
 * the card / Direct Debit (GoCardless) and creates the customer + subscription.
 */

const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 8;
}

function cookie(req: NextRequest, name: string): string {
  const v = req.cookies.get(name)?.value ?? "";
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

/** get_current_gclid(): "Google - …", else "Meta - …", else "Microsoft Bing - …". */
function clickId(req: NextRequest): string {
  const ok = (v: string) => v && v !== "undefined";
  const g = cookie(req, "gclid");
  const f = cookie(req, "fbclid");
  const m = cookie(req, "mscklid");
  if (ok(g)) return `Google - ${g}`;
  if (ok(f)) return `Meta - ${f}`;
  if (ok(m)) return `Microsoft Bing - ${m}`;
  return "";
}

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ code: 429, message: "Too many attempts. Please wait a minute and try again." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 400, message: "Invalid request." }, { status: 400 });
  }
  if (str(body.website)) return NextResponse.json({ code: 400, message: "Invalid request." }, { status: 400 });

  const plan = planById(Number(body.planId));
  if (!plan || !levelFromName(plan.name) || plan.planType !== "maintenance") {
    return NextResponse.json({ code: 404, message: "Plan not found. Please try again." }, { status: 404 });
  }
  const page = pageConfig(str(body.from));

  const about: AboutYou = {
    firstName: str(body.firstName, 60),
    lastName: str(body.lastName, 60),
    email: str(body.email, 120),
    phone: str(body.phone, 20),
    postcode: str(body.postcode, 10),
    address1: str(body.address1, 120),
    address2: str(body.address2, 120),
    town: str(body.town, 60),
    county: str(body.county, 60),
    country: str(body.country, 60) || "United Kingdom",
    startDate: str(body.startDate, 10) || ukToday(),
  };
  const errors = validateAboutYou(about);
  if (Object.keys(errors).length) {
    return NextResponse.json({ code: 422, message: "Please check the highlighted fields.", errors }, { status: 422 });
  }

  // plusheat_checkout_coupon(): the page's offer coupon for this duration. A
  // customer-typed code is only used when the plan has no automatic offer.
  const autoCoupon = planCoupon(plan.duration, page, plan.boiler);
  const coupon = autoCoupon || str(body.coupon, 30).toUpperCase();

  const firstName = about.firstName;
  const lastName = about.lastName;
  const displayName = `${firstName} ${lastName}`;
  const phone = normalisePhone(about.phone);
  const postcode = formatPostcode(about.postcode);
  const ownerType = plan.customer === "landlord" ? "Landlord" : "Homeowner";
  // Landlord property blocks (total_address_N): "L1 L2 town county country Zip:PC Date:dd/mm/yyyy".
  const property1 = plan.customer !== "landlord" ? "" : `${about.address1} ${about.address2} ${about.town} ${about.county} ${about.country} Zip:${postcode} Date:${about.startDate
    .split("-")
    .reverse()
    .join("/")}`.replace(/\s+/g, " ");

  let salesperson = cookie(req, "zohoSalesperson") || "Website";
  let leadSource = cookie(req, "zohoLeadSource") || "Website Visit";
  if (leadSource === "Website") leadSource = "Website Visit";
  if (!salesperson) salesperson = "Website";
  const initialLeadSource = cookie(req, "zohoInitialLeadSource");
  const audience = leadSource === "Pacifica" ? cookie(req, "audience") : "";
  const partnerJobId = leadSource === "Heatable" ? cookie(req, "ht_job_id") : "";
  const partnerQuoteId = leadSource === "Heatable" ? cookie(req, "ht_quote_id") : "";
  const nxRef = cookie(req, "nx_ref_earlier") && cookie(req, "nx_ref") ? "True" : "False";
  const gclid = clickId(req);

  let startsAt = about.startDate;
  if (leadSource === "Repair & Care PPC") {
    const d = new Date(`${startsAt}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 2);
    startsAt = d.toISOString().slice(0, 10);
  }

  // insert_checkout_log(): the "Checkout First Step" lead in Zoho CRM (abandoned checkout).
  const lead = upsertCrmLead({
    phone,
    firstName,
    lastName,
    email: about.email,
    description: `URL: ${req.nextUrl.origin}/checkout?plan=${plan.id}`,
    leadStatus: "New",
    leadSource: "Checkout First Step",
    leadForm: "Abandoned Checkout",
    initialLeadSource,
    audience,
    clickId: gclid,
  }).catch((e) => console.error("[crm] checkout lead failed", e));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const payload = {
    customer: {
      display_name: displayName,
      first_name: firstName,
      last_name: lastName,
      email: about.email,
      company_name: "",
      phone,
      billing_address: {
        attention: displayName,
        street: `${about.address1}, ${about.address2}`,
        city: about.town,
        state: about.county,
        country: about.country,
        zip: postcode,
      },
      ach_supported: true,
      custom_fields: [
        { label: "OwnerType", value: ownerType },
        { label: "Phone", value: phone },
        { label: "OrderNotes", value: "" },
        { label: "Property1", value: property1 },
        { label: "Property2", value: "" },
        { label: "Property3", value: "" },
        { label: "Property4", value: "" },
        { label: "Property5", value: "" },
        { label: "Quote_ID", value: "" },
        { label: "Boiler Age", value: "" },
        { label: "NeXarise Referred Direct", value: nxRef },
        { label: "Partner Job Id", value: partnerJobId },
        { label: "Partner Quote Id", value: partnerQuoteId },
        { label: "Audience", value: audience },
      ],
    },
    plan: { plan_code: plan.code, quantity: "1" },
    starts_at: startsAt,
    salesperson_name: salesperson,
    custom_fields: [
      { label: "OwnerType", value: ownerType },
      { label: "Phone", value: phone },
      { label: "OrderNotes", value: "" },
      { label: "Lead Source", value: leadSource },
      { label: "Property1", value: property1 },
      { label: "Property2", value: "" },
      { label: "Property3", value: "" },
      { label: "Property4", value: "" },
      { label: "Property5", value: "" },
    ],
    reference_id: "",
    coupon_code: coupon,
    redirect_url: `${siteUrl}/thank-you`,
  };

  if (!zohoConfigured("billing") || process.env.ZOHO_CHECKOUT_ENABLED !== "true") {
    await lead;
    return NextResponse.json(
      {
        code: 503,
        message:
          "Online checkout is not switched on for this environment. Please call 0808 164 2892 and our team will set up your cover.",
        debug: process.env.NODE_ENV === "development" ? { planCode: plan.code, coupon, startsAt } : undefined,
      },
      { status: 503 },
    );
  }

  try {
    const res = await createNewSubscriptionHostedPage(payload);
    await lead;
    if (res.code !== 0 || !res.hostedpage?.url) {
      console.error("[zoho] hosted page error", res.code, res.message, { plan: plan.code, coupon });
      return NextResponse.json({ code: res.code || 500, message: friendlyZohoError(res.message) }, { status: 400 });
    }
    return NextResponse.json({ code: 0, message: "success", url: res.hostedpage.url, planCode: plan.code, coupon });
  } catch (e) {
    console.error("[zoho] hosted page failed", e);
    return NextResponse.json(
      { code: 14, message: 'Sorry, we could not process the submission. Please click "Continue to Payment" again in a moment.' },
      { status: 502 },
    );
  }
}
