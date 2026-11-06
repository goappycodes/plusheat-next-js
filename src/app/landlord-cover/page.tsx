import type { Metadata } from "next";
import { CoverPage } from "@/components/CoverPage";
import { pageConfig } from "@/lib/offers";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Landlord Boiler Cover from £5.99/month | PlusHeat" },
  description:
    "Landlord cover for rental properties: boiler protection, a free annual service and Gas Safety Certificate (CP12).",
  alternates: { canonical: "https://www.plusheat.co.uk/landlord-cover/" },
};

export default function LandlordCoverPage() {
  return (
    <CoverPage
      page={pageConfig("landlord-cover")}
      hero={{
        accent: "Landlord",
        rest: "boiler cover",
        subtitle:
          "Enjoy peace of mind with our reliable boiler cover for landlords designed to protect against boiler breakdown, ensuring tenants stay warm with heating and hot water supply.",
        button: { label: "Explore landlord cover", href: "#plans_section" },
        image: {
          src: "/images/New-Homeowner-in-Sunlit-Kitchen.jpg",
          alt: "Homeowner in a sunlit kitchen",
          width: 1672,
          height: 941,
        },
      }}
    />
  );
}
