"use client";

import { useMemo, useState } from "react";

type Props = {
  alt: string;
  className?: string;
  primary: string;
  fallback?: string;
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80";

export default function SafeImage({ alt, className, primary, fallback }: Props) {
  const sources = useMemo(
    () => Array.from(new Set([primary, fallback, DEFAULT_IMAGE].filter(Boolean))),
    [fallback, primary],
  );
  const [index, setIndex] = useState(0);

  return (
    <img
      src={sources[index]}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className ?? "h-full w-full object-cover"}
      onError={() => setIndex((current) => Math.min(current + 1, sources.length - 1))}
    />
  );
}
