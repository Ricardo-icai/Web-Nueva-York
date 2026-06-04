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
        className="max-w-44 truncate rounded-md border-2 border-slate-950 bg-white px-3 py-2 text-xs font-black text-slate-800 shadow-[3px_3px_0_#111827] transition hover:-translate-y-0.5 hover:bg-[#fffdf4]"
        title={email}
      >
        {email}
      </Link>
      <button
        type="button"
        onClick={() => void signOutCurrentUser()}
        className="rounded-md border-2 border-slate-950 bg-red-700 px-3 py-2 text-xs font-black uppercase tracking-wide text-white shadow-[3px_3px_0_#111827] transition hover:-translate-y-0.5 hover:bg-red-800"
      >
        Salir
      </button>
    </div>
  );
}
