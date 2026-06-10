"use client";

import { useEffect, useMemo, useState } from "react";
import { getRestaurantLogoCandidates } from "@/lib/restaurants/restaurant-logos";

type Props = {
  name: string;
  officialWebsite?: string | null;
  fallbackImageUrl: string;
  className?: string;
};

export default function RestaurantLogoImage({
  name,
  officialWebsite,
  fallbackImageUrl,
  className = "h-full w-full bg-white object-contain p-6",
}: Props) {
  const logoCandidates = useMemo(() => getRestaurantLogoCandidates(officialWebsite), [officialWebsite]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const placeholderSrc = useMemo(() => {
    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "NY";

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <rect width="240" height="240" rx="28" fill="#fff8e1" />
        <rect x="12" y="12" width="216" height="216" rx="22" fill="#ffffff" stroke="#111827" stroke-width="8" />
        <text x="120" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="82" font-weight="700" fill="#0A2342">${initials}</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }, [name]);
  const fallbackSrc = fallbackImageUrl?.trim() ? fallbackImageUrl : placeholderSrc;
  const src = logoCandidates[candidateIndex] ?? fallbackSrc;
  const isLogo = candidateIndex < logoCandidates.length;

  useEffect(() => {
    setCandidateIndex(0);
  }, [officialWebsite, fallbackImageUrl, name]);

  return (
    <img
      src={src}
      alt={isLogo ? `${name} logo` : name}
      className={isLogo ? className : "h-full w-full object-cover"}
      onError={() => setCandidateIndex((current) => current + 1)}
      loading="lazy"
      decoding="async"
    />
  );
}
