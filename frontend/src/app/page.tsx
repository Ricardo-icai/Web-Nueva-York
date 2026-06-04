import Image from "next/image";
import Link from "next/link";

type HomeCard = {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  label: string;
};

const mainCards: HomeCard[] = [
  {
    title: "Transporte publico",
    subtitle: "Metro, OMNY, AirTrain, ferries, buses y trucos para moverte.",
    href: "/map",
    image: "https://images.pexels.com/photos/30228466/pexels-photo-30228466.jpeg?auto=compress&cs=tinysrgb&w=1600",
    label: "Primero",
  },
  {
    title: "Organizame la ruta",
    subtitle: "Planning automatico por dias, personas, ritmo y alojamiento.",
    href: "/route-planner",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=84",
    label: "Ruta",
  },
  {
    title: "Tengo Hambre",
    subtitle: "Restaurantes, pizza, hamburguesas, favoritos y mapa de locales.",
    href: "/restaurants",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=84",
    label: "Food",
  },
  {
    title: "Cultura",
    subtitle: "Museos, planes historicos, barrios y experiencias bajo techo.",
    href: "/culture",
    image: "https://images.pexels.com/photos/6133108/pexels-photo-6133108.jpeg?auto=compress&cs=tinysrgb&w=1600",
    label: "Cultura",
  },
  {
    title: "Roof Tops",
    subtitle: "Miradores, rooftops, vistas virales y enlaces para entradas.",
    href: "/viewpoints",
    image: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1600&q=84",
    label: "Skyline",
  },
  {
    title: "4 de Julio",
    subtitle: "Fuegos, Sail4th 250, Elcano, grandes veleros y eventos oficiales.",
    href: "/fourth-of-july",
    image: "https://images.pexels.com/photos/12674747/pexels-photo-12674747.jpeg?auto=compress&cs=tinysrgb&w=1600",
    label: "Eventos",
  },
  {
    title: "Editar perfil",
    subtitle: "Cambia fechas, alojamiento, viajeros y ritmo del viaje.",
    href: "/onboarding",
    image: "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?auto=format&fit=crop&w=1600&q=84",
    label: "Tu viaje",
  },
];

function VisualCard({ card, featured = false }: { card: HomeCard; featured?: boolean }) {
  return (
    <Link
      href={card.href}
      className={`group relative block overflow-hidden rounded-md border-2 border-slate-950 bg-slate-900 shadow-[6px_6px_0_#111827] transition hover:-translate-y-0.5 ${
        featured ? "min-h-[360px] md:col-span-2 md:row-span-2" : "min-h-[230px]"
      }`}
    >
      <Image
        src={card.image}
        alt={card.title}
        fill
        priority={featured}
        className="object-cover transition duration-700 group-hover:scale-105"
        sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/42 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <span className="rounded-md border-2 border-white/60 bg-white/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
          {card.label}
        </span>
        <h2 className={`${featured ? "text-4xl sm:text-5xl" : "text-2xl"} mt-3 font-american-diner leading-tight text-white`}>
          {card.title}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/78">{card.subtitle}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="nyc-page-shell page-bg-home">
      <section className="nyc-content-shell mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">NYC Family Planner</p>
            <h1 className="mt-1 font-american-diner text-4xl leading-tight text-slate-950 sm:text-5xl">
              Pick Your New York Moment
            </h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <VisualCard card={mainCards[0]} featured />
          {mainCards.slice(1).map((card) => (
            <VisualCard key={card.href} card={card} />
          ))}
        </div>
      </section>

    </main>
  );
}
