/**
 * Offer settings.
 *
 * Site-wide offer = WordPress General Settings > Plan Table > "Site-wide offer"
 * (ACF options_offer_*, values as on live 2026-11-06). The coupon *codes* are
 * configured here; their *values* (percentage, how many months) are read
 * from Zoho Billing at runtime, so changing a coupon in Zoho changes the site.
 *
 * Every value can be overridden with an environment variable, so marketing
 * can switch offers on Vercel without a code change.
 */
import type { Customer } from "@/lib/catalog";

const env = (k: string, d: string) => (process.env[k] ?? "").trim() || d;

export const SITE_OFFER = {
  monthlyCoupon: env("OFFER_MONTHLY_COUPON", "MHP3"), // 3 months half price
  yearlyCoupon: env("OFFER_ANNUAL_COUPON", "MF2"), // 2 months free (Zoho: one-time 16.67%)
  /** Fallback % when the monthly coupon can't be read from Zoho (offer_monthly_percent). */
  monthlyPercentFallback: Number(env("OFFER_MONTHLY_PERCENT", "50")),
  monthlyBadge: env("OFFER_MONTHLY_BADGE", "3 months half price"),
  monthlyDiscountText: env("OFFER_MONTHLY_DISCOUNT_TEXT", "For the first 3 months*"),
  /** %s = struck-through monthly price */
  monthlyTerms: env("OFFER_MONTHLY_TERMS", "For the first 3 months, then %s/mo"),
  annualBadge: env("OFFER_ANNUAL_BADGE", "2 months free"),
  annualTerms: env("OFFER_ANNUAL_TERMS", "Two months FREE"),
};

export const DEFAULT_PLAN_FEE = 99;
export const DEFAULT_FEES = [0, 59, 99];

/** Per-page "Plan Selection" settings (page ACF fields on live). */
export interface PlanPageConfig {
  slug: string;
  path: string;
  customer: Customer;
  fees: number[];
  defaultFee: number;
  title: string;
  titleAccent: string;
  subtitle: string;
  /** show_annual_as_monthly: annual cards show the per-month price + "billed annually, SAVE £X" */
  showAnnualAsMonthly: boolean;
  /** "Terms & exclusions" link under each card (not on landlord tables). */
  showTermsLink: boolean;
  monthlyCoupon?: string;
  yearlyCoupon?: string;
  annualOfferBubble?: string;
}

const SUBTITLE = "Every plan includes a free annual boiler service. You pick what you need to protect.";

export const PLAN_PAGES: Record<string, PlanPageConfig> = {
  "boiler-cover": {
    slug: "boiler-cover",
    path: "/boiler-cover",
    customer: "homeowner",
    fees: DEFAULT_FEES,
    defaultFee: DEFAULT_PLAN_FEE,
    title: "Choose your cover",
    titleAccent: "your cover",
    subtitle: SUBTITLE,
    showAnnualAsMonthly: true,
    showTermsLink: true,
  },
  "landlord-cover": {
    slug: "landlord-cover",
    path: "/landlord-cover",
    customer: "landlord",
    fees: DEFAULT_FEES,
    defaultFee: DEFAULT_PLAN_FEE,
    title: "Landlord cover plans",
    titleAccent: "cover plans",
    subtitle: SUBTITLE,
    showAnnualAsMonthly: true,
    showTermsLink: false,
  },
};

export function pageConfig(slug: string | undefined | null): PlanPageConfig {
  return PLAN_PAGES[slug ?? ""] ?? PLAN_PAGES["boiler-cover"];
}

/** get_plan_discount_coupon() for the default plan tables (gas boilers, no partner). */
export function planCoupon(duration: "monthly" | "yearly", page: PlanPageConfig, boiler = "gas"): string {
  if (boiler !== "gas") return "";
  return duration === "monthly"
    ? (page.monthlyCoupon ?? SITE_OFFER.monthlyCoupon)
    : (page.yearlyCoupon ?? SITE_OFFER.yearlyCoupon);
}
