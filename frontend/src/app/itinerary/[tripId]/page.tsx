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
  const trip = await apiFetch<Trip>(`/trips/${tripId}`);
  const dayPlan = await apiFetch<DayPlan>("/recommendations/day-plan", {
    method: "POST",
    body: JSON.stringify({ tripId, date: trip.startDate }),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold">{trip.name}</h1>
      <p className="mt-2 text-slate-300">
        {trip.travelers} viajeros - {trip.nationality} - {trip.startDate} a {trip.endDate}
      </p>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Plan del primer dia</h2>
        <p className="mt-1 text-sm text-slate-300">{dayPlan.weatherSummary}</p>

        <div className="mt-5 space-y-4">
          {dayPlan.items.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-sky-300">{item.startTime} - {item.type}</p>
              <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.reason}</p>
              <p className="mt-2 text-sm text-slate-400">Como llegar: {item.transport}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
