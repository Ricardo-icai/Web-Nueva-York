import Image from "next/image";
import Link from "next/link";
import { buildOfficialWebsiteSearchUrl } from "@/lib/restaurants/build-restaurant-links";
import { buildTransitPlannerUrl } from "@/lib/transit-planner";
import type { Restaurant } from "@/types/restaurants";

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const hasRating = typeof restaurant.googleRating === "number";
  const hasPrice = typeof restaurant.averagePricePerPersonUsd === "number";
  const websiteHref =
    restaurant.officialWebsite ?? buildOfficialWebsiteSearchUrl(restaurant.name, restaurant.address);
  const transitHref = buildTransitPlannerUrl({
    name: restaurant.name,
    address: restaurant.address,
    location: restaurant.location,
  });
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
          {hasRating ? `Valoración ${restaurant.googleRating?.toFixed(1)} - ${restaurant.googleReviewCount ?? 0} reseñas` : "Valoración de Google no disponible"}
        </p>
        <p className="text-sm text-slate-900">
          {hasPrice ? `Estimado desde $${restaurant.averagePricePerPersonUsd}/persona` : "Estimación de precio no disponible"}
        </p>
        {restaurant.distanceFromAccommodationKm !== null && restaurant.distanceFromAccommodationKm !== undefined && (
          <p className="text-sm text-slate-700">{restaurant.distanceFromAccommodationKm} km desde alojamiento</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Link href={restaurant.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-3 py-1 text-sm">Google Maps</Link>
          <Link href={transitHref} className="rounded-full border border-slate-300 px-3 py-1 text-sm">Cómo llegar</Link>
          {restaurant.officialWebsite ? (
            <Link href={restaurant.officialWebsite} target="_blank" className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm">Website</Link>
          ) : (
            <Link href={websiteHref} target="_blank" className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm">Buscar web oficial</Link>
          )}
        </div>
      </div>
    </article>
  );
}
