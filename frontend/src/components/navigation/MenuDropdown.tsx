"use client";

import Link from "next/link";
import { useState } from "react";

const menuLinks = [
  { href: "/", label: "Home" },
  { href: "/route-planner", label: "Organizame la ruta" },
  { href: "/onboarding", label: "Editar perfil" },
  { href: "/map", label: "Mapa" },
  { href: "/restaurants", label: "Tengo Hambre" },
  { href: "/culture", label: "Cultura" },
  { href: "/viewpoints", label: "Roof Tops" },
  { href: "/fourth-of-july", label: "4 de Julio" },
];

export default function MenuDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-stone-50 hover:bg-slate-800"
        aria-expanded={open}
        aria-controls="main-navigation-drawer"
      >
        Menu
      </button>

      <div
        className={`fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        id="main-navigation-drawer"
        className={`fixed left-0 top-0 z-50 h-dvh w-[min(82vw,340px)] border-r border-stone-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-stone-200 bg-[#0A2342] px-5 py-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D4AF37]">NYC Family Planner</p>
                <p className="mt-1 font-display text-2xl font-bold">Menu</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-xl font-bold hover:bg-white/10"
                aria-label="Cerrar menu"
              >
                x
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            {menuLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-stone-100 hover:text-[#C1121F]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-stone-200 p-4 text-xs font-semibold leading-5 text-slate-500">
            Eventos, mapas, cultura y planes de Nueva York en un solo sitio.
          </div>
        </div>
      </aside>
    </>
  );
}
