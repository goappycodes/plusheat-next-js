"use client";

import { useState } from "react";

const input =
  "box-border h-[58px] w-full rounded-2xl border-2 border-border-light bg-white px-4 py-[10px] text-[18px] text-heading outline-none placeholder:text-text focus:border-primary min-[769px]:text-[20px]";

/** Gravity Form 16 ("Boiler Cover"): Name, Phone, Email -> Zoho CRM lead (lead-capture.php). */
export function LeadForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return; // honeypot
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          pageUrl: window.location.href,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Something went wrong, please try again.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong, please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl bg-secondary p-6 text-[18px] leading-[1.5] text-heading">
        Thanks for getting in touch! One of our team will call you shortly to find the right cover for your home.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      <div className="grid grid-cols-1 gap-4 min-[641px]:grid-cols-2">
        <label className="sr-only" htmlFor="lead-name">
          Name
        </label>
        <input id="lead-name" name="name" type="text" required placeholder="Name" autoComplete="name" className={input} />
        <label className="sr-only" htmlFor="lead-phone">
          Telephone
        </label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          required
          placeholder="Phone Number"
          autoComplete="tel"
          pattern="^(?:\+44\s?7\d{3}|07\d{3})\s?\d{3}\s?\d{3}$|^[0-9+ ]{10,14}$"
          className={input}
        />
        <label className="sr-only" htmlFor="lead-email">
          Email
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          required
          placeholder="Email Address"
          autoComplete="email"
          className={`${input} min-[641px]:col-span-2`}
        />
        <input name="website" type="text" tabIndex={-1} autoComplete="off" className="hidden" />
      </div>
      {error && <p className="mb-0 mt-3 text-[14px] text-[#cc0100]">{error}</p>}
      <div className="mt-6 flex">
        <button
          type="submit"
          disabled={state === "sending"}
          className="mb-2 w-full cursor-pointer rounded-2xl border-0 bg-button px-8 pb-[18px] pt-4 text-center text-[20px] font-medium text-white transition-colors hover:bg-grey-dark disabled:opacity-70 min-[769px]:w-auto"
        >
          {state === "sending" ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
