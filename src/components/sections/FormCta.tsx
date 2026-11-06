/* eslint-disable @next/next/no-img-element */
import { LeadForm } from "./LeadForm";

/** 6.0 Form CTA (layout: form_cta) with the "Boiler Cover" lead form (Gravity Form 16). */
export function FormCta() {
  return (
    <section className="panel -mt-8 pt-8 min-[769px]:mt-0 min-[769px]:pb-24 min-[769px]:pt-16">
      <div className="container-ph max-[768px]:px-4">
        <div className="flex items-center justify-between gap-0 min-[769px]:gap-[120px]">
          <div className="w-full max-w-none min-[769px]:max-w-[588px]">
            <h2 className="section-title max-[768px]:!leading-[1.286]">
              Let’s find the right solution for <span className="text-primary">your home</span>
            </h2>
            <p className="section-subtitle mt-4 text-text">
              Leave your contact details and discover flexible cover for your home’s essential systems
            </p>
            <div className="mt-8 max-w-none min-[769px]:max-w-[522px]">
              <LeadForm />
            </div>
          </div>
          <div className="hidden min-w-0 flex-[0_1_492px] min-[769px]:block">
            <img src="/images/cta.webp" alt="" width={491} height={329} loading="lazy" className="block h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
