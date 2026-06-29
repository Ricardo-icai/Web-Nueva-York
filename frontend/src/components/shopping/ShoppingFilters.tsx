"use client";

export type ShoppingFilterState = {
  category: string;
  accommodationDistance: string;
  currentLocationDistance: string;
};

const categoryOptions = [
  { value: "all", label: "Todo tipo de compra" },
  { value: "luxury", label: "Lujo" },
  { value: "department_store", label: "Grandes almacenes" },
  { value: "fashion", label: "Moda" },
  { value: "sports", label: "Deporte" },
  { value: "sneakers_streetwear", label: "Sneakers y streetwear" },
  { value: "vintage", label: "Vintage y reventa" },
  { value: "beauty", label: "Belleza" },
  { value: "design_books", label: "Libros, diseno y regalos" },
  { value: "market", label: "Mercados y makers" },
];

const distanceOptions = [
  { value: "all", label: "Sin limite" },
  { value: "0-1.5", label: "Hasta 1,5 km" },
  { value: "0-3", label: "Hasta 3 km" },
  { value: "0-6", label: "Hasta 6 km" },
  { value: "6-plus", label: "Mas de 6 km" },
];

export default function ShoppingFilters({
  filters,
  onChange,
  onReset,
  resultCount,
}: {
  filters: ShoppingFilterState;
  onChange: (value: ShoppingFilterState) => void;
  onReset: () => void;
  resultCount: number;
}) {
  return (
    <section className="border-b border-slate-200 bg-white px-5 py-7 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Tipo de compra</span>
            <select
              value={filters.category}
              onChange={(event) => onChange({ ...filters, category: event.target.value })}
              className="w-full rounded-2xl border border-slate-300 bg-[#fffdf6] px-4 py-3 text-sm font-semibold text-slate-900"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Cerca de donde duermo</span>
            <select
              value={filters.accommodationDistance}
              onChange={(event) => onChange({ ...filters, accommodationDistance: event.target.value })}
              className="w-full rounded-2xl border border-slate-300 bg-[#fffdf6] px-4 py-3 text-sm font-semibold text-slate-900"
            >
              {distanceOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Cerca de mi ubicacion</span>
            <select
              value={filters.currentLocationDistance}
              onChange={(event) => onChange({ ...filters, currentLocationDistance: event.target.value })}
              className="w-full rounded-2xl border border-slate-300 bg-[#fffdf6] px-4 py-3 text-sm font-semibold text-slate-900"
            >
              {distanceOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="rounded-full border border-slate-300 bg-[#fffdf6] px-4 py-2 text-sm font-black text-slate-900">
            {resultCount} tiendas visibles
          </p>
          <button type="button" onClick={onReset} className="rounded-full border border-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-950">
            Restaurar filtros
          </button>
        </div>
      </div>
    </section>
  );
}
