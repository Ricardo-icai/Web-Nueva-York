import Image from "next/image";
import UseMyLocationMapButton from "@/components/common/UseMyLocationMapButton";
import FavoriteToggleButton from "@/components/favorites/FavoriteToggleButton";
import FavoritesRail, { type FavoriteRailItem } from "@/components/favorites/FavoritesRail";
import { buildTransitPlannerUrl } from "@/lib/transit-planner";

type EventCard = {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  officialUrl: string;
  ticketsUrl?: string;
  audience: string;
  price: string;
  directions: string;
  mapsUrl: string;
  tags: string[];
};

type Ship = {
  name: string;
  country: string;
  location: string;
  publicVisit: string;
};
const JULY_FAVORITES_KEY = "nyc_fourth_of_july_favorites_v1";

const fireworksEvent: EventCard = {
  name: "Macy's 4th of July Fireworks 2026",
  description:
    "El gran espectáculo oficial del 4 de Julio en Nueva York. En 2026 celebra el 50 aniversario de Macy's Fireworks y el 250 cumpleaños de Estados Unidos, con zonas de lanzamiento en el lower East River, lower Hudson River y Brooklyn Bridge.",
  date: "4 julio 2026",
  time: "Emisión NBC/Peacock 8:00 PM - 10:00 PM ET",
  location: "Lower Manhattan, Brooklyn Bridge, East River y Hudson River",
  image: "https://commons.wikimedia.org/wiki/Special:FilePath/Macy%27s%20Independence%20Day%20Fireworks%20from%20Hoboken%20-%20New%20York.jpg",
  officialUrl: "https://www.macys.com/s/fireworks/",
  audience: "Familias, parejas, viajeros primera vez, fotografía",
  price: "Gratis en zonas públicas; experiencias privadas pueden ser de pago",
  directions: "Usar metro y llegar temprano. Evitar coche y taxi cerca de waterfront.",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Brooklyn+Bridge+New+York",
  tags: ["Fuegos artificiales", "Oficial", "Gratis", "Alta afluencia"],
};

const majorEvents: EventCard[] = [
  fireworksEvent,
  {
    name: "Sail4th 250 Parade of Tall Ships",
    description:
      "Desfile histórico de grandes veleros por el Hudson River, desde Verrazzano Bridge hasta George Washington Bridge, como pieza central marítima de America 250.",
    date: "4 julio 2026",
    time: "9:30 AM - 2:00 PM",
    location: "Hudson River",
    image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1600&q=82",
    officialUrl: "https://sail4th.org/schedule",
    audience: "Familias, historia naval, fotografía, niños curiosos",
    price: "Gratis desde zonas públicas; cruceros oficiales de pago",
    directions: "Ver desde West Side, Battery Park, Governors Island o muelles anunciados.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Hudson+River+New+York",
    tags: ["Grandes veleros", "America 250", "Cultural"],
  },
  {
    name: "Free Public Viewing of Sail4th 250 Tall Ships",
    description:
      "Visitas públicas gratuitas a veleros internacionales en diferentes muelles de Brooklyn, Manhattan y Staten Island. Reservas recomendadas por alta demanda.",
    date: "Julio 2026",
    time: "11:30 AM - 4:00 PM en días oficiales",
    location: "Brooklyn Bridge Park, Piers 86/90/92, South Street Seaport, Stapleton Waterfront",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=82",
    officialUrl: "https://sail4th.org/tall-ship-tours",
    ticketsUrl: "https://sail4th.org/tall-ship-tours",
    audience: "Familias, educación, historia, planes gratuitos",
    price: "Gratis con reserva recomendada",
    directions: "Elegir muelle antes de salir; algunos barcos cambian por fecha.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Brooklyn+Bridge+Park+Piers+1+3+5",
    tags: ["Gratis", "Visitas públicas", "Educativo"],
  },
  {
    name: "Empire State Building 4th of July Celebration",
    description:
      "Experiencia con entrada para ver los fuegos desde el Empire State Building, con acceso al observatorio, música y catering americano.",
    date: "4 julio 2026",
    time: "7:30 PM - 9:30 PM",
    location: "Empire State Building",
    image: "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?auto=format&fit=crop&w=1600&q=82",
    officialUrl: "https://www.esbnyc.com/celebrate-4th-july-2026",
    ticketsUrl: "https://www.esbnyc.com/celebrate-4th-july-2026",
    audience: "Premium, parejas, familias con presupuesto alto",
    price: "Desde $580 por persona segun ESB",
    directions: "Metro a Herald Square o Penn Station; evitar taxis al finalizar.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Empire+State+Building",
    tags: ["Con entrada", "Premium", "Fuegos"],
  },
  {
    name: "International Aerial Review",
    description:
      "Formaciones aéreas de aeronaves estadounidenses e internacionales sobre la zona del desfile naval, con los Blue Angels liderando la revisión anunciada por Sail4th.",
    date: "4 julio 2026",
    time: "Morning",
    location: "Verrazzano Bridge y Hudson River",
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=1600&q=82",
    officialUrl: "https://sail4th.org/schedule",
    audience: "Familias, aviación, fotografía",
    price: "Gratis desde puntos públicos",
    directions: "Buscar zonas abiertas de cielo y evitar calles estrechas del waterfront.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Verrazzano-Narrows+Bridge",
    tags: ["Aéreo", "Gratis", "Espectáculo"],
  },
  {
    name: "Broadway and Times Square Holiday Performances",
    description:
      "Plan escénico complementario para el fin de semana: Broadway, Times Square y actuaciones especiales sujetas a programación y venta oficial.",
    date: "Fin de semana del 4 de julio",
    time: "Según espectáculo",
    location: "Theater District / Times Square",
    image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1600&q=82",
    officialUrl: "https://www.broadway.org/",
    ticketsUrl: "https://www.broadway.org/",
    audience: "Familias, cultura, teatro, noche urbana",
    price: "Variable según obra",
    directions: "Metro a Times Sq-42 St; entrar y salir por calles laterales si hay mucha afluencia.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Times+Square+New+York",
    tags: ["Con entrada", "Actuaciones", "Times Square"],
  },
];

const tallShips: Ship[] = [
  { name: "ARA Libertad", country: "Argentina", location: "Sail4th fleet", publicVisit: "Consultar ubicación oficial" },
  { name: "Esmeralda", country: "Chile", location: "Stapleton Waterfront Park", publicVisit: "Visitas públicas oficiales" },
  { name: "ARC Gloria", country: "Colombia", location: "Stapleton Waterfront Park", publicVisit: "Visitas públicas oficiales" },
  { name: "Gorch Fock", country: "Germany", location: "Sail4th fleet", publicVisit: "Consultar ubicación oficial" },
  { name: "Juan Bautista Cambiaso", country: "Dominican Republic", location: "Piers 90/92", publicVisit: "Visitas públicas oficiales" },
  { name: "BAE Guayas", country: "Ecuador", location: "Piers 90/92", publicVisit: "Visitas públicas oficiales" },
  { name: "Belle Poule", country: "France", location: "Sail4th fleet", publicVisit: "Consultar ubicación oficial" },
  { name: "INS Sudarshini", country: "India", location: "Brooklyn Bridge Park", publicVisit: "Visitas públicas oficiales" },
  { name: "Amerigo Vespucci", country: "Italy", location: "Pier 86", publicVisit: "Visitas públicas oficiales" },
  { name: "Oosterschelde", country: "Netherlands", location: "South Street Seaport", publicVisit: "Visitas públicas oficiales" },
  { name: "BAP Union", country: "Peru", location: "Stapleton Waterfront Park", publicVisit: "Visitas públicas oficiales" },
  { name: "NRP Sagres", country: "Portugal", location: "Brooklyn Bridge Park", publicVisit: "Visitas públicas oficiales" },
  { name: "Mircea", country: "Romania", location: "Brooklyn Bridge Park", publicVisit: "Visitas públicas oficiales" },
  { name: "Juan Sebastián de Elcano", country: "Spain", location: "Piers 90/92", publicVisit: "Visitas públicas oficiales" },
  { name: "HMS Gladan", country: "Sweden", location: "Pier 86", publicVisit: "Disponible julio 6-7 según Sail4th" },
  { name: "Capitán Miranda", country: "Uruguay", location: "Pier 86", publicVisit: "Visitas públicas oficiales" },
  { name: "Dar Mlodziezy", country: "Poland", location: "Piers 90/92", publicVisit: "Visitas públicas oficiales" },
  { name: "USCGC Eagle", country: "United States", location: "South Street Seaport", publicVisit: "Disponible julio 5 según Sail4th" },
  { name: "Pride of Baltimore", country: "United States", location: "South Street Seaport", publicVisit: "Visitas públicas oficiales" },
  { name: "Ernestina-Morrissey", country: "United States", location: "Piers 90/92", publicVisit: "Visitas públicas oficiales" },
  { name: "Tabor Boy", country: "United States", location: "Piers 90/92", publicVisit: "Visitas públicas oficiales" },
  { name: "Lynx", country: "United States", location: "Piers 90/92", publicVisit: "Visitas públicas oficiales" },
  { name: "When & If", country: "United States", location: "Piers 90/92", publicVisit: "Visitas públicas oficiales" },
];

const sail4thVisuals = [
  {
    src: "https://assets-sail4th.s3.us-east-1.amazonaws.com/media_assets/tsll%20ship%20statue%20gray%20hull.jpg",
    alt: "Gran velero junto a la Estatua de la Libertad",
    label: "Statue of Liberty",
  },
  {
    src: "https://assets-sail4th.s3.us-east-1.amazonaws.com/media_assets/GUAYAS%20parade.jpeg",
    alt: "Gran velero en desfile Sail4th",
    label: "Parade of Sail",
  },
  {
    src: "https://assets-sail4th.s3.us-east-1.amazonaws.com/sail4th-parade-routes.jpg",
    alt: "Mapa oficial de rutas Sail4th",
    label: "Official routes",
  },
  {
    src: "https://assets-sail4th.s3.us-east-1.amazonaws.com/sail4th-250-in-times-square-july-4-2025.jpg",
    alt: "Sail4th 250 en Times Square",
    label: "Times Square",
  },
];

const sail4thRouteCards = [
  {
    title: "Hudson River Grand Parade",
    time: "9:30 AM - 2:00 PM",
    place: "Verrazzano Bridge -> George Washington Bridge",
    note: "La imagen americana total: veleros, skyline oeste de Manhattan y Statue of Liberty.",
  },
  {
    title: "East River Class B Parade",
    time: "1:00 PM - 3:00 PM",
    place: "Hell Gate Bridge -> Gravesend Bay",
    note: "Mejor para sentir el movimiento de barcos por el East River y Brooklyn.",
  },
  {
    title: "Free Tall Ship Tours",
    time: "11:30 AM - 4:00 PM",
    place: "Brooklyn Bridge Park / Piers 86-92 / Seaport / Staten Island",
    note: "Gratis con reserva recomendada; ideal para familias y fotos de cerca.",
  },
];

const bestViewingZones = [
  "Brooklyn Bridge y Seaport District: prioridad para fuegos y skyline.",
  "Lower Manhattan waterfront: buena energía, alta afluencia y controles NYPD.",
  "Hudson River / Jersey City sightlines: clave en 2026 por expansión al lower Hudson.",
  "Observatorios y rooftops con entrada: solo como opción secundaria si buscas control, reserva y menos incertidumbre.",
];

const mapPoints = [
  ["Fuegos Macy's", "Brooklyn Bridge / East River / Hudson"],
  ["Elcano", "Piers 90/92, Manhattan"],
  ["Tall Ships", "Brooklyn Bridge Park, Seaport, Staten Island, West Side"],
  ["Aerial Review", "Verrazzano Bridge / Hudson River"],
  ["Conciertos y Broadway", "Times Square / Theater District"],
  ["Transporte", "MTA Subway, NYC Ferry, Staten Island Ferry"],
];

function EventCardView({ event }: { event: EventCard }) {
  const transitHref = buildTransitPlannerUrl({ name: event.name, address: event.location });
  return (
    <article className="nyc-hard-card-white overflow-hidden rounded-md">
      <div className="relative h-48 border-b-2 border-slate-950">
        <Image src={event.image} alt={event.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-700">{event.tags.join(" / ")}</p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h3 className="font-american-diner text-2xl text-slate-950">{event.name}</h3>
            <FavoriteToggleButton baseKey={JULY_FAVORITES_KEY} favoriteType="fourth-of-july" itemId={event.name} />
          </div>
        </div>
        <p className="text-sm font-semibold leading-6 text-slate-700">{event.description}</p>
        <div className="grid gap-2 text-sm font-semibold text-slate-700">
          <p><strong>Fecha:</strong> {event.date}</p>
          <p><strong>Hora:</strong> {event.time}</p>
          <p><strong>Ubicación:</strong> {event.location}</p>
          <p><strong>Público:</strong> {event.audience}</p>
          <p><strong>Precio:</strong> {event.price}</p>
          <p><strong>Cómo llegar:</strong> {event.directions}</p>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <a href={event.officialUrl} target="_blank" className="nyc-action rounded-md px-3 py-2 text-xs">
            Enlace oficial
          </a>
          {event.ticketsUrl ? (
            <a href={event.ticketsUrl} target="_blank" className="rounded-md border-2 border-slate-950 bg-[#fff3d1] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-950 shadow-[3px_3px_0_#111827]">
              Entradas
            </a>
          ) : null}
          <a href={event.mapsUrl} target="_blank" className="rounded-md border-2 border-slate-950 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-950 shadow-[3px_3px_0_#111827]">
            Google Maps
          </a>
          <a href={transitHref} className="rounded-md border-2 border-slate-950 bg-[#fffdf4] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-950 shadow-[3px_3px_0_#111827]">
            Como llegar
          </a>
        </div>
      </div>
    </article>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  children,
  tone = "navy",
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  tone?: "navy" | "deep" | "white";
}) {
  const isWhite = tone === "white";
  return (
    <section id={id} className={`${isWhite ? "bg-white text-[#0A2342]" : tone === "deep" ? "bg-[#07192f] text-white" : "bg-[#0A2342] text-white"} border-t-2 border-slate-950 px-5 py-12 sm:px-8 lg:py-16`}>
      <div className="mx-auto max-w-7xl">
        <p className={`text-xs font-black uppercase tracking-[0.22em] ${isWhite ? "text-red-700" : "text-[#D4AF37]"}`}>{eyebrow}</p>
        <h2 className="mt-2 font-american-diner text-4xl leading-tight sm:text-5xl">{title}</h2>
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

export default function FourthOfJulyPage() {
  const freeEvents = majorEvents.filter((event) => event.price.toLowerCase().includes("gratis"));
  const ticketedEvents = majorEvents.filter((event) => event.ticketsUrl);
  const favoriteItems: FavoriteRailItem[] = majorEvents.map((event) => ({
    id: event.name,
    name: event.name,
    meta: `${event.date} - ${event.location}`,
    href: event.officialUrl,
  }));
  const sectionShortcuts = [
    ["Fuegos", "#fuegos"],
    ["Sail4th", "#sail4th"],
    ["Elcano", "#elcano"],
    ["Conciertos", "#conciertos"],
    ["Familias", "#familias"],
    ["Cultura", "#cultura"],
    ["Gratis", "#gratis"],
    ["Entrada", "#entrada"],
    ["Mapa", "#mapa"],
    ["Clima", "#clima"],
  ];

  return (
    <main className="nyc-page-shell page-bg-july">
      <div className="nyc-content-shell mx-auto max-w-7xl overflow-hidden">
      <section className="relative min-h-[76vh] overflow-hidden border-b-2 border-slate-950">
        <Image
          src="https://images.pexels.com/photos/12674747/pexels-photo-12674747.jpeg?auto=compress&cs=tinysrgb&w=2400"
          alt="Skyline de Manhattan al atardecer"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,35,66,0.96),rgba(10,35,66,0.68),rgba(193,18,31,0.3)),linear-gradient(180deg,rgba(10,35,66,0.18),rgba(10,35,66,0.96))]" />
        <div className="relative z-10 mx-auto flex min-h-[76vh] max-w-7xl flex-col justify-end px-5 pb-10 pt-24 sm:px-8 lg:px-10">
          <div className="max-w-5xl">
            <p className="w-fit border border-[#D4AF37]/60 bg-[#D4AF37]/12 px-3 py-2 text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37]">
              4 de Julio en Nueva York
            </p>
            <h1 className="mt-5 font-american-diner text-5xl leading-[0.92] text-white sm:text-7xl lg:text-8xl">
              ESTRELLAS, BANDERAS Y ESPECTÁCULOS
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-7 text-white/84 sm:text-xl">
              La guía definitiva para vivir el 4 de Julio en Nueva York: fuegos artificiales, grandes veleros,
              conciertos, desfiles y los eventos más importantes de la ciudad.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#fuegos" className="nyc-action rounded-md px-5 py-3 text-sm">
                Ver eventos
              </a>
              <a href="#mapa" className="rounded-md border-2 border-white bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur">
                Mapa 4 de Julio
              </a>
            </div>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["Macy's", "fuegos oficiales y celebraciones"],
              ["Sail4th 250", "más de 50 veleros previstos"],
              ["NYC", "eventos culturales, familiares y premium"],
            ].map(([value, label]) => (
              <div key={value} className="rounded-md border-2 border-white/70 bg-white/10 p-4 backdrop-blur">
                <p className="font-american-diner text-3xl text-white">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-slate-950 bg-[#fff3d1] px-5 py-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sectionShortcuts.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="shrink-0 rounded-md border-2 border-slate-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-950 shadow-[3px_3px_0_#111827]"
              >
                {label}
              </a>
            ))}
          </div>
          <FavoritesRail baseKey={JULY_FAVORITES_KEY} favoriteType="fourth-of-july" items={favoriteItems} title="Favoritos del 4 de Julio" />
        </div>
      </section>

      <SectionShell id="fuegos" eyebrow="01 / Celebraciones oficiales" title="Fuegos Artificiales y Celebraciones Oficiales">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <EventCardView event={fireworksEvent} />
          <div className="rounded-md border border-white/15 bg-white/8 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="font-american-diner text-3xl font-bold">Mejores zonas para verlo</h3>
              <UseMyLocationMapButton destinationQuery="Brooklyn Bridge New York" compact />
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              {bestViewingZones.map((zone) => <li key={zone}>{zone}</li>)}
            </ul>
            <iframe
              title="Mapa Macy's Fireworks"
              src="https://www.google.com/maps?q=Brooklyn%20Bridge%20New%20York&output=embed"
              className="mt-5 h-72 w-full rounded-md border-0"
              loading="lazy"
            />
          </div>
        </div>
      </SectionShell>

      <SectionShell id="sail4th" eyebrow="02 / America 250 en el puerto" title="Sail4th 250 y Grandes Veleros" tone="deep">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-4">
            <div className="relative min-h-[430px] overflow-hidden rounded-md border-2 border-white/70 bg-white/5 shadow-[6px_6px_0_#111827]">
              <Image
                src={sail4thVisuals[0].src}
                alt={sail4thVisuals[0].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 54vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07192f] via-[#07192f]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4AF37]">Sail4th 250 official media</p>
                <h3 className="mt-2 font-american-diner text-4xl font-bold text-white">Tall ships, Liberty y skyline.</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/78">
                  Esta sección se lee como una guía visual: primero qué se ve, después cuándo ir, dónde colocarse y qué barcos buscar.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {sail4thVisuals.slice(1).map((visual) => (
                <div key={visual.src} className="relative aspect-[4/3] overflow-hidden rounded-md border border-white/15 bg-white/5">
                  <Image src={visual.src} alt={visual.alt} fill className="object-cover" sizes="(max-width: 768px) 33vw, 18vw" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07192f] to-transparent p-2">
                    <p className="text-[10px] font-black uppercase tracking-wide text-white">{visual.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-md border border-[#D4AF37]/35 bg-[#D4AF37]/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">Flow americano</p>
              <h3 className="mt-2 font-american-diner text-3xl font-bold text-white">Cómo vivir Sail4th sin perderte</h3>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Mira esta parte como un festival por zonas: desfile grande por el Hudson, barcos visitables en muelles y ambiente
                patriótico por todo el puerto. No hace falta verlo todo: elige una ruta y quédate ahí.
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              {sail4thRouteCards.map((route, idx) => (
                <div key={route.title} className="rounded-md border border-white/15 bg-white/8 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C1121F] text-sm font-black text-white ring-2 ring-[#D4AF37]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-american-diner text-2xl font-bold text-white">{route.title}</p>
                      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#D4AF37]">{route.time}</p>
                      <p className="mt-2 text-sm font-semibold text-white/82">{route.place}</p>
                      <p className="mt-1 text-sm leading-6 text-white/68">{route.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm leading-6 text-white/78">
              Sail4th 250 reunirá grandes veleros internacionales, revisiones navales y visitas públicas gratuitas.
              La lista oficial incluye barcos de más de 20 países y ubicaciones repartidas por Brooklyn Bridge Park,
              West Side, South Street Seaport y Staten Island.
            </p>
            <div className="mt-5 grid max-h-[430px] gap-3 overflow-auto pr-2 sm:grid-cols-2">
              {tallShips.map((ship) => (
                <div key={`${ship.name}-${ship.country}`} className="rounded-md border border-white/15 bg-[#0A2342]/70 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-black text-white">{ship.name}</p>
                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#0A2342]">
                      {ship.country}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/75">{ship.location}</p>
                  <p className="text-sm text-white/65">{ship.publicVisit}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="https://sail4th.org/tall-ships" target="_blank" className="rounded-sm bg-[#C1121F] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">Todos los barcos oficiales</a>
              <a href="https://sail4th.org/tall-ship-tours" target="_blank" className="rounded-sm border border-[#D4AF37] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#D4AF37]">Visitas públicas</a>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="elcano" eyebrow="03 / España en New York Harbor" title="Juan Sebastián Elcano">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="relative min-h-80 overflow-hidden rounded-md border border-white/15 lg:col-span-1">
            <Image
              src="https://commons.wikimedia.org/wiki/Special:FilePath/JUAN_SEBASTI%C3%81N_ELCANO.jpg"
              alt="Buque escuela Juan Sebastián de Elcano"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0A2342] to-transparent p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/80">
                Foto: PEPE GADEIRAS / Wikimedia Commons
              </p>
            </div>
          </div>
          <div className="rounded-md border border-white/15 bg-white/8 p-5 lg:col-span-2">
            <p className="text-sm leading-7 text-white/80">
              El Juan Sebastián de Elcano es el buque escuela de la Armada Española. Sail4th lo describe como un
              bergantín-goleta de cuatro mástiles, 371 pies, construido en Cádiz en 1928, y uno de los grandes barcos
              escuela más reconocibles del mundo. Para la experiencia NYC Family Planner, se trata como evento cultural
              prioritario por su valor histórico, visual e institucional.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Localización", "Piers 90/92 según Sail4th tall ship tours"],
                ["Horarios de visita", "Consultar reservas oficiales; visitas públicas 11:30 AM - 4:00 PM en ventanas anunciadas"],
                ["Eventos asociados", "Parade of Sail, visitas públicas, actos marítimos America 250"],
                ["Cómo llegar", "Subway 7/A/C/E/1/2/3/N/Q/R/W hacia West Side; caminar con margen"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-white/15 bg-[#07192f] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D4AF37]">{label}</p>
                  <p className="mt-2 text-sm text-white/78">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="https://sail4th.org/tall-ship-tours" target="_blank" className="rounded-sm bg-[#C1121F] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">Reservas oficiales</a>
              <a href="https://www.google.com/maps/search/?api=1&query=Piers+90+92+New+York" target="_blank" className="rounded-sm border border-white/30 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">Google Maps</a>
              <a href={buildTransitPlannerUrl({ name: "Juan Sebastian Elcano", address: "Piers 90/92 New York" })} className="rounded-sm border border-[#D4AF37] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#D4AF37]">Como llegar</a>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="conciertos" eyebrow="04 / Escenarios y actuaciones" title="Conciertos y Actuaciones en Directo" tone="white">
        <div className="grid gap-5 md:grid-cols-2">
          {majorEvents.filter((event) => event.tags.includes("Actuaciones") || event.name.includes("Macy")).map((event) => (
            <article key={event.name} className="rounded-md border border-[#0A2342]/15 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C1121F]">{event.date} / {event.time}</p>
              <h3 className="mt-2 font-american-diner text-2xl font-bold">{event.name}</h3>
              <p className="mt-2 text-sm leading-6 text-[#0A2342]/72">{event.description}</p>
              <a href={event.officialUrl} target="_blank" className="mt-4 inline-block rounded-sm bg-[#0A2342] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">Entradas / oficial</a>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="familias" eyebrow="05 / Plan familiar" title="Actividades para Familias" tone="deep">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Visitas gratuitas a veleros", "Educativo, visual y memorable. Reservar porque hay alta demanda."],
            ["Brooklyn Bridge Park y Seaport", "Zonas abiertas para fotos, skyline y espera antes de eventos oficiales."],
            ["Programación histórica America 250", "Ideal para niños curiosos: barcos, historia naval y ceremonias públicas."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-md border border-white/15 bg-white/8 p-5">
              <h3 className="font-american-diner text-2xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">{copy}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="cultura" eyebrow="06 / Ceremonias e historia" title="Celebraciones Históricas y Culturales">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="relative min-h-80 overflow-hidden rounded-md border border-white/15">
            <Image src="https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1800&q=82" alt="Estatua de la Libertad y skyline" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" />
          </div>
          <div className="space-y-3">
            {["America 250 y actos patrióticos", "International Naval Review", "International Aerial Review", "Ceremonias en torno a Statue of Liberty y New York Harbor"].map((item) => (
              <div key={item} className="rounded-md border border-white/15 bg-white/8 p-4">
                <p className="font-black text-white">{item}</p>
                <p className="mt-1 text-sm text-white/72">Monitorizar agenda oficial, seguridad, horarios y posibles cambios por clima.</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="gratis" eyebrow="07 / Sin coste" title="Eventos Gratuitos" tone="white">
        <div className="grid gap-4 md:grid-cols-3">
          {freeEvents.map((event) => (
            <article key={event.name} className="rounded-md border border-[#0A2342]/15 p-4">
              <h3 className="font-american-diner text-2xl font-bold">{event.name}</h3>
              <p className="mt-2 text-sm text-[#0A2342]/70">{event.time}</p>
              <p className="mt-1 text-sm text-[#0A2342]/70">{event.location}</p>
              <a href={event.officialUrl} target="_blank" className="mt-4 inline-block text-sm font-black text-[#C1121F] underline underline-offset-4">Ver oficial</a>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="entrada" eyebrow="08 / Ticketed events" title="Eventos con Entrada" tone="deep">
        <div className="grid gap-5 md:grid-cols-2">
          {ticketedEvents.map((event) => <EventCardView key={event.name} event={event} />)}
        </div>
      </SectionShell>

      <SectionShell id="mapa" eyebrow="09 / Mapa interactivo" title="Mapa Interactivo del 4 de Julio">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-md border border-white/15 bg-white/8 p-5">
            <div className="mb-4">
              <UseMyLocationMapButton destinationQuery="New York Harbor Brooklyn Bridge Piers 90 92" />
            </div>
            <div className="grid gap-3">
              {mapPoints.map(([label, value]) => (
                <div key={label} className="flex gap-3 rounded-md border border-white/15 bg-[#07192f] p-3">
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#C1121F] ring-2 ring-[#D4AF37]" />
                  <div>
                    <p className="font-black text-white">{label}</p>
                    <p className="text-sm text-white/72">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <iframe
            title="Mapa interactivo 4 de julio NYC"
            src="https://www.google.com/maps?q=New%20York%20Harbor%20Brooklyn%20Bridge%20Times%20Square%20Piers%2090%2092&output=embed"
            className="h-[520px] w-full rounded-md border-0"
            loading="lazy"
          />
        </div>
      </SectionShell>

      <SectionShell id="clima" eyebrow="10 / Inteligencia de viaje" title="Clima y Recomendaciones Inteligentes" tone="white">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Predicción meteorológica", "Consultar OpenWeather/NOAA antes de salir. Riesgo principal: calor húmedo, tormentas y viento en harbor."],
            ["Nivel de afluencia esperado", "Muy alto desde media tarde. Macy's, puentes, Seaport, Hudson y muelles Sail4th tendrán controles y esperas."],
            ["Recomendación según clima", "Con lluvia: priorizar visitas cubiertas, Broadway y observatorios. Con calor: itinerario por bloques cortos y sombra."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-md border border-[#0A2342]/15 p-5">
              <h3 className="font-american-diner text-2xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#0A2342]/72">{copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-md border border-[#0A2342]/15 bg-[#0A2342] p-5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D4AF37]">APIs recomendadas para automatizar la sección</p>
          <p className="mt-2 text-sm leading-6 text-white/78">
            Ticketmaster API, Eventbrite API, Google Places API, NYC Open Data y OpenWeather API. El PatriotEventsAgent queda preparado
            para monitorizar horarios, cancelaciones, ubicaciones, clima y recomendaciones por edad o preferencias.
          </p>
        </div>
      </SectionShell>
      </div>
    </main>
  );
}
