"use client";

import { getDeviceCoordinates } from "@/lib/geolocation";
import { useSearchParams } from "next/navigation";
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

type RouteGeometry = {
  routePath: [number, number][];
  userToRoutePath: [number, number][];
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

type PolylineLike = {
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
  polyline: (
    coords: [number, number][],
    opts: { color: string; weight: number; opacity: number; dashArray?: string },
  ) => PolylineLike;
};

const categoryColors: Record<string, string> = {
  Museo: "#0A2342",
  Monumento: "#7A1E2C",
  Arquitectura: "#D4AF37",
  Barrio: "#35605A",
  "Street Art": "#C1121F",
  Escena: "#5B2A86",
  Literatura: "#8A5A44",
  Pantalla: "#B45309",
  Tour: "#15803D",
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

async function fetchWalkingRouteGeometry(
  stops: [number, number][],
  userLocation: { lat: number; lng: number } | null,
): Promise<RouteGeometry> {
  const emptyGeometry: RouteGeometry = { routePath: [], userToRoutePath: [] };

  if (stops.length < 2) {
    return {
      routePath: stops,
      userToRoutePath: userLocation && stops.length ? [[userLocation.lat, userLocation.lng], stops[0]] : [],
    };
  }

  const routeCoordinates = stops.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const routeUrl = `https://router.project-osrm.org/route/v1/foot/${routeCoordinates}?overview=full&geometries=geojson`;
  const routeResponse = await fetch(routeUrl, {
    headers: { Accept: "application/json" },
  });
  if (!routeResponse.ok) return emptyGeometry;

  const routeJson = (await routeResponse.json()) as {
    routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>;
  };
  const routePath =
    routeJson.routes?.[0]?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];

  let userToRoutePath: [number, number][] = [];
  if (userLocation && stops.length > 0) {
    const userUrl =
      `https://router.project-osrm.org/route/v1/foot/` +
      `${userLocation.lng},${userLocation.lat};${stops[0][1]},${stops[0][0]}?overview=full&geometries=geojson`;
    const userResponse = await fetch(userUrl, {
      headers: { Accept: "application/json" },
    });
    if (userResponse.ok) {
      const userJson = (await userResponse.json()) as {
        routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>;
      };
      userToRoutePath =
        userJson.routes?.[0]?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];
    }
  }

  return { routePath, userToRoutePath };
}

export default function CulturalMap({ points, routes }: Props) {
  const searchParams = useSearchParams();
  const routeFromUrl = searchParams.get("route") ?? "";
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<ReturnType<LeafletLike["map"]> | null>(null);
  const markersLayerRef = useRef<{ remove: () => void } | null>(null);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeRoute, setActiveRoute] = useState(routeFromUrl);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry>({ routePath: [], userToRoutePath: [] });
  const [routeGeometryError, setRouteGeometryError] = useState("");

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(points.map((point) => point.category)))], [points]);
  const pointByName = useMemo(() => new Map(points.map((point) => [point.name, point])), [points]);
  const selectedRoute = useMemo(
    () => routes.find((route) => route.name === activeRoute) ?? null,
    [activeRoute, routes],
  );
  const selectedRoutePoints = useMemo(
    () => selectedRoute?.stops.map((stop) => pointByName.get(stop)).filter((point): point is CulturalMapPoint => Boolean(point)) ?? [],
    [pointByName, selectedRoute],
  );
  const visiblePoints = useMemo(() => {
    if (selectedRoutePoints.length) return selectedRoutePoints;
    return activeCategory === "Todos" ? points : points.filter((point) => point.category === activeCategory);
  }, [activeCategory, points, selectedRoutePoints]);

  function locateUser() {
    setLocationError("");
    void getDeviceCoordinates()
      .then(({ lat, lng }) => setUserLocation({ lat, lng }))
      .catch((message: unknown) => {
        setLocationError(message instanceof Error ? message.message : "No he podido obtener tu ubicación. Revisa permisos del navegador.");
      });
  }

  useEffect(() => {
    let cancelled = false;

    const loadRouteGeometry = async () => {
      if (selectedRoutePoints.length === 0) {
        if (!cancelled) {
          setRouteGeometry({ routePath: [], userToRoutePath: [] });
          setRouteGeometryError("");
        }
        return;
      }

      const fallbackRoutePath = selectedRoutePoints.map((point) => [point.lat, point.lng] as [number, number]);
      const fallbackUserPath: [number, number][] =
        userLocation && fallbackRoutePath.length > 0 ? [[userLocation.lat, userLocation.lng], fallbackRoutePath[0]] : [];

      try {
        const geometry = await fetchWalkingRouteGeometry(fallbackRoutePath, userLocation);
        if (cancelled) return;

        setRouteGeometry({
          routePath: geometry.routePath.length > 1 ? geometry.routePath : fallbackRoutePath,
          userToRoutePath: geometry.userToRoutePath.length > 1 ? geometry.userToRoutePath : fallbackUserPath,
        });
        setRouteGeometryError(
          geometry.routePath.length > 1
            ? ""
            : "Mostrando una unión simple temporal mientras se resuelve el recorrido a pie.",
        );
      } catch {
        if (cancelled) return;
        setRouteGeometry({ routePath: fallbackRoutePath, userToRoutePath: fallbackUserPath });
        setRouteGeometryError("No he podido cargar la ruta peatonal exacta y estoy mostrando una unión aproximada.");
      }
    };

    void loadRouteGeometry();
    return () => {
      cancelled = true;
    };
  }, [selectedRoutePoints, userLocation]);

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
      const routeCoords: [number, number][] = selectedRoutePoints.map((point) => [point.lat, point.lng]);
      const renderedRoutePath = routeGeometry.routePath.length > 1 ? routeGeometry.routePath : routeCoords;
      const renderedUserPath = routeGeometry.userToRoutePath;

      if (routeCoords.length > 1) {
        L.polyline(renderedRoutePath, { color: "#D4AF37", weight: 6, opacity: 0.95 }).addTo(layer);
      }
      if (userLocation && routeCoords.length > 0 && renderedUserPath.length > 1) {
        L.polyline(renderedUserPath, {
          color: "#7A1E2C",
          weight: 4,
          opacity: 0.75,
          dashArray: "8 8",
        }).addTo(layer);
      }

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

      if (userLocation) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:#16a34a;color:#fff;font-weight:900;font-size:11px;box-shadow:0 1px 6px rgba(0,0,0,.35);border:2px solid white">TU</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
        userMarker.bindTooltip("Tu ubicación", { direction: "top", offset: [0, -12], opacity: 0.95 });
        userMarker.addTo(layer);
        bounds.push([userLocation.lat, userLocation.lng]);
      }

      if (bounds.length > 1) {
        leafletMapRef.current.fitBounds(bounds, { padding: [28, 28] });
      }
    };

    void renderMap();
    return () => {
      disposed = true;
    };
  }, [routeGeometry, selectedRoutePoints, userLocation, visiblePoints]);

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
                onClick={() => {
                  setActiveRoute("");
                  setActiveCategory(category);
                }}
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
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7A1E2C]">Tu ubicación</p>
          <button
            type="button"
            onClick={locateUser}
            className="mt-3 rounded-sm bg-[#0A2342] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white"
          >
            Saber dónde estoy
          </button>
          {userLocation ? (
            <p className="mt-2 text-sm font-semibold text-emerald-800">
              Ubicación detectada: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          ) : null}
          {locationError ? <p className="mt-2 text-sm font-bold text-[#7A1E2C]">{locationError}</p> : null}
        </div>

        <div className="rounded-md border border-[#0A2342]/15 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7A1E2C]">Conexiones de transporte</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Cada punto abre la pestaña Transporte con el destino precargado. Desde ahí puedes usar tu ubicación y ver conexiones de metro, bus, ferry o AirTrain.
          </p>
        </div>

        <div className="rounded-md border border-[#0A2342]/15 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7A1E2C]">Rutas culturales</p>
          <div className="mt-3 space-y-3">
            {routes.map((route) => (
              <button
                key={route.name}
                type="button"
                onClick={() => {
                  setActiveRoute(route.name);
                  setActiveCategory("Todos");
                }}
                className={`w-full rounded-md p-3 text-left transition ${
                  activeRoute === route.name ? "bg-[#0A2342] text-white" : "bg-[#F8F4EA] text-[#0A2342]"
                }`}
              >
                <p className={`font-display text-xl font-bold ${activeRoute === route.name ? "text-white" : "text-[#0A2342]"}`}>
                  {route.name}
                </p>
                <p className={`mt-1 text-xs leading-5 ${activeRoute === route.name ? "text-white/76" : "text-slate-700"}`}>
                  {route.stops.join(" -> ")}
                </p>
              </button>
            ))}
          </div>
          {selectedRoute ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                Ruta activa: {selectedRoute.name}. La línea dorada sigue calles caminables entre paradas; la granate conecta tu ubicación con el inicio.
              </p>
              {routeGeometryError ? <p className="text-xs font-semibold text-amber-700">{routeGeometryError}</p> : null}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
