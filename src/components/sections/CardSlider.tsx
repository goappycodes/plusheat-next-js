"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Phone card slider (assets/js/sections/card-slider.js): a native
 * scroll-snap row with round arrows centred on the card edges. On wider
 * screens the arrows are hidden and the row is a normal flex row.
 */
export function CardSlider({
  items,
  listClassName,
  itemClassName,
  initialIndex = 0,
  arrowsBelow = 768,
}: {
  items: React.ReactNode[];
  listClassName: string;
  itemClassName: string;
  initialIndex?: number;
  arrowsBelow?: number;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(initialIndex);

  const scrollTo = useCallback((i: number, smooth = true) => {
    const list = ref.current;
    if (!list) return;
    const el = list.children[i] as HTMLElement | undefined;
    if (!el) return;
    const left = el.offsetLeft - (list.clientWidth - el.clientWidth) / 2;
    list.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    if (initialIndex > 0 && window.innerWidth <= arrowsBelow) scrollTo(initialIndex, false);
  }, [initialIndex, arrowsBelow, scrollTo]);

  const onScroll = () => {
    const list = ref.current;
    if (!list) return;
    const mid = list.scrollLeft + list.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(list.children).forEach((c, i) => {
      const el = c as HTMLElement;
      const d = Math.abs(el.offsetLeft + el.clientWidth / 2 - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setIndex(best);
  };

  const arrow =
    "absolute top-1/2 z-[2] h-10 w-10 -translate-y-1/2 cursor-pointer rounded-full border-0 bg-white p-0 shadow-[0_4px_14px_rgba(22,22,22,0.12)] disabled:cursor-default before:absolute before:left-1/2 before:top-1/2 before:h-[0.6rem] before:w-[0.6rem] before:border-l-2 before:border-t-2 before:border-heading before:content-[''] disabled:before:opacity-25";
  const show = arrowsBelow === 768 ? "min-[769px]:hidden" : "min-[992px]:hidden";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Previous"
        disabled={index <= 0}
        onClick={() => scrollTo(Math.max(0, index - 1))}
        className={`${arrow} ${show} left-[calc(16px-1.25rem)] before:-translate-x-[30%] before:-translate-y-1/2 before:-rotate-45`}
      />
      <ul ref={ref} onScroll={onScroll} className={`no-scrollbar ${listClassName}`}>
        {items.map((it, i) => (
          <li key={i} className={itemClassName}>
            {it}
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-label="Next"
        disabled={index >= items.length - 1}
        onClick={() => scrollTo(Math.min(items.length - 1, index + 1))}
        className={`${arrow} ${show} right-[calc(16px-1.25rem)] before:-translate-x-[70%] before:-translate-y-1/2 before:rotate-[135deg]`}
      />
    </div>
  );
}
