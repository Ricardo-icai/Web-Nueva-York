"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const quickDestinations = [
  "Times Square",
  "Brooklyn Bridge",
  "Empire State Building",
  "Central Park",
  "JFK Airport",
  "Piers 90/92 New York",
  "Yankee Stadium",
  "DUMBO Brooklyn",
];

const transportRules = [
  {
    title: "Metro",
    text: "La opcion mas rapida para cruzar Manhattan y moverte entre boroughs. Usa Google Maps/MTA antes de entrar por cambios de servicio.",
  },
  {
    title: "Bus",
    text: "Bueno para trayectos cortos este-oeste, zonas sin metro cercano o cuando vas con personas que prefieren caminar menos.",
  },
  {
    title: "Ferry",
    text: "Mas lento que el metro, pero muy visual. Ideal para East River, DUMBO, Williamsburg, Wall St y planes con skyline.",
  },
  {
    title: "Aeropuertos",
    text: "JFK: AirTrain + LIRR/metro. Newark: NJ Transit/AirTrain. LaGuardia: bus + metro o taxi si vais cargados.",
  },
];

const transitTips = [
  ["OMNY", "Paga con tarjeta contactless o movil. No hace falta MetroCard para la mayoria de viajes."],
  ["Subway", "El metro es la forma mas rapida de cruzar Manhattan, Brooklyn y Queens."],
  ["Ferry", "NYC Ferry funciona muy bien para vistas y rutas por East River."],
  ["Aeropuertos", "JFK usa AirTrain + LIRR/metro; Newark suele ir bien con NJ Transit."],
];

const subwayColors: Record<string, string> = {
  "1": "#EE352E",
  "2": "#EE352E",
  "3": "#EE352E",
  "4": "#00933C",
  "5": "#00933C",
  "6": "#00933C",
  "7": "#B933AD",
  A: "#0039A6",
  C: "#0039A6",
  E: "#0039A6",
  B: "#FF6319",
  D: "#FF6319",
  F: "#FF6319",
  M: "#FF6319",
  N: "#FCCC0A",
  Q: "#FCCC0A",
  R: "#FCCC0A",
  W: "#FCCC0A",
  L: "#A7A9AC",
  G: "#6CBE45",
  J: "#996633",
  Z: "#996633",
  BUS: "#004C99",
  FERRY: "#00AEEF",
  AIRTRAIN: "#6D388A",
  NJ: "#F58220",
};

function lineTextColor(line: string) {
  return ["N", "Q", "R", "W"].includes(line) ? "text-slate-950" : "text-white";
}

function destinationRoutePlan(destination: string) {
  const value = destination.toLowerCase();
  if (value.includes("jfk")) {
    return {
      title: "Ruta recomendada a JFK",
      lines: ["E", "A", "AIRTRAIN"],
      steps: [
        "Desde tu ubicacion, abre la ruta en Google Maps con modo transporte publico.",
        "Si priorizas precio: subway E hacia Jamaica Center o A hacia Howard Beach.",
        "Cambia a AirTrain JFK en Jamaica o Howard Beach y sigue la terminal indicada.",
      ],
      transfer: "Cambio clave: Jamaica / Howard Beach -> AirTrain JFK",
    };
  }
  if (value.includes("newark")) {
    return {
      title: "Ruta recomendada a Newark",
      lines: ["1", "2", "3", "A", "C", "E", "NJ"],
      steps: [
        "Llega a Penn Station usando 1/2/3 o A/C/E segun tu punto de salida.",
        "Toma NJ Transit hacia Newark Airport Rail Station.",
        "Cambia al AirTrain Newark hasta tu terminal.",
      ],
      transfer: "Cambio clave: Penn Station -> NJ Transit -> AirTrain Newark",
    };
  }
  if (value.includes("laguardia") || value.includes("lga")) {
    return {
      title: "Ruta recomendada a LaGuardia",
      lines: ["7", "E", "F", "M", "R", "BUS"],
      steps: [
        "Ve en subway hasta Jackson Heights-Roosevelt Av / 74 St-Broadway.",
        "Cambia al bus Q70 LaGuardia Link.",
        "Baja en la terminal indicada por el bus.",
      ],
      transfer: "Cambio clave: Jackson Heights-Roosevelt Av -> Q70",
    };
  }
  if (value.includes("brooklyn") || value.includes("dumbo") || value.includes("brooklyn bridge")) {
    return {
      title: "Ruta recomendada a Brooklyn / DUMBO",
      lines: ["A", "C", "F", "2", "3"],
      steps: [
        "Para DUMBO: busca York St (F) o High St (A/C).",
        "Para Brooklyn Bridge Park: A/C a High St suele ser facil.",
        "Termina caminando hacia waterfront o el puente segun el mapa.",
      ],
      transfer: "Objetivo: High St / York St y ultimo tramo a pie",
    };
  }
  if (value.includes("hudson") || value.includes("edge") || value.includes("pier") || value.includes("vessel")) {
    return {
      title: "Ruta recomendada al West Side / Hudson Yards",
      lines: ["7", "A", "C", "E"],
      steps: [
        "Si vas a Hudson Yards o Edge: usa linea 7 hasta 34 St-Hudson Yards.",
        "Para Piers 90/92: A/C/E hasta 42 St-Port Authority y caminar hacia el oeste.",
        "En eventos grandes, evita taxi al llegar y al salir.",
      ],
      transfer: "Objetivo: 34 St-Hudson Yards o 42 St-Port Authority",
    };
  }
  if (value.includes("times square") || value.includes("broadway")) {
    return {
      title: "Ruta recomendada a Times Square / Broadway",
      lines: ["1", "2", "3", "7", "N", "Q", "R", "W", "A", "C", "E"],
      steps: [
        "Busca llegada a Times Sq-42 St o 42 St-Port Authority.",
        "Si hay mucha gente, sal por calles laterales y camina dos manzanas.",
        "Comprueba sentido Uptown/Downtown antes de entrar al anden.",
      ],
      transfer: "Objetivo: Times Sq-42 St / Port Authority",
    };
  }
  if (value.includes("central park") || value.includes("metropolitan") || value.includes("met museum")) {
    return {
      title: "Ruta recomendada a Central Park / Museum Mile",
      lines: ["4", "5", "6", "B", "C", "1"],
      steps: [
        "Para lado este: 4/5/6 hacia 86 St o 77 St.",
        "Para lado oeste: B/C hacia 81 St o 86 St.",
        "Elige lado este/oeste antes de salir para no cruzar el parque sin querer.",
      ],
      transfer: "Objetivo: East Side 4/5/6 o West Side B/C",
    };
  }
  if (value.includes("ferry") || value.includes("statue") || value.includes("liberty") || value.includes("harbor")) {
    return {
      title: "Ruta recomendada a ferry / harbor",
      lines: ["1", "R", "W", "4", "5", "FERRY"],
      steps: [
        "Para Battery Park o ferries: usa 1 a South Ferry o R/W a Whitehall St.",
        "Para Wall St / Seaport: 4/5 hacia Bowling Green o Fulton St.",
        "Confirma muelle exacto antes de salir.",
      ],
      transfer: "Objetivo: South Ferry / Whitehall / Bowling Green",
    };
  }
  return {
    title: "Ruta recomendada en transporte publico",
    lines: ["A", "C", "E", "1", "2", "3", "N", "Q", "R", "W"],
    steps: [
      "Pulsa Usar mi ubicacion para fijar tu origen real.",
      "Abre la ruta rapida y compara subway, bus y ferry segun hora real.",
      "Prioriza estaciones principales y mira el sentido Uptown/Downtown o Brooklyn/Queens antes de entrar.",
    ],
    transfer: "El mapa de Google confirmara la combinacion exacta en tiempo real.",
  };
}

function destinationHint(destination: string) {
  const value = destination.toLowerCase();
  if (value.includes("jfk")) return "Recomendado: AirTrain JFK + LIRR si quieres rapidez; AirTrain + subway si quieres ahorrar.";
  if (value.includes("newark")) return "Recomendado: NJ Transit + AirTrain Newark. Comprueba horarios antes de salir.";
  if (value.includes("laguardia") || value.includes("lga")) return "Recomendado: bus M60/Q70 + metro, o taxi si vais con maletas.";
  if (value.includes("brooklyn") || value.includes("dumbo")) return "Recomendado: subway hacia Brooklyn; ferry si priorizas vistas.";
  if (value.includes("pier") || value.includes("hudson")) return "Recomendado: subway hasta West Side y caminar. Evita coche en eventos.";
  if (value.includes("times square")) return "Recomendado: subway a Times Sq-42 St, pero sal por calles laterales si hay mucha gente.";
  return "Recomendado: abre la ruta en Google Maps con modo transporte publico y compara metro vs bus segun hora real.";
}

export default function PublicTransitPlanner() {
  const searchParams = useSearchParams();
  const initialDestination = searchParams.get("destination") ?? "Times Square";
  const destinationLat = Number(searchParams.get("destinationLat") ?? "0");
  const destinationLng = Number(searchParams.get("destinationLng") ?? "0");
  const originLat = Number(searchParams.get("originLat") ?? "0");
  const originLng = Number(searchParams.get("originLng") ?? "0");
  const fromSite = searchParams.get("fromSite") === "1";
  const [destination, setDestination] = useState(initialDestination);
  const initialOrigin =
    Number.isFinite(originLat) && Number.isFinite(originLng) && originLat !== 0 && originLng !== 0
      ? { lat: originLat, lng: originLng }
      : null;
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(initialOrigin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoLocatedRef = useRef(false);
  const routePlan = useMemo(() => destinationRoutePlan(destination), [destination]);

  const directionsUrl = useMemo(() => {
    const params = new URLSearchParams({
      api: "1",
      destination,
      travelmode: "transit",
    });
    if (origin) params.set("origin", `${origin.lat},${origin.lng}`);
    if (Number.isFinite(destinationLat) && Number.isFinite(destinationLng) && destinationLat !== 0 && destinationLng !== 0) {
      params.set("destination", `${destinationLat},${destinationLng}`);
    }
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [destination, destinationLat, destinationLng, origin]);

  const mapQuery =
    Number.isFinite(destinationLat) && Number.isFinite(destinationLng) && destinationLat !== 0 && destinationLng !== 0
      ? `${destinationLat},${destinationLng}`
      : destination || "New York City Subway";
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  function useMyLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Tu navegador no permite geolocalizacion.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError("No he podido obtener tu ubicacion. Revisa permisos del navegador.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  useEffect(() => {
    if (!fromSite || autoLocatedRef.current || origin) return;
    autoLocatedRef.current = true;
    useMyLocation();
  }, [fromSite, origin]);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
      <section className="overflow-hidden rounded-lg border-2 border-slate-950 bg-[#0A2342] text-white shadow-[6px_6px_0_#111827] lg:col-span-2">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[260px]">
            <Image
              src="https://images.pexels.com/photos/30228466/pexels-photo-30228466.jpeg?auto=compress&cs=tinysrgb&w=1800"
              alt="Metro de Nueva York en una estacion"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent lg:bg-gradient-to-r" />
          </div>

          <div className="p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4AF37]">Guia rapida</p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">
              Como usar el transporte publico de Nueva York
            </h1>
            <p className="mt-4 text-base leading-7 text-white/76">
              Combina metro para rapidez, ferry para vistas y caminar solo cuando el tramo merezca la pena.
              Para familias, marca siempre una estacion alternativa antes de salir.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {transitTips.map(([title, copy]) => (
                <div key={title} className="rounded-md border border-white/15 bg-white/8 p-4">
                  <p className="font-display text-2xl font-bold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border-2 border-slate-950 bg-[#fff3d1] p-5 shadow-[6px_6px_0_#111827]">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">
          {fromSite ? "Como llegar desde la web" : "Ruta mas rapida"}
        </p>
        <h1 className="mt-2 font-american-diner text-4xl text-slate-950">Transporte publico NYC</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
          Dime donde quieres ir, marca tu ubicacion y abre la ruta en metro, bus o ferry con indicaciones reales.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">Destino</span>
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Ej. Brooklyn Bridge, JFK, Times Square..."
              className="h-12 w-full rounded-md border-2 border-slate-950 bg-white px-3 text-base font-bold outline-none focus:ring-2 focus:ring-red-700"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {quickDestinations.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDestination(item)}
                className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-stone-100"
              >
                {item}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={useMyLocation}
            disabled={loading}
            className="w-full rounded-md border-2 border-slate-950 bg-[#D4AF37] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 shadow-[4px_4px_0_#111827] disabled:opacity-60"
          >
            {loading ? "Buscando ubicacion..." : "Usar mi ubicacion"}
          </button>

          {origin ? (
            <p className="rounded-md border border-green-700 bg-green-50 p-3 text-sm font-bold text-green-800">
              Ubicacion detectada: {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
            </p>
          ) : null}
          {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}

          <a
            href={directionsUrl}
            target="_blank"
            className="block rounded-md border-2 border-slate-950 bg-red-700 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_#111827]"
          >
            Ver ruta mas rapida
          </a>
        </div>

        <div className="mt-5 rounded-md border-2 border-slate-950 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Conexion visual</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-slate-950">{routePlan.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {routePlan.lines.map((line) => {
              const color = subwayColors[line] ?? "#111827";
              const label = line === "AIRTRAIN" ? "AirTrain" : line === "NJ" ? "NJ Transit" : line;
              return (
                <span
                  key={line}
                  className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border-2 border-slate-950 px-3 text-sm font-black ${lineTextColor(line)}`}
                  style={{ backgroundColor: color }}
                >
                  {label}
                </span>
              );
            })}
          </div>
          <ol className="mt-4 space-y-2 text-sm font-semibold leading-6 text-slate-700">
            {routePlan.steps.map((step) => (
              <li key={step} className="flex gap-2">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-700" />
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 rounded-md bg-[#0A2342] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
            {routePlan.transfer}
          </p>
        </div>

        <div className="mt-5 rounded-md border-2 border-slate-950 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Consejo inteligente</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{destinationHint(destination)}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border-2 border-slate-950 bg-white shadow-[6px_6px_0_#111827]">
        <div className="border-b-2 border-slate-950 bg-[#0A2342] p-4 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37]">Mapa</p>
          <h2 className="font-display text-3xl font-bold">{destination || "New York City"}</h2>
        </div>
        <iframe title="Mapa transporte publico NYC" src={mapUrl} className="h-[520px] w-full border-0" loading="lazy" />
      </section>

      <section className="rounded-lg border-2 border-slate-950 bg-white p-5 shadow-[6px_6px_0_#111827] lg:col-span-2">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">OMNY y tarjeta de transporte</p>
        <h2 className="mt-2 font-display text-4xl font-bold text-slate-950">Como pagar el metro y bus en Nueva York</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ["1. Toca y entra", "Usa tarjeta contactless, Apple Pay, Google Pay, wearable u OMNY Card en el lector."],
            ["2. Misma tarjeta", "Usa siempre el mismo metodo para que OMNY aplique transbordos y limites semanales."],
            ["3. Si quieres tarjeta fisica", "Compra una OMNY Card en maquinas OMNY o comercios participantes y recargala."],
            ["4. MetroCard", "Desde 2026 OMNY es el metodo principal; no planifiques comprar/refill MetroCard nueva."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-md border border-slate-200 bg-stone-50 p-4">
              <p className="font-display text-2xl font-bold text-slate-950">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border-2 border-slate-950 bg-[#0A2342] p-5 text-white shadow-[6px_6px_0_#111827] lg:col-span-2">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">Que usar segun el caso</p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {transportRules.map((rule) => (
            <div key={rule.title} className="rounded-md border border-white/15 bg-white/8 p-4">
              <p className="font-display text-2xl font-bold">{rule.title}</p>
              <p className="mt-2 text-sm leading-6 text-white/72">{rule.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href="https://new.mta.info/" target="_blank" className="rounded-sm bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#0A2342]">
            MTA oficial
          </a>
          <a href="https://omny.info/" target="_blank" className="rounded-sm border border-[#D4AF37] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#D4AF37]">
            OMNY oficial
          </a>
          <a href="https://www.ferry.nyc/routes-and-schedules/" target="_blank" className="rounded-sm border border-white/35 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
            NYC Ferry
          </a>
        </div>
      </section>
    </div>
  );
}
