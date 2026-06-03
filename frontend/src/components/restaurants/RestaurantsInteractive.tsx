"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import RestaurantLogoImage from "@/components/restaurants/RestaurantLogoImage";
import { readSession, userScopedStorageKey } from "@/lib/auth";
import { buildOfficialWebsiteSearchUrl } from "@/lib/restaurants/build-restaurant-links";
import { buildTransitPlannerUrl } from "@/lib/transit-planner";
import type { Restaurant } from "@/types/restaurants";

type Props = {
  restaurants: Restaurant[];
  mapRestaurants?: Restaurant[];
  userLocation?: { lat: number; lng: number };
  afterMapSlot?: ReactNode;
};

type MarkerLike = {
  bindPopup: (html: string) => void;
  bindTooltip: (
    text: string,
    opts: { direction: "top" | "bottom" | "left" | "right"; offset: [number, number]; opacity: number },
  ) => void;
  openTooltip: () => void;
  closeTooltip: () => void;
  on: (event: "mouseover" | "mouseout", handler: () => void) => void;
  addTo: (layer: unknown) => void;
};

type LeafletLike = {
  map: (node: HTMLElement, opts: { zoomControl: boolean; scrollWheelZoom: boolean }) => {
    setView: (coords: [number, number], zoom: number) => unknown;
    fitBounds: (bounds: [number, number][], opts: { padding: [number, number] }) => void;
  };
  tileLayer: (url: string, opts: { attribution: string; maxZoom: number }) => { addTo: (map: unknown) => void };
  layerGroup: () => { addTo: (map: unknown) => unknown; remove: () => void };
  marker: (coords: [number, number], opts: { icon: unknown }) => MarkerLike;
  divIcon: (opts: { className: string; html: string; iconSize: [number, number]; iconAnchor: [number, number] }) => unknown;
  circleMarker: (
    coords: [number, number],
    opts: { radius: number; color: string; fillColor: string; fillOpacity: number; weight: number },
  ) => MarkerLike;
};

const FAVORITES_KEY = "nyc_restaurant_favorites_v1";

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

function groupKey(r: Restaurant) {
  if (r.cuisine.length > 0 && r.cuisine[0]) return r.cuisine[0];
  if (r.categories.length > 0 && r.categories[0]) return r.categories[0];
  return "Other";
}

export default function RestaurantsInteractive({ restaurants, mapRestaurants, userLocation, afterMapSlot }: Props) {
  const favoritesKey = useMemo(() => userScopedStorageKey(FAVORITES_KEY, readSession()?.email), []);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(userScopedStorageKey(FAVORITES_KEY, readSession()?.email));
      if (!raw) return [];
      const ids = JSON.parse(raw) as string[];
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  });
  const [geocodedMapRestaurants, setGeocodedMapRestaurants] = useState<{ key: string; items: Restaurant[] } | null>(null);

  useEffect(() => {
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
  }, [favorites, favoritesKey]);

  const uniqueRestaurants = useMemo(() => {
    const seen = new Set<string>();
    const out: Restaurant[] = [];
    for (const r of restaurants) {
      const key = canonicalName(r.name);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
    return out;
  }, [restaurants]);

  const uniqueMapRestaurants = useMemo(() => {
    const source = mapRestaurants ?? restaurants;
    const seen = new Set<string>();
    const out: Restaurant[] = [];
    for (const r of source) {
      const key = canonicalName(r.name);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
    return out;
  }, [mapRestaurants, restaurants]);

  const withLocation = useMemo(() => {
    return uniqueMapRestaurants.map((r, idx) => {
      const hasCoords = Number.isFinite(r.location.lat) && Number.isFinite(r.location.lng) && !(r.location.lat === 0 && r.location.lng === 0);
      if (hasCoords) return r;
      return { ...r, location: { lat: 40.758 + (idx % 20) * 0.002, lng: -73.9855 + Math.floor(idx / 20) * 0.002 } };
    });
  }, [uniqueMapRestaurants]);

  const mapLocationKey = useMemo(
    () => withLocation.map((r) => `${r.id}:${r.location.lat}:${r.location.lng}`).join("|"),
    [withLocation],
  );

  const resolvedMapRestaurants = geocodedMapRestaurants?.key === mapLocationKey ? geocodedMapRestaurants.items : withLocation;

  const grouped = useMemo(() => {
    const map = new Map<string, Restaurant[]>();
    for (const r of uniqueRestaurants) {
      const key = groupKey(r);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).map(([name, items]) => ({ name, items })).sort((a, b) => b.items.length - a.items.length);
  }, [uniqueRestaurants]);

  const favoriteRestaurants = useMemo(() => uniqueRestaurants.filter((r) => favorites.includes(r.id)), [uniqueRestaurants, favorites]);

  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<unknown>(null);
  const markersLayerRef = useRef<{ remove: () => void } | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const renderCard = (restaurant: Restaurant, cardKey?: string) => {
    const favorite = favorites.includes(restaurant.id);
    const estimated = restaurant.averagePricePerPersonUsd ?? null;
    const websiteHref =
      restaurant.officialWebsite ?? buildOfficialWebsiteSearchUrl(restaurant.name, restaurant.address);
    const transitHref = buildTransitPlannerUrl({
      name: restaurant.name,
      address: restaurant.address,
      location: restaurant.location,
    });
    return (
      <article key={cardKey ?? restaurant.id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="relative h-56 w-full">
          <RestaurantLogoImage
            name={restaurant.name}
            officialWebsite={restaurant.officialWebsite}
            fallbackImageUrl={restaurant.imageUrl}
          />
        </div>
        <div className="space-y-2 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">{restaurant.name}</h3>
            <button type="button" onClick={() => toggleFavorite(restaurant.id)} className="rounded-full border border-amber-400 px-3 py-1 text-xs font-semibold text-amber-700">
              {favorite ? "Favorito guardado" : "Favorito"}
            </button>
          </div>
          <p className="text-sm text-slate-700">{restaurant.cuisine.join(", ")}</p>
          <p className="text-sm text-slate-700">{restaurant.neighborhood ?? restaurant.address ?? "Address unavailable"}</p>
          <p className="text-sm text-slate-900">{typeof restaurant.googleRating === "number" ? `Rating ${restaurant.googleRating.toFixed(1)} - ${restaurant.googleReviewCount ?? 0} reviews` : "Rating unavailable"}</p>
          <p className="text-sm text-slate-900">{typeof estimated === "number" ? `Estimated from $${estimated}/person` : "Price estimate unavailable"}</p>
          <div className="flex flex-wrap gap-2">
            <Link href={restaurant.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-3 py-1 text-sm">Google Maps</Link>
            <Link href={transitHref} className="rounded-full border border-slate-300 px-3 py-1 text-sm">Como llegar</Link>
            <Link href={websiteHref} target="_blank" className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm">
              {restaurant.officialWebsite ? "Website" : "Buscar web oficial"}
            </Link>
          </div>
        </div>
      </article>
    );
  };

  useEffect(() => {
    let cancelled = false;
    const CACHE_KEY = "nyc_restaurant_geo_cache_v1";

    const runGeocoding = async () => {
      const needs = withLocation.filter(
        (r) =>
          !Number.isFinite(r.location.lat) ||
          !Number.isFinite(r.location.lng) ||
          (r.location.lat === 40.758 && r.location.lng === -73.9855),
      );
      if (!needs.length) return;

      let cache: Record<string, { lat: number; lng: number }> = {};
      try {
        cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}") as Record<string, { lat: number; lng: number }>;
      } catch {
        cache = {};
      }

      const updated = [...withLocation];
      for (const r of needs.slice(0, 120)) {
        if (cancelled) break;
        const key = `${r.name}|${r.neighborhood ?? ""}|${r.borough ?? ""}`;
        const cached = cache[key];
        if (cached) {
          const idx = updated.findIndex((x) => x.id === r.id);
          if (idx >= 0) updated[idx] = { ...updated[idx], location: cached };
          continue;
        }

        const query = encodeURIComponent(
          `${r.name} ${r.neighborhood ?? ""} ${r.borough ?? ""} New York`,
        );
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${query}`,
            { headers: { "Accept-Language": "en" } },
          );
          if (resp.ok) {
            const rows = (await resp.json()) as Array<{ lat?: string; lon?: string }>;
            const row = rows[0];
            if (row?.lat && row?.lon) {
              const point = { lat: Number(row.lat), lng: Number(row.lon) };
              if (Number.isFinite(point.lat) && Number.isFinite(point.lng)) {
                cache[key] = point;
                const idx = updated.findIndex((x) => x.id === r.id);
                if (idx >= 0) updated[idx] = { ...updated[idx], location: point };
              }
            }
          }
        } catch {
          // ignore geocode errors
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (!cancelled) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        setGeocodedMapRestaurants({ key: mapLocationKey, items: updated });
      }
    };

    runGeocoding();
    return () => {
      cancelled = true;
    };
  }, [mapLocationKey, withLocation]);

  useEffect(() => {
    let disposed = false;

    const ensureLeaflet = async (): Promise<LeafletLike | null> => {
      if (typeof window === "undefined") return null;
      const w = window as typeof window & { L?: LeafletLike };
      if (w.L) return w.L;
      if (!document.querySelector('link[data-leaflet="1"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.setAttribute("data-leaflet", "1");
        document.head.appendChild(link);
      }
      await new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector('script[data-leaflet="1"]') as HTMLScriptElement | null;
        if (existingScript) {
          if (w.L) resolve();
          else existingScript.addEventListener("load", () => resolve(), { once: true });
          return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.setAttribute("data-leaflet", "1");
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Leaflet failed to load"));
        document.body.appendChild(script);
      });
      return w.L ?? null;
    };

    const renderMap = async () => {
      const L = await ensureLeaflet();
      if (!L || !mapHostRef.current || disposed) return;

      if (!leafletMapRef.current) {
        const createdMap = L.map(mapHostRef.current, { zoomControl: true, scrollWheelZoom: true });
        createdMap.setView([40.758, -73.9855], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors", maxZoom: 19 }).addTo(createdMap);
        leafletMapRef.current = createdMap;
        // Fixes missing markers/tiles when the container size is settled after first paint.
        setTimeout(() => {
          (leafletMapRef.current as { invalidateSize?: () => void })?.invalidateSize?.();
        }, 120);
      }

      if (markersLayerRef.current) markersLayerRef.current.remove();
      const layer = L.layerGroup();
      layer.addTo(leafletMapRef.current);
      markersLayerRef.current = layer;

      const bounds: [number, number][] = [];
      for (const r of resolvedMapRestaurants) {
        const marker = L.circleMarker([r.location.lat, r.location.lng], {
          radius: 11,
          color: "#ffffff",
          fillColor: "#dc2626",
          fillOpacity: 1,
          weight: 3,
        });

        const websiteUrl = r.officialWebsite ?? buildOfficialWebsiteSearchUrl(r.name, r.address);
        const directionsUrl = buildTransitPlannerUrl({ name: r.name, address: r.address, location: r.location });
        marker.bindTooltip(r.name, { direction: "top", offset: [0, -12], opacity: 0.95 });
        marker.on("mouseover", () => marker.openTooltip());
        marker.on("mouseout", () => marker.closeTooltip());
        marker.bindPopup(`<div style="min-width:190px"><strong>${r.name}</strong><br/>${typeof r.googleRating === "number" ? `Rating ${r.googleRating.toFixed(1)} - ${r.googleReviewCount ?? 0} reviews` : "No rating"}<br/>${r.cuisine[0] ?? "Restaurant"}<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="padding:4px 8px;border-radius:9999px;border:1px solid #d6d3d1;color:#1f2937;text-decoration:none;font-size:12px">${r.officialWebsite ? "Web oficial" : "Buscar web oficial"}</a><a href="${directionsUrl}" style="padding:4px 8px;border-radius:9999px;border:1px solid #d6d3d1;color:#1f2937;text-decoration:none;font-size:12px">Como llegar</a></div></div>`);
        marker.addTo(layer);
        bounds.push([r.location.lat, r.location.lng]);
      }

      if (userLocation) {
        const userIcon = L.divIcon({ className: "", html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:#16a34a;color:#fff;font-weight:700;font-size:12px;box-shadow:0 1px 4px rgba(0,0,0,.4)">TU</div>`, iconSize: [24, 24], iconAnchor: [12, 12] });
        const you = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
        you.bindTooltip("Tu ubicacion", { direction: "top", offset: [0, -12], opacity: 0.95 });
        you.addTo(layer);
        bounds.push([userLocation.lat, userLocation.lng]);
      }

      if (bounds.length > 1) {
        (leafletMapRef.current as { fitBounds: (b: [number, number][], o: { padding: [number, number] }) => void }).fitBounds(bounds, { padding: [30, 30] });
      }
    };

    renderMap();
    return () => {
      disposed = true;
    };
  }, [resolvedMapRestaurants, userLocation]);

  return (
    <>
      <section className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Map</h2>
          <p className="text-sm text-slate-600">Todos los locales en rojo. Tu ubicacion en verde.</p>
        </div>
        <div ref={mapHostRef} className="h-96 w-full" />
      </section>

      {afterMapSlot}

      <section className="mx-auto mt-8 max-w-6xl">
        <h2 className="text-2xl font-bold text-slate-900">Favoritos</h2>
        {favoriteRestaurants.length === 0 ? <p className="mt-2 text-sm text-slate-600">Aun no has marcado favoritos.</p> : <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{favoriteRestaurants.map((r, idx) => renderCard(r, `fav-${r.id}-${idx}`))}</div>}
      </section>

      <section className="mx-auto mt-8 max-w-6xl space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Restaurants By Food Type</h2>
        {grouped.map((group) => (
          <div key={group.name} className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">{group.name}</h3>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{group.items.map((r, idx) => renderCard(r, `${group.name}-${r.id}-${idx}`))}</div>
          </div>
        ))}
      </section>
    </>
  );
}

