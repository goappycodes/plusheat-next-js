"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useRef, useState } from "react";
import type { CheckoutModel } from "@/lib/plans-view";
import {
  AboutYou,
  FieldErrors,
  NOT_COVERED_MESSAGE,
  addDays,
  postcodeExcluded,
  ukToday,
  validateAboutYou,
} from "@/lib/checkout";
import { CheckoutRatings, PlanPanel, WhatsIncluded } from "./PlanPanel";
import { Stepper } from "./Stepper";

const input =
  "box-border min-h-[50px] w-full rounded-[15px] border-2 bg-white px-5 py-[7px] text-[16px] leading-5 text-heading outline-none transition-colors focus:border-primary";
const inputCls = (err?: string) => `${input} ${err ? "border-[#cc0100]" : "border-border-light"}`;

function Field({
  id,
  label,
  required,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={`m-0 ${className}`}>
      <label htmlFor={id} className="mt-[25px] block font-semibold leading-8 text-text">
        {label}
        {required && <span className="ml-[2px] inline-block font-bold text-primary-dark">*</span>}
      </label>
      {children}
      {error && <span className="mt-1 block text-[13px] leading-[1.4] text-[#cc0100]">{error}</span>}
    </p>
  );
}

type Address = { id: string; label: string };

export function CheckoutFlow({ model }: { model: CheckoutModel }) {
  const [duration, setDuration] = useState<"monthly" | "yearly">(model.initialDuration);
  const side = (duration === "yearly" ? model.yearly : model.monthly) ?? model.monthly ?? model.yearly!;
  // The plan's own offer coupon (read-only), or a code the customer types when there is none.
  const [typedCoupon, setTypedCoupon] = useState("");
  const coupon = side.coupon || typedCoupon;

  const today = useMemo(() => ukToday(), []);
  const [v, setV] = useState<AboutYou>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+44",
    postcode: "",
    address1: "",
    address2: "",
    town: "",
    county: "",
    country: "United Kingdom",
    startDate: today,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [manual, setManual] = useState(false);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [lookupMsg, setLookupMsg] = useState("");
  const [looking, setLooking] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [hostedUrl, setHostedUrl] = useState("");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof AboutYou) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (k === "phone") {
      // global-functions.js: keep the +44 prefix while typing.
      val = val.replace(/[^\d+ ]/g, "");
      if (/^07/.test(val)) val = "+44" + val.slice(1);
      if (!val.startsWith("+44")) val = "+44" + val.replace(/^\+?4?4?/, "");
    }
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  async function lookup() {
    const pc = v.postcode.trim();
    setLookupMsg("");
    setAddresses(null);
    if (!pc) {
      setErrors((p) => ({ ...p, postcode: "Postcode is a required field." }));
      return;
    }
    if (postcodeExcluded(pc)) {
      setErrors((p) => ({ ...p, postcode: NOT_COVERED_MESSAGE }));
      return;
    }
    setLooking(true);
    try {
      const res = await fetch(`/api/address?postcode=${encodeURIComponent(pc)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (!json.addresses?.length) setLookupMsg("No addresses found for that postcode. Please enter your address manually.");
      setAddresses(json.addresses ?? []);
    } catch (e) {
      setLookupMsg(e instanceof Error && e.message ? e.message : "Address lookup is unavailable. Please enter your address manually.");
      setManual(true);
    } finally {
      setLooking(false);
    }
  }

  async function pickAddress(id: string) {
    if (!id) return;
    try {
      const res = await fetch(`/api/address?id=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const a = json.address;
      setV((p) => ({
        ...p,
        address1: a.line1,
        address2: a.line2,
        town: a.town,
        county: a.county,
        country: a.country,
        postcode: a.postcode || p.postcode,
      }));
      setErrors((p) => ({ ...p, address1: undefined, town: undefined }));
      setManual(true);
    } catch {
      setLookupMsg("Sorry, we couldn't load that address. Please enter it manually.");
      setManual(true);
    }
  }

  async function submit() {
    setServerError("");
    const errs = validateAboutYou(v);
    if (errs.address1 || errs.town) setManual(true);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...v,
          planId: side.planId,
          from: model.pageSlug,
          start: model.startDuration,
          coupon,
        }),
      });
      const json = await res.json();
      if (json.code === 0 && json.url) {
        setHostedUrl(json.url);
        setStep(2);
      } else {
        if (json.errors) setErrors(json.errors);
        setServerError(json.message || "Sorry, something went wrong. Please try again.");
        if (!json.errors) setStep(2);
      }
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setServerError('Sorry, we could not process the submission. Please click "Continue to Payment" again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={topRef} className="scroll-mt-4">
      <Stepper step={step} />

      {step === 2 ? (
        <section className="mx-auto max-w-[1100px] pb-20 pt-5 min-[992px]:pt-10">
          <div className="container-ph">
            {hostedUrl ? (
              <div className="relative min-h-[400px]">
                {!iframeLoaded && (
                  <div className="absolute inset-x-0 top-10 flex flex-col items-center gap-3 text-heading">
                    <div className="ph-loader" />
                    <span>Loading secure payment…</span>
                  </div>
                )}
                <iframe
                  src={hostedUrl}
                  title="Secure payment"
                  onLoad={() => setIframeLoaded(true)}
                  className="h-[1040px] w-full border-0"
                  allow="payment"
                />
              </div>
            ) : (
              <div className="rounded-[15px] bg-secondary p-5 text-primary">
                {serverError}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setServerError("");
                    }}
                    className="cursor-pointer rounded-2xl border-0 bg-primary px-6 py-3 text-white"
                  >
                    Back to your details
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-[1100px] pb-20 pt-5 min-[992px]:pt-10">
          <div className="container-ph">
            <div className="relative flex flex-col gap-[30px] min-[992px]:flex-row">
              {/* About You */}
              <div className="min-w-0 min-[992px]:flex-[0_0_calc(66.666%-15px)]">
                <div className="mb-[30px] rounded-[15px] bg-secondary p-5 text-primary">
                  <div className="flex items-center gap-[10px]">
                    <img src="/images/shield-icon.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-full bg-primary p-[10px]" />
                    <span>You&apos;re minutes away from protecting your home.</span>
                  </div>
                </div>

                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                  className="flex flex-col rounded-[30px] bg-white px-5 py-[30px] shadow-[var(--shadow-plan)] min-[481px]:px-[30px] min-[481px]:py-10"
                >
                  <h3 className="mb-[10px] mt-0 text-[30px] font-semibold leading-none text-heading min-[481px]:text-[36px]">
                    About <span className="text-primary">You</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-x-5 min-[641px]:grid-cols-2">
                    <Field id="billing_first_name" label="First Name" required error={errors.firstName}>
                      <input
                        id="billing_first_name"
                        data-error={!!errors.firstName}
                        className={inputCls(errors.firstName)}
                        value={v.firstName}
                        onChange={set("firstName")}
                        autoComplete="given-name"
                      />
                    </Field>
                    <Field id="billing_last_name" label="Surname" required error={errors.lastName}>
                      <input
                        id="billing_last_name"
                        data-error={!!errors.lastName}
                        className={inputCls(errors.lastName)}
                        value={v.lastName}
                        onChange={set("lastName")}
                        autoComplete="family-name"
                      />
                    </Field>
                  </div>
                  <Field id="billing_email" label="Email Address" required error={errors.email}>
                    <input
                      id="billing_email"
                      type="email"
                      data-error={!!errors.email}
                      className={inputCls(errors.email)}
                      value={v.email}
                      onChange={set("email")}
                      autoComplete="email"
                    />
                  </Field>
                  <Field id="billing_phone" label="Mobile Number" required error={errors.phone}>
                    <input
                      id="billing_phone"
                      type="tel"
                      data-error={!!errors.phone}
                      className={inputCls(errors.phone)}
                      value={v.phone}
                      onChange={set("phone")}
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </Field>

                  <h4 className="mb-0 mt-[30px] text-[18px] font-semibold leading-[1.3] text-heading">
                    Property <span className="text-primary">Address</span>
                  </h4>
                  <Field id="postcode" label="Postcode" required error={errors.postcode}>
                    <div className="flex flex-col min-[641px]:flex-row min-[641px]:flex-wrap">
                      <input
                        id="postcode"
                        data-error={!!errors.postcode}
                        className={`${inputCls(errors.postcode)} order-1 uppercase min-[641px]:w-auto min-[641px]:min-w-0 min-[641px]:flex-1 min-[641px]:rounded-r-none min-[641px]:border-r-0`}
                        value={v.postcode}
                        onChange={set("postcode")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            lookup();
                          }
                        }}
                        autoComplete="postal-code"
                      />
                      <button
                        type="button"
                        onClick={lookup}
                        disabled={looking}
                        className="order-3 mt-3 flex min-h-[50px] flex-none cursor-pointer items-center justify-center gap-3 whitespace-nowrap rounded-[15px] border-0 bg-button px-5 text-[14px] font-medium text-white disabled:opacity-70 min-[641px]:order-2 min-[641px]:mt-0 min-[641px]:rounded-l-none min-[641px]:px-6 min-[641px]:text-[15px]"
                      >
                        {looking ? "Searching…" : "Lookup address"}
                        <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
                          <path d="M0 6h18M13 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </button>
                      {!manual && (
                        <button
                          type="button"
                          onClick={() => setManual(true)}
                          className="order-2 mt-3 cursor-pointer self-start border-0 bg-transparent p-0 text-[13px] text-text underline-offset-2 hover:underline min-[641px]:order-3 min-[641px]:basis-full min-[641px]:text-left"
                        >
                          Enter Address manually
                        </button>
                      )}
                    </div>
                  </Field>
                  {lookupMsg && <p className="mb-0 mt-3 text-[13px] text-[#cc0100]">{lookupMsg}</p>}
                  {addresses && addresses.length > 0 && (
                    <Field id="postcodeanywhwere_addresses" label="Address" required>
                      <select
                        id="postcodeanywhwere_addresses"
                        defaultValue=""
                        onChange={(e) => pickAddress(e.target.value)}
                        className={`${inputCls()} cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22><path d=%22M1 1l5 5 5-5%22 stroke=%22%23161616%22 stroke-width=%221.5%22 fill=%22none%22/></svg>')] bg-[right_20px_center] bg-no-repeat pr-12`}
                      >
                        <option value="" disabled>
                          Please select your address
                        </option>
                        {addresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                  {manual && (
                    <>
                      <Field id="Address_line_1" label="Address line 1" required error={errors.address1}>
                        <input
                          id="Address_line_1"
                          data-error={!!errors.address1}
                          className={inputCls(errors.address1)}
                          value={v.address1}
                          onChange={set("address1")}
                          autoComplete="address-line1"
                        />
                      </Field>
                      <Field id="Address_line_2" label="Address line 2">
                        <input id="Address_line_2" className={inputCls()} value={v.address2} onChange={set("address2")} autoComplete="address-line2" />
                      </Field>
                      <div className="grid grid-cols-1 gap-x-5 min-[641px]:grid-cols-2">
                        <Field id="Town" label="Town" required error={errors.town}>
                          <input id="Town" data-error={!!errors.town} className={inputCls(errors.town)} value={v.town} onChange={set("town")} autoComplete="address-level2" />
                        </Field>
                        <Field id="county" label="County">
                          <input id="county" className={inputCls()} value={v.county} onChange={set("county")} autoComplete="address-level1" />
                        </Field>
                      </div>
                      <Field id="country" label="Country">
                        <input id="country" className={inputCls()} value={v.country} onChange={set("country")} autoComplete="country-name" />
                      </Field>
                    </>
                  )}

                  <Field id="datepickerr" label="Agreement Start Date" required error={errors.startDate}>
                    <input
                      id="datepickerr"
                      type="date"
                      data-error={!!errors.startDate}
                      min={today}
                      max={addDays(today, 90)}
                      className={inputCls(errors.startDate)}
                      value={v.startDate}
                      onChange={set("startDate")}
                    />
                  </Field>

                  <input name="website" type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                  {serverError && (
                    <div className="mt-6 rounded-[15px] bg-secondary p-4 text-[14px] text-primary">{serverError}</div>
                  )}

                  <div className="mt-[30px]">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="relative block min-h-[50px] w-full cursor-pointer rounded-2xl border-0 bg-primary px-[25px] py-[13.5px] text-center text-[14px] font-medium leading-[1.2] text-white min-[481px]:text-[18px] min-[481px]:font-normal transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-75"
                    >
                      {submitting ? "Please Wait" : "Continue to Payment"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Your Plan */}
              <div className="min-w-0 min-[992px]:flex-[0_0_calc(33.333%-15px)]">
                <div className="rounded-[30px] bg-white p-[30px] shadow-[var(--shadow-plan)]">
                  <PlanPanel
                    model={model}
                    side={side}
                    duration={duration}
                    onSwitch={setDuration}
                    coupon={coupon}
                    onCoupon={setTypedCoupon}
                    showSwitch={model.startDuration === "monthly"}
                  />
                </div>
                <CheckoutRatings />
                <WhatsIncluded />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
