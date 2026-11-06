import "server-only";
import {
  COVER_LEVELS,
  CoverLevel,
  Duration,
  LEVELS,
  MOST_POPULAR,
  PLANS,
  PlanRow,
  TERMS_PDF,
  findPlan,
  levelFromName,
  planById,
  planInclusions,
  siblingPlan,
} from "@/lib/catalog";
import { PlanPageConfig, SITE_OFFER, planCoupon } from "@/lib/offers";
import {
  annualOfferBubble,
  annualSaving,
  couponFreeMonths,
  couponHalfPriceMonthsText,
  couponOfferText,
  discountPrice,
  grossFromZoho,
  money,
  round2,
  yearlyDiscountedPrice,
  yearlyPaymentMonths,
} from "@/lib/pricing";
import { CouponInfo, PriceBook, getCoupon, getPriceBook } from "@/lib/zoho";

/* ------------------------------------------------------------------ */
/* Offer, resolved against Zoho                                        */
/* ------------------------------------------------------------------ */

export interface ResolvedOffer {
  monthlyCoupon: string;
  monthlyPercent: number;
  monthlyBadge: string;
  monthlyTerms: string; // "%s" = price
  monthlyDiscountText: string;
  yearlyCoupon: string;
  yearlyPercent: number | null;
  yearlyMonths: number;
  annualBadge: string;
  annualTerms: string;
  bubble: string;
}

function percentOf(c: CouponInfo | null): number | null {
  return c && c.discountBy === "percentage" && c.status !== "expired" ? c.value : null;
}

/** The page's offer, with the coupon values (percentage, months) taken from Zoho. */
export async function resolveOffer(page: PlanPageConfig): Promise<ResolvedOffer> {
  const monthlyCoupon = planCoupon("monthly", page);
  const yearlyCoupon = planCoupon("yearly", page);
  const [mc, yc] = await Promise.all([getCoupon(monthlyCoupon), getCoupon(yearlyCoupon)]);

  const monthlyPercent = percentOf(mc) ?? SITE_OFFER.monthlyPercentFallback;
  const months = mc && mc.type === "duration" && mc.duration > 0 ? mc.duration : null;

  // Text follows the Zoho coupon (e.g. MHP3 = 50% for 3 months = "3 months half price").
  let monthlyBadge = SITE_OFFER.monthlyBadge;
  let monthlyTerms = SITE_OFFER.monthlyTerms;
  let monthlyDiscountText = couponHalfPriceMonthsText(monthlyCoupon) || SITE_OFFER.monthlyDiscountText;
  if (months) {
    const span = `${months} month${months === 1 ? "" : "s"}`;
    monthlyBadge = monthlyPercent === 50 ? `${span} half price` : `${monthlyPercent}% off for ${span}`;
    monthlyTerms = `For the first ${span}, then %s/mo`;
    monthlyDiscountText = `For the first ${span}*`;
  }

  const free = couponFreeMonths(yearlyCoupon);
  return {
    monthlyCoupon,
    monthlyPercent,
    monthlyBadge,
    monthlyTerms,
    monthlyDiscountText,
    yearlyCoupon,
    yearlyPercent: percentOf(yc),
    yearlyMonths: yearlyPaymentMonths(yearlyCoupon),
    annualBadge: free ? `${free} month${free === 1 ? "" : "s"} free` : SITE_OFFER.annualBadge,
    annualTerms: couponOfferText(yearlyCoupon) || SITE_OFFER.annualTerms,
    bubble: page.annualOfferBubble ?? annualOfferBubble(yearlyCoupon),
  };
}

export function grossPrice(book: PriceBook, plan: PlanRow | undefined): number | null {
  if (!plan) return null;
  const ex = book.exVat[plan.code];
  return typeof ex === "number" ? grossFromZoho(ex) : null;
}

const gbp = (x: number | string) => `£${typeof x === "number" ? money(x) : x}`;

/* ------------------------------------------------------------------ */
/* Plan cards (inc/plans/plans-cards.php)                              */
/* ------------------------------------------------------------------ */

export interface PriceBlock {
  struck?: string;
  main: string;
  unit: "/mo" | "/yr";
  tagline?: string;
  /** "billed annually, SAVE £X": the bold part */
  taglineStrong?: string;
}

export interface PlanCard {
  level: CoverLevel;
  planId: number;
  planCode: string;
  name: string;
  subtitle: string;
  discountPill?: string;
  labelPill?: string;
  highlighted: boolean;
  price: PriceBlock;
  inclusions: { text: string; included: boolean }[];
  termsUrl?: string;
}

export interface PlansTable {
  page: PlanPageConfig;
  bubble: string;
  /** key: `${duration}-${fee}` */
  cards: Record<string, PlanCard[]>;
}

function cardPrice(
  book: PriceBook,
  offer: ResolvedOffer,
  page: PlanPageConfig,
  plan: PlanRow,
): { price: PriceBlock; pill?: string } | null {
  const regular = grossPrice(book, plan);
  if (regular === null) return null;

  if (plan.duration === "monthly") {
    // plans_cards_get_plan_monthly_pricing_html()
    const discounted = offer.monthlyPercent > 0 ? discountPrice(regular, offer.monthlyPercent) : null;
    if (discounted === null) return { price: { main: gbp(regular), unit: "/mo" } };
    return {
      pill: offer.monthlyBadge,
      price: {
        struck: gbp(regular),
        main: gbp(discounted),
        unit: "/mo",
        tagline: offer.monthlyTerms.replace("%s", gbp(regular)),
      },
    };
  }

  // plans_cards_get_plan_yearly_pricing_html(): built from the monthly plan's price.
  const monthly = grossPrice(book, siblingPlan(plan, "monthly"));
  if (monthly === null || offer.yearlyMonths === 12) {
    return { price: { main: gbp(regular), unit: "/yr" } };
  }
  const original = round2(monthly * 12);
  const discounted = Number(yearlyDiscountedPrice(monthly, offer.yearlyMonths, offer.yearlyPercent));

  if (page.showAnnualAsMonthly) {
    return {
      pill: offer.annualBadge,
      price: {
        struck: gbp(monthly),
        main: gbp(round2(discounted / 12)),
        unit: "/mo",
        tagline: "billed annually, ",
        taglineStrong: `SAVE ${gbp(annualSaving(original, discounted))}`,
      },
    };
  }
  return {
    pill: offer.annualBadge,
    price: { struck: gbp(original), main: gbp(discounted), unit: "/yr", tagline: offer.annualTerms },
  };
}

export async function buildPlansTable(page: PlanPageConfig): Promise<PlansTable> {
  const [book, offer] = await Promise.all([getPriceBook(), resolveOffer(page)]);
  const cards: Record<string, PlanCard[]> = {};

  // Every card lists the fullest plan's items, greying out what it lacks.
  const allInclusions = planInclusions("platinum", page.customer);

  for (const duration of ["monthly", "yearly"] as Duration[]) {
    for (const fee of page.fees) {
      const list: PlanCard[] = [];
      for (const level of COVER_LEVELS) {
        const plan = findPlan({ level, duration, fee, customer: page.customer });
        if (!plan) continue;
        const priced = cardPrice(book, offer, page, plan);
        if (!priced) continue;
        const own = planInclusions(level, page.customer);
        list.push({
          level,
          planId: plan.id,
          planCode: plan.code,
          name: LEVELS[level].displayName,
          subtitle: LEVELS[level].subtitle,
          discountPill: priced.pill,
          labelPill: level === MOST_POPULAR ? "Most popular" : undefined,
          highlighted: level === MOST_POPULAR,
          price: priced.price,
          inclusions: allInclusions.map((text) => ({ text, included: own.includes(text) })),
          termsUrl: page.showTermsLink ? LEVELS[level].page : undefined,
        });
      }
      cards[`${duration}-${fee}`] = list;
    }
  }

  return { page, bubble: offer.bubble, cards };
}

/* ------------------------------------------------------------------ */
/* "Starting from" prices (home page pricing cards)                    */
/* ------------------------------------------------------------------ */

/** Lowest monthly price a customer sees for a plan family, after the monthly offer. */
export async function startingFromPrices(page: PlanPageConfig) {
  const [book, offer] = await Promise.all([getPriceBook(), resolveOffer(page)]);
  const lowest = (rows: PlanRow[], withOffer: boolean) => {
    let min: number | null = null;
    for (const r of rows) {
      const g = grossPrice(book, r);
      if (g === null) continue;
      const p = withOffer && offer.monthlyPercent > 0 ? discountPrice(g, offer.monthlyPercent) : g;
      if (min === null || p < min) min = p;
    }
    return min;
  };
  const cover = (customer: string) =>
    PLANS.filter(
      (p) =>
        ["Custom", "Standard", "Premium", "Platinum"].includes(p.name) &&
        p.customer === customer &&
        p.duration === "monthly" &&
        p.planType === "maintenance" &&
        p.boiler === "gas" &&
        p.service === "yes" &&
        [0, 59, 99].includes(p.fee),
    );
  // Repair & Care has no monthly discount (plans_cards_get_plan_pricing_html()).
  const repair = PLANS.filter((p) => p.name === "Repair Care" && p.duration === "monthly");
  return {
    homeowner: lowest(cover("homeowner"), true),
    landlord: lowest(cover("landlord"), true),
    repairCare: lowest(repair, false),
  };
}

/* ------------------------------------------------------------------ */
/* Checkout plan panel (inc/woocommerce/checkout/checkout-functions.php) */
/* ------------------------------------------------------------------ */

export interface CheckoutPrice {
  struck?: string;
  main: string;
  unit: "/mo" | "/yr";
  /** small line under the price: "For the first 3 months*" */
  discountTagline?: string;
  /** "billed annually at £179.80" / "Two months FREE" */
  tagline?: string;
  /** "SAVE £35.96" */
  saving?: string;
}

export interface CheckoutSide {
  planId: number;
  planCode: string;
  duration: Duration;
  coupon: string;
  price: CheckoutPrice;
}

export interface CheckoutModel {
  pageSlug: string;
  level: CoverLevel;
  planName: string;
  customer: string;
  fee: number;
  inclusions: string[];
  documents: { title: string; url: string }[];
  startDuration: Duration;
  initialDuration: Duration;
  monthly: CheckoutSide | null;
  yearly: CheckoutSide | null;
  /** "SAVE £X by paying annually" switch, only when the checkout started monthly. */
  annualSwitch: { saving: string; annual: string; perMonth: string } | null;
}

function checkoutPrice(
  book: PriceBook,
  offer: ResolvedOffer,
  page: PlanPageConfig,
  plan: PlanRow,
  coupon: string,
): CheckoutPrice | null {
  const regular = grossPrice(book, plan);
  if (regular === null) return null;

  if (plan.duration === "monthly") {
    // get_checkout_monthly_pricing_html(): the monthly discount shows with the coupon.
    if (!coupon || !(offer.monthlyPercent > 0)) return { main: gbp(regular), unit: "/mo" };
    return {
      struck: gbp(regular),
      main: gbp(discountPrice(regular, offer.monthlyPercent)),
      unit: "/mo",
      discountTagline: offer.monthlyDiscountText,
    };
  }

  // get_checkout_yearly_pricing_html()
  const monthly = grossPrice(book, siblingPlan(plan, "monthly"));
  const months = yearlyPaymentMonths(coupon);
  if (!coupon || monthly === null || months === 12) return { main: gbp(regular), unit: "/yr" };
  const original = round2(monthly * 12);
  const discounted = Number(yearlyDiscountedPrice(monthly, months, offer.yearlyPercent));

  if (page.showAnnualAsMonthly) {
    return {
      struck: gbp(monthly),
      main: gbp(round2(discounted / 12)),
      unit: "/mo",
      tagline: `billed annually at ${gbp(discounted)}`,
      saving: `SAVE ${gbp(annualSaving(original, discounted))}`,
    };
  }
  return {
    struck: gbp(original),
    main: gbp(discounted),
    unit: "/yr",
    tagline: couponOfferText(coupon) || offer.annualTerms,
  };
}

/**
 * Everything the checkout needs for a plan, both durations precomputed so the
 * annual switch is instant. Returns null for an unknown plan.
 */
export async function buildCheckoutModel(
  planId: number,
  page: PlanPageConfig,
  startDuration?: Duration,
): Promise<CheckoutModel | null> {
  const plan = planById(planId);
  if (!plan) return null;
  const level = levelFromName(plan.name);
  if (!level || plan.planType !== "maintenance") return null;

  const [book, offer] = await Promise.all([getPriceBook(), resolveOffer(page)]);
  const start: Duration = startDuration ?? plan.duration;

  const side = (d: Duration): CheckoutSide | null => {
    const p = siblingPlan(plan, d);
    if (!p) return null;
    const coupon = planCoupon(d, page, p.boiler);
    const price = checkoutPrice(book, offer, page, p, coupon);
    if (!price) return null;
    return { planId: p.id, planCode: p.code, duration: d, coupon, price };
  };

  const monthly = side("monthly");
  const yearly = side("yearly");

  // plusheat_checkout_annual_offer() / plusheat_checkout_annual_switch_html()
  let annualSwitch: CheckoutModel["annualSwitch"] = null;
  const monthlyGross = grossPrice(book, siblingPlan(plan, "monthly"));
  if (start === "monthly" && yearly && monthlyGross && offer.yearlyMonths < 12) {
    const annual = yearlyDiscountedPrice(monthlyGross, offer.yearlyMonths, offer.yearlyPercent);
    const saving = annualSaving(monthlyGross * 12, Number(annual));
    if (Number(saving) > 0) {
      annualSwitch = { saving, annual, perMonth: money(Number(annual) / 12) };
    }
  }

  return {
    pageSlug: page.slug,
    level,
    planName: LEVELS[level].displayName,
    customer: plan.customer,
    fee: plan.fee,
    inclusions: planInclusions(level, plan.customer, plan.service),
    documents: [
      { title: "Terms & Conditions", url: TERMS_PDF },
      { title: "Plan Information Document", url: LEVELS[level].infoDocument },
    ],
    startDuration: start,
    initialDuration: plan.duration,
    monthly,
    yearly,
    annualSwitch,
  };
}
