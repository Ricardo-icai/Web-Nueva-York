"use client";

import Image from "next/image";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function RestaurantsHero({ total }: { total: number }) {
  const { language } = useLanguage();

  return (
    <section className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-stone-200 bg-[#fff8eb] shadow-sm md:grid-cols-[1fr_420px]">
      <div className="space-y-3 p-5 md:p-7">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700">NYC Food Map</p>
        <h1 className="font-american-diner text-4xl tracking-tight text-slate-950 md:text-5xl">
          {language === "en" ? "Where to Eat in New York" : "Sitios para comer en Nueva York"}
        </h1>
        <p className="inline-flex rounded-full border-2 border-slate-950 bg-white px-4 py-1 text-sm font-black uppercase tracking-wide text-slate-950">
          {total} {language === "en" ? "spots found" : "locales encontrados"}
        </p>
      </div>
      <div className="relative min-h-56 md:min-h-full">
        <Image
          src="https://images.unsplash.com/photo-1761301006544-f4e61c271201?auto=format&fit=crop&w=1200&q=85"
          alt={language === "en" ? "New York street corner with a pizzeria and classic food scene" : "Esquina de Nueva York con una pizzería y ambiente de comida urbana"}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 420px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/20" />
      </div>
    </section>
  );
}
