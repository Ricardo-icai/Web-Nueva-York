import Image from "next/image";
import Link from "next/link";
import RooftopsHallOfFameSection from "@/components/restaurants/RooftopsHallOfFameSection";
import UseMyRooftopLocationButton from "@/components/viewpoints/UseMyRooftopLocationButton";
import { buildGoogleDirectionsUrl } from "@/lib/api/google-places";
import { getNycRooftopsHallOfFame } from "@/lib/restaurants/enrich-nyc-rooftops";
import { buildTransitPlannerUrl } from "@/lib/transit-planner";
import type { Coordinates, NycRooftopHallOfFamePlace } from "@/types/restaurants";

const VIEWPOINTS = [
  {
    name: "Top of the Rock",
    area: "Rockefeller Center",
    style: "Classic paid viewpoint",
    bestFor: "Empire State Building photos, sunset, first NYC trip",
    imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1400&q=85",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Top%20of%20the%20Rock%20New%20York%20NY",
    websiteUrl: "https://www.rockefellercenter.com/attractions/top-of-the-rock-observation-deck/",
    badges: ["Iconic", "Sunset", "Photos"],
  },
  {
    name: "SUMMIT One Vanderbilt",
    area: "Midtown East",
    style: "Immersive skyline deck",
    bestFor: "Mirrors, glass, dramatic skyline photos",
    imageUrl: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1400&q=85",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=SUMMIT%20One%20Vanderbilt%20New%20York%20NY",
    websiteUrl: "https://summitov.com/",
    badges: ["Viral", "Indoor", "Photos"],
  },
  {
    name: "Edge",
    area: "Hudson Yards",
    style: "Outdoor sky deck",
    bestFor: "Glass floor, Hudson views, big city scale",
    imageUrl: "https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=1400&q=85",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Edge%20Hudson%20Yards%20New%20York%20NY",
    websiteUrl: "https://www.edgenyc.com/",
    badges: ["Outdoor", "Hudson", "Worth Booking"],
  },
  {
    name: "One World Observatory",
    area: "Financial District",
    style: "Downtown paid viewpoint",
    bestFor: "Lower Manhattan, harbor views, bad-weather backup",
    imageUrl: "https://images.unsplash.com/photo-1543716091-a840c05249ec?auto=format&fit=crop&w=1400&q=85",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=One%20World%20Observatory%20New%20York%20NY",
    websiteUrl: "https://www.oneworldobservatory.com/",
    badges: ["Indoor", "Downtown", "Weather-Safe"],
  },
  {
    name: "Brooklyn Heights Promenade",
    area: "Brooklyn Heights",
    style: "Free skyline viewpoint",
    bestFor: "Lower Manhattan skyline, families, easy photos",
    imageUrl: "https://images.unsplash.com/photo-1532960401447-7dd05bef20b0?auto=format&fit=crop&w=1400&q=85",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Brooklyn%20Heights%20Promenade%20New%20York%20NY",
    websiteUrl: "https://www.nycgovparks.org/parks/brooklyn-heights-promenade",
    badges: ["Free", "Family", "Skyline"],
  },
  {
    name: "DUMBO Manhattan Bridge View",
    area: "DUMBO",
    style: "Street photo spot",
    bestFor: "Classic NYC photo, bridge view, quick stop",
    imageUrl: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1400&q=85",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=DUMBO%20Manhattan%20Bridge%20View%20Brooklyn%20New%20York%20NY",
    websiteUrl: "https://www.nycgo.com/boroughs-neighborhoods/brooklyn/dumbo/",
    badges: ["Viral", "Free", "Photos"],
  },
];

function viewpointToHallPlace(spot: (typeof VIEWPOINTS)[number], userLocation?: Coordinates): NycRooftopHallOfFamePlace {
  const coords: Record<string, Coordinates> = {
    "Top of the Rock": { lat: 40.7594, lng: -73.9792 },
    "SUMMIT One Vanderbilt": { lat: 40.7527, lng: -73.9787 },
    "Edge": { lat: 40.7541, lng: -74.0008 },
    "One World Observatory": { lat: 40.713, lng: -74.0132 },
    "Brooklyn Heights Promenade": { lat: 40.696, lng: -73.997 },
    "DUMBO Manhattan Bridge View": { lat: 40.7033, lng: -73.9895 },
  };
  const location = coords[spot.name];
  return {
    id: spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name: spot.name,
    type: "rooftop",
    borough: spot.area.includes("Brooklyn") || spot.area.includes("DUMBO") ? "Brooklyn" : "Manhattan",
    neighborhood: spot.area,
    rooftopStyle: spot.style.includes("paid") || spot.style.includes("deck") ? "Photography" : "Skyline view",
    categories: ["viewpoint", "nyc_rooftops_hall_of_fame", "views", "near_tourist_areas"],
    bestFor: ["photos", "sunset", "families"],
    viewType: ["Manhattan skyline"],
    whyItMatters: spot.bestFor,
    dressCode: "Casual",
    reservationRecommended: !spot.badges.includes("Free"),
    ageRestriction: "Family-friendly daytime",
    bestTimeToGo: spot.badges.includes("Sunset") ? "Sunset" : "Unknown",
    weatherSuitability: spot.badges.includes("Indoor") ? "covered" : "weather_dependent",
    priceLevel: null,
    averagePricePerPersonUsd: null,
    address: null,
    lat: location.lat,
    lng: location.lng,
    officialWebsite: spot.websiteUrl,
    googleMapsUrl: spot.mapsUrl,
    directionsUrl: userLocation ? buildGoogleDirectionsUrl(userLocation, location) : spot.mapsUrl,
    reservationUrl: spot.websiteUrl,
    imageUrl: spot.imageUrl,
    googlePlaceId: null,
    googleRating: null,
    googleReviewCount: null,
    dataQuality: "curated_pending_google_enrichment",
    badges: ["Viewpoint Hall of Fame", ...spot.badges],
    rooftopReputationScore: spot.badges.includes("Viral") ? 96 : 90,
    viewQualityScore: 94,
  };
}

type ViewpointsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(v: string | string[] | undefined, fallback = "") {
  return Array.isArray(v) ? (v[0] ?? fallback) : (v ?? fallback);
}

export default async function ViewpointsPage({ searchParams }: ViewpointsPageProps) {
  const params = await searchParams;
  const userLat = Number(one(params.userLat, "0"));
  const userLng = Number(one(params.userLng, "0"));
  const userLocation = userLat !== 0 && userLng !== 0 ? { lat: userLat, lng: userLng } : undefined;
  const rooftops = await getNycRooftopsHallOfFame(userLocation);
  const skylinePlaces = [...VIEWPOINTS.map((spot) => viewpointToHallPlace(spot, userLocation)), ...rooftops];

  return (
    <main className="min-h-screen bg-[url('https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-fixed bg-center px-6 py-10 md:px-10">
      <div className="min-h-screen bg-stone-50/95 pb-10">
        <section className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-stone-200 bg-[#fff8eb] shadow-sm md:grid-cols-[1fr_420px]">
          <div className="space-y-3 p-5 md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700">NYC Skyline Guide</p>
            <h1 className="font-american-diner text-5xl tracking-tight text-slate-950 md:text-6xl">Roof Tops</h1>
            <p className="max-w-xl text-sm font-semibold text-slate-700">
              Miradores, rooftops, skyline spots y sitios virales para ver Nueva York desde arriba o desde el mejor angulo.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
              <a href="#viewpoints" className="rounded-md border-2 border-slate-950 bg-white px-3 py-2 shadow-[3px_3px_0_#111827]">
                Viewpoints
              </a>
              <a href="#rooftops" className="rounded-md border-2 border-slate-950 bg-red-700 px-3 py-2 text-white shadow-[3px_3px_0_#111827]">
                Rooftops Hall of Fame
              </a>
              <a href="#mapa-rooftops" className="rounded-md border-2 border-slate-950 bg-white px-3 py-2 shadow-[3px_3px_0_#111827]">
                Mapa
              </a>
              <UseMyRooftopLocationButton />
            </div>
          </div>
          <div className="relative min-h-64 md:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=85"
              alt="Skyline de Nueva York con rascacielos"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>
        </section>

        <div id="rooftops" className="mx-auto max-w-6xl">
          <div id="mapa-rooftops" />
          <RooftopsHallOfFameSection places={skylinePlaces} accommodation={userLocation} />
        </div>

        <section id="viewpoints" className="mx-auto mt-8 max-w-6xl space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-red-700">Viewpoints Hall of Fame</p>
              <h2 className="font-american-diner text-4xl text-slate-950">Otros Miradores y Spots de Skyline</h2>
            </div>
            <Link href="/restaurants" className="rounded-md border-2 border-slate-950 bg-white px-4 py-2 text-sm font-black uppercase tracking-wide shadow-[3px_3px_0_#111827]">
              Ver comida cerca
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {VIEWPOINTS.map((spot) => {
              const hallPlace = viewpointToHallPlace(spot, userLocation);
              const transitHref = buildTransitPlannerUrl({
                name: spot.name,
                address: spot.area,
                lat: hallPlace.lat,
                lng: hallPlace.lng,
              });
              return (
              <article key={spot.name} className="overflow-hidden rounded-lg border-2 border-slate-950 bg-white shadow-[5px_5px_0_#111827]">
                <div className="relative h-48 w-full">
                  <Image src={spot.imageUrl} alt={spot.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-base font-black text-slate-950">{spot.name}</p>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{spot.area} - {spot.style}</p>
                  <p className="text-sm text-slate-700">{spot.bestFor}</p>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {spot.badges.map((badge) => (
                      <span key={badge} className="rounded-full bg-slate-950 px-2 py-1 font-bold text-white">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <a href={spot.mapsUrl} target="_blank" className="rounded-full border border-slate-300 px-2 py-1">Google Maps</a>
                    <a href={transitHref} className="rounded-full border border-slate-300 px-2 py-1">Como llegar</a>
                    <a href={spot.websiteUrl} target="_blank" className="rounded-full border border-red-700 bg-red-700 px-2 py-1 font-bold text-white">Entradas / Web oficial</a>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}
