"use client";

import { useState } from "react";
import { readSession, readUsers, type StoredSession, type StoredUser } from "@/lib/auth";

export default function ProfilePage() {
  const [profile] = useState<{ session: StoredSession | null; user: StoredUser | null }>(() => {
    const currentSession = readSession();
    return {
      session: currentSession,
      user: currentSession?.email ? readUsers()[currentSession.email] ?? null : null,
    };
  });

  const { session, user } = profile;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <section className="rounded-lg border-2 border-slate-950 bg-[#fff3d1] p-6 shadow-[6px_6px_0_#111827]">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Perfil</p>
        <h1 className="mt-2 font-american-diner text-5xl text-slate-950">Tu sesion</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border-2 border-slate-950 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">Correo</p>
            <p className="mt-2 break-words text-lg font-black text-slate-950">{session?.email ?? "Sin sesion"}</p>
          </div>
          <div className="rounded-md border-2 border-slate-950 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">Estado</p>
            <p className="mt-2 text-lg font-black text-slate-950">{user?.confirmed ? "Correo confirmado" : "Pendiente"}</p>
          </div>
          <div className="rounded-md border-2 border-slate-950 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">Sesion iniciada</p>
            <p className="mt-2 text-sm font-bold text-slate-800">
              {session?.startedAt ? new Date(session.startedAt).toLocaleString("es-ES") : "No disponible"}
            </p>
          </div>
          <div className="rounded-md border-2 border-slate-950 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">Usuario creado</p>
            <p className="mt-2 text-sm font-bold text-slate-800">
              {user?.createdAt ? new Date(user.createdAt).toLocaleString("es-ES") : "No disponible"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
