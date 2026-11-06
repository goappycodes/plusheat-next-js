# PlusHeat — Next.js (2027 rebuild)

Home page, Boiler Cover (and Landlord Cover) and the full checkout journey of
[plusheat.co.uk](https://www.plusheat.co.uk), rebuilt on **Next.js 16 + Tailwind v4**
and talking **directly to Zoho** — no WordPress / WooCommerce in the loop.

| Route | What it is | WordPress equivalent |
| --- | --- | --- |
| `/` | Home | page 4449 (Page Sections) |
| `/boiler-cover` | Plans comparison (homeowner) | page 27179, `[plusheat_plans_cards]` |
| `/landlord-cover` | Plans comparison (landlord) | page 6170 |
| `/checkout?plan=<id>&from=<page>&start=<monthly\|yearly>` | About You → Payment (Zoho hosted page) | `/checkout/?add-to-cart=<id>` + `zoho_custom.php` |
| `/thank-you?hostedpage_id=…` | Confirmation (reads the subscription back from Zoho) | `/thank-you/` `[get_order_product_details]` |
| `POST /api/checkout` | Creates the Zoho Billing hosted page | `zoho_custom.php` |
| `GET /api/address` | Loqate postcode lookup (server-side proxy) | `eazycollect.js` CapturePlus calls |
| `POST /api/lead` | "Let's find the right solution" form → Zoho CRM lead | Gravity Form 16 → `lead-capture.php` |

Pages not rebuilt yet (Boiler Service, Repair & Care, blog, contact…) link to the live WordPress site.

## How prices, offers and checkout work

Everything is ported from the child theme (`wp-content/themes/plusheat`) and the root Zoho scripts.

- **Plan matrix** — `src/data/plans.json` is an export of the WP `plusheat_plans` table: each
  level × duration × call-out fee × customer × boiler × service → **Zoho plan code**. The old
  WooCommerce product ID is kept as the public plan ID, so `/checkout?add-to-cart=139` still works.
- **Prices come from Zoho Billing** (`GET /billing/v1/plans`, cached 1 h). Zoho stores prices before
  VAT; the site shows `round(price × 1.2, 2)`, exactly what Zoho bills. On WordPress these numbers
  came from WooCommerce products that had to be kept in sync by hand.
- **Offers come from Zoho coupons** (`GET /billing/v1/coupons/{code}`, cached 1 day). The coupon
  *codes* are configured in `src/lib/offers.ts` (site-wide: monthly `MHP3`, annual `MF2`, same as
  General Settings → Plan Table on WP); their *values* — percentage and how many months — are read
  from Zoho, and the badges/taglines are generated from them ("3 months half price",
  "For the first 3 months, then £9.98/mo", "2 months FREE with every annual plan").
- **Price maths** — `src/lib/pricing.ts` is a line-by-line port of `get_discount_price()`,
  `plusheat_yearly_discounted_price()`, `plusheat_coupon_price()`, `plusheat_yearly_payment_months()`,
  `plusheat_coupon_offer_text()` etc., so the site shows the same pennies Zoho charges
  (e.g. Home Cover £99: £17.98 → £8.99/mo for 3 months; annual £179.80 = £14.98/mo, SAVE £35.96).
- **Plan cards** (`src/components/plans`) — same toggles as WP: *I am a* Homeowner/Landlord,
  *Call-out fee* £0/£59/£99 (default £99), *Pay* Monthly/Annually with the offer bubble, "Most
  popular" on Home cover, greyed-out inclusions, Terms & exclusions links, and the `fee` /
  `duration` cookies. "Show annual as monthly" is on for both cover pages, as on live.
- **Checkout** (`src/components/checkout`) — About You form with the same fields and rules
  (UK mobile `+447…`, letters-only surname, excluded postcodes IM/ZE/GY/HS/JE/KW/LD/PO67/LL58-78/
  PA20-80/IV…/PO30-41, start date today → +90 days UK time), Loqate address lookup or manual
  entry, the "Your Plan" panel with the **"SAVE £X by paying annually" switch** (only when the
  checkout started monthly), plan documents, and the read-only offer coupon.
- **Payment** — `POST /api/checkout` re-derives plan, plan code and coupon on the server (nothing
  price-related is trusted from the browser) and calls `POST /billing/v1/hostedpages/newsubscription`
  with the same payload as `zoho_custom.php` (customer, billing address, custom fields by label:
  OwnerType, Phone, Property1-5, Lead Source, NeXarise, Partner Job/Quote Id, Audience, salesperson,
  coupon, start date). The returned Zoho hosted page (card / GoCardless Direct Debit) is embedded
  in step 2, exactly like WP. `redirect_url` sends the customer to `/thank-you` on this site.
- **Attribution** — `src/proxy.ts` keeps `gclid` / `fbclid` / `msclkid` in the same cookies as WP;
  `zohoSalesperson`, `zohoLeadSource`, `zohoInitialLeadSource`, `audience`, `ht_job_id`,
  `ht_quote_id`, `nx_ref` are read with the same names and defaults ("Website", "Website Visit").
- **Abandoned-checkout lead** — the "Checkout First Step" CRM lead upsert (`insert_checkout_log()`)
  runs only when `ZOHO_CRM_LEADS_ENABLED=true`.

## Environment variables

Copy `.env.example` to `.env.local`. **Never commit real values — this repository is public.**

| Variable | Purpose |
| --- | --- |
| `ZOHO_BILLING_CLIENT_ID` / `_SECRET` / `_REFRESH_TOKEN` | Zoho Billing (prices, coupons, hosted pages). Same app as WP's `PLUSHEAT_ZOHO_BILLING_*`. |
| `ZOHO_ORG_ID` | `677567221` |
| `ZOHO_ACCOUNTS_URL`, `ZOHO_API_URL` | `https://accounts.zoho.com`, `https://www.zohoapis.com` (US DC) |
| `ZOHO_CHECKOUT_ENABLED` | `true` to create real hosted pages; otherwise checkout shows a "please call us" message |
| `ZOHO_CRM_CLIENT_ID` / `_SECRET`, `ZOHO_CRM_LEADS_REFRESH_TOKEN` | CRM leads (home form + abandoned checkout) |
| `ZOHO_CRM_LEADS_ENABLED` | `true` to actually write CRM leads (off by default so tests don't pollute CRM) |
| `LOQATE_CAPTURE_KEY` (or `LOQATE_API_KEY`) | Postcode lookup |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for the Zoho `redirect_url` |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` only on the real production domain (otherwise `noindex`) |
| `ZOHO_OFFLINE` | `true` = never call Zoho, use `src/data/zoho-price-snapshot.json` (local UI work) |
| `OFFER_MONTHLY_COUPON`, `OFFER_ANNUAL_COUPON`, `OFFER_*` | Override the site-wide offer without a code change |

Zoho throttles access-token minting. Tokens are cached for 50 minutes in the Next.js data cache
(shared across Vercel instances), with single-flight minting and a 5-minute back-off on refusal,
and every Zoho read falls back to the snapshot — pages never break if Zoho is slow or down.

## Development

```bash
npm install
npm run dev
npm run build
```

`npm run lint` and `npx tsc --noEmit` should both be clean.

## Decisions made during the rebuild (for review)

1. **Next 16 Cache Components is off.** Zoho data uses `unstable_cache` because, on Vercel, it is
   shared across serverless instances (the `"use cache"` default is per-instance memory, which
   would mint a Zoho token per instance and risk Zoho's throttle). Pages are ISR (1 h).
2. **Repair & Care "starting from" shows £13.00, not £12.99.** It is now computed from Zoho: plan
   `RC99` is £10.83 + VAT = £13.00, which is what Zoho bills. The WP page had £12.99 typed in.
3. **Landlord checkout takes one property.** WP's multi-property (up to 5) and HMO bedroom blocks
   are not in this phase; the single property goes in `Property1` as on WP.
4. **Partner / comparison-site flows** (MSM, GoCompare, CtM 1MFEAP switch, Heatable, Pacifica,
   one-click links, Repair & Care Stripe pre-payment) are not part of this phase. The coupon and
   pricing helpers already include the comparison-switch maths for when they are added.
5. **Zoho error e-mails** (WP mailed jay@ / liam@ on hosted-page errors) are logged to the server
   log instead; wire an alerting/e-mail provider before go-live.
6. **Trustpilot TrustBox** uses the site's own widget; it only renders reviews on domains allowed in
   Trustpilot, so a static rating card shows on other domains.
7. The **thank-you page** is a clean Plan Summary; WP's conversion tags (GA4, Ads, Meta, Bing,
   comparison-site sale pings) still need adding before go-live.
8. Indexing is **off** (`noindex`) unless `NEXT_PUBLIC_ALLOW_INDEXING=true`, so the preview never
   competes with the live site in search.
