"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { PlanCard, PlansTable } from "@/lib/plans-view";
import { PHONE_SALES } from "@/lib/site";
import { CardSlider } from "@/components/sections/CardSlider";

type Duration = "monthly" | "yearly";

function readCookie(cookies: string, name: string): string | null {
  const m = cookies.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
const noopSubscribe = () => () => {};
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

function OptionGroup({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-stretch gap-2 min-[769px]:flex-row min-[769px]:items-center min-[769px]:gap-[10px] ${className}`}>
      <p className="m-0 flex items-end text-[13px] leading-[1.5] text-text">{label}</p>
      <div className="relative flex w-full items-center justify-center gap-[2px] rounded-[14px] bg-grey-light p-1 min-[769px]:w-auto">
        {children}
      </div>
    </div>
  );
}

const optionBtn = (active: boolean) =>
  `flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-[10px] border-0 px-5 py-[10px] text-[14px] font-medium leading-[1.2] transition-colors min-[769px]:flex-none ${
    active ? "bg-button text-white" : "bg-transparent text-heading hover:bg-white/60"
  }`;

function PlanCardView({ card, onChoose, busy }: { card: PlanCard; onChoose: (c: PlanCard) => void; busy: boolean }) {
  return (
    <div
      id={`${card.level}_plan`}
      className={`relative flex h-full w-full flex-col rounded-[24px] border-2 bg-white p-5 shadow-[var(--shadow-plan)] min-[769px]:p-6 ${
        card.highlighted ? "border-primary text-heading" : "border-transparent"
      }`}
    >
      <div className="mb-5 flex min-h-8 flex-wrap items-center gap-2">
        {card.discountPill && (
          <div className="flex items-center justify-center rounded-full bg-secondary px-[11.2px] py-[5.6px] text-center text-[12px] font-medium leading-[1.2] text-primary">
            <span>{card.discountPill}</span>
          </div>
        )}
        {card.labelPill && (
          <p className="m-0 rounded-full bg-primary px-[11.2px] py-[5.6px] text-[12px] font-medium leading-[1.2] text-white">
            {card.labelPill}
          </p>
        )}
      </div>
      <p className="mb-1 mt-0 text-[20px] font-medium leading-[1.2] text-heading">{card.name}</p>
      <p className="mb-6 mt-0 text-[14px] leading-[1.5] text-text">{card.subtitle}</p>

      <div className="mb-5">
        {card.price.struck && (
          <div className="leading-[24px]">
            <del className="text-[14px] leading-[1.5] text-text">{card.price.struck}</del>
          </div>
        )}
        <div className="flex flex-wrap items-baseline text-[36px] font-semibold leading-[1.1] text-primary">
          <span>{card.price.main}</span>
          <span className="text-[16px] leading-[1.1]">{card.price.unit}</span>
        </div>
        {(card.price.tagline || card.price.taglineStrong) && (
          <div className="mt-[5px] min-h-[35.1px] text-[13px] font-semibold leading-[1.35]">
            {card.price.tagline}
            {card.price.taglineStrong && <strong className="font-semibold">{card.price.taglineStrong}</strong>}
          </div>
        )}
      </div>

      <div className="mb-6">
        <button
          type="button"
          disabled={busy}
          onClick={() => onChoose(card)}
          className={`block w-full cursor-pointer rounded-xl border-0 px-5 py-4 text-center text-[16px] font-medium leading-[1.2] text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70 ${
            card.highlighted ? "bg-primary" : "bg-button"
          }`}
        >
          Choose plan
        </button>
      </div>

      <div className="mb-5 border-t border-soft pt-6">
        <ul className="m-0 list-none p-0">
          {card.inclusions.map((i) => (
            <li
              key={i.text}
              className={`mb-3 flex items-center gap-[10px] text-[14px] leading-[1.2] ${
                i.included ? "tick-li text-heading" : "dash-li text-grey"
              }`}
            >
              <span>{i.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {card.termsUrl && (
        <div className="mt-auto">
          <a
            href={card.termsUrl}
            target="_blank"
            rel="noopener"
            className="inline-block text-[13px] font-medium leading-[1.2] text-heading after:content-['_→'] hover:text-primary"
          >
            Terms &amp; exclusions
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Plans Comparison Table (inc/plans/plans-cards.php + plan-table.js): I am a
 * Homeowner/Landlord, Call-out fee, Pay Monthly/Annually. Every combination
 * was priced on the server from Zoho, so switching is instant; the fee and
 * payment choices are remembered in the same `fee` / `duration` cookies.
 */
export function PlansCards({ table }: { table: PlansTable }) {
  const { page } = table;
  const router = useRouter();
  // The visitor's last fee / payment choice (same `fee` / `duration` cookies as WordPress).
  // Server render (and hydration) uses the page defaults, then the cookies apply.
  const cookies = useSyncExternalStore(noopSubscribe, () => document.cookie, () => "");
  const [chosenFee, setChosenFee] = useState<number | null>(null);
  const [chosenDuration, setChosenDuration] = useState<Duration | null>(null);
  const [busy, setBusy] = useState(false);

  const cookieFeeRaw = readCookie(cookies, "fee");
  const cookieFee = cookieFeeRaw ? Number(cookieFeeRaw) : NaN;
  const cookieDuration = readCookie(cookies, "duration");
  const fee = chosenFee ?? (page.fees.includes(cookieFee) ? cookieFee : page.defaultFee);
  const duration: Duration =
    chosenDuration ?? (cookieDuration === "yearly" || cookieDuration === "monthly" ? cookieDuration : "monthly");

  const cards = useMemo(() => table.cards[`${duration}-${fee}`] ?? [], [table.cards, duration, fee]);
  const popular = Math.max(0, cards.findIndex((c) => c.highlighted));

  const chooseFee = (f: number) => {
    setChosenFee(f);
    setCookie("fee", String(f));
  };
  const chooseDuration = (d: Duration) => {
    setChosenDuration(d);
    setCookie("duration", d);
  };

  const onChoose = (card: PlanCard) => {
    setBusy(true);
    const q = new URLSearchParams({ plan: String(card.planId), from: page.slug, start: duration });
    router.push(`/checkout?${q}`);
  };

  const [before, accent, after] = (() => {
    const i = page.title.toLowerCase().lastIndexOf(page.titleAccent.toLowerCase());
    if (i < 0) return [page.title, "", ""];
    return [page.title.slice(0, i), page.title.slice(i, i + page.titleAccent.length), page.title.slice(i + page.titleAccent.length)];
  })();

  return (
    <div id="plans_section" className="mx-auto max-w-[2100px] scroll-mt-4">
      <div className="container-ph max-[768px]:px-4">
        <div className="mb-2 text-left">
          <h2 className="mb-[5px] mt-0 text-[32px] font-semibold leading-[1.15] text-heading min-[769px]:text-[48px]">
            {before}
            <span className="text-primary">{accent}</span>
            {after}
          </h2>
          <p className="mb-9 mt-3 max-w-[480px] text-[16px] leading-[1.625] text-text min-[769px]:text-[20px] min-[769px]:leading-[1.4]">
            {page.subtitle}
          </p>

          <div className="flex flex-col items-stretch gap-4 min-[769px]:flex-row min-[769px]:flex-wrap min-[769px]:items-center min-[769px]:gap-x-10 min-[769px]:gap-y-4">
            <OptionGroup label="I am a">
              <Link href="/boiler-cover#plans_section" scroll={false} className={optionBtn(page.customer === "homeowner")}>
                Homeowner
              </Link>
              <Link href="/landlord-cover#plans_section" scroll={false} className={optionBtn(page.customer === "landlord")}>
                Landlord
              </Link>
            </OptionGroup>
            <OptionGroup label="Call-out fee">
              {page.fees.map((f) => (
                <button key={f} type="button" onClick={() => chooseFee(f)} className={optionBtn(fee === f)}>
                  £{f}
                </button>
              ))}
            </OptionGroup>
            <OptionGroup label="Pay" className="max-[768px]:mt-2">
              <button type="button" onClick={() => chooseDuration("monthly")} className={optionBtn(duration === "monthly")}>
                Monthly
              </button>
              <button type="button" onClick={() => chooseDuration("yearly")} className={`relative ${optionBtn(duration === "yearly")}`}>
                Annually
                {table.bubble && duration !== "yearly" && <span className="offer-bubble">{table.bubble}</span>}
              </button>
            </OptionGroup>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="mb-12 pt-10 text-center">
            <div className="text-heading">Plan not found. Please try again!</div>
          </div>
        ) : (
          <div className="max-[768px]:overflow-x-clip">
            <CardSlider
              key={`${duration}-${fee}`}
              initialIndex={popular}
              listClassName="m-0 flex list-none items-stretch gap-5 p-0 pt-10 max-[768px]:-mx-4 max-[768px]:snap-x max-[768px]:snap-mandatory max-[768px]:gap-2 max-[768px]:overflow-x-auto max-[768px]:px-6 max-[768px]:pb-6 max-[768px]:pt-4 max-[768px]:[scroll-padding:0_24px] min-[769px]:max-[1140px]:flex-wrap"
              itemClassName="flex max-[768px]:flex-[0_0_calc(100vw-48px)] max-[768px]:snap-center min-[769px]:min-w-0 min-[769px]:flex-1 min-[769px]:max-[1140px]:flex-[1_1_calc(50%-0.625rem)]"
              items={cards.map((c) => (
                <PlanCardView key={c.planId} card={c} onChoose={onChoose} busy={busy} />
              ))}
            />
          </div>
        )}
      </div>
      <div className="container-ph max-[768px]:px-4">
        <p className="mb-0 mt-6 text-[14px] leading-[1.5] text-text min-[769px]:hidden">Swipe to compare plans &rarr;</p>
        <div className="mt-5 text-[14px] leading-[1.5] text-text min-[769px]:mt-8">
          <p className="m-0">
            Not sure which plan fits? Compare what each one covers below or call{" "}
            <a href={`tel:${PHONE_SALES.replace(/\s/g, "")}`} className="hover:text-primary">
              {PHONE_SALES}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
