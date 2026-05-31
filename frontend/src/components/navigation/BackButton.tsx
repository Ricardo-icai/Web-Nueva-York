"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

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
      className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-stone-100"
    >
      Volver
    </button>
  );
}
