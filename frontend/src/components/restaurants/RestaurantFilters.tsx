"use client";

import Link from "next/link";
import UseMyLocationButton from "@/components/restaurants/UseMyLocationButton";

type Props = {
  cuisine: string;
  priceRange: string;
  maxDistanceFromUserKm: string;
  maxDistanceFromHotelKm: string;
  userLat: string;
  userLng: string;
  hotelLat: string;
  hotelLng: string;
};

export default function RestaurantFilters(props: Props) {
  const selectClass =
    "h-11 w-full rounded-md border-2 border-slate-950 bg-[#fffdf4] px-3 text-sm font-black uppercase tracking-wide text-slate-950 shadow-[3px_3px_0_#111827] outline-none transition focus:bg-white focus:ring-2 focus:ring-red-600";
  const labelClass = "text-[11px] font-black uppercase tracking-[0.18em] text-red-700";

  return (
    <form className="rounded-lg border-2 border-slate-950 bg-[#fff3d1] p-4 shadow-[6px_6px_0_#111827]">
      <input type="hidden" name="userLat" value={props.userLat} />
      <input type="hidden" name="userLng" value={props.userLng} />
      <input type="hidden" name="hotelLat" value={props.hotelLat} />
      <input type="hidden" name="hotelLng" value={props.hotelLng} />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-dashed border-slate-950 pb-3">
        <div>
          <p className="font-american-diner text-3xl text-slate-950">Menu de Filtros</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-700">Elige comida, precio y distancia</p>
        </div>
        <span className="rounded-full border-2 border-slate-950 bg-red-700 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
          NYC Specials
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className={labelClass}>Tipo de comida</span>
          <select name="cuisine" defaultValue={props.cuisine} className={selectClass}>
            <option value="">Todo el menu</option>
            <option value="pizza">Pizza</option>
            <option value="burger">Burgers</option>
            <option value="italian">Italiana</option>
            <option value="japanese">Japonesa</option>
            <option value="korean">Coreana</option>
            <option value="mexican">Mexicana</option>
            <option value="deli">Deli</option>
            <option value="bagel">Bagels</option>
            <option value="dessert">Postres</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Precio medio</span>
          <select name="priceRange" defaultValue={props.priceRange} className={selectClass}>
            <option value="">Cualquier precio</option>
            <option value="under-20">Menos de $20</option>
            <option value="20-35">$20 - $35</option>
            <option value="35-60">$35 - $60</option>
            <option value="60-100">$60 - $100</option>
            <option value="over-100">Mas de $100</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Desde mi ubicacion</span>
          <select name="maxDistanceFromUserKm" defaultValue={props.maxDistanceFromUserKm} className={selectClass}>
            <option value="">Sin limite</option>
            <option value="1">1 km</option>
            <option value="3">3 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Desde donde duermo</span>
          <select name="maxDistanceFromHotelKm" defaultValue={props.maxDistanceFromHotelKm} className={selectClass}>
            <option value="">Sin limite</option>
            <option value="1">1 km</option>
            <option value="3">3 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" className="rounded-md border-2 border-slate-950 bg-slate-950 px-5 py-2 text-sm font-black uppercase tracking-wide text-stone-50 shadow-[3px_3px_0_#b91c1c]">
          Aplicar filtros
        </button>
        <Link href="/restaurants" className="rounded-md border-2 border-slate-950 bg-white px-5 py-2 text-center text-sm font-black uppercase tracking-wide text-slate-950 shadow-[3px_3px_0_#111827] hover:bg-[#fffdf4]">
          Restaurar
        </Link>
        <UseMyLocationButton />
      </div>
    </form>
  );
}
