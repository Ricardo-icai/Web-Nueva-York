import type { Restaurant } from "@/types/restaurants";

export default function RestaurantCategorySection({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  const topCategories = new Map<string, number>();
  for (const r of restaurants) {
    for (const c of r.categories) {
      topCategories.set(c, (topCategories.get(c) ?? 0) + 1);
    }
  }
  const top = Array.from(topCategories.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <section className="mx-auto mt-8 max-w-6xl rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Category Sections</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {top.map(([name, count]) => (
          <span key={name} className="rounded-full border border-stone-300 px-3 py-1 text-sm text-slate-700">
            {name} ({count})
          </span>
        ))}
      </div>
    </section>
  );
}

