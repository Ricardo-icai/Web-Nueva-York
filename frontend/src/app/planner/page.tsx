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
};

export default async function PlannerPage() {
  const plans = await apiFetch<Featured[]>('/places/featured');

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">Planes destacados</h1>
      <p className="mt-2 text-slate-300">Seleccionados para una primera visita funcional y bien distribuida.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <Image src={plan.image} alt={plan.title} width={600} height={360} className="h-44 w-full object-cover" />
            <div className="p-4">
              <p className="text-xs uppercase tracking-wide text-sky-300">{plan.type} - {plan.area}</p>
              <h2 className="mt-1 text-lg font-semibold">{plan.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{plan.durationMinutes} min · {plan.indoor ? 'Interior' : 'Exterior'}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
