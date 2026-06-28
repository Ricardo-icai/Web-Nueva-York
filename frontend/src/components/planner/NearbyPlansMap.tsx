"use client";

import { useEffect, useRef } from "react";

export type NearbyPlansMapPoint = {
  id: string;
  title: string;
  category: string;
  lat: number;
  lng: number;
  badge: string;
  mapsUrl: string;
  transitUrl: string;
};

type Props = {
  userLocation: { lat: number; lng: number } | null;
  points: NearbyPlansMapPoint[];
};

type MarkerLike = {
  bindPopup: (html: string) => void;
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
  Cultura: "#0A2342",
  Restaurante: "#B45309",
  Noche: "#7A1E2C",
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

export default function NearbyPlansMap({ userLocation, points }: Props) {
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<ReturnType<LeafletLike["map"]> | null>(null);
  const markersLayerRef = useRef<{ remove: () => void } | null>(null);

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
        createdMap.setView([40.758, -73.9855], 12);
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

      for (const point of points) {
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 9,
          color: "#ffffff",
          fillColor: categoryColors[point.category] ?? "#0A2342",
          fillOpacity: 1,
          weight: 3,
        });
        marker.bindPopup(
          `<div style="min-width:220px"><strong>${escapeHtml(point.title)}</strong><br/>${escapeHtml(point.category)} · ${escapeHtml(point.badge)}<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><a href="${escapeHtml(point.mapsUrl)}" target="_blank" rel="noopener noreferrer" style="padding:5px 8px;border-radius:9999px;border:1px solid #d6d3d1;color:#0A2342;text-decoration:none;font-size:12px">Google Maps</a><a href="${escapeHtml(point.transitUrl)}" style="padding:5px 8px;border-radius:9999px;border:1px solid #D4AF37;color:#0A2342;text-decoration:none;font-size:12px">Como llegar</a></div></div>`,
        );
        marker.addTo(layer);
        bounds.push([point.lat, point.lng]);
      }

      if (userLocation) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:#16a34a;color:#fff;font-weight:900;font-size:11px;box-shadow:0 1px 6px rgba(0,0,0,.35);border:2px solid white">TÚ</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
        userMarker.bindPopup("<strong>Tu ubicación</strong>");
        userMarker.addTo(layer);
        bounds.push([userLocation.lat, userLocation.lng]);
      }

      if (bounds.length > 1) {
        leafletMapRef.current.fitBounds(bounds, { padding: [28, 28] });
      } else if (bounds.length === 1) {
        leafletMapRef.current.setView(bounds[0], 14);
      }
    };

    void renderMap();
    return () => {
      disposed = true;
    };
  }, [points, userLocation]);

  return <div ref={mapHostRef} className="h-[460px] w-full" />;
}
