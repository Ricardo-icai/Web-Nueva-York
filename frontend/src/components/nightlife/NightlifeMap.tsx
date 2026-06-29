"use client";

import { getDeviceCoordinates } from "@/lib/geolocation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { NightlifeVenue } from "@/types/nightlife";
import { useEffect, useMemo, useRef, useState } from "react";

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
    invalidateSize?: () => void;
  };
  tileLayer: (url: string, opts: { attribution: string; maxZoom: number }) => { addTo: (map: unknown) => void };
  layerGroup: () => { addTo: (map: unknown) => unknown; remove: () => void };
  circleMarker: (
    coords: [number, number],
    opts: { radius: number; color: string; fillColor: string; fillOpacity: number; weight: number },
  ) => MarkerLike;
  marker: (coords: [number, number], opts: { icon: unknown }) => MarkerLike;
  divIcon: (opts: { className: string; html: string; iconSize: [number, number]; iconAnchor: [number, number] }) => unknown;
};

const categoryColors: Record<string, string> = {
  club: "#111827",
  cocktail_bar: "#B45309",
  speakeasy: "#6B7280",
  rooftop: "#0EA5E9",
  live_music: "#16A34A",
  event: "#F43F5E",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char] ?? char;
  });
}

function categoryLabel(category: string) {
  return category.replaceAll("_", " ");
}

export default function NightlifeMap({
  venues,
  selectedId,
  favorites,
  onUserLocationChange,
  accommodation,
}: {
  venues: NightlifeVenue[];
  selectedId?: string | null;
  favorites: string[];
  onUserLocationChange?: (location: { lat: number; lng: number } | null) => void;
  accommodation?: { lat: number; lng: number; address: string } | null;
}) {
  const { language } = useLanguage();
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<ReturnType<LeafletLike["map"]> | null>(null);
  const markersLayerRef = useRef<{ remove: () => void } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [geocoded, setGeocoded] = useState<NightlifeVenue[]>(venues);

  useEffect(() => {
    setGeocoded(venues);
  }, [venues]);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = "nyc_nightlife_geo_cache_v1";

    async function run() {
      const missing = venues.filter((venue) => typeof venue.location.lat !== "number" || typeof venue.location.lng !== "number");
      if (!missing.length) return;

      let cache: Record<string, { lat: number; lng: number }> = {};
      try {
        cache = JSON.parse(localStorage.getItem(cacheKey) ?? "{}") as Record<string, { lat: number; lng: number }>;
      } catch {
        cache = {};
      }

      const next = [...venues];
      for (const venue of missing) {
        const key = `${venue.name}|${venue.address ?? venue.neighborhood ?? ""}`;
        const cached = cache[key];
        if (cached) {
          const index = next.findIndex((item) => item.id === venue.id);
          if (index >= 0) next[index] = { ...next[index], location: cached };
          continue;
        }

        const query = encodeURIComponent(`${venue.name} ${venue.address ?? ""} New York`);
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${query}`, {
            headers: { "Accept-Language": "en" },
          });
          if (response.ok) {
            const rows = (await response.json()) as Array<{ lat?: string; lon?: string }>;
            const row = rows[0];
            if (row?.lat && row?.lon) {
              const point = { lat: Number(row.lat), lng: Number(row.lon) };
              cache[key] = point;
              const index = next.findIndex((item) => item.id === venue.id);
              if (index >= 0) next[index] = { ...next[index], location: point };
            }
          }
        } catch {
          // ignore geocode failures
        }
      }

      if (!cancelled) {
        localStorage.setItem(cacheKey, JSON.stringify(cache));
        setGeocoded(next);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [venues]);

  const venuesWithCoords = useMemo(
    () => geocoded.filter((venue) => typeof venue.location.lat === "number" && typeof venue.location.lng === "number"),
    [geocoded],
  );

  const locateUser = () => {
    setLocationError("");
    void getDeviceCoordinates()
      .then(({ lat, lng }) => {
        const location = { lat, lng };
        setUserLocation(location);
        onUserLocationChange?.(location);
      })
      .catch((message: unknown) => {
        setLocationError(message instanceof Error ? message.message : language === "en" ? "I could not get your location." : "No he podido obtener tu ubicacion.");
      });
  };

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
        const map = L.map(mapHostRef.current, { zoomControl: true, scrollWheelZoom: true });
        map.setView([40.758, -73.9855], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);
        leafletMapRef.current = map;
        setTimeout(() => leafletMapRef.current?.invalidateSize?.(), 120);
      }

      if (markersLayerRef.current) markersLayerRef.current.remove();
      const layer = L.layerGroup();
      layer.addTo(leafletMapRef.current);
      markersLayerRef.current = layer;

      const bounds: [number, number][] = [];
      for (const venue of venuesWithCoords) {
        const marker = L.circleMarker([venue.location.lat!, venue.location.lng!], {
          radius: selectedId === venue.id ? 12 : 10,
          color: "#ffffff",
          fillColor: categoryColors[venue.category] ?? "#111827",
          fillOpacity: 1,
          weight: favorites.includes(venue.id) ? 4 : 3,
        });
        marker.bindTooltip(venue.name, { direction: "top", offset: [0, -12], opacity: 0.95 });
        marker.on("mouseover", () => marker.openTooltip());
        marker.on("mouseout", () => marker.closeTooltip());
        marker.bindPopup(
          `<div style="min-width:220px"><img src="${escapeHtml(venue.imageUrl)}" alt="${escapeHtml(venue.name)}" style="width:100%;height:92px;object-fit:cover;border-radius:12px;margin-bottom:8px"/><strong>${escapeHtml(venue.name)}</strong><br/>${escapeHtml(categoryLabel(venue.category))}<br/>${escapeHtml(venue.neighborhood ?? "")}<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><a href="${escapeHtml(venue.googleMapsUrl)}" target="_blank" rel="noopener noreferrer" style="padding:5px 8px;border-radius:9999px;border:1px solid #d6d3d1;color:#111827;text-decoration:none;font-size:12px">Google Maps</a></div></div>`,
        );
        marker.addTo(layer);
        bounds.push([venue.location.lat!, venue.location.lng!]);
      }

      if (userLocation) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:#16a34a;color:#fff;font-weight:900;font-size:11px;border:2px solid white">${language === "en" ? "YOU" : "TU"}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
        userMarker.bindTooltip(language === "en" ? "Your location" : "Tu ubicacion", { direction: "top", offset: [0, -12], opacity: 0.95 });
        userMarker.addTo(layer);
        bounds.push([userLocation.lat, userLocation.lng]);
      }

      if (accommodation) {
        const accommodationIcon = L.divIcon({
          className: "",
          html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:#111827;color:#fff;font-weight:900;font-size:10px;border:2px solid white">HOTEL</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        const accommodationMarker = L.marker([accommodation.lat, accommodation.lng], { icon: accommodationIcon });
        accommodationMarker.bindTooltip(language === "en" ? "Where you stay" : "Donde duermes", { direction: "top", offset: [0, -12], opacity: 0.95 });
        accommodationMarker.addTo(layer);
        bounds.push([accommodation.lat, accommodation.lng]);
      }

      if (bounds.length > 1) leafletMapRef.current.fitBounds(bounds, { padding: [28, 28] });
    };

    void renderMap();
    return () => {
      disposed = true;
    };
  }, [accommodation, favorites, selectedId, userLocation, venuesWithCoords]);

  return (
    <section id="nightlife-map" className="border-t border-slate-200 bg-white px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-bold text-slate-950">{language === "en" ? "Nightlife map" : "Mapa de nightlife"}</h2>
          <div className="flex flex-col items-end gap-2">
            <button type="button" onClick={locateUser} className="rounded-full border border-slate-950 bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">
              {language === "en" ? "Use my location" : "Usar mi ubicacion"}
            </button>
            {locationError ? <p className="text-right text-xs font-semibold text-rose-700">{locationError}</p> : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white">
          <div ref={mapHostRef} className="h-[520px] w-full" />
        </div>
      </div>
    </section>
  );
}
