import Link from "next/link";
import { HEADER_CTA, NAV } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";

function NavLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return href.startsWith("/") ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`} aria-label="PlusHeat home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/plusheat-logo.svg" alt="PlusHeat" width={139} height={25} className="block h-auto max-w-[150px]" />
    </Link>
  );
}

/** header.php: logo, primary menu (with the Cover dropdown), Book Service / Book Repair. */
export function SiteHeader({ simplified = false, overHero = false }: { simplified?: boolean; overHero?: boolean }) {
  return (
    <header className={`relative z-40 bg-white ${overHero ? "over-hero" : ""}`}>
      <div className="container-ph">
        <div className="flex min-h-[66px] items-center justify-between gap-6 min-[1001px]:min-h-[78px]">
          <Logo />
          {!simplified && (
            <>
              <nav className="hidden flex-1 justify-center min-[1001px]:flex" aria-label="Primary">
                <ul className="m-0 flex list-none items-center gap-[22px] p-0">
                  {NAV.map((item, i) => (
                    <li
                      key={item.label}
                      className={`group relative ${i > 0 ? "before:px-[5px] before:text-transparent before:content-['|']" : ""}`}
                    >
                      <NavLink
                        href={item.href}
                        className="whitespace-nowrap text-[16px] leading-none text-heading transition-opacity hover:text-primary hover:opacity-80"
                      >
                        {item.label}
                      </NavLink>
                      {item.children && (
                        <ul className="invisible absolute left-1/2 top-[calc(100%+14px)] z-[100] flex min-w-[220px] -translate-x-1/2 -translate-y-2 flex-col gap-[2px] rounded-2xl border border-[#efefef] bg-white p-2 text-left opacity-0 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.18)] transition-all duration-200 before:absolute before:inset-x-0 before:-top-4 before:h-4 before:content-[''] group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                          {item.children.map((c) => (
                            <li key={c.href} className="w-full">
                              <NavLink
                                href={c.href}
                                className="block whitespace-nowrap rounded-[10px] px-[14px] py-3 text-[15px] leading-[1.2] text-heading transition-colors hover:bg-[#fff3e8] hover:text-primary"
                              >
                                {c.label}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="hidden flex-none gap-3 min-[1001px]:flex">
                {HEADER_CTA.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    className="hdr-btn inline-flex items-center justify-center whitespace-nowrap rounded-2xl border-2 border-heading bg-white px-6 py-3 text-[16px] leading-none text-heading transition-colors hover:bg-heading hover:text-white"
                  >
                    {c.label}
                  </a>
                ))}
              </div>
              <MobileMenu />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
