/* eslint-disable @next/next/no-img-element */
import { CardSlider } from "./CardSlider";

/* ------------------------------------------------------------------ */
/* 2.0 Intro with Tags (layout: intro_tags)                            */
/* ------------------------------------------------------------------ */

export function IntroTags({ chips }: { chips: string[] }) {
  return (
    <section className="relative z-[2] -mt-[61px] rounded-t-[32px] bg-white pt-8 shadow-[var(--shadow-panel-strong)] min-[769px]:rounded-t-[64px] min-[769px]:pt-16">
      <div className="container-ph max-[768px]:px-4">
        <div className="flex flex-col items-start justify-between gap-8 min-[992px]:flex-row min-[992px]:gap-10">
          <div className="min-w-0 flex-[1_1_52%]">
            <h2 className="mb-4 mt-0 text-[32px] font-semibold leading-[1.286] text-heading min-[769px]:text-[3rem] min-[769px]:leading-[1.2]">
              <span className="text-primary">Effortless</span> living starts at home
            </h2>
            <div className="max-w-[46rem] text-[1.25rem] leading-[26px] text-text min-[769px]:leading-[28px]">
              <p className="m-0">
                When something goes wrong, you shouldn’t have to worry about chasing solutions. We make life at home
                feel easier, with reliable cover, friendly support, and help when you need it.
              </p>
            </div>
          </div>
          <ul className="m-0 flex list-none flex-wrap gap-3 p-0 min-[992px]:max-w-[527px] min-[992px]:justify-end">
            {chips.map((c) => (
              <li
                key={c}
                className="whitespace-nowrap rounded-full bg-soft px-4 py-2 text-[16px] leading-[1.2] text-black min-[769px]:py-[10px]"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3.0 Pricing Cards (layout: pricing_cards)                           */
/* ------------------------------------------------------------------ */

export interface PricingCard {
  icon: string;
  iconW: number;
  iconH: number;
  title: string;
  price: string | null;
  body: React.ReactNode;
  button: { label: string; href: string };
}

export function PricingCards({ cards }: { cards: PricingCard[] }) {
  return (
    <section className="relative bg-white pb-[100px] pt-12 min-[769px]:mt-20 min-[769px]:pb-24 min-[769px]:pt-0">
      <div className="container-ph max-[768px]:px-4">
        <CardSlider
          listClassName="m-0 flex list-none gap-2 p-0 max-[768px]:-mx-4 max-[768px]:-mb-8 max-[768px]:-mt-6 max-[768px]:snap-x max-[768px]:snap-mandatory max-[768px]:overflow-x-auto max-[768px]:px-8 max-[768px]:pb-8 max-[768px]:pt-6 max-[768px]:[scroll-padding:0_32px] min-[769px]:gap-8"
          itemClassName="flex max-[768px]:flex-[0_0_calc(100vw-64px)] max-[768px]:snap-center min-[769px]:min-w-0 min-[769px]:flex-1"
          items={cards.map((c) => (
            <article
              key={c.title}
              className="flex w-full flex-col gap-6 rounded-[24px] bg-white p-6 shadow-[var(--shadow-pricing)] min-[769px]:gap-10 min-[769px]:rounded-[32px] min-[769px]:p-8"
            >
              <div className="flex flex-col gap-5">
                <img src={c.icon} alt="" width={c.iconW} height={c.iconH} className="block h-10 w-auto self-start" />
                <div className="flex flex-col gap-2">
                  <h3 className="m-0 text-[24px] font-semibold leading-[1.2] tracking-[-0.03em] text-heading min-[769px]:text-[1.75rem]">
                    {c.title}
                  </h3>
                  {c.price && (
                    <div className="flex flex-col gap-[2px]">
                      <span className="text-[14px] leading-[1.75] tracking-[-0.03em] text-muted min-[769px]:text-[16px]">
                        Starting from
                      </span>
                      <p className="m-0 text-[28px] font-bold leading-none tracking-[-0.02em] text-primary min-[769px]:text-[2.375rem]">
                        {c.price}{" "}
                        <span className="text-[16px] font-bold tracking-normal min-[769px]:text-[1.25rem]">/ mo</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[16px] leading-[1.625] tracking-[-0.03em] text-text min-[769px]:text-[1.25rem] min-[769px]:leading-[1.4] [&_strong]:font-[inherit] [&_strong]:text-heading">
                <p className="m-0">{c.body}</p>
              </div>
              <a
                href={c.button.href}
                className="mt-auto flex items-center justify-center gap-[10px] rounded-2xl bg-button px-6 pb-[1.0625rem] pt-4 text-center text-[16px] font-medium text-white transition-colors hover:bg-grey-dark min-[769px]:px-8 min-[769px]:pb-[18px] min-[769px]:text-[1.25rem]"
              >
                {c.button.label}
              </a>
            </article>
          ))}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4.0 Benefit Cards (layout: benefit_cards)                           */
/* ------------------------------------------------------------------ */

export interface Benefit {
  title: React.ReactNode;
  text: string;
  watermark: string;
}

export function BenefitCards({ benefits }: { benefits: Benefit[] }) {
  return (
    <section className="panel -mt-8 pb-[100px] pt-8 min-[769px]:mt-0 min-[769px]:pb-20 min-[769px]:pt-12 min-[992px]:pb-24 min-[992px]:pt-16">
      <div className="container-ph max-[768px]:px-4">
        <div className="mb-12 flex max-w-[588px] flex-col gap-4 min-[992px]:mb-16">
          <h2 className="section-title">
            Why we’re <span className="text-primary">the right choice</span>
          </h2>
          <p className="section-subtitle">
            We’re here to make life at home feel easier, with cover you can trust and support you can rely on.
          </p>
        </div>
        <ul className="no-scrollbar m-0 flex list-none gap-2 p-0 max-[768px]:-mx-4 max-[768px]:snap-x max-[768px]:snap-mandatory max-[768px]:overflow-x-auto max-[768px]:px-4 max-[768px]:[scroll-padding-left:16px] min-[769px]:flex-wrap min-[769px]:gap-6 min-[1200px]:flex-nowrap min-[1200px]:gap-8">
          {benefits.map((b, i) => (
            <li
              key={i}
              className="flex max-[768px]:flex-[0_0_220px] max-[768px]:snap-start min-[769px]:min-w-0 min-[769px]:flex-[1_1_calc(50%-0.75rem)] min-[1200px]:flex-1"
            >
              <article className="relative flex min-h-[316px] w-full flex-col gap-4 overflow-hidden rounded-[24px] border-2 border-soft p-4 min-[769px]:gap-6 min-[769px]:p-7 min-[1200px]:min-h-[305px] min-[1200px]:gap-4 min-[1200px]:rounded-[32px] min-[1200px]:p-8">
                <img
                  src={b.watermark}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 z-[1] max-h-[calc(100%-4rem)] w-auto max-w-[calc(100%-4rem)] -translate-x-1/2 -translate-y-1/2"
                />
                <h3 className="relative z-[2] m-0 text-[24px] font-semibold leading-[1.417] tracking-[-0.03em] text-heading [&_span]:text-primary">
                  {b.title}
                </h3>
                <p className="relative z-[2] m-0 mt-auto text-[16px] leading-[1.625] tracking-[-0.03em] text-heading min-[1200px]:text-[1.25rem] min-[1200px]:leading-[1.4]">
                  {b.text}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
