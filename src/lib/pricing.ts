/**
 * Price maths, ported line by line from the WordPress theme so the new site
 * shows exactly the numbers Zoho bills:
 *   inc/functions/plan-functions.php  get_discount_price()
 *   inc/functions/plan-coupons.php    plusheat_yearly_payment_months(),
 *                                     plusheat_yearly_discounted_price(),
 *                                     plusheat_coupon_price(), …
 *   inc/woocommerce/checkout/checkout-functions.php  plusheat_coupon_offer_text(), …
 *
 * Zoho stores plan prices before VAT; the site shows them with 20% VAT.
 */

export const VAT_RATE = 20;

/** PHP round($x, 2) (half away from zero, without binary-float surprises). */
export function round2(x: number): number {
  const sign = x < 0 ? -1 : 1;
  return (sign * Math.round(Number(`${Math.abs(x)}e2`))) / 100;
}

/** sprintf('%0.2f') */
export function money(x: number): string {
  return round2(x).toFixed(2);
}

/** Customer price of a Zoho plan (recurring_price is before VAT). */
export function grossFromZoho(exVat: number): number {
  return round2(exVat * (1 + VAT_RATE / 100));
}

/** get_discount_price(): a percentage off a VAT-inclusive price, the way Zoho bills it. */
export function discountPrice(price: number, discount: number): number {
  if (!(discount > 0)) return price;
  const vatDiscounting = round2(1 + VAT_RATE / 100);
  const base = price / vatDiscounting;
  const baseDiscount = (base * discount) / 100;
  const tax = ((base - baseDiscount) * VAT_RATE) / 100;
  return round2(base - baseDiscount + tax);
}

/** Months free in a coupon code: NMF… / MFN = N, anything else = 0. */
export function couponFreeMonths(coupon: string): number {
  const c = coupon.trim().toUpperCase();
  const m = c.match(/^(\d+)MF/) || c.match(/^MF(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * plusheat_yearly_payment_months(): months actually paid for an annual plan.
 * NMF / MFN = N months free, NMHP = N months half price; else the default (10).
 */
export function yearlyPaymentMonths(coupon: string, fallback = 10): number {
  const c = coupon.trim().toUpperCase();
  const free = c.match(/^(\d+)MF/) || c.match(/^MF(\d+)$/);
  if (free) return 12 - parseInt(free[1], 10);
  const half = c.match(/^(\d+)MHP/);
  if (half) return 12 - parseInt(half[1], 10) / 2;
  return fallback;
}

/**
 * plusheat_yearly_discounted_price(): annual price after the coupon. The
 * percentage is the coupon's own Zoho value (MF2 = 16.67%) when known.
 */
export function yearlyDiscountedPrice(monthlyPrice: number, months: number, couponPercent: number | null): string {
  const exact = ((12 - months) / 12) * 100;
  const percent = couponPercent ?? round2(exact);

  if (Math.abs(percent - exact) < 0.0001) return money(monthlyPrice * months);

  const vat = VAT_RATE / 100;
  const base = round2((monthlyPrice * 12) / (1 + vat));
  const discount = round2((base * percent) / 100);
  const subtotal = round2(base - discount);
  return money(subtotal + round2(subtotal * vat));
}

/** plusheat_coupon_price(): a VAT-inclusive price less a percentage coupon. */
export function couponPrice(grossPrice: number, coupon: string, couponPercent: number | null): string {
  const percent = couponPercent ?? (couponFreeMonths(coupon) / 12) * 100;
  const vat = VAT_RATE / 100;
  const base = round2(grossPrice / (1 + vat));
  const subtotal = round2(base - round2((base * percent) / 100));
  return money(subtotal + round2(subtotal * vat));
}

/** plusheat_annual_saving() */
export function annualSaving(fullPrice: number, annualPrice: number): string {
  return money(fullPrice - annualPrice);
}

const WORDS: Record<number, string> = { 1: "One", 2: "Two", 3: "Three", 4: "Four", 6: "Six", 12: "Twelve" };

/** plusheat_coupon_offer_text(): 3MFAP = "Three months FREE", 6MHPAP = "Six months HALF PRICE". */
export function couponOfferText(coupon: string): string {
  let n: number;
  let kind: string;
  const mf = coupon.match(/^MF(\d+)$/i);
  if (mf) {
    n = parseInt(mf[1], 10);
    kind = "F";
  } else {
    const m = coupon.match(/^(\d+)M(F|HP)/i);
    if (!m) return "";
    n = parseInt(m[1], 10);
    kind = m[2].toUpperCase();
  }
  const count = WORDS[n] ?? String(n);
  return `${count} month${n === 1 ? "" : "s"} ${kind === "F" ? "FREE" : "HALF PRICE"}`;
}

/** plusheat_coupon_half_price_months_text(): "For the first N months*". */
export function couponHalfPriceMonthsText(coupon: string): string {
  const m = coupon.match(/^(\d+)MHP/i);
  if (!m) return "";
  const n = parseInt(m[1], 10);
  return `For the first ${n} month${n === 1 ? "" : "s"}*`;
}

/** plusheat_annual_offer_bubble() for the default tables: "2 months FREE with every annual plan". */
export function annualOfferBubble(yearlyCoupon: string): string {
  const months = couponFreeMonths(yearlyCoupon);
  return months ? `${months} month${months === 1 ? "" : "s"} FREE with every annual plan` : "";
}

/** plusheat_price_tagline(): a page tagline with %s / {price} replaced. */
export function priceTagline(text: string, price: string): string {
  return text.replace(/%s|\{price\}/g, price);
}
