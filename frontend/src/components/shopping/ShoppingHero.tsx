"use client";

export default function ShoppingHero({ total }: { total: number }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,rgba(10,35,66,0.96),rgba(30,41,59,0.9)),url('https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1800&q=84')] bg-cover bg-center px-5 py-10 text-white sm:px-8 sm:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl">
        <p className="w-fit rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#f7d56b]">
          Shopping curator
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="font-american-diner text-5xl leading-[0.92] sm:text-6xl">
              Compras en Nueva York con mapa, filtros y tiendas realmente famosas
            </h1>
            <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-white/82 sm:text-base">
              Hemos montado una seleccion de tiendas muy conocidas de Nueva York para lujo, moda, sneakers, deportes,
              vintage, belleza y regalos. Puedes filtrarlas por tipo de compra y ver cuales te quedan cerca de donde estas
              o de donde duermes.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Radar de compras</p>
            <p className="mt-3 font-american-diner text-4xl">{total}</p>
            <p className="mt-2 text-sm font-semibold text-white/78">tiendas curadas entre iconos de Fifth Avenue, SoHo, Brooklyn y spots deportivos clave.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
