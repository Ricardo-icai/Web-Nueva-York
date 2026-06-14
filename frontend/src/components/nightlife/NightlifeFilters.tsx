"use client";

export type NightlifeFilterState = {
  priceRange: string;
  musicStyle: string;
  agePolicy: string;
  accommodationDistance: string;
  currentLocationDistance: string;
};

type Props = {
  filters: NightlifeFilterState;
  onChange: (next: NightlifeFilterState) => void;
  resultCount: number;
};

const priceOptions = [
  ["all", "Cualquier precio"],
  ["0-40", "0-40 USD por persona"],
  ["40-70", "40-70 USD por persona"],
  ["70-100", "70-100 USD por persona"],
  ["100-160", "100-160 USD por persona"],
];

const ageOptions = [
  ["all", "Todas"],
  ["21+", "Solo 21+"],
  ["unknown", "Politica no indicada"],
];

const musicOptions = [
  ["all", "Cualquier musica"],
  ["Reggaeton", "Reggaeton / Latin"],
  ["House", "House"],
  ["Techno", "Techno"],
  ["Hip Hop", "Hip Hop"],
  ["EDM", "EDM"],
  ["Jazz", "Jazz"],
  ["Live music", "Musica en directo"],
  ["Lounge", "Lounge"],
];

const distanceOptions = [
  ["all", "Sin limite"],
  ["0-1.5", "Hasta 1.5 km"],
  ["0-3", "Hasta 3 km"],
  ["0-6", "Hasta 6 km"],
  ["6-plus", "Mas de 6 km"],
];

export default function NightlifeFilters({ filters, onChange, resultCount }: Props) {
  const setFilter = <K extends keyof NightlifeFilterState>(key: K, value: NightlifeFilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section id="nightlife-filters" className="border-b border-slate-200 bg-white px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold text-slate-950">Filtros</h2>
          <p className="text-sm text-slate-600">{resultCount} resultados</p>
        </div>

        <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-[#faf7f2] p-5 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2 text-sm">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Precio real</span>
            <select value={filters.priceRange} onChange={(event) => setFilter("priceRange", event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950">
              {priceOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Tipo de musica</span>
            <select value={filters.musicStyle} onChange={(event) => setFilter("musicStyle", event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950">
              {musicOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Edad</span>
            <select value={filters.agePolicy} onChange={(event) => setFilter("agePolicy", event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950">
              {ageOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Distancia desde donde duermes</span>
            <select value={filters.accommodationDistance} onChange={(event) => setFilter("accommodationDistance", event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950">
              {distanceOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Distancia desde donde estoy</span>
            <select value={filters.currentLocationDistance} onChange={(event) => setFilter("currentLocationDistance", event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-950">
              {distanceOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
