"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HEADER_CTA, LIVE, NAV } from "@/lib/site";
import { ContactDetails } from "./ContactDetails";

/** The slide-in phone menu (header.php #siteMobileMenu). */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    // Move focus into the menu when it opens and back to the burger when it closes.
    if (open) closeRef.current?.focus();
    else if (wasOpen.current) burgerRef.current?.focus();
    wasOpen.current = open;
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={burgerRef}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        className="ml-auto block cursor-pointer border-0 bg-transparent p-[6px] min-[1001px]:hidden"
        onClick={() => setOpen(true)}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} className="my-[5px] block h-[2.5px] w-[26px] rounded-sm bg-heading" />
        ))}
      </button>

      {/* Closed: inert + invisible, so its links are neither focusable nor in the accessibility tree. */}
      <div
        id="site-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={`fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white px-6 pb-[34px] pt-[22px] ${
          open
            ? "visible translate-x-0 [transition:transform_300ms_ease]"
            : "invisible translate-x-full [transition:transform_300ms_ease,visibility_0s_linear_300ms]"
        }`}
      >
        <div className="mb-[30px] flex items-center justify-between">
          <Link href="/" onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/plusheat-logo.svg" alt="PlusHeat" width={139} height={25} className="max-w-[140px]" />
          </Link>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            className="cursor-pointer border-0 bg-transparent text-[32px] leading-none text-text"
            onClick={() => setOpen(false)}
          >
            &times;
          </button>
        </div>

        <nav>
          <ul className="m-0 mb-[30px] flex list-none flex-col gap-5 p-0">
            {NAV.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={sub === item.label}
                      className="flex w-full items-center justify-between border-0 bg-transparent p-0 text-left text-[16px] font-semibold text-heading"
                      onClick={() => setSub(sub === item.label ? null : item.label)}
                    >
                      {item.label}
                      <span
                        className={`mr-1 h-2 w-2 border-b-2 border-r-2 border-current transition-transform ${
                          sub === item.label ? "translate-y-[2px] -rotate-[135deg]" : "-translate-y-[3px] rotate-45"
                        }`}
                      />
                    </button>
                    {sub === item.label && (
                      <ul className="m-0 mt-3 flex list-none flex-col p-0 pl-[14px]">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              onClick={() => setOpen(false)}
                              className="block py-[9px] text-[15px] text-text"
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <a href={item.href} className="text-[16px] font-semibold text-heading">
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-[16px] leading-[2.25] text-text">
          <h4 className="mb-0 font-semibold">
            <a href={`${LIVE}/contact/`} className="text-heading">
              Contact us
            </a>
          </h4>
          <ContactDetails />
        </div>

        <div className="mt-auto flex gap-[14px] pt-[34px]">
          {HEADER_CTA.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-2xl border-2 border-heading bg-heading p-4 text-[16px] leading-none text-white"
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
