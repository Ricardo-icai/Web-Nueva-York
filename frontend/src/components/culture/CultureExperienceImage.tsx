"use client";

import { useMemo, useState } from "react";

type Props = {
  name: string;
  primary: string;
  fallback: string;
};

const DEFAULT_CULTURE_IMAGE =
  "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=84";

export default function CultureExperienceImage({ name, primary, fallback }: Props) {
  const sources = useMemo(
    () => Array.from(new Set([primary, fallback, DEFAULT_CULTURE_IMAGE].filter(Boolean))),
    [primary, fallback],
  );
  const [index, setIndex] = useState(0);

  return (
    <img
      src={sources[index]}
      alt={name}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={() => setIndex((current) => Math.min(current + 1, sources.length - 1))}
    />
  );
}
