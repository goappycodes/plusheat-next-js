/* eslint-disable @next/next/no-img-element */
import { TrustpilotWidget } from "./TrustpilotWidget";

const PARTNER_LOGOS = [
  { src: "/images/image-23.svg", w: 153, h: 32, alt: "MoneySuperMarket" },
  { src: "/images/image-22.png", w: 77, h: 44, alt: "GoCompare" },
  { src: "/images/image-21.svg", w: 168, h: 44, alt: "Compare the Market" },
  { src: "/images/image-19.png", w: 41, h: 44, alt: "Money Saving Expert" },
];

/** 5.0 Trustpilot Review (layout: trustpilot_review) */
export function TrustReviews({ title, subtitle }: { title: React.ReactNode; subtitle: string }) {
  return (
    <section className="panel -mt-8 pb-10 pt-8 min-[769px]:mt-0 min-[769px]:pb-24 min-[769px]:pt-16">
      <div className="container-ph max-[768px]:px-4">
        <div className="mb-[30px] flex flex-col items-start justify-between gap-8 min-[769px]:flex-row min-[769px]:gap-16">
          <div className="flex max-w-none flex-col gap-4 min-[769px]:max-w-[510px]">
            <h2 className="section-title max-[768px]:!text-[28px] [&_span]:text-primary">{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
          </div>
          <div className="flex w-full flex-nowrap items-center justify-between gap-3 min-[769px]:w-auto min-[769px]:flex-wrap min-[769px]:justify-end min-[769px]:gap-8">
            {PARTNER_LOGOS.map((l) => (
              <div key={l.src} className="flex min-w-0 shrink items-center justify-center min-[769px]:shrink-0">
                <img
                  src={l.src}
                  alt={l.alt}
                  width={l.w}
                  height={l.h}
                  style={{ "--w": `${l.w}px`, "--h": `${l.h}px` } as React.CSSProperties}
                  className="block max-h-6 w-auto max-w-full object-contain min-[769px]:h-[var(--h)] min-[769px]:max-h-none min-[769px]:w-[var(--w)]"
                />
              </div>
            ))}
          </div>
        </div>
        <TrustpilotWidget />
      </div>
    </section>
  );
}
