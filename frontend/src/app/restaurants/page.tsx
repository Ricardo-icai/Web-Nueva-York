import RestaurantDetailsDrawer from "@/components/restaurants/RestaurantDetailsDrawer";
import RestaurantFilters from "@/components/restaurants/RestaurantFilters";
import PizzaHallOfFameSection from "@/components/restaurants/PizzaHallOfFameSection";
import RestaurantsHero from "@/components/restaurants/RestaurantsHero";
import RestaurantsInteractive from "@/components/restaurants/RestaurantsInteractive";
import RestaurantLogoImage from "@/components/restaurants/RestaurantLogoImage";
import { getNycPizzaHallOfFame } from "@/lib/restaurants/enrich-nyc-pizza";
import { getRestaurantsIntelligence } from "@/lib/restaurants/enrich-restaurant";
import { isInPriceRange } from "@/lib/restaurants/estimate-price";
import { buildOfficialWebsiteSearchUrl } from "@/lib/restaurants/build-restaurant-links";
import type { NycPizzaHallOfFamePlace, Restaurant } from "@/types/restaurants";

type RestaurantsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(v: string | string[] | undefined, fallback = "") {
  return Array.isArray(v) ? (v[0] ?? fallback) : (v ?? fallback);
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function canonicalName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(nyc|new york|restaurant|pizzeria|pizza)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueByName<T extends { name: string }>(items: T[]) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = canonicalName(item.name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function pizzaPlaceToRestaurant(place: NycPizzaHallOfFamePlace): Restaurant {
  return {
    id: place.id,
    source: "curated",
    dataQuality: place.dataQuality === "enriched" ? "enriched" : "curated",
    name: place.name,
    description: place.whyItMatters,
    cuisine: ["Pizza"],
    categories: place.categories,
    address: place.address,
    neighborhood: place.neighborhood,
    borough: place.borough,
    location: { lat: place.lat ?? 40.758, lng: place.lng ?? -73.9855 },
    googlePlaceId: place.googlePlaceId,
    googleRating: place.googleRating,
    googleReviewCount: place.googleReviewCount,
    googleReviews: [],
    priceLevel: place.priceLevel,
    averagePricePerPersonUsd: place.averagePricePerPersonUsd,
    officialWebsite: place.officialWebsite,
    googleMapsUrl: place.googleMapsUrl,
    directionsUrl: place.directionsUrl,
    reservationUrl: place.reservationUrl,
    imageUrl: place.imageUrl,
    imageSource: "curated",
    phone: place.phone,
    openingHours: place.openingHours,
    familyFriendly: place.bestFor.includes("families"),
    distanceFromAccommodationKm: place.distanceFromAccommodationKm,
    qualityScore: place.nycReputationScore,
    editorialTags: [...place.badges, place.pizzaStyle, ...place.signaturePizzas],
  };
}

export default async function RestaurantsPage({ searchParams }: RestaurantsPageProps) {
  const params = await searchParams;
  const cuisine = one(params.cuisine).toLowerCase();
  const priceRange = one(params.priceRange);
  const maxDistanceFromUserKm = Number(one(params.maxDistanceFromUserKm, "0"));
  const maxDistanceFromHotelKm = Number(one(params.maxDistanceFromHotelKm, "0"));
  const userLat = Number(one(params.userLat, "0"));
  const userLng = Number(one(params.userLng, "0"));
  const hotelLat = Number(one(params.hotelLat, "0"));
  const hotelLng = Number(one(params.hotelLng, "0"));

  const userLocation = userLat !== 0 && userLng !== 0 ? { lat: userLat, lng: userLng } : undefined;
  const accommodation = hotelLat !== 0 && hotelLng !== 0 ? { lat: hotelLat, lng: hotelLng } : undefined;
  const isPizzaSelected = cuisine.includes("pizza");

  let restaurants = uniqueByName(await getRestaurantsIntelligence(accommodation));

  restaurants = restaurants.filter((r) => {
    const searchable = [
      r.name,
      r.description ?? "",
      r.cuisine.join(" "),
      r.categories.join(" "),
      (r.editorialTags ?? []).join(" "),
    ].join(" ").toLowerCase();
    if (cuisine && !searchable.includes(cuisine)) return false;
    if (!isInPriceRange(r.averagePricePerPersonUsd, priceRange)) return false;

    if (maxDistanceFromUserKm > 0 && userLocation) {
      const dUser = distanceKm(userLocation.lat, userLocation.lng, r.location.lat, r.location.lng);
      if (dUser > maxDistanceFromUserKm) return false;
    }

    if (maxDistanceFromHotelKm > 0 && accommodation) {
      const dHotel = distanceKm(accommodation.lat, accommodation.lng, r.location.lat, r.location.lng);
      if (dHotel > maxDistanceFromHotelKm) return false;
    }

    return true;
  });

  const burgerHallOfFame = restaurants.filter((r) =>
    r.categories.join(" ").toLowerCase().includes("best_burgers_nyc") ||
    r.categories.join(" ").toLowerCase().includes("burgers"),
  );
  const pizzaHallOfFame = isPizzaSelected
    ? (await getNycPizzaHallOfFame(accommodation)).filter((place) => {
        if (!isInPriceRange(place.averagePricePerPersonUsd, priceRange)) return false;

        if (maxDistanceFromUserKm > 0 && userLocation) {
          const lat = place.lat;
          const lng = place.lng;
          if (typeof lat !== "number" || typeof lng !== "number") return false;
          const dUser = distanceKm(userLocation.lat, userLocation.lng, lat, lng);
          if (dUser > maxDistanceFromUserKm) return false;
        }

        if (maxDistanceFromHotelKm > 0) {
          if (typeof place.distanceFromAccommodationKm !== "number") return false;
          if (place.distanceFromAccommodationKm > maxDistanceFromHotelKm) return false;
        }

        return true;
      })
    : [];
  const pizzaMapRestaurants = pizzaHallOfFame.map(pizzaPlaceToRestaurant);
  const pizzaHallKeys = new Set(pizzaHallOfFame.map((place) => canonicalName(place.name)));
  if (isPizzaSelected) {
    restaurants = restaurants.filter((restaurant) => !pizzaHallKeys.has(canonicalName(restaurant.name)));
  }

  const mapFilteredLocales = uniqueByName([...restaurants, ...pizzaMapRestaurants]);

  restaurants = restaurants.sort((a, b) => {
    const trendBoost = (r: (typeof restaurants)[number]) => {
      const hay = `${r.categories.join(" ")} ${(r.editorialTags ?? []).join(" ")}`.toLowerCase();
      let boost = 0;
      if (hay.includes("viral")) boost += 35;
      if (hay.includes("worth_the_hype")) boost += 30;
      if (hay.includes("tiktok")) boost += 20;
      if (hay.includes("instagram")) boost += 20;
      if (hay.includes("must_try")) boost += 15;
      return boost;
    };
    const scoreA =
      (a.googleRating ?? 0) * 110 +
      Math.log10((a.googleReviewCount ?? 0) + 1) * 45 +
      (a.qualityScore ?? 0) +
      trendBoost(a);
    const scoreB =
      (b.googleRating ?? 0) * 110 +
      Math.log10((b.googleReviewCount ?? 0) + 1) * 45 +
      (b.qualityScore ?? 0) +
      trendBoost(b);
    return scoreB - scoreA;
  });

  const featured = restaurants[0];
  const totalLocales = mapFilteredLocales.length;
  const mustTryGroups: Array<{ title: string; keys: string[] }> = [
    { title: "Pizza", keys: ["pizza"] },
    { title: "Bagels", keys: ["bagels"] },
    { title: "Classic NYC", keys: ["deli", "classic_nyc", "street_food"] },
    { title: "Burgers", keys: ["burgers"] },
    { title: "Asian & Chinatown", keys: ["asian", "chinatown", "korean"] },
    { title: "Italian", keys: ["italian", "little_italy"] },
    { title: "Steakhouses", keys: ["steakhouse"] },
    { title: "Food Markets", keys: ["food_markets"] },
    { title: "Rooftops", keys: ["rooftop"] },
    { title: "Cookies & Bakeries", keys: ["cookies", "bakery"] },
    { title: "Cheesecake", keys: ["cheesecake"] },
    { title: "Banana Pudding & Cupcakes", keys: ["banana_pudding", "cupcakes"] },
    { title: "Pastry", keys: ["pastry"] },
    { title: "Donuts", keys: ["donuts"] },
    { title: "Ice Cream", keys: ["ice_cream"] },
    { title: "Chocolate & Babka", keys: ["chocolate_babka"] },
  ];

  return (
    <main className="min-h-screen bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-fixed bg-center px-6 py-10 md:px-10">
      <div className="min-h-screen bg-stone-50/95 p-0">
        <RestaurantsHero total={totalLocales} />

        <section className="mx-auto mt-6 max-w-6xl rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <RestaurantFilters
            cuisine={one(params.cuisine)}
            priceRange={one(params.priceRange)}
            maxDistanceFromUserKm={one(params.maxDistanceFromUserKm)}
            maxDistanceFromHotelKm={one(params.maxDistanceFromHotelKm)}
            userLat={one(params.userLat)}
            userLng={one(params.userLng)}
            hotelLat={one(params.hotelLat)}
            hotelLng={one(params.hotelLng)}
          />
        </section>

        <RestaurantsInteractive
          restaurants={restaurants}
          mapRestaurants={mapFilteredLocales}
          userLocation={userLocation}
          afterMapSlot={
            <>
              <PizzaHallOfFameSection places={pizzaHallOfFame} />

              {burgerHallOfFame.length > 0 ? (
              <section className="mx-auto mt-8 max-w-6xl space-y-4">
                <h2 className="font-american-diner text-3xl text-slate-900">NYC Burger Hall of Fame</h2>
                <p className="text-sm text-slate-700">
                  Los burgers mejor valorados y de moda, ordenados por calidad, distancia, rating y resenas.
                </p>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {burgerHallOfFame
                    .sort((a, b) => {
                      const distanceA = a.distanceFromAccommodationKm ?? 9999;
                      const distanceB = b.distanceFromAccommodationKm ?? 9999;
                      const familyA = a.familyFriendly ? 1 : 0;
                      const familyB = b.familyFriendly ? 1 : 0;
                      const qualityA = a.qualityScore ?? 0;
                      const qualityB = b.qualityScore ?? 0;
                      const ratingA = a.googleRating ?? 0;
                      const ratingB = b.googleRating ?? 0;
                      const reviewsA = Math.log10((a.googleReviewCount ?? 0) + 1);
                      const reviewsB = Math.log10((b.googleReviewCount ?? 0) + 1);
                      const scoreA = qualityA * 0.35 + ratingA * 30 + reviewsA * 18 + familyA * 8 - distanceA * 1.5;
                      const scoreB = qualityB * 0.35 + ratingB * 30 + reviewsB * 18 + familyB * 8 - distanceB * 1.5;
                      return scoreB - scoreA;
                    })
                    .slice(0, 24)
                    .map((r, idx) => {
                      return (
                      <article key={`hof-${r.id}-${idx}`} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                        <div className="relative h-44 w-full">
                          <RestaurantLogoImage
                            name={r.name}
                            officialWebsite={r.officialWebsite}
                            fallbackImageUrl={r.imageUrl}
                            className="h-full w-full bg-white object-contain p-5"
                          />
                        </div>
                        <div className="space-y-2 p-4">
                          <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                          <p className="text-xs text-slate-600">
                            Signature burger: {r.editorialTags?.[0] ?? r.cuisine[0] ?? "Burger house"}
                          </p>
                          <p className="text-xs text-slate-600">{r.neighborhood ?? r.address ?? "Neighborhood unavailable"}</p>
                          <p className="text-xs text-slate-700">
                            {typeof r.googleRating === "number"
                              ? `Rating ${r.googleRating.toFixed(1)} - ${r.googleReviewCount ?? 0} reviews`
                              : "Rating unavailable"}
                          </p>
                          <p className="text-xs text-slate-700">
                            {typeof r.averagePricePerPersonUsd === "number"
                              ? `Estimated from $${r.averagePricePerPersonUsd}/person`
                              : "Price estimate unavailable"}
                          </p>
                          <p className="text-xs text-slate-700">
                            {typeof r.distanceFromAccommodationKm === "number"
                              ? `Distance from hotel: ${r.distanceFromAccommodationKm.toFixed(1)} km`
                              : "Distance from hotel unavailable"}
                          </p>
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {r.editorialTags?.includes("nyc_classic") ? <span className="rounded-full bg-slate-900 px-2 py-1 text-white">NYC Classic</span> : null}
                            {r.editorialTags?.includes("viral_on_tiktok") ? <span className="rounded-full bg-rose-600 px-2 py-1 text-white">Viral on TikTok</span> : null}
                            {r.familyFriendly ? <span className="rounded-full bg-emerald-600 px-2 py-1 text-white">Family Friendly</span> : null}
                            {r.editorialTags?.includes("best_value") ? <span className="rounded-full bg-amber-500 px-2 py-1 text-slate-900">Best Value</span> : null}
                            {r.editorialTags?.includes("premium_burger") ? <span className="rounded-full bg-violet-700 px-2 py-1 text-white">Premium Burger</span> : null}
                            {r.editorialTags?.includes("instagram_favorite") ? <span className="rounded-full bg-fuchsia-600 px-2 py-1 text-white">Instagram Favorite</span> : null}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <a href={r.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-2 py-1">Google Maps</a>
                            <a href={r.directionsUrl ?? r.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-2 py-1">Como llegar</a>
                            <a href={r.officialWebsite ?? buildOfficialWebsiteSearchUrl(r.name, r.address)} target="_blank" className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1">
                              {r.officialWebsite ? "Website" : "Buscar web oficial"}
                            </a>
                          </div>
                        </div>
                      </article>
                      );
                    })}
                </div>
              </section>
              ) : null}
            </>
          }
        />

        <section className="mx-auto mt-8 max-w-6xl space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Must-Try NYC Food & Desserts</h2>
          {mustTryGroups.map((group) => {
            const groupItems = restaurants.filter((r) =>
              group.keys.some((k) => r.categories.join(" ").toLowerCase().includes(k)),
            );
            if (!groupItems.length) return null;

            return (
              <div key={group.title} className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {groupItems.slice(0, 8).map((r, idx) => (
                    (() => {
                      return (
                    <article
                      key={`${group.title}-${r.id}-${idx}`}
                      className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                    >
                      <div className="relative h-44 w-full">
                        <RestaurantLogoImage
                          name={r.name}
                          officialWebsite={r.officialWebsite}
                          fallbackImageUrl={r.imageUrl}
                          className="h-full w-full bg-white object-contain p-5"
                        />
                      </div>
                      <div className="space-y-2 p-4">
                        <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                        <p className="text-xs text-slate-600">{r.cuisine.join(", ")}</p>
                        <p className="text-xs text-slate-600">{r.description ?? "No editorial note."}</p>
                        <p className="text-xs text-slate-700">
                          {typeof r.googleRating === "number"
                            ? `Rating ${r.googleRating.toFixed(1)} - ${r.googleReviewCount ?? 0} reviews`
                            : "Rating unavailable"}
                        </p>
                        <p className="text-xs text-slate-700">
                          {typeof r.averagePricePerPersonUsd === "number"
                            ? `Estimated from $${r.averagePricePerPersonUsd}/person`
                            : "Price estimate unavailable"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <a href={r.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-2 py-1">Google Maps</a>
                          <a href={r.directionsUrl ?? r.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-2 py-1">Como llegar</a>
                          <a href={r.officialWebsite ?? buildOfficialWebsiteSearchUrl(r.name, r.address)} target="_blank" className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1">
                            {r.officialWebsite ? "Website" : "Buscar web oficial"}
                          </a>
                        </div>
                      </div>
                    </article>
                      );
                    })()
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <RestaurantDetailsDrawer restaurant={featured} />
      </div>
    </main>
  );
}
