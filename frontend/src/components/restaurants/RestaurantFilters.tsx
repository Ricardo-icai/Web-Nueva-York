"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import UseMyLocationButton from "@/components/restaurants/UseMyLocationButton";
import { loadTravelProfile } from "@/lib/user-data";

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

type SavedTravelProfile = {
  accommodation?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
};

const TRAVEL_PROFILE_KEY = "nyc_travel_profile_v1";

export default function RestaurantFilters(props: Props) {
  const { dictionary, language } = useLanguage();
  const [savedHotel, setSavedHotel] = useState<{ address: string; lat: string; lng: string } | null>(null);
  const selectClass =
    "h-11 w-full rounded-md border-2 border-slate-950 bg-[#fffdf4] px-3 text-sm font-black uppercase tracking-wide text-slate-950 shadow-[3px_3px_0_#111827] outline-none transition focus:bg-white focus:ring-2 focus:ring-red-600";
  const labelClass = "text-[11px] font-black uppercase tracking-[0.18em] text-red-700";
  const hotelLat = props.hotelLat || savedHotel?.lat || "";
  const hotelLng = props.hotelLng || savedHotel?.lng || "";

  useEffect(() => {
    async function loadSavedHotel() {
      const profile = (await loadTravelProfile(TRAVEL_PROFILE_KEY)) as SavedTravelProfile | null;
      if (!profile) return;
      const accommodation = profile.accommodation;
      if (
        accommodation?.address &&
        typeof accommodation.lat === "number" &&
        Number.isFinite(accommodation.lat) &&
        typeof accommodation.lng === "number" &&
        Number.isFinite(accommodation.lng)
      ) {
        setSavedHotel({
          address: accommodation.address,
          lat: String(accommodation.lat),
          lng: String(accommodation.lng),
        });
      }
    }
    void loadSavedHotel();
  }, []);

  return (
    <form className="rounded-lg border-2 border-slate-950 bg-[#fff3d1] p-4 shadow-[6px_6px_0_#111827]">
      <input type="hidden" name="userLat" value={props.userLat} />
      <input type="hidden" name="userLng" value={props.userLng} />
      <input type="hidden" name="hotelLat" value={hotelLat} />
      <input type="hidden" name="hotelLng" value={hotelLng} />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-dashed border-slate-950 pb-3">
        <div>
          <p className="font-american-diner text-3xl text-slate-950">{dictionary.restaurantFilters.title}</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-700">{dictionary.restaurantFilters.subtitle}</p>
          {savedHotel ? (
            <p className="mt-2 text-xs font-black uppercase tracking-wide text-emerald-800">
              {dictionary.restaurantFilters.sleepingAt} {savedHotel.address}
            </p>
          ) : (
            <p className="mt-2 text-xs font-black uppercase tracking-wide text-red-700">{dictionary.restaurantFilters.sleepingFallback}</p>
          )}
        </div>
        <span className="rounded-full border-2 border-slate-950 bg-red-700 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
          {dictionary.restaurantFilters.specials}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className={labelClass}>{dictionary.restaurantFilters.cuisine}</span>
          <select name="cuisine" defaultValue={props.cuisine} className={selectClass}>
            <option value="">{dictionary.restaurantFilters.allMenu}</option>
            <option value="pizza">Pizza</option>
            <option value="burger">{language === "en" ? "Burgers" : "Burgers"}</option>
            <option value="italian">{language === "en" ? "Italian" : "Italiana"}</option>
            <option value="japanese">{language === "en" ? "Japanese" : "Japonesa"}</option>
            <option value="korean">{language === "en" ? "Korean" : "Coreana"}</option>
            <option value="mexican">{language === "en" ? "Mexican" : "Mexicana"}</option>
            <option value="deli">Deli</option>
            <option value="bagel">Bagels</option>
            <option value="dessert">{language === "en" ? "Desserts" : "Postres"}</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>{dictionary.restaurantFilters.price}</span>
          <select name="priceRange" defaultValue={props.priceRange} className={selectClass}>
            <option value="">{dictionary.restaurantFilters.anyPrice}</option>
            <option value="under-20">{language === "en" ? "Under $20" : "Menos de $20"}</option>
            <option value="20-35">$20 - $35</option>
            <option value="35-60">$35 - $60</option>
            <option value="60-100">$60 - $100</option>
            <option value="over-100">{language === "en" ? "Over $100" : "Más de $100"}</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>{dictionary.restaurantFilters.nearMe}</span>
          <select name="maxDistanceFromUserKm" defaultValue={props.maxDistanceFromUserKm} className={selectClass}>
            <option value="">{dictionary.restaurantFilters.noLimit}</option>
            <option value="1">1 km</option>
            <option value="3">3 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>{dictionary.restaurantFilters.nearHotel}</span>
          <select name="maxDistanceFromHotelKm" defaultValue={props.maxDistanceFromHotelKm} className={selectClass}>
            <option value="">{dictionary.restaurantFilters.noLimit}</option>
            <option value="1">1 km</option>
            <option value="3">3 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" className="rounded-md border-2 border-slate-950 bg-slate-950 px-5 py-2 text-sm font-black uppercase tracking-wide text-stone-50 shadow-[3px_3px_0_#b91c1c]">
          {dictionary.restaurantFilters.apply}
        </button>
        <Link href="/restaurants" className="rounded-md border-2 border-slate-950 bg-white px-5 py-2 text-center text-sm font-black uppercase tracking-wide text-slate-950 shadow-[3px_3px_0_#111827] hover:bg-[#fffdf4]">
          {dictionary.restaurantFilters.reset}
        </Link>
        <UseMyLocationButton />
      </div>
    </form>
  );
}
