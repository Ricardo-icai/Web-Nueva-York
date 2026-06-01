import Image from "next/image";

export default function RestaurantsHero({ total }: { total: number }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-4 rounded-3xl border border-stone-200 bg-white/90 p-4 shadow-sm md:grid-cols-[1fr_320px] md:p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-700">NYC Restaurants Intelligence</p>
        <h1 className="font-american-diner text-4xl tracking-tight text-slate-900 md:text-5xl">
          Tengo Hambre en Nueva York
        </h1>
        <p className="text-sm text-slate-700">Locales encontrados: {total}</p>
      </div>
      <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-stone-100 md:h-full">
        <div className="relative h-36 w-36 md:h-44 md:w-44">
          <Image
            src="/images/elcano.svg"
            alt="Logo"
            fill
            className="object-contain"
            sizes="176px"
          />
          <div className="burger-orbit absolute inset-0">
            <span className="burger-icon">🍔</span>
          </div>
        </div>
      </div>
    </section>
  );
}
