import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Trip = {
  id: string;
  name: string;
  nationality: string;
  startDate: string;
  endDate: string;
  travelers: number;
  pace: string;
};

type DayPlan = {
  weatherSummary: string;
  items: Array<{
    id: string;
    title: string;
    type: string;
    startTime: string;
    transport: string;
    reason: string;
  }>;
};

export default async function ItineraryPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  let trip: Trip;

  try {
    trip = await apiFetch<Trip>(`/trips/${tripId}`);
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="font-display text-3xl text-slate-900">Viaje no disponible</h1>
          <p className="mt-3 text-slate-700">
            Este itinerario pertenece a un viaje que ya no existe en el servidor.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-block rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-stone-50"
          >
            Crear un viaje nuevo
          </Link>
        </div>
      </div>
    );
  }

  const dayPlan = await apiFetch<DayPlan>("/recommendations/day-plan", {
    method: "POST",
    body: JSON.stringify({ tripId, date: trip.startDate }),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{trip.name}</h1>
      <p className="mt-2 text-slate-700">
        {trip.travelers} viajeros - {trip.nationality} - {trip.startDate} a {trip.endDate}
      </p>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Plan del primer dia</h2>
        <p className="mt-1 text-sm text-slate-700">{dayPlan.weatherSummary}</p>

        <div className="mt-5 space-y-4">
          {dayPlan.items.map((item) => (
            <article key={item.id} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-700">
                {item.startTime} - {item.type}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-700">{item.reason}</p>
              <p className="mt-2 text-sm text-slate-600">Como llegar: {item.transport}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
