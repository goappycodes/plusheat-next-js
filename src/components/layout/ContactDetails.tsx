import { EMAIL_SUPPORT, PHONE_EMERGENCY, PHONE_SALES } from "@/lib/site";

/* eslint-disable @next/next/no-img-element */
const Icon = ({ src }: { src: string }) => (
  <img src={src} alt="" width={18} height={18} className="mr-2 inline-block h-[18px] w-[18px] align-[-4px]" />
);

/** The "Contact us" block (General Settings > Footer > Contact) used in the footer and mobile menu. */
export function ContactDetails({ strongClass = "text-heading" }: { strongClass?: string }) {
  return (
    <p className="m-0">
      <Icon src="/images/mail-filled.svg" />
      <a href={`mailto:${EMAIL_SUPPORT}`} className="hover:text-primary">
        {EMAIL_SUPPORT}
      </a>
      <br />
      <Icon src="/images/phone-filled.svg" />
      <a href={`tel:${PHONE_SALES}`} className="hover:text-primary">
        {PHONE_SALES}
      </a>
      <br />
      <Icon src="/images/clock-filled.svg" />
      Mon-Fri 09:00 – 17:00
      <br />
      <strong className={`font-semibold ${strongClass}`}>Emergency Breakdown</strong>
      <br />
      <Icon src="/images/phone-filled.svg" />
      <a href={`tel:${PHONE_EMERGENCY}`} className="hover:text-primary">
        {PHONE_EMERGENCY}
      </a>
    </p>
  );
}
