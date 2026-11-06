/* eslint-disable @next/next/no-img-element */
import { LIVE, PHONE_SALES } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* 12.0 Feature Grid (layout: feature_grid)                            */
/* ------------------------------------------------------------------ */

export function FeatureGrid() {
  const light = [
    { icon: "/images/pin-icon.svg", title: "Local engineers", text: "Across the UK, ready when you need them." },
    { icon: "/images/calendar-icon.svg", title: "Yearly reminders", text: "We'll let you know when your service is due." },
    { icon: "/images/pound-icon.svg", title: "Clear pricing", text: "What you see is what you pay. No hidden extras." },
  ];
  const card = "flex flex-col justify-start gap-3 rounded-[32px] p-5 min-[769px]:gap-6 min-[769px]:p-8";
  return (
    <section className="panel -mt-8 pb-20 pt-8 min-[769px]:mt-0 min-[769px]:pb-24 min-[769px]:pt-16">
      <div className="container-ph max-[768px]:px-5">
        <div className="mb-8 flex max-w-[640px] flex-col gap-3 min-[769px]:mb-12 min-[769px]:gap-4">
          <h2 className="section-title max-[768px]:!text-[25.6px] max-[768px]:!leading-[1.27]">
            Why we&apos;re <span className="text-primary">the right choice</span>
          </h2>
          <p className="section-subtitle max-[768px]:!leading-[26px]">Qualified engineers, clear pricing, a service that fits around you.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[769px]:grid-cols-2 min-[769px]:gap-6 min-[1024px]:grid-cols-3">
          <article className={`${card} border-2 border-primary bg-white min-[769px]:col-span-2 min-[769px]:min-h-[300px]`}>
            <span className="flex">
              <img src="/images/gas-safe.png" alt="Gas Safe Register" width={46} height={50} className="h-[50px] w-auto" />
            </span>
            <div>
              <h3 className="m-0 max-w-[560px] text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-primary min-[769px]:text-[40px] min-[769px]:leading-[1.2]">
                Every engineer is Gas Safe registered
              </h3>
              <div className="mt-3 text-[14px] leading-[1.5] text-heading min-[769px]:text-[18px] min-[769px]:leading-[1.45]">
                Qualified, regularly checked — so the job is done safely, every time.
              </div>
            </div>
          </article>

          <article
            className={`${card} grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 bg-primary text-white min-[769px]:flex min-[769px]:min-h-[300px] min-[769px]:justify-between`}
          >
            <span aria-hidden="true" className="col-start-2 row-start-1 self-end text-[16px] leading-none tracking-[0.1em] min-[769px]:text-[28.8px]">
              &#9733;&#9733;&#9733;&#9733;&#9733;
            </span>
            <div className="contents min-[769px]:block">
              <span className="col-start-1 row-span-2 row-start-1 block text-[52px] font-semibold leading-none tracking-[-0.03em] min-[769px]:text-[96px]">
                4.7
              </span>
              <p className="col-start-2 row-start-2 m-0 self-start text-[14px] font-medium leading-[1.3] min-[769px]:mt-3 min-[769px]:text-[18px] min-[769px]:leading-[1.4]">
                on Trustpilot &bull; 18k+ reviews
              </p>
            </div>
          </article>

          {light.map((l) => (
            <article key={l.title} className={`${card} bg-soft min-[769px]:min-h-[240px]`}>
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white max-[768px]:hidden">
                <img src={l.icon} alt="" width={32} height={32} />
              </span>
              <div>
                <h3 className="m-0 text-[18px] font-semibold leading-[1.35] tracking-[-0.02em] text-heading min-[769px]:text-[25.6px] min-[769px]:leading-[1.3]">
                  {l.title}
                </h3>
                <div className="mt-1 text-[14px] leading-[1.5] text-text min-[769px]:mt-3 min-[769px]:text-[18px] min-[769px]:leading-[1.45]">{l.text}</div>
              </div>
            </article>
          ))}

          <article className={`${card} bg-secondary text-primary min-[769px]:col-span-2 min-[769px]:min-h-[200px]`}>
            <div>
              <h3 className="m-0 text-[18px] font-semibold leading-[1.35] tracking-[-0.02em] min-[769px]:text-[25.6px] min-[769px]:leading-[1.3]">
                One team for everything
              </h3>
              <div className="mt-1 text-[14px] leading-[1.5] min-[769px]:mt-3 min-[769px]:text-[18px] min-[769px]:leading-[1.45]">
                Servicing, repairs and new boilers — no juggling contractors.
              </div>
            </div>
          </article>

          <article className={`${card} gap-4 border-2 border-soft bg-white min-[769px]:min-h-[200px]`}>
            <h3 className="m-0 text-[14px] font-medium leading-[1.4] text-text min-[769px]:text-[18px]">Our promise</h3>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0 min-[769px]:gap-3">
              {["Reliable", "Trustworthy", "Convenient", "Supportive", "Responsive"].map((t) => (
                <li key={t} className="rounded-full bg-soft px-3 py-[6px] text-[13px] font-medium leading-[1.2] text-heading min-[769px]:px-4 min-[769px]:py-[10px] min-[769px]:text-[16px]">
                  {t}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 13.0 Comparison Table (layout: comparison_table)                    */
/* ------------------------------------------------------------------ */

type Mark = "tick" | "cross" | string;

const COMPARE_ROWS: { label: string; values: [Mark, Mark, Mark] }[] = [
  { label: "Trustpilot score", values: ["4.7", "4.3", "4.6"] },
  { label: "Calls answered fast", values: ["tick", "tick", "tick"] },
  { label: "Repair requests accepted more often", values: ["tick", "tick", "cross"] },
  { label: "Fixed on the first visit more often", values: ["tick", "cross", "tick"] },
  { label: "Real people, not bots or IVRs", values: ["tick", "cross", "cross"] },
  { label: "Local tradespeople for every job", values: ["tick", "cross", "cross"] },
  { label: "Same or next-day appointments", values: ["tick", "cross", "cross"] },
  { label: "No call-out fee option", values: ["tick", "cross", "cross"] },
  { label: "Free annual boiler service", values: ["tick", "cross", "tick"] },
];

const COMPARE_COLUMNS = [
  { name: "PlusHeat", logo: "/images/compare-plusheat-logo.svg", w: 139, h: 25, icon: "/images/plusheat-vector.svg", iw: 29, ih: 16 },
  { name: "British Gas", logo: "/images/british-gas-logo.svg", w: 117, h: 70, icon: "/images/british-gas-vector.svg", iw: 18, ih: 16 },
  { name: "HomeServe", logo: "/images/home-serve-logo.svg", w: 111, h: 40, icon: "/images/home-serve-vector.svg", iw: 16, ih: 16 },
];

function CompareValue({ v, highlight }: { v: Mark; highlight: boolean }) {
  if (v === "tick") {
    return highlight ? (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary min-[769px]:h-8 min-[769px]:w-8">
        <img src="/images/tick.svg" alt="Yes" width={12} height={13} />
      </span>
    ) : (
      <span className="flex h-7 w-7 items-center justify-center min-[769px]:h-8 min-[769px]:w-8">
        <img src="/images/tick-dark.svg" alt="Yes" width={12} height={13} />
      </span>
    );
  }
  if (v === "cross") {
    return (
      <span className="flex h-5 w-5 items-center justify-center">
        <img src="/images/tick-cross.svg" alt="No" width={13} height={13} />
      </span>
    );
  }
  return (
    <span className={`text-[16px] font-semibold leading-[1.5] min-[769px]:text-[20px] ${highlight ? "text-heading" : "text-text"}`}>
      {v}
      <img src="/images/star.svg" alt="" aria-hidden="true" width={20} height={20} className="ml-[5px] inline-block h-4 w-4 align-[-2px] min-[769px]:h-5 min-[769px]:w-5" />
    </span>
  );
}

export function CompareTable() {
  const last = COMPARE_ROWS.length - 1;
  const value = (hl: boolean, isLastCol: boolean, isLastRow: boolean) =>
    `flex min-h-[52px] items-center justify-center border-b border-line px-1 py-[14px] text-center min-[769px]:min-h-[60px] min-[769px]:px-4 ${
      hl ? "bg-soft min-[769px]:border-x-2 min-[769px]:border-x-primary min-[769px]:bg-white" : "bg-soft"
    } ${isLastRow ? "border-b-0" : ""} ${isLastRow && isLastCol ? "rounded-br-[20px] min-[769px]:rounded-br-[32px]" : ""}`;

  return (
    <section className="panel -mt-8 pb-20 pt-8 min-[769px]:mt-0 min-[769px]:pb-24 min-[769px]:pt-16">
      <div className="container-ph max-[768px]:px-5">
        <div className="mb-8 flex max-w-[640px] flex-col gap-3 min-[769px]:mb-12 min-[769px]:gap-4">
          <h2 className="section-title max-[768px]:!text-[25.6px] max-[768px]:!leading-[1.27]">
            How <span className="text-primary">we compare</span>
          </h2>
          <p className="section-subtitle max-[768px]:!leading-[26px]">More included as standard.</p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_48px_48px_48px] items-stretch min-[769px]:grid-cols-[minmax(0,2.35fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)]">
          {/* caps */}
          <div aria-hidden="true" />
          <div aria-hidden="true" className="h-0 min-[769px]:h-6 min-[769px]:rounded-t-[32px] min-[769px]:border-x-2 min-[769px]:border-t-2 min-[769px]:border-primary min-[769px]:bg-white" />
          <div aria-hidden="true" />
          <div aria-hidden="true" />

          {/* head */}
          <div className="flex min-h-[48px] items-center gap-2 rounded-tl-[20px] border-b border-line bg-soft py-[14px] pl-[14px] pr-3 font-medium text-heading min-[769px]:min-h-[88px] min-[769px]:gap-5 min-[769px]:py-3 min-[769px]:rounded-tl-[32px] min-[769px]:pl-8 min-[769px]:pr-4">
            <span className="hidden text-[16px] min-[769px]:inline">What you get</span>
          </div>
          {COMPARE_COLUMNS.map((c, i) => (
            <div
              key={c.name}
              className={`flex min-h-[48px] items-center justify-center border-b border-line px-1 py-3 min-[769px]:min-h-[88px] min-[769px]:px-4 ${
                i === 0 ? "bg-soft min-[769px]:border-x-2 min-[769px]:border-x-primary min-[769px]:bg-white" : "bg-soft"
              } ${i === 2 ? "rounded-tr-[20px] min-[769px]:rounded-tr-[32px]" : ""}`}
            >
              <img src={c.logo} alt={c.name} width={c.w} height={c.h} className="hidden h-auto max-h-[70px] max-w-full min-[769px]:block" />
              <img src={c.icon} alt={c.name} width={c.iw} height={c.ih} className="block min-[769px]:hidden" />
            </div>
          ))}

          {COMPARE_ROWS.map((r, ri) => (
            <div key={r.label} className="contents">
              <div
                className={`flex min-h-[52px] items-center gap-2 border-b border-line bg-soft py-[14px] pl-[14px] pr-3 text-[14px] leading-[1.4] text-heading min-[769px]:min-h-[60px] min-[769px]:py-3 min-[769px]:gap-5 min-[769px]:pl-8 min-[769px]:pr-4 min-[769px]:text-[16px] ${
                  ri === last ? "rounded-bl-[20px] border-b-0 min-[769px]:rounded-bl-[32px]" : ""
                }`}
              >
                <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-white text-[11px] leading-[1.5] max-[768px]:hidden">
                  {ri + 1}
                </span>
                <span>{r.label}</span>
              </div>
              {r.values.map((v, ci) => (
                <div key={ci} className={value(ci === 0, ci === 2, ri === last)}>
                  <CompareValue v={v} highlight={ci === 0} />
                </div>
              ))}
            </div>
          ))}

          {/* foot */}
          <div aria-hidden="true" />
          <div className="min-[769px]:rounded-b-[32px] min-[769px]:border-x-2 min-[769px]:border-b-2 min-[769px]:border-primary min-[769px]:bg-white min-[769px]:px-6 min-[769px]:pb-8 min-[769px]:pt-3">
            <a
              href="#plans_section"
              className="hidden rounded-2xl bg-primary p-4 text-center text-[20px] font-medium text-white transition-colors hover:bg-primary-dark min-[769px]:block"
            >
              Choose a plan
            </a>
          </div>
          <div />
          <div />
        </div>
        <a
          href="#plans_section"
          className="mt-6 block rounded-xl bg-primary p-4 text-center text-[18px] font-medium leading-[1.2] text-white min-[769px]:hidden"
        >
          Choose a plan
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 14.0 FAQ with CTA (layout: faq_cta)                                 */
/* ------------------------------------------------------------------ */

const FAQS = [
  {
    q: "What does boiler cover include?",
    a: "Repairs to your boiler and controls, parts and labour, plus a free annual boiler service. Higher plans add heating, plumbing, electrics and more.",
  },
  {
    q: "How fast will an engineer arrive?",
    a: "In most cases a Gas Safe engineer attends within 24 to 48 hours, with a faster response for emergencies such as no heating or hot water.",
  },
  {
    q: "Is there a call-out fee?",
    a: "It depends on your plan. If you’ve chosen a plan with a call-out fee or fixed fee, that fee applies to each repair request. If an issue falls outside your plan, we may still offer to fix it as an out-of-plan charge.",
  },
  {
    q: "Can landlords get cover?",
    a: "Yes. We offer dedicated landlord cover for boilers and central heating, with options that include an annual service and a gas safety (CP12) check. See our landlord cover plans for full details.",
  },
  {
    q: "When can I make my first repair request?",
    a: "There is a 28-day exclusion period on every plan, starting from the first full day of your agreement start date. If you need help during this period you can still use our services at our reduced out-of-plan rate.",
  },
];

export function FaqCta() {
  return (
    <section className="panel -mt-8 pb-12 pt-8 min-[769px]:mt-0 min-[769px]:pb-24 min-[769px]:pt-16">
      <div className="container-ph max-[768px]:px-5">
        <div className="grid grid-cols-1 items-start gap-8 min-[992px]:grid-cols-[minmax(0,1.96fr)_minmax(0,1fr)]">
          <div>
            <h2 className="section-title mb-6 max-[768px]:!text-[25.6px] max-[768px]:!leading-[1.27] min-[769px]:mb-8">
              Questions, <span className="text-primary">answered</span>
            </h2>
            <div className="flex flex-col gap-4">
              {FAQS.map((f) => (
                <details key={f.q} className="faq-item rounded-[24px] border-2 border-soft bg-white">
                  <summary className="relative cursor-pointer py-5 pl-5 pr-14 text-[16px] font-medium leading-[1.4] text-heading outline-none min-[769px]:py-6 min-[769px]:pl-8 min-[769px]:pr-[72px] min-[769px]:text-[18px]">
                    {f.q}
                  </summary>
                  <div className="px-5 pb-5 text-[14px] leading-[1.6] min-[769px]:px-8 min-[769px]:pb-6 min-[769px]:text-[16px]">
                    <p className="m-0">{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
            <a
              href={`${LIVE}/homeowners/faqs/`}
              className="mt-8 inline-block text-[18px] font-medium leading-[1.5] text-heading after:content-['_→'] hover:text-primary"
            >
              See all FAQs
            </a>
          </div>
          <aside className="flex flex-col gap-5 rounded-[30px] bg-primary p-7 text-white min-[769px]:gap-6 min-[769px]:rounded-[32px] min-[769px]:p-10 min-[992px]:sticky min-[992px]:top-6">
            <h3 className="m-0 text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] min-[769px]:text-[40px]">
              Ready to protect your home?
            </h3>
            <p className="m-0 text-[18px] leading-[1.45]">Pick a plan today — the annual boiler service is on us.</p>
            <a
              href="#plans_section"
              className="rounded-2xl bg-button px-8 pb-[18px] pt-4 text-center text-[18px] font-medium leading-[1.5] text-white transition-colors hover:bg-grey-dark"
            >
              Choose a plan
            </a>
            <a href={`tel:${PHONE_SALES.replace(/\s/g, "")}`} className="font-medium text-white">
              Or call {PHONE_SALES}
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
