"use client";

import { useMemo, useState } from "react";
import { getRestaurantLogoCandidates } from "@/lib/restaurants/restaurant-logos";

type Props = {
  name: string;
  officialWebsite?: string | null;
  fallbackImageUrl: string;
  className?: string;
  sizes?: string;
};

export default function RestaurantLogoImage({
  name,
  officialWebsite,
  fallbackImageUrl,
  className = "h-full w-full bg-white object-contain p-6",
  sizes = "(max-width: 768px) 100vw, 33vw",
}: Props) {
  const logoCandidates = useMemo(() => getRestaurantLogoCandidates(officialWebsite), [officialWebsite]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const src = logoCandidates[candidateIndex] ?? fallbackImageUrl;
  const isLogo = candidateIndex < logoCandidates.length;

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
