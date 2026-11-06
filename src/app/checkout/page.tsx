import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { pageConfig } from "@/lib/offers";
import { buildCheckoutModel } from "@/lib/plans-view";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

/**
 * /checkout?plan=<plan id>&from=<plan page>&start=<monthly|yearly>
 * (replaces /checkout/?add-to-cart=<id> + the WooCommerce cart session).
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) ?? "";
  // Old WordPress links: /checkout/?add-to-cart=139
  const planId = Number(one("plan") || one("add-to-cart"));
  const from = one("from") || "boiler-cover";
  const start = one("start") === "yearly" ? "yearly" : one("start") === "monthly" ? "monthly" : undefined;

  const model = planId ? await buildCheckoutModel(planId, pageConfig(from), start) : null;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader simplified />
      <main>
        {model ? (
          <CheckoutFlow model={model} />
        ) : (
          <div className="container-ph py-24 text-center">
            <h1 className="mb-4 text-[32px] font-semibold text-heading">Plan not found</h1>
            <p className="mb-8">
              Please try again or go{" "}
              <Link href="/" className="text-primary underline">
                back to homepage
              </Link>
              .
            </p>
            <Link href="/boiler-cover#plans_section" className="inline-block rounded-2xl bg-button px-8 py-4 text-white">
              Choose a plan
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
