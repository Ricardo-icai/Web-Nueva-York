import ShoppingExperience from "@/components/shopping/ShoppingExperience";
import { enrichShoppingVenues } from "@/lib/shopping/enrich-shopping-venues";

export default async function ShoppingPage() {
  const venues = await enrichShoppingVenues();

  return (
    <main className="nyc-page-shell page-bg-shopping">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[34px] border border-[#111827] bg-white shadow-[8px_8px_0_#111827]">
        <ShoppingExperience venues={venues} />
      </div>
    </main>
  );
}
