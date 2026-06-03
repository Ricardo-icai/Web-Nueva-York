"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AUTH_UPDATED_EVENT, readSession, userScopedStorageKey } from "@/lib/auth";

type SavedTravelProfile = {
  name?: string;
  nationality?: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  pace?: string;
  accommodation?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
};

const TRAVEL_PROFILE_KEY = "nyc_travel_profile_v1";

function missingProfileFields(profile: SavedTravelProfile | null) {
  const missing: string[] = [];
  if (!profile?.name?.trim()) missing.push("nombre del viaje");
  if (!profile?.nationality?.trim()) missing.push("nacionalidad");
  if (!profile?.startDate) missing.push("fecha de llegada");
  if (!profile?.endDate) missing.push("fecha de salida");
  if (!profile?.travelers || profile.travelers < 1) missing.push("viajeros");
  if (!profile?.pace) missing.push("ritmo");
  if (
    !profile?.accommodation?.address?.trim() ||
    typeof profile.accommodation.lat !== "number" ||
    typeof profile.accommodation.lng !== "number"
  ) {
    missing.push("alojamiento");
  }
  return missing;
}

export default function ProfileCompletionBanner() {
  const pathname = usePathname();
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    function refresh() {
      const session = readSession();
      if (!session?.email) {
        setMissing([]);
        return;
      }

      try {
        const raw = localStorage.getItem(userScopedStorageKey(TRAVEL_PROFILE_KEY, session.email));
        const profile = raw ? (JSON.parse(raw) as SavedTravelProfile) : null;
        setMissing(missingProfileFields(profile));
      } catch {
        setMissing(missingProfileFields(null));
      }
    }

    refresh();
    window.addEventListener(AUTH_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [pathname]);

  if (pathname === "/onboarding" || missing.length === 0) return null;

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-5 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-amber-950">
          Completa tu perfil del viaje para que las recomendaciones, filtros y rutas se ajusten mejor. Falta: {missing.join(", ")}.
        </p>
        <Link
          href="/onboarding"
          className="rounded-sm bg-[#0A2342] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white"
        >
          Completar perfil
        </Link>
      </div>
    </div>
  );
}
