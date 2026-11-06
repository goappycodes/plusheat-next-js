import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FormCta } from "@/components/sections/FormCta";
import { Hero } from "@/components/sections/Hero";
import { BenefitCards, IntroTags, PricingCards } from "@/components/sections/HomeSections";
import { TrustReviews } from "@/components/sections/TrustReviews";
import { pageConfig } from "@/lib/offers";
import { startingFromPrices } from "@/lib/plans-view";
import { money } from "@/lib/pricing";
import { LIVE } from "@/lib/site";

export const revalidate = 3600;

export default async function HomePage() {
  // "Starting from" prices come straight from the Zoho plan prices + the live monthly offer.
  const [home, landlord] = await Promise.all([
    startingFromPrices(pageConfig("boiler-cover")),
    startingFromPrices(pageConfig("landlord-cover")),
  ]);
  const p = (x: number | null) => (x === null ? null : `£${money(x)}`);

  return (
    <div className="min-h-screen bg-[#faf9f7] min-[769px]:bg-white">
      <SiteHeader overHero />
      <main>
        <Hero
          accent="Peace of mind"
          rest="when home emergencies happen"
          subtitle="Reliable protection for your boiler, central heating system and much more – all in one place."
          button={{ label: "Explore cover", href: "/boiler-cover" }}
          image={{
            src: "/images/home-hero-figma.jpg",
            alt: "Couple relaxing on a sofa at home with their dog",
            width: 1440,
            height: 892,
          }}
          noOverlay
          mobileZoom={1.2}
          focusX="100%"
          focusY="19%"
          desktopY="16%"
        />
        <IntroTags
          chips={[
            "Boiler Services",
            "Gas Safety Certificate (CP12)",
            "Plumbing",
            "Boilers & heating",
            "Electrics",
            "Home Security",
            "Pest Control",
            "Drainage",
          ]}
        />
        <PricingCards
          cards={[
            {
              icon: "/images/icon-18.svg",
              iconW: 45,
              iconH: 42,
              title: "Homeowner cover",
              price: p(home.homeowner),
              body: (
                <>
                  Protect your boiler, heating system, electrics, plumbing and more from unexpected breakdowns.
                  Flexible plans designed to keep your home warm and running reliably.
                </>
              ),
              button: { label: "Get cover", href: "/boiler-cover" },
            },
            {
              icon: "/images/Vector-26.svg",
              iconW: 44,
              iconH: 41,
              title: "Landlord cover",
              price: p(landlord.landlord),
              body: (
                <>
                  Cover designed for <strong>rental properties,</strong> including boiler protection, annual service and
                  Gas Safety Certificate (CP12). Built to support landlords and tenants.
                </>
              ),
              button: { label: "Get cover", href: "/landlord-cover" },
            },
            {
              icon: "/images/Vector-27.svg",
              iconW: 41,
              iconH: 42,
              title: "Repair & care",
              price: p(home.repairCare),
              body: <>Get your boiler fixed, then covered for 12 months – with a free annual boiler service included.</>,
              button: { label: "Book a repair", href: `${LIVE}/repair-care/` },
            },
          ]}
        />
        <BenefitCards
          benefits={[
            {
              title: (
                <>
                  <span>UK Nationwide</span> coverage
                </>
              ),
              text: "Reliable home cover available wherever you are in the UK.",
              watermark: "/images/UK-nationwide.png",
            },
            {
              title: (
                <>
                  <span>Flexible</span> cover for homeowners and landlords
                </>
              ),
              text: "Choose a plan that fits your home, property, and needs.",
              watermark: "/images/flexible.png",
            },
            {
              title: (
                <>
                  <span>Clear pricing,</span> no hidden surprises
                </>
              ),
              text: "Know exactly what you’re paying for, with no unexpected costs.",
              watermark: "/images/clear-pricing.png",
            },
            {
              title: (
                <>
                  Customer support available <span>24/7</span>
                </>
              ),
              text: "Our friendly team is always ready to help when you need us.",
              watermark: "/images/customer-support.png",
            },
          ]}
        />
        <TrustReviews
          title={
            <>
              Trusted by <span>thousands</span> of homeowners
            </>
          }
          subtitle="We’re proud of the feedback we receive, and even prouder of the service behind."
        />
        <FormCta />
      </main>
      <SiteFooter />
    </div>
  );
}
