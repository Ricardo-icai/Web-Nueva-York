"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { AUTH_UPDATED_EVENT, readSession } from "@/lib/auth";
import { loadTravelProfile } from "@/lib/user-data";

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

type MissingFieldKey =
  | "tripName"
  | "nationality"
  | "arrivalDate"
  | "departureDate"
  | "travelers"
  | "pace"
  | "accommodation";

function missingProfileFields(profile: SavedTravelProfile | null) {
  const missing: MissingFieldKey[] = [];
  if (!profile?.name?.trim()) missing.push("tripName");
  if (!profile?.nationality?.trim()) missing.push("nationality");
  if (!profile?.startDate) missing.push("arrivalDate");
  if (!profile?.endDate) missing.push("departureDate");
  if (!profile?.travelers || profile.travelers < 1) missing.push("travelers");
  if (!profile?.pace) missing.push("pace");
  if (
    !profile?.accommodation?.address?.trim() ||
    typeof profile.accommodation.lat !== "number" ||
    typeof profile.accommodation.lng !== "number"
  ) {
    missing.push("accommodation");
  }
  return missing;
}

export default function ProfileCompletionBanner() {
  const pathname = usePathname();
  const [missing, setMissing] = useState<MissingFieldKey[]>([]);
  const { dictionary } = useLanguage();

  useEffect(() => {
    async function refresh() {
      const session = readSession();
      if (!session?.email) {
        setMissing([]);
        return;
      }

      const profile = (await loadTravelProfile(TRAVEL_PROFILE_KEY)) as SavedTravelProfile | null;
      setMissing(missingProfileFields(profile));
    }

    void refresh();
    window.addEventListener(AUTH_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [pathname]);

  if (pathname === "/onboarding" || missing.length === 0) return null;

  return (
    <div className="border-b-2 border-slate-950 bg-[#fff3d1] px-5 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-black text-slate-950">
          {dictionary.profileBanner.missingPrefix} {missing.map((field) => dictionary.profileBanner.fields[field]).join(", ")}.
        </p>
        <Link
          href="/onboarding"
          className="nyc-action rounded-md px-4 py-2 text-xs"
        >
          {dictionary.profileBanner.completeProfile}
        </Link>
      </div>
    </div>
  );
}
