"use client";

export default function RooftopCocktailLoader() {
  return (
    <div className="rounded-lg border-2 border-slate-950 bg-[#101820] px-6 py-10 text-center text-white shadow-[6px_6px_0_#b91c1c]">
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed border-amber-300 motion-safe:animate-spin">
        <span className="text-6xl motion-safe:animate-pulse" aria-hidden="true">
          🍸
        </span>
      </div>
      <p className="mt-5 font-american-diner text-3xl">Roof Tops</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-amber-200">
        Agitando skyline, copas y vistas
      </p>
    </div>
  );
}
