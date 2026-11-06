/**
 * Checkout rules shared by the browser (instant feedback) and the API route
 * (the source of truth). Ported from plusheat-checkout.js / global-functions.js
 * and the eazycollect-form plugin (validatePostcode()).
 */

export interface AboutYou {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postcode: string;
  address1: string;
  address2: string;
  town: string;
  county: string;
  country: string;
  /** YYYY-MM-DD */
  startDate: string;
}

export type FieldErrors = Partial<Record<keyof AboutYou, string>>;

const EMAIL_RE = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/;
const UK_POSTCODE_RE = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i;

/** Areas PlusHeat does not cover (eazycollect.js validatePostcode()). */
const EXCLUDED_PREFIXES = [
  "IM", "ZE", "GY", "HS", "JE", "KW", "LD", "PO67",
  ...Array.from({ length: 21 }, (_, i) => `LL${58 + i}`),
  ...Array.from({ length: 61 }, (_, i) => `PA${20 + i}`),
  "IV19", "IV41", "IV42", "IV43", "IV44", "IV45", "IV46", "IV47", "IV48", "IV49", "IV55", "IV56",
  ...Array.from({ length: 12 }, (_, i) => `PO${30 + i}`),
];

export const NOT_COVERED_MESSAGE = "Unfortunately, we do not cover your area, sorry for the inconvenience!";

export function postcodeExcluded(postcode: string): boolean {
  const pc = postcode.toUpperCase().replace(/\s+/g, "");
  return EXCLUDED_PREFIXES.some((p) => pc.startsWith(p));
}

/** Formats "sw1a1aa" as "SW1A 1AA". */
export function formatPostcode(pc: string): string {
  const m = pc.trim().toUpperCase().match(UK_POSTCODE_RE);
  return m ? `${m[1]} ${m[2]}` : pc.trim().toUpperCase();
}

/** UK mobile normalised to +447xxxxxxxxx (the checkout prefills +44). */
export function normalisePhone(raw: string): string {
  let p = raw.replace(/[\s()-]/g, "");
  if (p.startsWith("0044")) p = "+44" + p.slice(4);
  if (p.startsWith("44")) p = "+" + p;
  if (p.startsWith("+440")) p = "+44" + p.slice(4);
  if (p.startsWith("07")) p = "+44" + p.slice(1);
  return p;
}

/** UK date helpers for the agreement start date: today (UK time) to +90 days. */
export function ukToday(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function validateAboutYou(v: AboutYou): FieldErrors {
  const e: FieldErrors = {};
  const req = (k: keyof AboutYou, label: string) => {
    if (!v[k] || !String(v[k]).trim()) e[k] = `${label} is a required field.`;
  };
  req("firstName", "First Name");
  req("lastName", "Surname");
  req("email", "Email Address");
  req("phone", "Mobile Number");
  req("postcode", "Postcode");
  req("address1", "Address line 1");
  req("town", "Town");
  req("startDate", "Agreement Start Date");

  if (!e.lastName && !/^[A-Za-z][A-Za-z' -]*$/.test(v.lastName.trim())) e.lastName = "Please enter letters only.";
  if (!e.email && !EMAIL_RE.test(v.email.trim())) e.email = "Please enter a valid email address.";
  if (!e.phone && !/^(?:\+447\d{9}|07\d{9})$/.test(normalisePhone(v.phone))) {
    e.phone = "Please enter a valid UK mobile number.";
  }
  if (!e.postcode) {
    if (!UK_POSTCODE_RE.test(v.postcode.trim())) e.postcode = "Please enter a valid UK postcode.";
    else if (postcodeExcluded(v.postcode)) e.postcode = NOT_COVERED_MESSAGE;
  }
  if (!e.startDate) {
    const today = ukToday();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.startDate) || v.startDate < today || v.startDate > addDays(today, 90)) {
      e.startDate = "Please choose a start date within the next 90 days.";
    }
  }
  return e;
}

/** getZOHOErrorMessage() (eazycollect.js) */
export function friendlyZohoError(message: string): string {
  if (message === "Enter a valid coupon code") {
    return "Unfortunately your coupon code has not been recognised by the checkout. Please double check the code that you have used. Our Customer Services team are available to help you with this issue. Please use our live chat to speak to someone now.";
  }
  if (message === "Coupon cannot be applied to the subscription since it is neither associated with the plan nor the addon") {
    return "Unfortunately this coupon code cannot be applied to this plan. Our Customer Services team are available to help you with this issue. Please use our live chat to speak to someone now.";
  }
  return message;
}
