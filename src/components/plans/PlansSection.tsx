import { buildPlansTable } from "@/lib/plans-view";
import type { PlanPageConfig } from "@/lib/offers";
import { PlansCards } from "./PlansCards";

/** The white "plans-cards" panel that overlaps the hero, with the Zoho-priced plan table inside. */
export async function PlansSection({ page }: { page: PlanPageConfig }) {
  const table = await buildPlansTable(page);
  return (
    <div className="relative -mt-8 rounded-t-[32px] bg-white pb-[calc(3.5rem+32px)] pt-10 shadow-[var(--shadow-panel-strong)] min-[769px]:-mt-[61px] min-[769px]:rounded-t-[64px] min-[769px]:pb-20 min-[769px]:pt-16">
      <PlansCards table={table} />
    </div>
  );
}
