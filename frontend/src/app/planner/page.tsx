import Image from "next/image";
import { apiFetch } from "@/lib/api";

type Featured = {
  id: string;
  title: string;
  type: string;
  area: string;
  image: string;
  durationMinutes: number;
  indoor: boolean;
  lat: number;
  lng: number;
  officialUrl: string;
};

export default async function PlannerPage() {
  const plans = await apiFetch<Featured[]>('/places/featured');

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-4xl text-slate-900">Planes destacados de Nueva York</h1>
      <p className="mt-2 text-slate-600">Seleccionados con enfoque familiar, visual y logistico.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {plans.map((plan) => {
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${plan.lat},${plan.lng}`;
          return (
            <article key={plan.id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              <div className="relative h-56 w-full overflow-hidden">
                <Image src={plan.image} alt={plan.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent" />
                <p className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800">
                  {plan.type}
                </p>
              </div>
              <div className="p-5">
                <h2 className="font-display text-2xl text-slate-900">{plan.title}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {plan.area} - {plan.durationMinutes} min - {plan.indoor ? "Interior" : "Exterior"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={mapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                    Ver en mapa
                  </a>
                  <a href={plan.officialUrl} target="_blank" rel="noreferrer" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-stone-50">
                    Web oficial
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
