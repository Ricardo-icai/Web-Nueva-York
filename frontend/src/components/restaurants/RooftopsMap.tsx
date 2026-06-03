"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildOfficialWebsiteSearchUrl } from "@/lib/restaurants/build-restaurant-links";
import type { Coordinates, NycRooftopHallOfFamePlace } from "@/types/restaurants";

type Props = {
  places: NycRooftopHallOfFamePlace[];
  accommodation?: Coordinates;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

type MarkerLike = {
  bindPopup: (html: string) => void;
  bindTooltip: (
    text: string,
    opts: { direction: "top" | "bottom" | "left" | "right"; offset: [number, number]; opacity: number },
  ) => void;
  openTooltip: () => void;
  closeTooltip: () => void;
  on: (event: "mouseover" | "mouseout" | "click", handler: () => void) => void;
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

export default function RooftopsMap({ places, accommodation, selectedId, onSelect }: Props) {
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<ReturnType<LeafletLike["map"]> | null>(null);
  const markersLayerRef = useRef<{ remove: () => void } | null>(null);
  const [geocoded, setGeocoded] = useState<Record<string, Coordinates>>({});

  const placesWithLocation = useMemo(
    () =>
      places
        .map((place) => {
          const cached = geocoded[place.id];
          const location =
            typeof place.lat === "number" && typeof place.lng === "number"
              ? { lat: place.lat, lng: place.lng }
              : cached;
          return location ? { place, location } : null;
        })
        .filter((item): item is { place: NycRooftopHallOfFamePlace; location: Coordinates } => item !== null),
    [geocoded, places],
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const missing = places.filter(
        (place) =>
          typeof place.lat !== "number" ||
          typeof place.lng !== "number",
      );
      const updates: Record<string, Coordinates> = {};
      for (const place of missing.slice(0, 80)) {
        if (cancelled || geocoded[place.id]) continue;
        const query = encodeURIComponent(`${place.name} ${place.neighborhood} ${place.borough} New York`);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${query}`,
            { headers: { "Accept-Language": "en" } },
          );
          if (response.ok) {
            const rows = (await response.json()) as Array<{ lat?: string; lon?: string }>;
            const row = rows[0];
            if (row?.lat && row.lon) {
              const point = { lat: Number(row.lat), lng: Number(row.lon) };
              if (Number.isFinite(point.lat) && Number.isFinite(point.lng)) updates[place.id] = point;
            }
          }
        } catch {
          // Geocoding is best-effort; Google Maps links still work without a marker.
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      if (!cancelled && Object.keys(updates).length) {
        setGeocoded((prev) => ({ ...prev, ...updates }));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [geocoded, places]);

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
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(createdMap);
        leafletMapRef.current = createdMap;
        setTimeout(() => leafletMapRef.current?.invalidateSize?.(), 120);
      }

      if (markersLayerRef.current) markersLayerRef.current.remove();
      const layer = L.layerGroup();
      layer.addTo(leafletMapRef.current);
      markersLayerRef.current = layer;

      const bounds: [number, number][] = [];
      for (const { place, location } of placesWithLocation) {
        const isSelected = selectedId === place.id;
        const marker = L.circleMarker([location.lat, location.lng], {
          radius: isSelected ? 14 : 10,
          color: "#ffffff",
          fillColor: isSelected ? "#b91c1c" : "#111827",
          fillOpacity: 1,
          weight: 3,
        });
        const websiteUrl = place.officialWebsite ?? buildOfficialWebsiteSearchUrl(place.name, place.address);
        const directionsUrl = place.directionsUrl ?? place.googleMapsUrl;
        marker.bindTooltip(place.name, { direction: "top", offset: [0, -12], opacity: 0.95 });
        marker.on("mouseover", () => marker.openTooltip());
        marker.on("mouseout", () => marker.closeTooltip());
        marker.on("click", () => onSelect?.(place.id));
        marker.bindPopup(
          `<div style="min-width:220px"><img src="${escapeHtml(place.imageUrl)}" alt="" style="width:100%;height:92px;object-fit:cover;border-radius:10px;margin-bottom:8px"/><strong>${escapeHtml(place.name)}</strong><br/>${escapeHtml(place.neighborhood)}<br/>${typeof place.googleRating === "number" ? `Rating ${place.googleRating.toFixed(1)} - ${place.googleReviewCount ?? 0} reviews` : "Rating unavailable"}<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><a href="${escapeHtml(place.googleMapsUrl)}" target="_blank" rel="noopener noreferrer" style="padding:4px 8px;border-radius:9999px;border:1px solid #d6d3d1;color:#1f2937;text-decoration:none;font-size:12px">Google Maps</a><a href="${escapeHtml(directionsUrl)}" target="_blank" rel="noopener noreferrer" style="padding:4px 8px;border-radius:9999px;border:1px solid #d6d3d1;color:#1f2937;text-decoration:none;font-size:12px">Como llegar</a><a href="${escapeHtml(websiteUrl)}" target="_blank" rel="noopener noreferrer" style="padding:4px 8px;border-radius:9999px;border:1px solid #d6d3d1;color:#1f2937;text-decoration:none;font-size:12px">${place.officialWebsite ? "Web oficial" : "Buscar web oficial"}</a></div></div>`,
        );
        marker.addTo(layer);
        bounds.push([location.lat, location.lng]);
      }

      if (accommodation) {
        const icon = L.divIcon({
          className: "",
          html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:#16a34a;color:#fff;font-weight:700;font-size:12px;box-shadow:0 1px 4px rgba(0,0,0,.4)">TU</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const userMarker = L.marker([accommodation.lat, accommodation.lng], { icon });
        userMarker.bindTooltip("Tu ubicacion", { direction: "top", offset: [0, -12], opacity: 0.95 });
        userMarker.addTo(layer);
        bounds.push([accommodation.lat, accommodation.lng]);
      }

      if (bounds.length > 1) {
        leafletMapRef.current.fitBounds(bounds, { padding: [30, 30] });
      }
    };

    renderMap();
    return () => {
      disposed = true;
    };
  }, [accommodation, onSelect, placesWithLocation, selectedId]);

  return (
    <div className="overflow-hidden rounded-lg border-2 border-slate-950 bg-white shadow-[6px_6px_0_#111827]">
      <div className="border-b-2 border-slate-950 bg-[#fff3d1] px-4 py-3">
        <p className="font-american-diner text-2xl text-slate-950">Mapa de Roof Tops</p>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-700">
          {placesWithLocation.length} puntos de rooftops localizados en Nueva York
        </p>
      </div>
      <div ref={mapHostRef} className="h-80 w-full md:h-96" />
    </div>
  );
}
