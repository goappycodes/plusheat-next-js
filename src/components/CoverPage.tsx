import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PlansSection } from "@/components/plans/PlansSection";
import { CompareTable, FaqCta, FeatureGrid } from "@/components/sections/BoilerSections";
import { Hero, HeroProps } from "@/components/sections/Hero";
import { TrustReviews } from "@/components/sections/TrustReviews";
import type { PlanPageConfig } from "@/lib/offers";

/** Boiler cover / landlord cover page (flexible-page-template.php with Page Sections). */
export function CoverPage({ page, hero }: { page: PlanPageConfig; hero: HeroProps }) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader overHero />
      <main>
        <Hero {...hero} />
        <PlansSection page={page} />
        <FeatureGrid />
        <CompareTable />
        <TrustReviews
          title={
            <>
              {page.customer === "landlord" ? (
                <>
                  Trusted by <span>thousands</span> of landlords
                </>
              ) : (
                <>
                  Loved by <span>homeowners</span>
                </>
              )}
            </>
          }
          subtitle="4.7 on Trustpilot from 18,000+ reviews."
        />
        <FaqCta />
      </main>
      <SiteFooter />
    </div>
  );
}
