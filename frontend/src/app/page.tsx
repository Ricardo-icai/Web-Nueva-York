import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <section className="grid gap-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-sky-950 p-8 md:grid-cols-2 md:p-12">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Nueva York en familia</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Tu viaje perfecto, dia a dia y sin perder tiempo</h1>
          <p className="mt-4 max-w-xl text-slate-300">Genera un itinerario real con clima, presupuesto, edades y eventos especiales como Mundial 2026 y Sail4th.</p>
          <div className="mt-7 flex gap-3">
            <Link href="/onboarding" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900">Empezar ahora</Link>
            <Link href="/planner" className="rounded-full border border-slate-500 px-5 py-2 text-sm font-semibold">Explorar planes</Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-700">
          <Image src="/images/hero-nyc.svg" alt="Skyline de Nueva York" width={800} height={520} className="h-full w-full object-cover" priority />
        </div>
      </section>
    </div>
  );
}
