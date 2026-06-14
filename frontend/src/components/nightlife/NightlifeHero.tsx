export default function NightlifeHero({ total }: { total: number }) {
  return (
    <section className="relative min-h-[72vh] overflow-hidden border-b border-slate-200 bg-white text-slate-950">
      <img
        src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=2200&q=80"
        alt="Ambiente nocturno de fiesta en Nueva York"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(0,0,0,0.55))]" />
      <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-5 pb-10 pt-24 sm:px-8">
        <h1 className="max-w-4xl font-display text-5xl font-bold leading-[0.92] text-white sm:text-7xl">
          Nightlife NYC
        </h1>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#nightlife-filters" className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950">
            Explorar locales
          </a>
          <a href="#nightlife-map" className="rounded-full border border-white/70 bg-black/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur">
            Ver mapa
          </a>
        </div>
        <p className="mt-6 text-sm text-white/85">{total} locales curados.</p>
      </div>
    </section>
  );
}
