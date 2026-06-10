"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDeviceCoordinates } from "@/lib/geolocation";

export default function UseMyRooftopLocationButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateWithLocation(lat: number, lng: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("userLat", String(lat));
    next.set("userLng", String(lng));
    router.push(`/viewpoints?${next.toString()}`);
  }

  function handleClick() {
    setError("");
    setLoading(true);
    void getDeviceCoordinates()
      .then(({ lat, lng }) => updateWithLocation(lat, lng))
      .catch((message: unknown) => {
        setError(message instanceof Error ? message.message : "No he podido obtener tu ubicacion.");
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-md border-2 border-slate-950 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-950 shadow-[3px_3px_0_#111827] hover:bg-[#fffdf4] disabled:opacity-60"
      >
        {loading ? "Buscando ubicacion..." : "Usar mi ubicacion"}
      </button>
      {error ? <p className="text-xs font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
