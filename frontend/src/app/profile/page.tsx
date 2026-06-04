"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, readSession, readUsers, type StoredSession, type StoredUser } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type ProfileState = {
  session: StoredSession | null;
  user: StoredUser | null;
  provider: "supabase" | "local";
  confirmed: boolean;
  createdAt?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileState>(() => {
    const currentSession = readSession();
    const localUser = currentSession?.email ? readUsers()[currentSession.email] ?? null : null;
    return {
      session: currentSession,
      user: localUser,
      provider: isSupabaseConfigured() ? "supabase" : "local",
      confirmed: Boolean(localUser?.confirmed),
      createdAt: localUser?.createdAt,
    };
  });

  useEffect(() => {
    let active = true;
    async function loadSupabaseProfile() {
      if (!isSupabaseConfigured()) return;
      const supabase = await getSupabaseBrowserClient();
      const { data } = await supabase!.auth.getUser();
      if (!active || !data.user?.email) return;
      setProfile({
        session: { email: data.user.email, startedAt: data.user.last_sign_in_at ?? new Date().toISOString() },
        user: null,
        provider: "supabase",
        confirmed: Boolean(data.user.email_confirmed_at),
        createdAt: data.user.created_at,
      });
    }

    void loadSupabaseProfile();
    return () => {
      active = false;
    };
  }, []);

  const { session, user } = profile;

  return (
    <main className="nyc-page-shell page-bg-profile">
      <section className="nyc-content-shell mx-auto max-w-4xl p-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Perfil</p>
        <h1 className="mt-2 font-american-diner text-5xl text-slate-950">Tu sesion</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border-2 border-slate-950 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">Correo</p>
            <p className="mt-2 break-words text-lg font-black text-slate-950">{session?.email ?? "Sin sesion"}</p>
          </div>
          <div className="rounded-md border-2 border-slate-950 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">Estado</p>
            <p className="mt-2 text-lg font-black text-slate-950">
              {session?.email ? "Cuenta activa" : "Sin sesion"}
            </p>
          </div>
          <div className="rounded-md border-2 border-slate-950 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">Sistema</p>
            <p className="mt-2 text-lg font-black text-slate-950">
              {profile.provider === "supabase" ? "Supabase Auth" : "Local"}
            </p>
          </div>
          <div className="rounded-md border-2 border-slate-950 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">Usuario creado</p>
            <p className="mt-2 text-sm font-bold text-slate-800">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleString("es-ES") : "No disponible"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
