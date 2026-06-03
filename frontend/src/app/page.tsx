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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Train_stopping_at_a_New_York_subway_station_%28Unsplash%29.jpg",
    label: "Primero",
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
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/New_York_City_%28New_York%2C_USA%29%2C_Statue_of_Liberty_--_2012_--_6814.jpg",
    label: "Cultura",
  },
  {
    title: "Roof Tops",
    subtitle: "Miradores, rooftops, vistas virales y enlaces para entradas.",
    href: "/viewpoints",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/2022-0402-NYC-Summit_One_Vanderbilt-02.jpg",
    label: "Skyline",
  },
  {
    title: "4 de Julio",
    subtitle: "Fuegos, Sail4th 250, Elcano, grandes veleros y eventos oficiales.",
    href: "/fourth-of-july",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Fireworks_around_the_Freedom_Tower_%2848201561146%29.jpg",
    label: "Eventos",
  },
  {
    title: "Mundial 2026",
    subtitle: "Todo lo importante para vivir el Mundial cerca de Nueva York.",
    href: "/world-cup-2026",
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1600&q=82",
    label: "Sports",
  },
  {
    title: "Editar perfil",
    subtitle: "Cambia fechas, alojamiento, viajeros y ritmo del viaje.",
    href: "/onboarding",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Times_square_at_night.jpg",
    label: "Tu viaje",
  },
];

function VisualCard({ card, featured = false }: { card: HomeCard; featured?: boolean }) {
  return (
    <Link
      href={card.href}
      className={`group relative block overflow-hidden rounded-md border border-white/12 bg-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.22)] ${
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
        <span className="rounded-full border border-white/35 bg-white/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
          {card.label}
        </span>
        <h2 className={`${featured ? "text-4xl sm:text-5xl" : "text-2xl"} mt-3 font-display font-bold leading-tight text-white`}>
          {card.title}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/78">{card.subtitle}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="bg-stone-50">
      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">NYC Family Planner</p>
            <h1 className="mt-1 font-display text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
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
