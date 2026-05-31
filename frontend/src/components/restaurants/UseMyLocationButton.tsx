"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UseMyLocationButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  function updateWithLocation(lat: number, lng: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("hotelLat", String(lat));
    next.set("hotelLng", String(lng));
    router.push(`/restaurants?${next.toString()}`);
  }

  function handleClick() {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateWithLocation(pos.coords.latitude, pos.coords.longitude);
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-60"
    >
      {loading ? "Buscando ubicacion..." : "Usar mi ubicacion exacta"}
    </button>
  );
}
