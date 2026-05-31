"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { nycHeroImages } from "@/lib/visuals";

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % nycHeroImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0">
      {nycHeroImages.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Nueva York premium"
          fill
          priority={i === 0}
          className={`object-cover transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
          sizes="100vw"
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/35" />
    </div>
  );
}
