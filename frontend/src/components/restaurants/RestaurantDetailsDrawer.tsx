import type { Restaurant } from "@/types/restaurants";

export default function RestaurantDetailsDrawer({ restaurant }: { restaurant?: Restaurant }) {
  if (!restaurant) return null;
  return (
    <details className="mx-auto mt-6 max-w-6xl rounded-2xl border border-stone-200 bg-white p-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-900">Restaurant details</summary>
      <div className="mt-3 grid gap-2 text-sm text-slate-700">
        <p>{restaurant.description ?? "No editorial description available."}</p>
        <p>Phone: {restaurant.phone ?? "Unavailable"}</p>
        <p>Opening hours: {restaurant.openingHours?.length ? restaurant.openingHours.join(" | ") : "Unavailable"}</p>
        <p>Tags: {restaurant.editorialTags?.length ? restaurant.editorialTags.join(", ") : "None"}</p>
      </div>
    </details>
  );
}

