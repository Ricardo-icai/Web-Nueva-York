import Image from "next/image";
import Link from "next/link";
import HeroCarousel from "@/components/home/HeroCarousel";
import { getDictionary } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/server-language";

type HomeCard = {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  label: string;
};

function VisualCard({ card, featured = false }: { card: HomeCard; featured?: boolean }) {
  return (
    <Link
      href={card.href}
      className={`nyc-smooth-card nyc-image-panel group relative block border border-slate-950/85 bg-slate-900 shadow-[0_18px_44px_rgba(15,23,42,0.18)] ${
        featured ? "min-h-[380px] md:col-span-2 md:row-span-2" : "min-h-[250px]"
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,31,0.12),rgba(8,15,31,0.2),rgba(8,15,31,0.88))]" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="mb-2 max-w-md text-sm font-semibold text-white/78">{card.subtitle}</p>
        <h2 className={`${featured ? "text-4xl sm:text-5xl" : "text-2xl"} font-american-diner leading-tight text-white`}>{card.title}</h2>
      </div>
    </Link>
  );
}

export default async function Home() {
  const language = await getServerLanguage();
  const dictionary = getDictionary(language);

  const mainCards: HomeCard[] = [
    {
      ...dictionary.home.cards[0],
      href: "/map",
      image: "https://images.pexels.com/photos/30228466/pexels-photo-30228466.jpeg?auto=compress&cs=tinysrgb&w=1600",
    },
    {
      ...dictionary.home.cards[1],
      href: "/route-planner",
      image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=84",
    },
    {
      ...dictionary.home.cards[2],
      href: "/restaurants",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=84",
    },
    {
      ...dictionary.home.cards[3],
      href: "/shopping",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=84",
    },
    {
      ...dictionary.home.cards[4],
      href: "/culture",
      image: "https://images.pexels.com/photos/6133108/pexels-photo-6133108.jpeg?auto=compress&cs=tinysrgb&w=1600",
    },
    {
      ...dictionary.home.cards[5],
      href: "/viewpoints",
      image: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1600&q=84",
    },
    {
      ...dictionary.home.cards[6],
      href: "/fourth-of-july",
      image: "https://images.pexels.com/photos/12674747/pexels-photo-12674747.jpeg?auto=compress&cs=tinysrgb&w=1600",
    },
    {
      ...dictionary.home.cards[7],
      href: "/nightlife",
      image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=84",
    },
    {
      ...dictionary.home.cards[8],
      href: "/esim-usa",
      image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=1600&q=84",
    },
    {
      ...dictionary.home.cards[9],
      href: "/onboarding",
      image: "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?auto=format&fit=crop&w=1600&q=84",
    },
  ];

  return (
    <main className="nyc-page-shell page-bg-home">
      <section className="nyc-content-shell mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <section className="nyc-image-panel relative min-h-[68svh] border border-slate-950/85 shadow-[0_24px_64px_rgba(15,23,42,0.22)]">
          <HeroCarousel />
          <div className="relative z-10 flex min-h-[68svh] flex-col justify-end px-5 pb-8 pt-24 text-white sm:px-8 sm:pb-10">
            <div className="max-w-3xl">
              <p className="w-fit rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/14 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#F7D56B]">
                {dictionary.home.heroBadge}
              </p>
              <h1 className="mt-5 font-american-diner text-5xl leading-[0.92] sm:text-7xl">{dictionary.home.heroTitle}</h1>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/route-planner" className="nyc-action px-5 py-3 text-sm">
                {dictionary.home.heroPrimaryCta}
              </Link>
              <Link href="/culture" className="nyc-flag-action px-5 py-3 text-sm">
                {dictionary.home.heroSecondaryCta}
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <VisualCard card={mainCards[0]} featured />
          {mainCards.slice(1).map((card) => (
            <VisualCard key={card.href} card={card} />
          ))}
        </div>
      </section>
    </main>
  );
}
