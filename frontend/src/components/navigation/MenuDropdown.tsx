"use client";

import Link from "next/link";
import { useState } from "react";

const menuLinks = [
  { href: "/", label: "Home" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/planner", label: "Planner" },
  { href: "/map", label: "Mapa" },
  { href: "/restaurants", label: "Tengo Hambre" },
  { href: "/culture", label: "Cultura" },
  { href: "/viewpoints", label: "Miradores" },
  { href: "/photo-spots", label: "Photo Spots" },
  { href: "/sail4th-elcano", label: "Sail4th / Elcano" },
  { href: "/fourth-of-july", label: "4 de Julio" },
  { href: "/world-cup-2026", label: "Mundial 2026" },
  { href: "/profile", label: "Perfil" },
  { href: "/settings", label: "Settings" },
];

export default function MenuDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-stone-50 hover:bg-slate-800"
      >
        Menu
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
          {menuLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-stone-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
