import { NextRequest, NextResponse } from "next/server";
import { upsertCrmLead } from "@/lib/zoho";

/**
 * POST /api/lead — the home page "Let's find the right solution" form
 * (Gravity Form 16 -> boiler_cover_to_zoho_crm() in lead-capture.php).
 */
const SOURCES: Record<string, string> = {
  "/boiler-cover-fb": "Meta Ads",
  "/boiler-cover-ms": "Bing Ads",
  "/boiler-cover-qa": "Quora Ads",
  "/boiler-cover-nd": "Nextdoor Ads",
};

const str = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const name = str(body.name, 80);
  const phone = str(body.phone, 20);
  const email = str(body.email);
  if (!name || !phone || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please fill in your name, phone number and a valid email." }, { status: 422 });
  }

  let path = "/";
  try {
    path = new URL(str(body.pageUrl, 300)).pathname.replace(/\/$/, "") || "/";
  } catch {}
  const source = SOURCES[path] ?? "PPC Form";

  const c = (n: string) => req.cookies.get(n)?.value ?? "";
  const ok = (v: string) => v && v !== "undefined";
  const clickId = ok(c("gclid")) ? `Google - ${c("gclid")}` : ok(c("fbclid")) ? `Meta - ${c("fbclid")}` : ok(c("mscklid")) ? `Microsoft Bing - ${c("mscklid")}` : "";

  try {
    const res = await upsertCrmLead({
      phone,
      firstName: "",
      lastName: name,
      email,
      description: "",
      leadStatus: "New",
      leadSource: source,
      leadForm: "",
      initialLeadSource: decodeURIComponent(c("zohoInitialLeadSource")),
      audience: "",
      clickId,
    });
    return NextResponse.json({ ok: true, skipped: "skipped" in res ? true : undefined });
  } catch (e) {
    console.error("[crm] lead failed", e);
    return NextResponse.json({ ok: false, error: "Sorry, something went wrong. Please call 0808 164 2892." }, { status: 502 });
  }
}
