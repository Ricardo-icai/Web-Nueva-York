"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";

export type ShoppingFilterState = {
  category: string;
  budget: string;
  bestFor: string;
  zone: string;
  accommodationDistance: string;
  currentLocationDistance: string;
  onlyOfficial: boolean;
  familyFriendlyOnly: boolean;
  trendingOnly: boolean;
  flagshipOnly: boolean;
};

const categoryOptions = [
  { value: "all", label: "Todo tipo de compra" },
  { value: "luxury", label: "Lujo" },
  { value: "fashion", label: "Moda" },
  { value: "department_store", label: "Grandes almacenes" },
  { value: "sneakers_streetwear", label: "Sneakers" },
  { value: "streetwear", label: "Streetwear" },
  { value: "sports", label: "Deporte" },
  { value: "tech", label: "Tecnologia" },
  { value: "beauty", label: "Belleza" },
  { value: "toys", label: "Juguetes" },
  { value: "souvenirs", label: "Souvenirs" },
  { value: "vintage", label: "Vintage" },
  { value: "outlet", label: "Outlets" },
  { value: "bookstore", label: "Libros" },
];

const budgetOptions = [
  { value: "all", label: "Cualquier presupuesto" },
  { value: "$", label: "$" },
  { value: "$$", label: "$$" },
  { value: "$$$", label: "$$$" },
  { value: "$$$$", label: "$$$$" },
];

const bestForOptions = [
  { value: "all", label: "Todo el mundo" },
  { value: "familias", label: "Familias" },
  { value: "teens", label: "Adolescentes" },
  { value: "regalos", label: "Regalos" },
  { value: "lujo", label: "Lujo" },
  { value: "first time in nyc", label: "First time NYC" },
  { value: "sneakers", label: "Sneakers" },
  { value: "beauty", label: "Beauty" },
];

const zoneOptions = [
  { value: "all", label: "Todas las zonas" },
  { value: "Fifth Avenue", label: "Fifth Avenue" },
  { value: "SoHo", label: "SoHo" },
  { value: "NoHo", label: "NoHo" },
  { value: "Times Square", label: "Times Square" },
  { value: "Herald Square", label: "Herald Square" },
  { value: "Williamsburg", label: "Williamsburg" },
  { value: "Chelsea", label: "Chelsea" },
  { value: "Woodbury Common", label: "Woodbury" },
];

const distanceOptions = [
  { value: "all", label: "Sin limite" },
  { value: "0-1.5", label: "Hasta 15 min" },
  { value: "0-3", label: "15-30 min" },
  { value: "0-6", label: "30-45 min" },
  { value: "6-plus", label: "45+ min" },
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
  const { language } = useLanguage();
  const categoryOptions = [
    { value: "all", label: language === "en" ? "All shopping" : "Todo tipo de compra" },
    { value: "luxury", label: language === "en" ? "Luxury" : "Lujo" },
    { value: "fashion", label: language === "en" ? "Fashion" : "Moda" },
    { value: "department_store", label: language === "en" ? "Department stores" : "Grandes almacenes" },
    { value: "sneakers_streetwear", label: "Sneakers" },
    { value: "streetwear", label: "Streetwear" },
    { value: "sports", label: language === "en" ? "Sports" : "Deporte" },
    { value: "tech", label: language === "en" ? "Tech" : "Tecnologia" },
    { value: "beauty", label: language === "en" ? "Beauty" : "Belleza" },
    { value: "toys", label: language === "en" ? "Toys" : "Juguetes" },
    { value: "souvenirs", label: "Souvenirs" },
    { value: "vintage", label: "Vintage" },
    { value: "outlet", label: "Outlets" },
    { value: "bookstore", label: language === "en" ? "Books" : "Libros" },
  ];

  const budgetOptions = [
    { value: "all", label: language === "en" ? "Any budget" : "Cualquier presupuesto" },
    { value: "$", label: "$" },
    { value: "$$", label: "$$" },
    { value: "$$$", label: "$$$" },
    { value: "$$$$", label: "$$$$" },
  ];

  const bestForOptions = [
    { value: "all", label: language === "en" ? "Everyone" : "Todo el mundo" },
    { value: "familias", label: language === "en" ? "Families" : "Familias" },
    { value: "teens", label: language === "en" ? "Teens" : "Adolescentes" },
    { value: "regalos", label: language === "en" ? "Gifts" : "Regalos" },
    { value: "lujo", label: language === "en" ? "Luxury" : "Lujo" },
    { value: "first time in nyc", label: "First time NYC" },
    { value: "sneakers", label: "Sneakers" },
    { value: "beauty", label: "Beauty" },
  ];

  const zoneOptions = [
    { value: "all", label: language === "en" ? "All areas" : "Todas las zonas" },
    { value: "Fifth Avenue", label: "Fifth Avenue" },
    { value: "SoHo", label: "SoHo" },
    { value: "NoHo", label: "NoHo" },
    { value: "Times Square", label: "Times Square" },
    { value: "Herald Square", label: "Herald Square" },
    { value: "Williamsburg", label: "Williamsburg" },
    { value: "Chelsea", label: "Chelsea" },
    { value: "Woodbury Common", label: "Woodbury" },
  ];

  const distanceOptions = [
    { value: "all", label: language === "en" ? "No limit" : "Sin limite" },
    { value: "0-1.5", label: language === "en" ? "Up to 15 min" : "Hasta 15 min" },
    { value: "0-3", label: language === "en" ? "15-30 min" : "15-30 min" },
    { value: "0-6", label: language === "en" ? "30-45 min" : "30-45 min" },
    { value: "6-plus", label: language === "en" ? "45+ min" : "45+ min" },
  ];

  return (
    <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#fffdf7,#f8f4eb)] px-5 py-7 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 rounded-[30px] border border-slate-200 bg-white/88 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{language === "en" ? "Shopping type" : "Tipo de compra"}</span>
            <select value={filters.category} onChange={(event) => onChange({ ...filters, category: event.target.value })} className="w-full rounded-2xl border border-slate-300 bg-[#fffdf6] px-4 py-3 text-sm font-semibold text-slate-900">
              {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{language === "en" ? "Budget" : "Presupuesto"}</span>
            <select value={filters.budget} onChange={(event) => onChange({ ...filters, budget: event.target.value })} className="w-full rounded-2xl border border-slate-300 bg-[#fffdf6] px-4 py-3 text-sm font-semibold text-slate-900">
              {budgetOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{language === "en" ? "Best for" : "Mejor para"}</span>
            <select value={filters.bestFor} onChange={(event) => onChange({ ...filters, bestFor: event.target.value })} className="w-full rounded-2xl border border-slate-300 bg-[#fffdf6] px-4 py-3 text-sm font-semibold text-slate-900">
              {bestForOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{language === "en" ? "Area" : "Zona"}</span>
            <select value={filters.zone} onChange={(event) => onChange({ ...filters, zone: event.target.value })} className="w-full rounded-2xl border border-slate-300 bg-[#fffdf6] px-4 py-3 text-sm font-semibold text-slate-900">
              {zoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{language === "en" ? "Near my hotel" : "Cerca de donde duermo"}</span>
            <select value={filters.accommodationDistance} onChange={(event) => onChange({ ...filters, accommodationDistance: event.target.value })} className="w-full rounded-2xl border border-slate-300 bg-[#fffdf6] px-4 py-3 text-sm font-semibold text-slate-900">
              {distanceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{language === "en" ? "Near me" : "Cerca de mi ubicacion"}</span>
            <select value={filters.currentLocationDistance} onChange={(event) => onChange({ ...filters, currentLocationDistance: event.target.value })} className="w-full rounded-2xl border border-slate-300 bg-[#fffdf6] px-4 py-3 text-sm font-semibold text-slate-900">
              {distanceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => onChange({ ...filters, onlyOfficial: !filters.onlyOfficial })} className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${filters.onlyOfficial ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-900"}`}>
            {language === "en" ? "Official site" : "Web oficial"}
          </button>
          <button type="button" onClick={() => onChange({ ...filters, familyFriendlyOnly: !filters.familyFriendlyOnly })} className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${filters.familyFriendlyOnly ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-900"}`}>
            {language === "en" ? "Family" : "Familiar"}
          </button>
          <button type="button" onClick={() => onChange({ ...filters, trendingOnly: !filters.trendingOnly })} className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${filters.trendingOnly ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-900"}`}>
            {language === "en" ? "Trending" : "Trending"}
          </button>
          <button type="button" onClick={() => onChange({ ...filters, flagshipOnly: !filters.flagshipOnly })} className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${filters.flagshipOnly ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-900"}`}>
            {language === "en" ? "Flagship" : "Flagship"}
          </button>
          <p className="rounded-full border border-slate-300 bg-[#fffdf6] px-4 py-2 text-sm font-black text-slate-900">{resultCount} {language === "en" ? "stores visible" : "tiendas visibles"}</p>
          <button type="button" onClick={onReset} className="rounded-full border border-slate-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-950">
            {language === "en" ? "Reset filters" : "Restaurar filtros"}
          </button>
        </div>
      </div>
    </section>
  );
}
