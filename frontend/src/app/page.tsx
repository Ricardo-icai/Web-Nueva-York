import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/components/home/HeroCarousel";
import { categoryCards } from "@/lib/visuals";

export default function Home() {
  return (
    <div>
      <section className="relative min-h-[78vh] overflow-hidden">
        <HeroCarousel />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl items-end px-6 pb-14 pt-20">
          <div className="max-w-3xl text-stone-50">
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-amber-300">NYC Family Planner</p>
            <h1 className="font-display text-5xl leading-tight md:text-7xl">
              Discover New York Intelligently
            </h1>
            <p className="mt-5 max-w-2xl text-base text-stone-200 md:text-lg">
              La plataforma que decide por ti que hacer en Nueva York, segun tu familia,
              las fechas, la ubicacion del alojamiento y el clima real.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/onboarding"
                className="rounded-full bg-stone-50 px-6 py-3 text-sm font-semibold text-slate-900"
              >
                Start Planning
              </Link>
              <Link
                href="/planner"
                className="rounded-full border border-stone-300/70 px-6 py-3 text-sm font-semibold text-stone-50"
              >
                Explore NYC
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl text-slate-900 md:text-4xl">Categorias destacadas</h2>
          <p className="text-sm text-slate-500">Curadas para familias en primera visita</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {categoryCards.map((card) => (
            <article
              key={card.title}
              className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
                <h3 className="absolute bottom-4 left-4 font-display text-2xl text-stone-50">
                  {card.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <article className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm md:grid-cols-2">
          <div className="relative min-h-[260px]">
            <Image
              src="https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1600&q=80"
              alt="Tema maritimo inspirado en Elcano"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="p-7 md:p-10">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-600">Edicion especial 2026</p>
            <h3 className="mt-3 font-display text-3xl text-slate-900">Sail4th, Elcano y Mundial en una sola experiencia</h3>
            <p className="mt-4 text-slate-600">
              Integramos eventos oficiales, logistica de transporte y recomendaciones adaptadas
              para que vivas Nueva York sin perderte lo importante.
            </p>
            <Link href="/onboarding" className="mt-6 inline-block rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-stone-50">
              Crear mi viaje ahora
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
