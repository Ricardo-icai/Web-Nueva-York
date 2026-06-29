"use client";

import { getDeviceCoordinates } from "@/lib/geolocation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { ShoppingVenue } from "@/types/shopping";
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
  luxury: "#C1121F",
  department_store: "#0A2342",
  fashion: "#D97706",
  sports: "#16A34A",
  sneakers_streetwear: "#2563EB",
  streetwear: "#1D4ED8",
  tech: "#111827",
  vintage: "#7C3AED",
  beauty: "#DB2777",
  toys: "#F59E0B",
  souvenirs: "#0F766E",
  outlet: "#B45309",
  mall: "#475569",
  bookstore: "#334155",
  specialty: "#0F172A",
  design_books: "#475569",
  market: "#0F766E",
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

export default function ShoppingMap({
  venues,
  accommodation,
  onUserLocationChange,
}: {
  venues: ShoppingVenue[];
  accommodation?: { lat: number; lng: number; address: string } | null;
  onUserLocationChange?: (location: { lat: number; lng: number } | null) => void;
}) {
  const { language } = useLanguage();
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<ReturnType<LeafletLike["map"]> | null>(null);
  const markersLayerRef = useRef<{ remove: () => void } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [geocoded, setGeocoded] = useState<ShoppingVenue[]>(venues);

  useEffect(() => {
    setGeocoded(venues);
  }, [venues]);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = "nyc_shopping_geo_cache_v1";

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
          if (!response.ok) continue;
          const rows = (await response.json()) as Array<{ lat?: string; lon?: string }>;
          const row = rows[0];
          if (!row?.lat || !row?.lon) continue;
          const point = { lat: Number(row.lat), lng: Number(row.lon) };
          cache[key] = point;
          const index = next.findIndex((item) => item.id === venue.id);
          if (index >= 0) next[index] = { ...next[index], location: point };
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

  function locateUser() {
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
  }

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
          radius: 10,
          color: "#ffffff",
          fillColor: categoryColors[venue.category] ?? "#0A2342",
          fillOpacity: 1,
          weight: 3,
        });
        marker.bindTooltip(venue.name, { direction: "top", offset: [0, -12], opacity: 0.95 });
        marker.on("mouseover", () => marker.openTooltip());
        marker.on("mouseout", () => marker.closeTooltip());
        marker.bindPopup(
          `<div style="min-width:230px"><img src="${escapeHtml(venue.imageUrl)}" alt="${escapeHtml(venue.name)}" style="width:100%;height:92px;object-fit:cover;border-radius:12px;margin-bottom:8px"/><strong>${escapeHtml(venue.name)}</strong><br/>${escapeHtml(categoryLabel(venue.category))}<br/>${escapeHtml(venue.neighborhood ?? "")}<br/>${escapeHtml(venue.priceRangeLabel ?? venue.averageSpendLabel ?? (language === "en" ? "Price unavailable" : "Precio aprox. no disponible"))}${venue.googleRating ? `<br/>Google ${venue.googleRating.toFixed(1)}${venue.googleReviewCount ? ` · ${venue.googleReviewCount} ${language === "en" ? "reviews" : "reseñas"}` : ""}` : ""}<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><a href="${escapeHtml(venue.officialWebsite ?? venue.googleMapsUrl)}" target="_blank" rel="noopener noreferrer" style="padding:5px 8px;border-radius:9999px;border:1px solid #d6d3d1;color:#111827;text-decoration:none;font-size:12px">${language === "en" ? "Website" : "Web"}</a><a href="${escapeHtml(venue.googleMapsUrl)}" target="_blank" rel="noopener noreferrer" style="padding:5px 8px;border-radius:9999px;border:1px solid #d6d3d1;color:#111827;text-decoration:none;font-size:12px">Maps</a><a href="${escapeHtml(venue.directionsUrl ?? venue.googleMapsUrl)}" target="_blank" rel="noopener noreferrer" style="padding:5px 8px;border-radius:9999px;background:#111827;color:#fff;text-decoration:none;font-size:12px">${language === "en" ? "Directions" : "Como llegar"}</a></div></div>`,
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
  }, [accommodation, userLocation, venuesWithCoords, onUserLocationChange]);

  return (
    <section id="shopping-map" className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f7f3ea)] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-american-diner text-4xl text-slate-950">{language === "en" ? "Map" : "Mapa"}</h2>
          <div className="flex flex-col items-end gap-2">
            <button type="button" onClick={locateUser} className="rounded-full border border-slate-950 bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_28px_rgba(15,23,42,0.16)]">
              {language === "en" ? "Use my location" : "Usar mi ubicacion"}
            </button>
            {locationError ? <p className="text-right text-xs font-semibold text-rose-700">{locationError}</p> : null}
          </div>
        </div>
        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_22px_46px_rgba(15,23,42,0.1)]">
          <div ref={mapHostRef} className="h-[520px] w-full" />
        </div>
      </div>
    </section>
  );
}
