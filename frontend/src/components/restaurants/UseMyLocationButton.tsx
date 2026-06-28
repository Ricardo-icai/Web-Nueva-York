"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { getDeviceCoordinates } from "@/lib/geolocation";

export default function UseMyLocationButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dictionary, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateWithLocation(lat: number, lng: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("userLat", String(lat));
    next.set("userLng", String(lng));
    router.push(`/restaurants?${next.toString()}`);
  }

  function handleClick() {
    setError("");
    setLoading(true);
    void getDeviceCoordinates()
      .then(({ lat, lng }) => updateWithLocation(lat, lng))
      .catch((message: unknown) => {
        setError(message instanceof Error ? message.message : language === "en" ? "I couldn't get your location." : "No he podido obtener tu ubicación.");
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-60"
      >
        {loading ? (language === "en" ? "Finding location..." : "Buscando ubicación...") : dictionary.restaurantFilters.nearMe}
      </button>
      {error ? <p className="text-xs font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
