/** Pages not rebuilt yet still live on the WordPress site. */
export const LIVE = "https://www.plusheat.co.uk";

export const PHONE_SALES = "0808 164 2892";
export const PHONE_EMERGENCY = "0808 164 2893";
export const EMAIL_SUPPORT = "support@plusheat.co.uk";

export const NAV: { label: string; href: string; children?: { label: string; href: string }[] }[] = [
  {
    label: "Cover",
    href: "#",
    children: [
      { label: "Boiler Cover", href: "/boiler-cover" },
      { label: "Landlord Cover", href: "/landlord-cover" },
    ],
  },
  { label: "Boiler Service", href: `${LIVE}/boiler-service/` },
  { label: "Boiler Repair", href: `${LIVE}/repair-care/` },
  { label: "New Boiler", href: `${LIVE}/new-boiler-heatable/` },
  { label: "Support", href: `${LIVE}/blog/` },
  { label: "Contact Us", href: `${LIVE}/contact/` },
];

export const HEADER_CTA = [
  { label: "Book Service", href: `${LIVE}/request-service/` },
  { label: "Book Repair", href: `${LIVE}/breakdown-reporting/` },
];

export const FOOTER_COLUMNS = {
  plans: {
    title: "Service plans",
    links: [
      { label: "Boiler Cover", href: `${LIVE}/boiler-cover-plan/` },
      { label: "Heating Cover", href: `${LIVE}/heating-cover-plan/` },
      { label: "Home Cover", href: `${LIVE}/home-cover-plan/` },
      { label: "Total Cover", href: `${LIVE}/total-cover-plan/` },
      { label: "London", href: `${LIVE}/boiler-cover-london/` },
      { label: "Manchester", href: `${LIVE}/boiler-cover-manchester/` },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "FAQs", href: `${LIVE}/homeowners/faqs/` },
      { label: "Complaints", href: `${LIVE}/wp-content/uploads/2020/03/Complaints_Procedure.pdf`, external: true },
      { label: "Cancellations", href: `${LIVE}/cancellations/` },
      { label: "Contact Us", href: `${LIVE}/contact/` },
    ],
  },
  about: {
    title: "About us",
    links: [
      { label: "Our Story", href: `${LIVE}/our-story/` },
      { label: "Our Promise", href: `${LIVE}/our-promise/` },
      { label: "Careers", href: `${LIVE}/work-with-us/` },
      { label: "Become an Engineer", href: `${LIVE}/become-an-engineer/` },
    ],
  },
};

export const SOCIAL = [
  { title: "Facebook", href: "https://www.facebook.com/plusheatuk/", icon: "/images/facebook.svg" },
  { title: "Instagram", href: "https://www.instagram.com/plusheatuk/", icon: "/images/instagram.svg" },
  { title: "LinkedIn", href: "#", icon: "/images/linkedin.svg" },
  { title: "X", href: "https://twitter.com/PlusHeatUK", icon: "/images/twitter.svg" },
  { title: "YouTube", href: "https://www.youtube.com/channel/UCVflgz-rlIdxE3RY87fsw4Q", icon: "/images/youtube.svg" },
];

export const TRUSTPILOT_URL = "https://uk.trustpilot.com/review/www.plusheat.co.uk";
export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?hl=en-GB&gl=uk&q=PlusHeat,+27+Old+Gloucester+St,+London+WC1B+5AA&ludocid=14326118305456231096&lsig=AB86z5VyR2Ku7JbKJjLPVKn_ug4x#lrd=0x48760f6c166c0001:0xc6d098b21ef092b8,1";
