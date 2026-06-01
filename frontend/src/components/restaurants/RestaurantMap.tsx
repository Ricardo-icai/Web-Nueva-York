import type { Restaurant } from "@/types/restaurants";

export default function RestaurantMap({ selected }: { selected?: Restaurant }) {
  const mapQuery = selected
    ? encodeURIComponent(`${selected.name} ${selected.address ?? "New York"}`)
    : "New%20York%20restaurants";
  return (
    <section className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Map</h2>
      </div>
      <iframe
        title="Restaurant map"
        src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
        className="h-96 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </section>
  );
}

