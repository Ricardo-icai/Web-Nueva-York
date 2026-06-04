"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="rounded-md border-2 border-slate-950 bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-slate-900 shadow-[3px_3px_0_#111827] transition hover:-translate-y-0.5 hover:bg-[#fffdf4]"
    >
      Volver
    </button>
  );
}
