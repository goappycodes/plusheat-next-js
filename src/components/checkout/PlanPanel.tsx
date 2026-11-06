/* eslint-disable @next/next/no-img-element */
import type { CheckoutModel, CheckoutSide } from "@/lib/plans-view";

/** The "Your Plan" panel (plan_detail_at_checkout() / checkout_plan_details()). */
export function PlanPanel({
  model,
  side,
  duration,
  onSwitch,
  coupon,
  onCoupon,
  showSwitch,
}: {
  model: CheckoutModel;
  side: CheckoutSide;
  duration: "monthly" | "yearly";
  onSwitch: (d: "monthly" | "yearly") => void;
  coupon: string;
  onCoupon: (v: string) => void;
  showSwitch: boolean;
}) {
  const p = side.price;
  const sw = model.annualSwitch;
  const isYearly = duration === "yearly";

  return (
    <div>
      <h3 className="mb-[10px] mt-0 text-[36px] font-semibold leading-none text-heading">
        Your <span className="text-primary">Plan</span>
      </h3>
      <div className="my-5 text-[22px] capitalize leading-[1.2] text-heading">{model.planName}</div>

      <div className="mb-5">
        <ul className="m-0 list-none p-0">
          {model.inclusions.map((i) => (
            <li key={i} className="tick-li relative mb-[10px] flex items-center gap-[9px] text-[14px] leading-[1.1]">
              {i}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-[10px] mt-[30px] text-[20px] font-semibold leading-[1.5] text-heading">Total</div>
      <div className="relative mb-5 flex flex-col items-start">
        {p.struck && <del className="text-[20px] leading-[1.5]">{p.struck}</del>}
        <div className="flex flex-wrap items-baseline text-[30px] font-semibold leading-none text-primary">
          <span>{p.main}</span>
          <span className="text-[16px] leading-none">{p.unit}</span>
        </div>
        {p.discountTagline && <div className="mt-2 text-[14px] leading-[1.5]">{p.discountTagline}</div>}
        {p.tagline && <div className="mt-2 text-[14px] leading-[1.5]">{p.tagline}</div>}
        {p.saving && <div className="mt-1 text-[14px] font-bold leading-[1.5] text-primary">{p.saving}</div>}
      </div>

      {showSwitch && sw && (
        <div className="mb-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-[10px] rounded-[10px] border border-primary/35 bg-primary/[0.07] px-[14px] py-3">
            <div className="text-[13px] leading-[1.35]">
              <strong className="mb-[2px] block text-[14px] font-bold text-primary">
                {isYearly ? "You SAVE" : "SAVE"} £{sw.saving} by paying annually
              </strong>
              {!isYearly && (
                <span>
                  Switch to £{sw.perMonth}/mo, billed annually at £{sw.annual}.
                </span>
              )}
            </div>
            <button
              type="button"
              aria-pressed={isYearly}
              onClick={() => onSwitch(isYearly ? "monthly" : "yearly")}
              className={`flex cursor-pointer items-center gap-[6px] rounded-full border px-3 py-[6px] text-[13px] font-semibold leading-none transition-colors ${
                isYearly ? "border-primary bg-primary text-white" : "border-border-light bg-white text-black"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-[14px] w-[14px] rounded-full border-[1.33px] ${
                  isYearly ? "border-white bg-white shadow-[inset_0_0_0_3px_var(--color-primary)]" : "border-[#707070] bg-white"
                }`}
              />
              Pay Annually
            </button>
          </div>
        </div>
      )}

      <div className="my-5 border-y border-soft pb-5 pt-[15px]">
        <div className="mb-[10px] font-semibold text-heading">
          Plan <span className="text-primary">Documentation</span>
        </div>
        {model.documents.map((d) => (
          <div key={d.title} className="mb-[5px]">
            <a
              href={d.url}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-between rounded-xl bg-doc px-4 py-[13.6px] text-heading transition-colors hover:bg-secondary"
            >
              <span className="text-[12.8px] font-medium leading-none">{d.title}</span>
              <img src="/images/download-icon.svg" alt="" width={15} height={16} />
            </a>
          </div>
        ))}
      </div>

      <div className="relative mt-5">
        <label htmlFor="coupon_codeid" className="mb-[5px] block leading-8">
          Coupon Code
        </label>
        <input
          id="coupon_codeid"
          type="text"
          value={coupon}
          readOnly={Boolean(side.coupon)}
          onChange={(e) => onCoupon(e.target.value.toUpperCase())}
          placeholder="Enter code"
          autoComplete="off"
          className="box-border min-h-[50px] w-full rounded-[15px] border-2 border-border-light bg-white px-5 py-[7px] text-[16px] leading-5 text-heading outline-none focus:border-primary read-only:text-text"
        />
      </div>
    </div>
  );
}

/** .checkout-ratings: Trustpilot + Google review scores. */
export function CheckoutRatings() {
  return (
    <div className="mt-[30px] rounded-[30px] bg-white p-[30px] shadow-[var(--shadow-plan)]">
      <a href="https://uk.trustpilot.com/review/www.plusheat.co.uk" target="_blank" rel="noopener" className="block">
        <img src="/images/logo-black.svg" alt="Trustpilot" width={126} height={31} className="mb-2 h-[31px] w-auto" />
        <div className="flex gap-[3px]" aria-label="4.7 out of 5 stars">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="flex h-[43px] w-[43px] items-center justify-center text-[32px] leading-none text-white"
              style={{
                background:
                  i < 4 ? "#00b67a" : "linear-gradient(90deg, #00b67a 0%, #00b67a 70%, #dcdce6 70%, #dcdce6 100%)",
              }}
            >
              ★
            </span>
          ))}
        </div>
        <p className="mb-0 mt-2 text-[12px] leading-[1.4] text-heading">
          TrustScore <strong>4.7</strong> | <span className="font-semibold underline">18,398 reviews</span>
        </p>
      </a>
      <div className="my-5 border-t border-soft" />
      <div className="flex flex-col items-center gap-1 text-center">
        <img src="/images/image-13.png" alt="Google" width={24} height={24} />
        <div className="flex items-center gap-[6px]">
          <span className="text-[20px] font-semibold text-heading">4.6</span>
          <span className="text-[24px] leading-none tracking-[1px] text-[#fbbc04]">★★★★★</span>
        </div>
        <span className="text-[12px] text-text">3,522 reviews</span>
      </div>
    </div>
  );
}

export function WhatsIncluded() {
  return (
    <div className="mt-[30px] rounded-[30px] bg-white p-[30px] shadow-[var(--shadow-plan)]">
      <h4 className="mb-5 mt-0 text-[20px] font-semibold leading-none text-heading">
        What&apos;s <span className="text-primary">Included</span>
      </h4>
      <ul className="m-0 list-none p-0">
        {["Nationwide UK Coverage", "24/7 customer support", "Qualified engineers", "No hidden fees"].map((t) => (
          <li key={t} className="tick-li mb-[15px] flex items-center gap-[9px] font-light leading-[1.1]">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
