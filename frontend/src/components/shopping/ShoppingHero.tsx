"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ShoppingHero({ total }: { total: number }) {
  const { language } = useLanguage();

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,rgba(10,35,66,0.94),rgba(17,24,39,0.88)),url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=84')] bg-cover bg-center px-5 py-10 text-white sm:px-8 sm:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_34%)]" />
      <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-[#d4af37]/18 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[#c1121f]/18 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mt-5">
          <div>
            <h1 className="font-american-diner text-5xl leading-[0.92] sm:text-6xl">
              {language === "en" ? "City Finds NYC" : "Escaparates NYC"}
            </h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#shopping-map" className="nyc-action px-5 py-3 text-sm">
                {language === "en" ? "View map" : "Ver mapa"}
              </a>
              <a href="#shopping-sections" className="nyc-flag-action px-5 py-3 text-sm">
                {language === "en" ? "View stores" : "Ver tiendas"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
