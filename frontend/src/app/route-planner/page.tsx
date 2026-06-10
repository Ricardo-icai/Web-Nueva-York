"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readSession, userScopedStorageKey } from "@/lib/auth";
import { buildTransitPlannerUrl } from "@/lib/transit-planner";
import { loadTravelProfile, saveRoute } from "@/lib/user-data";

type Pace = "relajado" | "normal" | "intenso";

type SavedTravelProfile = {
  name?: string;
  nationality?: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  pace?: Pace;
  accommodation?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
};

type EssentialStop = {
  title: string;
  area: string;
  type: string;
  image: string;
  duration: string;
  bestTime: string;
  reason: string;
  lat: number;
  lng: number;
  priority: number;
  weather: "any" | "indoor" | "outdoor";
};

type PlannedStop = EssentialStop & {
  time: string;
};

type DayPlan = {
  date: string;
  title: string;
  theme: string;
  notes: string;
  stops: PlannedStop[];
};

const TRAVEL_PROFILE_KEY = "nyc_travel_profile_v1";
const MUST_SEE_KEY = "nyc_route_must_sees_v1";

const essentials: EssentialStop[] = [
  {
    title: "Statue of Liberty & Ellis Island",
    area: "New York Harbor",
    type: "Historia",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/New_York_City_%28New_York%2C_USA%29%2C_Statue_of_Liberty_--_2012_--_6814.jpg",
    duration: "4-5 h",
    bestTime: "Manana",
    reason: "Simbolo absoluto de Nueva York e historia migrante.",
    lat: 40.6892,
    lng: -74.0445,
    priority: 100,
    weather: "outdoor",
  },
  {
    title: "9/11 Memorial & One World Trade Center",
    area: "Financial District",
    type: "Memoria",
    image: "https://images.unsplash.com/photo-1543716091-a840c05249ec?auto=format&fit=crop&w=1600&q=84",
    duration: "2-3 h",
    bestTime: "Mediodia",
    reason: "Imprescindible para entender la memoria reciente de la ciudad.",
    lat: 40.7115,
    lng: -74.0134,
    priority: 98,
    weather: "any",
  },
  {
    title: "Brooklyn Bridge & DUMBO",
    area: "Lower Manhattan / Brooklyn",
    type: "Skyline",
    image: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1600&q=84",
    duration: "2-3 h",
    bestTime: "Atardecer",
    reason: "La caminata urbana mas iconica y una de las mejores vistas de Manhattan.",
    lat: 40.7061,
    lng: -73.9969,
    priority: 97,
    weather: "outdoor",
  },
  {
    title: "Central Park & The Met",
    area: "Upper East Side",
    type: "Arte y parque",
    image: "https://images.unsplash.com/photo-1581521028875-5b318ab52b1c?auto=format&fit=crop&w=1600&q=84",
    duration: "3-5 h",
    bestTime: "Manana",
    reason: "Combina parque, museo imprescindible y una ruta familiar muy flexible.",
    lat: 40.7794,
    lng: -73.9632,
    priority: 96,
    weather: "any",
  },
  {
    title: "Times Square & Broadway District",
    area: "Midtown",
    type: "Icono urbano",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Times_square_at_night.jpg",
    duration: "1.5-3 h",
    bestTime: "Noche",
    reason: "Energia visual pura de Nueva York y punto natural para Broadway.",
    lat: 40.758,
    lng: -73.9855,
    priority: 95,
    weather: "any",
  },
  {
    title: "Grand Central, Chrysler & Bryant Park",
    area: "Midtown East",
    type: "Arquitectura",
    image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1600&q=84",
    duration: "2 h",
    bestTime: "Mediodia",
    reason: "Arquitectura neoyorquina muy facil de encajar y sin grandes desplazamientos.",
    lat: 40.7527,
    lng: -73.9772,
    priority: 92,
    weather: "any",
  },
  {
    title: "MoMA & Rockefeller Center",
    area: "Midtown",
    type: "Arte moderno",
    image: "https://images.unsplash.com/photo-1598540324147-4df7d59bbfaa?auto=format&fit=crop&w=1600&q=84",
    duration: "3 h",
    bestTime: "Tarde",
    reason: "Arte moderno, St. Patrick's y Midtown cultural en una misma zona.",
    lat: 40.7614,
    lng: -73.9779,
    priority: 90,
    weather: "indoor",
  },
  {
    title: "High Line, Chelsea & Hudson Yards",
    area: "West Side",
    type: "Paseo urbano",
    image: "https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=1600&q=84",
    duration: "2-3 h",
    bestTime: "Tarde",
    reason: "Ruta moderna, visual y muy buena para caminar sin perderse.",
    lat: 40.7479,
    lng: -74.0048,
    priority: 88,
    weather: "outdoor",
  },
  {
    title: "SoHo, Chinatown & Little Italy",
    area: "Downtown",
    type: "Barrios",
    image: "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1600&q=84",
    duration: "3 h",
    bestTime: "Tarde",
    reason: "Tres identidades historicas de Manhattan en una ruta compacta.",
    lat: 40.7191,
    lng: -73.9973,
    priority: 86,
    weather: "any",
  },
  {
    title: "American Museum of Natural History",
    area: "Upper West Side",
    type: "Familias",
    image: "https://images.unsplash.com/photo-1605722243979-fe0be815d1a9?auto=format&fit=crop&w=1600&q=84",
    duration: "3 h",
    bestTime: "Manana",
    reason: "Plan perfecto para ninos, adolescentes y dias de lluvia.",
    lat: 40.7813,
    lng: -73.9739,
    priority: 84,
    weather: "indoor",
  },
  {
    title: "Harlem & Apollo Theater",
    area: "Harlem",
    type: "Musica e historia",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1600&q=84",
    duration: "2-3 h",
    bestTime: "Manana",
    reason: "Historia afroamericana, jazz y una identidad cultural esencial.",
    lat: 40.81,
    lng: -73.9501,
    priority: 82,
    weather: "any",
  },
  {
    title: "Brooklyn Museum & Prospect Park",
    area: "Brooklyn",
    type: "Brooklyn cultural",
    image: "https://images.unsplash.com/photo-1532167080057-e8e966c4e2e4?auto=format&fit=crop&w=1600&q=84",
    duration: "3-4 h",
    bestTime: "Tarde",
    reason: "Buen cierre si hay suficientes dias y quieres salir del Manhattan clasico.",
    lat: 40.6712,
    lng: -73.9636,
    priority: 76,
    weather: "any",
  },
  {
    title: "SUMMIT One Vanderbilt",
    area: "Midtown East",
    type: "Miradores",
    image: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1600&q=84",
    duration: "2 h",
    bestTime: "Atardecer",
    reason: "Mirador inmersivo y una de las vistas mas virales del skyline.",
    lat: 40.7527,
    lng: -73.9787,
    priority: 91,
    weather: "indoor",
  },
  {
    title: "Edge & Hudson Yards",
    area: "Hudson Yards",
    type: "Miradores",
    image: "https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=1600&q=84",
    duration: "2 h",
    bestTime: "Atardecer",
    reason: "Terraza exterior elevada y acceso perfecto desde High Line.",
    lat: 40.7541,
    lng: -74.0008,
    priority: 89,
    weather: "any",
  },
  {
    title: "Joe's Pizza & Greenwich Village",
    area: "Greenwich Village",
    type: "Comida NYC",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=84",
    duration: "1.5 h",
    bestTime: "Comida",
    reason: "Una parada rapida para probar una porcion clasica y pasear por Village.",
    lat: 40.7306,
    lng: -74.0027,
    priority: 83,
    weather: "any",
  },
  {
    title: "Macy's 4th of July Fireworks",
    area: "East River / Hudson River",
    type: "Eventos",
    image: "https://images.pexels.com/photos/12674747/pexels-photo-12674747.jpeg?auto=compress&cs=tinysrgb&w=1600",
    duration: "4-6 h",
    bestTime: "Tarde y noche",
    reason: "El gran espectaculo oficial del 4 de Julio; solo debe marcarse si coincide con las fechas del viaje.",
    lat: 40.7061,
    lng: -73.9969,
    priority: 99,
    weather: "outdoor",
  },
  {
    title: "Broadway Show",
    area: "Theater District",
    type: "Cultura",
    image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1600&q=84",
    duration: "3 h",
    bestTime: "Noche",
    reason: "Una noche de Broadway completa el viaje cultural a Nueva York.",
    lat: 40.759,
    lng: -73.9845,
    priority: 87,
    weather: "indoor",
  },
];

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

function dayCount(profile: SavedTravelProfile | null) {
  const start = parseDate(profile?.startDate);
  const end = parseDate(profile?.endDate);
  if (!start || !end || end < start) return 0;
  return Math.max(1, Math.min(14, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1));
}

function missingProfileFields(profile: SavedTravelProfile | null) {
  const missing: string[] = [];
  if (!profile?.name?.trim()) missing.push("nombre del viaje");
  if (!profile?.startDate) missing.push("fecha de llegada");
  if (!profile?.endDate) missing.push("fecha de salida");
  if (!profile?.travelers || profile.travelers < 1) missing.push("viajeros");
  if (!profile?.pace) missing.push("ritmo");
  if (!profile?.accommodation?.address?.trim()) missing.push("alojamiento");
  return missing;
}

function slotsFor(profile: SavedTravelProfile | null) {
  const pace = profile?.pace ?? "normal";
  const travelers = profile?.travelers ?? 2;
  const base = pace === "relajado" ? 2 : pace === "intenso" ? 4 : 3;
  return travelers >= 5 ? Math.max(2, base - 1) : base;
}

function buildPlan(profile: SavedTravelProfile | null, mustSeeTitles: string[]): DayPlan[] {
  const days = dayCount(profile);
  const start = parseDate(profile?.startDate);
  if (!days || !start) return [];

  const mustSee = new Set(mustSeeTitles);
  const perDay = Math.max(slotsFor(profile), Math.ceil(mustSee.size / days));
  const selected = [...essentials]
    .sort((a, b) => {
      const requiredDifference = Number(mustSee.has(b.title)) - Number(mustSee.has(a.title));
      return requiredDifference || b.priority - a.priority;
    })
    .slice(0, Math.min(essentials.length, days * perDay));

  const times = perDay >= 4 ? ["09:00", "12:00", "15:30", "19:00"] : perDay === 3 ? ["09:30", "13:00", "17:30"] : ["10:00", "16:00"];
  const themes = ["Iconos absolutos", "Arte y Midtown", "Downtown historico", "Brooklyn y skyline", "Barrios con alma", "Cultura local"];

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const stops = selected.slice(index * perDay, index * perDay + perDay).map((stop, stopIndex) => ({
      ...stop,
      time: times[stopIndex] ?? "18:00",
    }));
    return {
      date: formatDate(date),
      title: `Dia ${index + 1}`,
      theme: themes[index % themes.length],
      notes:
        index === 0
          ? `Empieza desde ${profile?.accommodation?.address ?? "tu alojamiento"} y prioriza puntos iconicos.`
          : "Ruta pensada para evitar saltos innecesarios y combinar interior/exterior.",
      stops,
    };
  }).filter((day) => day.stops.length > 0);
}

function routeMapUrl(day: DayPlan) {
  const query = day.stops.map((stop) => `${stop.lat},${stop.lng}`).join("/");
  return `https://www.google.com/maps/dir/${query}`;
}

export default function RoutePlannerPage() {
  const [profile, setProfile] = useState<SavedTravelProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [mustSeeTitles, setMustSeeTitles] = useState<string[]>([]);
  const [mustSeesLoaded, setMustSeesLoaded] = useState(false);
  const [activeMustSeeType, setActiveMustSeeType] = useState("Todos");

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const saved = (await loadTravelProfile(TRAVEL_PROFILE_KEY)) as SavedTravelProfile | null;
        if (active) setProfile(saved);
      } finally {
        if (active) setProfileLoaded(true);
      }
    }
    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadMustSees() {
      await Promise.resolve();
      const key = userScopedStorageKey(MUST_SEE_KEY, readSession()?.email);
      try {
        const saved = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
        if (active) {
          setMustSeeTitles(Array.isArray(saved) ? saved.filter((title) => essentials.some((item) => item.title === title)) : []);
        }
      } catch {
        if (active) setMustSeeTitles([]);
      } finally {
        if (active) setMustSeesLoaded(true);
      }
    }
    void loadMustSees();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!mustSeesLoaded) return;
    const key = userScopedStorageKey(MUST_SEE_KEY, readSession()?.email);
    localStorage.setItem(key, JSON.stringify(mustSeeTitles));
  }, [mustSeeTitles, mustSeesLoaded]);

  const missing = useMemo(() => missingProfileFields(profile), [profile]);
  const plan = useMemo(() => buildPlan(profile, mustSeeTitles), [mustSeeTitles, profile]);
  const totalDays = dayCount(profile);
  const totalStops = plan.reduce((sum, day) => sum + day.stops.length, 0);
  const mustSeeTypes = useMemo(() => ["Todos", ...Array.from(new Set(essentials.map((item) => item.type)))], []);
  const visibleMustSees = useMemo(
    () => essentials.filter((item) => activeMustSeeType === "Todos" || item.type === activeMustSeeType),
    [activeMustSeeType],
  );

  useEffect(() => {
    if (!profile || plan.length === 0) return;
    void saveRoute({
      routeKey: "auto-essential-route",
      title: "Organizame la ruta",
      payload: {
        profile,
        mustSeeTitles,
        days: plan,
        totalDays,
        totalStops,
      },
    });
  }, [mustSeeTitles, plan, profile, totalDays, totalStops]);

  if (!profileLoaded || !mustSeesLoaded) {
    return (
      <main className="nyc-page-shell page-bg-route text-[#0A2342]">
        <section className="nyc-content-shell mx-auto max-w-4xl p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7A1E2C]">Organizame la ruta</p>
          <h1 className="mt-2 font-american-diner text-4xl">Preparando tu planning</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
            Estamos cargando los datos guardados de tu viaje.
          </p>
        </section>
      </main>
    );
  }

  if (missing.length > 0) {
    return (
      <main className="nyc-page-shell page-bg-route text-[#0A2342]">
        <section className="nyc-content-shell mx-auto max-w-4xl p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7A1E2C]">Organizame la ruta</p>
          <h1 className="mt-2 font-american-diner text-4xl">Necesito tu perfil completo</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
            Para hacer un planning real segun personas, dias, ritmo y alojamiento, completa primero: {missing.join(", ")}.
          </p>
          <Link href="/onboarding" className="nyc-action mt-6 inline-block rounded-sm px-5 py-3 text-sm">
            Completar perfil
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="nyc-page-shell page-bg-route text-[#0A2342]">
      <div className="nyc-content-shell mx-auto max-w-7xl overflow-hidden">
      <section className="border-b-2 border-slate-950 bg-[#fff3d1] px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Tus imprescindibles</p>
              <h1 className="mt-1 font-american-diner text-3xl text-slate-950 sm:text-4xl">¿Qué no te quieres perder?</h1>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMustSeeTitles(essentials.slice(0, 5).map((item) => item.title))}
                className="rounded-md border-2 border-slate-950 bg-[#D4AF37] px-3 py-2 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0_#111827]"
              >
                Top 5
              </button>
              <button
                type="button"
                onClick={() => setMustSeeTitles([])}
                className="rounded-md border-2 border-slate-950 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide shadow-[3px_3px_0_#111827]"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {mustSeeTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveMustSeeType(type)}
                className={`shrink-0 rounded-md border-2 border-slate-950 px-3 py-2 text-xs font-black uppercase tracking-wide ${
                  activeMustSeeType === type ? "bg-[#0A2342] text-white" : "bg-white text-slate-950"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleMustSees.map((item) => {
              const selected = mustSeeTitles.includes(item.title);
              return (
                <button
                  key={item.title}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setMustSeeTitles((current) =>
                      current.includes(item.title)
                        ? current.filter((title) => title !== item.title)
                        : [...current, item.title],
                    )
                  }
                  className={`min-h-24 rounded-md border-2 border-slate-950 p-3 text-left shadow-[3px_3px_0_#111827] transition hover:-translate-y-0.5 ${
                    selected ? "bg-red-700 text-white" : "bg-white text-slate-950"
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${selected ? "text-[#D4AF37]" : "text-red-700"}`}>
                    {item.type} · {item.area}
                  </span>
                  <span className="mt-1 block font-black leading-5">{item.title}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm font-bold text-slate-700">
            {mustSeeTitles.length > 0
              ? `${mustSeeTitles.length} imprescindibles seleccionados. El planning los colocara primero y completara el resto automaticamente.`
              : "Sin seleccion manual: crearemos una ruta equilibrada con los imprescindibles mejor valorados."}
          </p>
        </div>
      </section>

      <section className="relative min-h-[64vh] overflow-hidden border-b-2 border-slate-950">
        <Image
          src="https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=2200&q=84"
          alt="Skyline de Nueva York para organizar ruta"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,35,66,0.96),rgba(10,35,66,0.62),rgba(193,18,31,0.26)),linear-gradient(180deg,rgba(10,35,66,0.14),rgba(10,35,66,0.96))]" />
        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-5 pb-10 pt-24 text-white sm:px-8">
          <p className="w-fit border border-[#D4AF37]/60 bg-[#D4AF37]/12 px-3 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#D4AF37]">
            Ruta automatica
          </p>
          <h1 className="mt-5 max-w-5xl font-american-diner text-5xl leading-[0.94] sm:text-7xl">
            Organizame la ruta
          </h1>
          <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-white/84">
            Planning automatico para {profile?.travelers} viajeros, {totalDays} dias, ritmo {profile?.pace}, saliendo desde {profile?.accommodation?.address}.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#planning" className="nyc-action rounded-sm px-5 py-3 text-sm">
              Ver planning
            </a>
            <Link href="/onboarding" className="rounded-sm border-2 border-white bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
              Editar perfil
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:px-8 md:grid-cols-4">
        {[
          ["Dias", String(totalDays)],
          ["Paradas", String(totalStops)],
          ["Personas", String(profile?.travelers ?? 1)],
          ["Ritmo", profile?.pace ?? "normal"],
        ].map(([label, value]) => (
          <div key={label} className="nyc-hard-card-white rounded-md p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7A1E2C]">{label}</p>
            <p className="mt-1 font-american-diner text-4xl">{value}</p>
          </div>
        ))}
      </section>

      <section id="planning" className="mx-auto max-w-7xl space-y-6 px-5 pb-14 sm:px-8">
        {plan.map((day) => (
          <article key={day.title} className="overflow-hidden rounded-md border-2 border-slate-950 bg-white shadow-[6px_6px_0_#111827]">
            <div className="border-b-2 border-slate-950 bg-[#0A2342] p-5 text-white">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">{day.date}</p>
                  <h2 className="mt-1 font-american-diner text-4xl">{day.title}: {day.theme}</h2>
                  <p className="mt-2 text-sm font-semibold text-white/78">{day.notes}</p>
                </div>
                <a href={routeMapUrl(day)} target="_blank" className="rounded-sm border-2 border-[#D4AF37] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#D4AF37]">
                  Ver ruta completa
                </a>
              </div>
            </div>

            <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-3">
              {day.stops.map((stop, index) => (
                <div key={`${day.title}-${stop.title}`} className="border-b border-[#0A2342]/10 p-4 md:border-r">
                  <div className="relative h-44 overflow-hidden rounded-md bg-stone-100">
                    <Image src={stop.image} alt={stop.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    <span className="absolute left-3 top-3 rounded-full bg-[#0A2342] px-3 py-1 text-xs font-black text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7A1E2C]">{stop.time} / {stop.type}</p>
                    {mustSeeTitles.includes(stop.title) ? (
                      <p className="w-fit rounded-full bg-red-700 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                        Elegido por ti
                      </p>
                    ) : null}
                    <h3 className="font-american-diner text-2xl">{stop.title}</h3>
                    <p className="text-sm font-semibold text-slate-600">{stop.area} - {stop.duration} - mejor: {stop.bestTime}</p>
                    <p className="text-sm leading-6 text-slate-700">{stop.reason}</p>
                    <div className="flex flex-wrap gap-2 pt-2 text-xs font-black uppercase tracking-[0.1em]">
                      <a href={buildTransitPlannerUrl({ name: stop.title, lat: stop.lat, lng: stop.lng })} className="rounded-sm border border-[#D4AF37] bg-[#D4AF37]/12 px-3 py-2 text-[#0A2342]">
                        Como llegar
                      </a>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`} target="_blank" className="rounded-sm border border-[#0A2342]/25 px-3 py-2 text-[#0A2342]">
                        Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
      </div>
    </main>
  );
}
