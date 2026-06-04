"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_UPDATED_EVENT,
  getCurrentAuthUser,
  hashPassword,
  isSupabaseConfigured,
  normalizeEmail,
  readSession,
  readUsers,
  saveSession,
  saveUsers,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Props = {
  children: ReactNode;
};

type Mode = "login" | "register";

export default function AuthGate({ children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [startedPlanning, setStartedPlanning] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const cleanEmail = useMemo(() => normalizeEmail(email), [email]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (isSupabaseConfigured()) {
        const user = await getCurrentAuthUser();
        if (active) {
          setAuthenticated(Boolean(user?.email));
          setReady(true);
        }
        return;
      }

      const session = readSession();
      const users = readUsers();
      if (active) {
        setAuthenticated(Boolean(session?.email && users[session.email]));
        setReady(true);
      }
    };

    void refresh();
    let subscription: { unsubscribe: () => void } | undefined;
    void getSupabaseBrowserClient().then((supabase) => {
      subscription = supabase?.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          saveSession(session.user.email);
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
        setReady(true);
      }).data.subscription;
    });

    window.addEventListener(AUTH_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      active = false;
      subscription?.unsubscribe();
      window.removeEventListener(AUTH_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  async function handleLogin() {
    setBusy(true);
    setMessage("");
    try {
      const supabaseLogin = await signInWithEmailPassword(cleanEmail, password);
      if (supabaseLogin.handledBySupabase) {
        if (supabaseLogin.error) {
          setMessage("Correo o contrasena incorrectos.");
          return;
        }
        setAuthenticated(true);
        router.replace("/");
        return;
      }

      const users = readUsers();
      const user = users[cleanEmail];
      const passwordHash = await hashPassword(cleanEmail, password);

      if (!user || user.passwordHash !== passwordHash) {
        setMessage("Correo o contrasena incorrectos.");
        return;
      }

      users[cleanEmail] = { ...user, lastLoginAt: new Date().toISOString() };
      saveUsers(users);
      saveSession(cleanEmail);
      setAuthenticated(true);
      router.replace("/");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister() {
    setBusy(true);
    setMessage("");
    try {
      if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
        setMessage("Introduce un correo valido.");
        return;
      }

      if (password.length < 6) {
        setMessage("La contrasena debe tener al menos 6 caracteres.");
        return;
      }

      const supabaseSignup = await signUpWithEmailPassword(cleanEmail, password);
      if (supabaseSignup.handledBySupabase) {
        if (supabaseSignup.error) {
          setMessage(supabaseSignup.error);
          return;
        }
        if (supabaseSignup.needsEmailConfirmation) {
          setMessage("Supabase tiene activada la confirmacion por email. Desactiva 'Confirm email' en Authentication > Providers > Email para registrar solo con correo y contrasena.");
          return;
        }
        setAuthenticated(true);
        router.replace("/");
        return;
      }

      const users = readUsers();
      if (users[cleanEmail]) {
        setMessage("Este correo ya esta registrado. Entra con tu contrasena.");
        setMode("login");
        return;
      }

      users[cleanEmail] = {
        email: cleanEmail,
        passwordHash: await hashPassword(cleanEmail, password),
        confirmed: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      saveUsers(users);
      saveSession(cleanEmail);
      setAuthenticated(true);
      router.replace("/");
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "login") void handleLogin();
    if (mode === "register") void handleRegister();
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-red-700" />
      </div>
    );
  }

  if (authenticated) return <>{children}</>;

  if (!startedPlanning) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#0A2342] px-4 py-8 text-white sm:px-6">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(10,35,66,0.94), rgba(193,18,31,0.28)), url('https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=2200&q=82')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2342] via-[#0A2342]/40 to-transparent" />
        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-end">
          <div className="max-w-4xl pb-8">
            <p className="w-fit rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/12 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#D4AF37]">
              NYC Family Planner
            </p>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[0.95] sm:text-7xl">
              Planifica Nueva York con tu cuenta.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-xl">
              Para usar la web tienes que registrarte o iniciar sesion. Asi guardamos tu perfil, tu viaje y tus favoritos.
            </p>
            <button
              type="button"
              onClick={() => setStartedPlanning(true)}
              className="mt-8 rounded-sm bg-[#C1121F] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_45px_rgba(193,18,31,0.35)]"
            >
              Start Planning
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff3d1] px-4 py-8 text-slate-950 sm:px-6">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <p className="w-fit rounded-full border-2 border-slate-950 bg-red-700 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[3px_3px_0_#111827]">
            Private NYC Planner
          </p>
          <div className="space-y-3">
            <h1 className="font-american-diner text-5xl leading-none text-slate-950 sm:text-7xl">
              Entra a tu viaje de Nueva York
            </h1>
            <p className="max-w-xl text-base font-semibold text-slate-700 sm:text-lg">
              Guarda tu sesion, tus preferencias y tus favoritos por usuario antes de entrar en la web.
            </p>
            <p className="max-w-xl text-sm font-bold text-red-700">
              {isSupabaseConfigured()
                ? "Conectado a Supabase Auth: cada usuario queda registrado con su propia cuenta."
                : "Modo local hasta que anadas las claves de Supabase en .env.local."}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border-2 border-slate-950 bg-white p-5 shadow-[7px_7px_0_#111827] sm:p-6"
        >
          <div className="border-b-2 border-dashed border-slate-950 pb-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">
              {mode === "login" ? "Log in" : "Registro"}
            </p>
            <h2 className="mt-1 font-american-diner text-4xl text-slate-950">
              Usuario y contrasena
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">Correo</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="h-12 w-full rounded-md border-2 border-slate-950 bg-[#fffdf4] px-3 text-base font-bold outline-none focus:ring-2 focus:ring-red-700"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">Contrasena</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="h-12 w-full rounded-md border-2 border-slate-950 bg-[#fffdf4] px-3 text-base font-bold outline-none focus:ring-2 focus:ring-red-700"
              />
            </label>
          </div>

          {message ? <p className="mt-4 text-sm font-bold text-red-700">{message}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 h-12 w-full rounded-md border-2 border-slate-950 bg-red-700 px-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[4px_4px_0_#111827] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? "Procesando..." : mode === "login" ? "Entrar" : "Crear usuario"}
          </button>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-bold">
            {mode === "login" ? (
              <button type="button" onClick={() => setMode("register")} className="text-red-700 underline underline-offset-4">
                Crear cuenta
              </button>
            ) : (
              <button type="button" onClick={() => setMode("login")} className="text-red-700 underline underline-offset-4">
                Ya tengo cuenta
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
