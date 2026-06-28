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
          className={`object-cover transition-[opacity,transform] duration-[1400ms] ease-out ${i === index ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
          sizes="100vw"
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,35,66,0.88),rgba(10,35,66,0.52),rgba(10,35,66,0.18)),linear-gradient(180deg,rgba(10,35,66,0.12),rgba(10,35,66,0.84))]" />
    </div>
  );
}
