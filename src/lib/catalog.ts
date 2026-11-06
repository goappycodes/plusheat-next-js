/**
 * Plan catalogue.
 *
 * `src/data/plans.json` is an export of the WordPress `plusheat_plans` table:
 * every combination of plan level × duration × call-out fee × customer ×
 * boiler × service and the Zoho Billing plan code it maps to. `id` is the old
 * WooCommerce product ID, kept as the stable public identifier so existing
 * links (`?add-to-cart=135`) can be redirected to the same plan.
 *
 * Plan names, subtitles, inclusions and plan pages come from the ACF option
 * `plusheat_plans` (General Settings > Plans) on the live site.
 */
import plansData from "@/data/plans.json";

export type Duration = "monthly" | "yearly";
export type Customer = "homeowner" | "landlord";
export type PlanType = "maintenance" | "emergency";

export interface PlanRow {
  id: number;
  name: string; // Custom | Standard | Premium | Platinum | ...
  code: string; // Zoho Billing plan_code
  duration: Duration;
  fee: number;
  planType: PlanType | string;
  customer: Customer;
  boiler: string;
  service: string;
}

export const PLANS: PlanRow[] = (plansData as PlanRow[]).map((p) => ({
  ...p,
  code: p.code.trim(),
}));

/** The four cover levels on the boiler / landlord cover pages, in card order. */
export const COVER_LEVELS = ["custom", "standard", "premium", "platinum"] as const;
export type CoverLevel = (typeof COVER_LEVELS)[number];

export const MOST_POPULAR: CoverLevel = "premium"; // ACF most_popular_plan = "Premium"

interface LevelContent {
  acfName: string; // name in plusheat_plans / ACF
  displayName: string; // get_plusheat_plan_name()
  subtitle: string;
  page: string; // plan page (Terms & exclusions link)
  inclusions: string[];
  infoDocument: string;
  summaryDocument: string;
}

const UPLOADS = "https://www.plusheat.co.uk/wp-content/uploads";

export const TERMS_PDF = `${UPLOADS}/2026/07/PlusHeat-Terms-Conditions.pdf`;

export const LEVELS: Record<CoverLevel, LevelContent> = {
  custom: {
    acfName: "Custom",
    displayName: "Boiler cover",
    subtitle: "Your boiler and controls",
    page: "https://www.plusheat.co.uk/boiler-cover-plan/",
    inclusions: ["Boiler & controls", "Free annual boiler service"],
    infoDocument: `${UPLOADS}/2026/06/Boiler-Cover-Plan-Service-Plan-Information-Document.pdf`,
    summaryDocument: `${UPLOADS}/2026/06/Boiler-Cover-Plan-Summary.pdf`,
  },
  standard: {
    acfName: "Standard",
    displayName: "Heating cover",
    subtitle: "Boiler + central heating",
    page: "https://www.plusheat.co.uk/heating-cover-plan/",
    inclusions: ["Boiler & controls", "Free annual boiler service", "Central heating"],
    infoDocument: `${UPLOADS}/2026/06/Heating-Cover-Plan-Service-Plan-Information-Document.pdf`,
    summaryDocument: `${UPLOADS}/2026/06/Heating-Cover-Plan-Summary.pdf`,
  },
  premium: {
    acfName: "Premium",
    displayName: "Home cover",
    subtitle: "Heating, plumbing & electrics",
    page: "https://www.plusheat.co.uk/home-cover-plan/",
    inclusions: [
      "Boiler & controls",
      "Free annual boiler service",
      "Central heating",
      "Plumbing",
      "Electrical",
      "Drainage",
    ],
    infoDocument: `${UPLOADS}/2026/06/Home-Cover-Plan-Service-Plan-Information-Document.pdf`,
    summaryDocument: `${UPLOADS}/2026/06/Home-Cover-Plan-Summary.pdf`,
  },
  platinum: {
    acfName: "Platinum",
    displayName: "Total cover",
    subtitle: "Everything, fully protected",
    page: "https://www.plusheat.co.uk/total-cover-plan/",
    inclusions: [
      "Boiler & controls",
      "Free annual boiler service",
      "Central heating",
      "Plumbing",
      "Electrical",
      "Drainage",
      "Home security",
      "Pest control cover",
    ],
    infoDocument: `${UPLOADS}/2026/06/Total-Cover-Plan-Service-Plan-Information-Document.pdf`,
    summaryDocument: `${UPLOADS}/2026/06/Total-Cover-Plan-Summary.pdf`,
  },
};

export const CP12_LABEL = "Free gas safety certificate (CP12)";

export function levelFromName(name: string): CoverLevel | null {
  const n = name.trim().toLowerCase();
  if (n.includes("custom") || n === "boiler cover") return "custom";
  if (n.includes("standard") || n === "heating cover") return "standard";
  if (n.includes("premium") || n === "home cover") return "premium";
  if (n.includes("platinum") || n === "total cover") return "platinum";
  return null;
}

/**
 * get_plan_addon_details() + the landlord CP12 rule: landlord plans with the
 * service get "Free gas safety certificate (CP12)" as the third item
 * (plusheat_order_cp12_third()).
 */
export function planInclusions(level: CoverLevel, customer: Customer, service = "yes"): string[] {
  let items = [...LEVELS[level].inclusions];
  if (service === "no") items = items.filter((i) => i !== "Annual boiler service");
  if (customer === "landlord" && service !== "no") {
    items.splice(Math.min(2, items.length), 0, CP12_LABEL);
  }
  return items;
}

/** get_plan_id(): the plan row for a selection, or undefined. */
export function findPlan(sel: {
  level: CoverLevel;
  duration: Duration;
  fee: number;
  customer: Customer;
  boiler?: string;
  planType?: string;
  service?: string;
}): PlanRow | undefined {
  const name = LEVELS[sel.level].acfName.toLowerCase();
  return PLANS.find(
    (p) =>
      p.name.toLowerCase() === name &&
      p.duration === sel.duration &&
      p.fee === sel.fee &&
      p.customer === sel.customer &&
      p.boiler === (sel.boiler ?? "gas") &&
      p.planType === (sel.planType ?? "maintenance") &&
      p.service === (sel.service ?? "yes"),
  );
}

export function planById(id: number): PlanRow | undefined {
  return PLANS.find((p) => p.id === id);
}

/** The same plan on the other duration (monthly <-> yearly), if it exists. */
export function siblingPlan(plan: PlanRow, duration: Duration): PlanRow | undefined {
  if (plan.duration === duration) return plan;
  return PLANS.find(
    (p) =>
      p.name === plan.name &&
      p.duration === duration &&
      p.fee === plan.fee &&
      p.planType === plan.planType &&
      p.customer === plan.customer &&
      p.boiler === plan.boiler &&
      p.service === plan.service,
  );
}
