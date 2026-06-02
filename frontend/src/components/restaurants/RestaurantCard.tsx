import Image from "next/image";
import Link from "next/link";
import type { Restaurant } from "@/types/restaurants";

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const hasRating = typeof restaurant.googleRating === "number";
  const hasPrice = typeof restaurant.averagePricePerPersonUsd === "number";
  return (
    <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="relative h-56 w-full">
        <Image src={restaurant.imageUrl} alt={restaurant.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="space-y-2 p-5">
        <h3 className="text-lg font-semibold text-slate-900">{restaurant.name}</h3>
        <p className="text-sm text-slate-700">{restaurant.cuisine.join(", ")}</p>
        <p className="text-sm text-slate-700">{restaurant.neighborhood ?? restaurant.address ?? "Address unavailable"}</p>
        <p className="text-sm text-slate-900">
          {hasRating ? `Rating ${restaurant.googleRating?.toFixed(1)} - ${restaurant.googleReviewCount ?? 0} resenas` : "Google rating unavailable"}
        </p>
        <p className="text-sm text-slate-900">
          {hasPrice ? `Estimated from $${restaurant.averagePricePerPersonUsd}/person` : "Price estimate unavailable"}
        </p>
        {restaurant.distanceFromAccommodationKm !== null && restaurant.distanceFromAccommodationKm !== undefined && (
          <p className="text-sm text-slate-700">{restaurant.distanceFromAccommodationKm} km desde alojamiento</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Link href={restaurant.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-3 py-1 text-sm">Google Maps</Link>
          <Link href={restaurant.directionsUrl ?? restaurant.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-3 py-1 text-sm">Directions</Link>
          {restaurant.officialWebsite ? (
            <Link href={restaurant.officialWebsite} target="_blank" className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm">Website</Link>
          ) : (
            <span className="rounded-full border border-stone-300 px-3 py-1 text-sm text-stone-500">Official website unavailable</span>
          )}
        </div>
      </div>
    </article>
  );
}
