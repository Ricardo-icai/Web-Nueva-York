"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type CulturalMapPoint = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  badges: string[];
  googleMapsUrl: string;
  transitUrl: string;
};

type CulturalRoute = {
  name: string;
  stops: string[];
};

type Props = {
  points: CulturalMapPoint[];
  routes: CulturalRoute[];
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
    invalidateSize?: () => void;
  };
  tileLayer: (url: string, opts: { attribution: string; maxZoom: number }) => { addTo: (map: unknown) => void };
  layerGroup: () => { addTo: (map: unknown) => unknown; remove: () => void };
  circleMarker: (
    coords: [number, number],
    opts: { radius: number; color: string; fillColor: string; fillOpacity: number; weight: number },
  ) => MarkerLike;
};

const categoryColors: Record<string, string> = {
  Museo: "#0A2342",
  Monumento: "#7A1E2C",
  Arquitectura: "#D4AF37",
  Barrio: "#35605A",
  "Street Art": "#C1121F",
  Escena: "#5B2A86",
  Literatura: "#8A5A44",
  Musica: "#111827",
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

export default function CulturalMap({ points, routes }: Props) {
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<ReturnType<LeafletLike["map"]> | null>(null);
  const markersLayerRef = useRef<{ remove: () => void } | null>(null);
  const [activeCategory, setActiveCategory] = useState("Todos");

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(points.map((point) => point.category)))], [points]);
  const visiblePoints = useMemo(
    () => (activeCategory === "Todos" ? points : points.filter((point) => point.category === activeCategory)),
    [activeCategory, points],
  );

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
      for (const point of visiblePoints) {
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 10,
          color: "#ffffff",
          fillColor: categoryColors[point.category] ?? "#0A2342",
          fillOpacity: 1,
          weight: 3,
        });
        marker.bindTooltip(point.name, { direction: "top", offset: [0, -12], opacity: 0.95 });
        marker.on("mouseover", () => marker.openTooltip());
        marker.on("mouseout", () => marker.closeTooltip());
        marker.bindPopup(
          `<div style="min-width:210px"><strong>${escapeHtml(point.name)}</strong><br/>${escapeHtml(point.category)}<br/><span>${escapeHtml(point.badges.slice(0, 3).join(" / "))}</span><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><a href="${escapeHtml(point.googleMapsUrl)}" target="_blank" rel="noopener noreferrer" style="padding:5px 8px;border-radius:9999px;border:1px solid #d6d3d1;color:#0A2342;text-decoration:none;font-size:12px">Google Maps</a><a href="${escapeHtml(point.transitUrl)}" style="padding:5px 8px;border-radius:9999px;border:1px solid #D4AF37;color:#0A2342;text-decoration:none;font-size:12px">Como llegar</a></div></div>`,
        );
        marker.addTo(layer);
        bounds.push([point.lat, point.lng]);
      }

      if (bounds.length > 1) {
        leafletMapRef.current.fitBounds(bounds, { padding: [28, 28] });
      }
    };

    renderMap();
    return () => {
      disposed = true;
    };
  }, [visiblePoints]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="overflow-hidden rounded-md border border-[#0A2342]/15 bg-white shadow-[0_18px_55px_rgba(10,35,66,0.12)]">
        <div className="border-b border-[#0A2342]/12 bg-[#0A2342] p-4 text-white">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">CulturalMap.tsx</p>
          <h3 className="font-display text-3xl font-bold">Museos, monumentos, barrios y rutas</h3>
        </div>
        <div ref={mapHostRef} className="h-[520px] w-full" />
      </div>

      <aside className="space-y-4">
        <div className="rounded-md border border-[#0A2342]/15 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7A1E2C]">Filtros del mapa</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-wide ${
                  activeCategory === category
                    ? "border-[#0A2342] bg-[#0A2342] text-white"
                    : "border-[#0A2342]/20 bg-[#F8F4EA] text-[#0A2342]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">{visiblePoints.length} puntos culturales visibles.</p>
        </div>

        <div className="rounded-md border border-[#0A2342]/15 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7A1E2C]">Conexiones de transporte</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Cada punto abre la pestana Transporte con el destino precargado. Desde ahi puedes usar tu ubicacion y ver conexiones de metro, bus, ferry o AirTrain.
          </p>
        </div>

        <div className="rounded-md border border-[#0A2342]/15 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7A1E2C]">Rutas culturales</p>
          <div className="mt-3 space-y-3">
            {routes.map((route) => (
              <div key={route.name} className="rounded-md bg-[#F8F4EA] p-3">
                <p className="font-display text-xl font-bold text-[#0A2342]">{route.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-700">{route.stops.join(" -> ")}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
