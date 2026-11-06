/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { FOOTER_COLUMNS, LIVE, SOCIAL } from "@/lib/site";
import { ContactDetails } from "./ContactDetails";

type Col = { title: string; links: { label: string; href: string; external?: boolean }[] };

function Column({ col, className }: { col: Col; className: string }) {
  return (
    <div className={className}>
      <h4 className="mb-4 mt-0 text-[20px] font-semibold leading-[28px] text-[#f5f5f5]">{col.title}</h4>
      <ul className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-3 p-0 min-[1001px]:flex min-[1001px]:flex-col min-[1001px]:gap-[10px]">
        {col.links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener" : undefined}
              className="text-[16px] leading-[26px] text-[#f5f5f5] transition-colors hover:text-primary min-[1001px]:text-[20px] min-[1001px]:leading-[28px]"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** footer.php, dark style (General Settings > Footer > Footer style = Dark). */
export function SiteFooter() {
  return (
    <footer className="relative z-[2] mt-4 rounded-t-[64px] border-t border-heading bg-heading tracking-[-0.03em] text-[#f5f5f5] shadow-[var(--shadow-panel-strong)] min-[1001px]:mt-0">
      <div className="container-ph">
        <div className="grid grid-cols-1 gap-[34px] pb-6 pt-11 min-[1001px]:grid-cols-[2fr_1fr_1fr_1fr_2fr] min-[1001px]:gap-6 min-[1001px]:pb-14 min-[1001px]:pt-16 min-[1101px]:grid-cols-[2fr_0.7fr_0.7fr_0.7fr_1.5fr]">
          <div className="order-0">
            <Link href="/" className="inline-flex items-center">
              <img src="/images/plusheat-logo.svg" alt="PlusHeat" width={139} height={25} className="mb-4 max-w-[160px]" />
            </Link>
            <p className="mb-[22px] mt-0 max-w-full text-[16px] leading-6 text-[#f5f5f5] min-[1001px]:max-w-[300px]">
              Reliable protection for your boiler and central heating system and more – all in one place.
            </p>
            <div className="flex gap-[14px]">
              {SOCIAL.map((s) => (
                <a key={s.title} href={s.href} target="_blank" rel="noopener" title={s.title} className="inline-flex h-6 w-6">
                  <img src={s.icon} alt={s.title} width={24} height={24} className="h-full w-full object-contain brightness-0 invert" />
                </a>
              ))}
            </div>
          </div>
          <Column col={FOOTER_COLUMNS.plans} className="order-2 min-[1001px]:order-none" />
          <Column col={FOOTER_COLUMNS.support} className="order-4 min-[1001px]:order-none" />
          <Column col={FOOTER_COLUMNS.about} className="order-3 min-[1001px]:order-none" />
          <div className="order-1 text-[16px] leading-6 min-[1001px]:order-none min-[1001px]:text-[20px] min-[1001px]:leading-[28px]">
            <h4 className="mb-4 mt-0 text-[20px] font-semibold leading-[28px]">
              <a href={`${LIVE}/contact/`} className="text-[#f5f5f5] hover:text-primary">
                Contact us
              </a>
            </h4>
            <div className="-mt-[3px] leading-[2] [&_a]:text-[#f5f5f5]">
              <ContactDetails strongClass="text-[#f5f5f5]" />
            </div>
          </div>
        </div>

        <div className="pb-12 pt-9 text-[16px] leading-6 text-[#f5f5f5] opacity-65">
          <div className="mb-[14px]">
            <div>
              Our plans are a service agreement and not an insurance policy; as such it is not regulated by the Financial
              Conduct Authority. Please read the full{" "}
              <a href={`${LIVE}/terms-conditions/`} className="underline underline-offset-2 hover:text-primary">
                terms &amp; Conditions
              </a>
              .
            </div>
            <div>
              Boiler services will be carried out between the months of April – September. This is to ensure we are
              fully equipped and have engineers available to assist you with breakdowns during the busy winter months.
              If you opt to pay monthly, you will also need to be a customer for three months before you can call to
              book in your boiler service.
            </div>
          </div>
          <div className="flex flex-col items-start gap-x-[22px] gap-y-2 pt-[6px] min-[1001px]:flex-row min-[1001px]:flex-wrap min-[1001px]:items-center">
            <span>VAT Registration Number: 320980416</span>
            <a href={`${LIVE}/terms-conditions/`} className="hover:text-primary">
              Terms &amp; Conditions
            </a>
            <a href={`${LIVE}/wp-content/uploads/2026/06/Plusheat-Privacy-Doc.pdf`} target="_blank" rel="noopener" className="hover:text-primary">
              Security &amp; Privacy Policy
            </a>
            <span className="mt-[30px] basis-full min-[1001px]:ml-auto min-[1001px]:mt-0 min-[1001px]:basis-auto">
              &copy; PlusHeat {new Date().getFullYear()} All Rights Reserved
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
