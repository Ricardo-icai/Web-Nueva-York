"use client";

import { useState } from "react";
import { buildTransitPlannerUrl } from "@/lib/transit-planner";
import { getDeviceCoordinates } from "@/lib/geolocation";

type Props = {
  destinationQuery: string;
  compact?: boolean;
};

export default function UseMyLocationMapButton({ destinationQuery, compact = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");

  function handleClick() {
    setError("");
    setLoading(true);
    void getDeviceCoordinates()
      .then(({ lat, lng }) => setCoords({ lat, lng }))
      .catch((message: unknown) => {
        setError(message instanceof Error ? message.message : "No he podido obtener tu ubicación.");
      })
      .finally(() => setLoading(false));
  }

  const directionsUrl = coords
    ? buildTransitPlannerUrl({ name: destinationQuery, origin: coords })
    : "";

  return (
    <div className={compact ? "space-y-2" : "rounded-md border border-white/15 bg-white/8 p-4"}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-sm bg-[#D4AF37] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#0A2342] disabled:opacity-60"
      >
        {loading ? "Buscando ubicación..." : "Saber dónde estoy"}
      </button>
      {coords ? (
        <div className="mt-2 text-sm leading-6 text-white/78">
          <p>
            Estás aprox. en {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}.
          </p>
          <a href={directionsUrl} className="font-black text-[#D4AF37] underline underline-offset-4">
            Cómo llegar en transporte público
          </a>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm font-bold text-red-200">{error}</p> : null}
    </div>
  );
}
