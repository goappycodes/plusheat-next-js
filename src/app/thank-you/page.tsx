import type { Metadata } from "next";
import Link from "next/link";
import { Stepper } from "@/components/checkout/Stepper";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PLANS, levelFromName, planInclusions } from "@/lib/catalog";
import { money } from "@/lib/pricing";
import { PHONE_EMERGENCY, PHONE_SALES } from "@/lib/site";
import { getHostedPage, zohoConfigured } from "@/lib/zoho";

export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };

/**
 * Confirmation step. Zoho redirects here with ?hostedpage_id=… after payment;
 * the subscription is read back from the hosted page (thank-you.php
 * [get_order_product_details]). Zoho amounts are before VAT, so x1.2.
 */
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const id = String((Array.isArray(sp.hostedpage_id) ? sp.hostedpage_id[0] : sp.hostedpage_id) ?? "").slice(0, 120);

  let sub: NonNullable<NonNullable<Awaited<ReturnType<typeof getHostedPage>>["data"]>["subscription"]> | undefined;
  if (id && zohoConfigured("billing")) {
    try {
      const res = await getHostedPage(id);
      sub = res.data?.subscription;
    } catch (e) {
      console.error("[zoho] hosted page read failed", e);
    }
  }

  const row = sub ? PLANS.find((p) => p.code === sub!.plan.plan_code) : undefined;
  const level = row ? levelFromName(row.name) : null;
  const includes = level && row ? planInclusions(level, row.customer, row.service) : [];
  const duration = sub?.interval_unit === "years" ? "yearly" : "monthly";
  const total = sub ? money(Number(sub.sub_total) * 1.2) : null;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader simplified />
      <main>
        <Stepper step={3} />
        <section className="mx-auto max-w-[1100px] pb-20 pt-5 min-[992px]:pt-10">
          <div className="container-ph">
            <div className="flex flex-col gap-[30px] min-[992px]:flex-row">
              <div className="min-w-0 rounded-[30px] bg-white px-6 py-10 shadow-[var(--shadow-plan)] min-[992px]:flex-[0_0_calc(66.666%-15px)] min-[481px]:px-[30px]">
                <h1 className="mb-4 mt-0 text-[32px] font-semibold leading-[1.1] text-heading min-[481px]:text-[36px]">
                  Thank you{sub?.customer?.first_name ? `, ${sub.customer.first_name}` : ""}! <span className="text-primary">You&apos;re covered.</span>
                </h1>
                <p className="m-0 text-[16px] leading-[1.6]">
                  {sub
                    ? "Your PlusHeat plan is set up. We've emailed your welcome pack and plan documents — keep them handy."
                    : "Thank you for choosing PlusHeat. Your plan is being set up and we'll email your welcome pack and plan documents shortly."}
                </p>
                {sub?.customer?.cf_reference_number && (
                  <p className="mb-0 mt-6 rounded-[15px] bg-secondary p-5 text-heading">
                    Your reference number: <strong className="text-primary">{sub.customer.cf_reference_number}</strong>
                  </p>
                )}
                <div className="mt-8 grid grid-cols-1 gap-4 min-[641px]:grid-cols-2">
                  <div className="rounded-[20px] bg-soft p-5">
                    <div className="mb-1 font-semibold text-heading">Need to book a repair?</div>
                    <p className="m-0 text-[14px]">
                      There is a 28-day exclusion period from your start date. Emergency breakdown line:{" "}
                      <a href={`tel:${PHONE_EMERGENCY.replace(/\s/g, "")}`} className="font-medium text-primary">
                        {PHONE_EMERGENCY}
                      </a>
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-soft p-5">
                    <div className="mb-1 font-semibold text-heading">Questions about your plan?</div>
                    <p className="m-0 text-[14px]">
                      Call us on{" "}
                      <a href={`tel:${PHONE_SALES.replace(/\s/g, "")}`} className="font-medium text-primary">
                        {PHONE_SALES}
                      </a>{" "}
                      (Mon-Fri 09:00 – 17:00).
                    </p>
                  </div>
                </div>
                <Link href="/" className="mt-8 inline-block rounded-2xl bg-button px-8 pb-[18px] pt-4 text-[18px] font-medium text-white">
                  Back to home
                </Link>
              </div>

              <div className="min-w-0 rounded-[30px] bg-white p-[30px] shadow-[var(--shadow-plan)] min-[992px]:flex-[0_0_calc(33.333%-15px)]">
                <h3 className="mb-5 mt-0 text-[30px] font-semibold leading-none text-heading">
                  Plan <span className="text-primary">Summary</span>
                </h3>
                {sub ? (
                  <>
                    <div className="mb-4 text-[20px] text-heading">{sub.plan.name}</div>
                    {row && (
                      <div className="mb-4">
                        <div className="text-[14px] font-semibold text-heading">Call-out Level</div>
                        <div className="text-[14px]">£{row.fee} per call-out</div>
                      </div>
                    )}
                    {includes.length > 0 && (
                      <div className="mb-4">
                        <div className="mb-2 text-[14px] font-semibold text-heading">Coverage Summary</div>
                        <ul className="m-0 list-none p-0">
                          {includes.map((i) => (
                            <li key={i} className="tick-li mb-[10px] flex items-center gap-[9px] text-[14px] leading-[1.1]">
                              {i}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="border-t border-soft pt-4">
                      <div className="text-[14px] font-semibold text-heading">{duration === "yearly" ? "Yearly" : "Monthly"} Price</div>
                      <div className="text-[30px] font-semibold text-primary">
                        £{total}
                        <span className="text-[16px]">{duration === "yearly" ? "/yr" : "/mo"}</span>
                      </div>
                      {sub.start_date && <div className="mt-2 text-[14px]">Starts {new Date(sub.start_date).toLocaleDateString("en-GB")}</div>}
                    </div>
                  </>
                ) : (
                  <p className="m-0 text-[14px]">Your plan details will appear in your welcome email.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
