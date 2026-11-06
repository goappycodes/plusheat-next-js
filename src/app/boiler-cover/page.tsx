import type { Metadata } from "next";
import { CoverPage } from "@/components/CoverPage";
import { pageConfig } from "@/lib/offers";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Boiler and Heating Cover from £4.99/mo | Free Annual Service" },
  description:
    "Breakdown repairs, a free annual boiler service and 24/7 UK support — in one simple plan. Boiler cover from £4.99 a month.",
  alternates: { canonical: "https://www.plusheat.co.uk/boiler-cover/" },
};

export default function BoilerCoverPage() {
  return (
    <CoverPage
      page={pageConfig("boiler-cover")}
      hero={{
        accent: "Boiler cover",
        rest: "that has your back",
        subtitle: "Breakdown repairs, a free annual boiler service and 24/7 UK support — in one simple plan.",
        button: { label: "Choose a plan", href: "#plans_section" },
        image: {
          src: "/images/boiler-cover-hero-full.jpg",
          alt: "Gas Safe engineer checking a boiler with a homeowner",
          width: 1672,
          height: 941,
        },
      }}
    />
  );
}
