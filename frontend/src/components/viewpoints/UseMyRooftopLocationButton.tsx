"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UseMyRooftopLocationButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  function updateWithLocation(lat: number, lng: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("userLat", String(lat));
    next.set("userLng", String(lng));
    router.push(`/viewpoints?${next.toString()}`);
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
      className="rounded-md border-2 border-slate-950 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-950 shadow-[3px_3px_0_#111827] hover:bg-[#fffdf4] disabled:opacity-60"
    >
      {loading ? "Buscando ubicacion..." : "Usar mi ubicacion"}
    </button>
  );
}
