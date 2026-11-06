"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { TRUSTPILOT_URL } from "@/lib/site";

declare global {
  interface Window {
    Trustpilot?: { loadFromElement: (el: HTMLElement, force?: boolean) => void };
  }
}

const BUSINESS_UNIT = "59e0d6b80000ff0005ad90df";

/**
 * The site's own TrustBox (template "Slider", 5-star reviews), exactly as on
 * WordPress. TrustBoxes only render on domains allowed in Trustpilot, so if
 * the iframe has not appeared after a few seconds (e.g. on a preview domain)
 * a static summary card is shown instead.
 */
export function TrustpilotWidget({
  templateId = "54ad5defc6454f065c28af8b",
  height = "240px",
  stars = "5",
  locale = "en-GB",
}: {
  templateId?: string;
  height?: string;
  stars?: string;
  locale?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ref.current && window.Trustpilot) window.Trustpilot.loadFromElement(ref.current, true);
    const t = setTimeout(() => {
      const iframe = ref.current?.querySelector("iframe");
      if (!iframe || iframe.offsetHeight < 20) setFailed(true);
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <Script
        src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (ref.current && window.Trustpilot) window.Trustpilot.loadFromElement(ref.current, true);
        }}
      />
      <div
        ref={ref}
        className={failed ? "hidden" : "trustpilot-widget"}
        data-locale={locale}
        data-template-id={templateId}
        data-businessunit-id={BUSINESS_UNIT}
        data-style-height={height}
        data-style-width="100%"
        data-stars={stars}
        data-review-languages="en"
      >
        <a href={TRUSTPILOT_URL} target="_blank" rel="noopener">
          Trustpilot
        </a>
      </div>
      {failed && (
        <a
          href={TRUSTPILOT_URL}
          target="_blank"
          rel="noopener"
          className="flex flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-soft px-6 py-10 text-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-black.svg" alt="Trustpilot" width={120} height={30} className="h-[30px] w-auto" />
          <span className="text-[28px] tracking-[4px] text-[#00b67a]">★★★★★</span>
          <span className="text-[16px] text-heading">
            Rated <strong>4.7</strong> / 5 based on <span className="underline">18,000+ reviews</span>
          </span>
        </a>
      )}
    </div>
  );
}
