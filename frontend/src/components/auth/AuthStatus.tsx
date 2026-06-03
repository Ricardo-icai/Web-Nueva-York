"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_UPDATED_EVENT, readSession, signOutCurrentUser } from "@/lib/auth";

export default function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setEmail(readSession()?.email ?? null);
    refresh();
    window.addEventListener(AUTH_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!email) return null;

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href="/profile"
        className="max-w-44 truncate rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-100"
        title={email}
      >
        {email}
      </Link>
      <button
        type="button"
        onClick={() => void signOutCurrentUser()}
        className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-700 hover:bg-red-100"
      >
        Salir
      </button>
    </div>
  );
}
