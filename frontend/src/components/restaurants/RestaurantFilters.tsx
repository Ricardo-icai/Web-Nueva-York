"use client";

import Link from "next/link";
import UseMyLocationButton from "@/components/restaurants/UseMyLocationButton";

type Props = {
  cuisine: string;
  priceLevel: string;
  maxDistanceFromUserKm: string;
  maxDistanceFromHotelKm: string;
  userLat: string;
  userLng: string;
  hotelLat: string;
  hotelLng: string;
};

export default function RestaurantFilters(props: Props) {
  return (
    <form className="grid gap-3 md:grid-cols-5">
      <input type="hidden" name="userLat" value={props.userLat} />
      <input type="hidden" name="userLng" value={props.userLng} />
      <input type="hidden" name="hotelLat" value={props.hotelLat} />
      <input type="hidden" name="hotelLng" value={props.hotelLng} />
      <select name="cuisine" defaultValue={props.cuisine} className="rounded-xl border border-stone-300 px-3 py-2 text-sm">
        <option value="">Tipo de comida</option>
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
      <select name="priceLevel" defaultValue={props.priceLevel} className="rounded-xl border border-stone-300 px-3 py-2 text-sm">
        <option value="">Precio</option>
        <option value="1">$</option>
        <option value="2">$$</option>
        <option value="3">$$$</option>
        <option value="4">$$$$</option>
      </select>
      <select name="maxDistanceFromUserKm" defaultValue={props.maxDistanceFromUserKm} className="rounded-xl border border-stone-300 px-3 py-2 text-sm">
        <option value="">Distancia desde mi ubicacion</option>
        <option value="1">1 km</option>
        <option value="3">3 km</option>
        <option value="5">5 km</option>
        <option value="10">10 km</option>
      </select>
      <select name="maxDistanceFromHotelKm" defaultValue={props.maxDistanceFromHotelKm} className="rounded-xl border border-stone-300 px-3 py-2 text-sm">
        <option value="">Distancia desde donde duermo</option>
        <option value="1">1 km</option>
        <option value="3">3 km</option>
        <option value="5">5 km</option>
        <option value="10">10 km</option>
      </select>
      <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-stone-50">Aplicar</button>
      <Link href="/restaurants" className="rounded-full border border-stone-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-stone-100">
        Restaurar filtros
      </Link>
      <UseMyLocationButton />
    </form>
  );
}
