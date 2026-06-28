"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  AUTH_UPDATED_EVENT,
  clearLegacyLocalUsers,
  getCurrentAuthUser,
  isSupabaseConfigured,
  normalizeEmail,
  saveSession,
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
  const { dictionary, language } = useLanguage();
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
      if (!isSupabaseConfigured()) {
        if (active) {
          setAuthenticated(false);
          setReady(true);
        }
        return;
      }

      clearLegacyLocalUsers();
      const user = await getCurrentAuthUser();
      if (active) {
        setAuthenticated(Boolean(user?.email));
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
      if (!supabaseLogin.handledBySupabase) {
        setMessage(language === "en" ? "This app is not connected to Supabase." : "La aplicación no está conectada a Supabase.");
        return;
      }
      if (supabaseLogin.error) {
        setMessage(language === "en" ? "Incorrect email or password." : "Correo o contraseña incorrectos.");
        return;
      }
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
        setMessage(language === "en" ? "Enter a valid email address." : "Introduce un correo válido.");
        return;
      }

      if (password.length < 6) {
        setMessage(language === "en" ? "Password must be at least 6 characters long." : "La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      const supabaseSignup = await signUpWithEmailPassword(cleanEmail, password);
      if (!supabaseSignup.handledBySupabase) {
        setMessage(language === "en" ? "This app is not connected to Supabase." : "La aplicación no está conectada a Supabase.");
        return;
      }
      if (supabaseSignup.emailAlreadyRegistered) {
        setEmail("");
        setMessage(
          language === "en"
            ? "That email is already registered. Use a different email to create a new account."
            : "Este correo ya está registrado. Introduce otro correo para crear una cuenta nueva.",
        );
        return;
      }
      if (supabaseSignup.error) {
        setMessage(supabaseSignup.error);
        return;
      }
      if (supabaseSignup.needsEmailConfirmation) {
        setMessage(
          language === "en"
            ? "Supabase email confirmation is enabled. Disable 'Confirm email' in Authentication > Providers > Email to allow email-and-password sign-up only."
            : "Supabase tiene activada la confirmación por email. Desactiva 'Confirm email' en Authentication > Providers > Email para registrar solo con correo y contraseña.",
        );
        return;
      }
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
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,35,66,0.86),rgba(10,35,66,0.48),rgba(10,35,66,0.16)),linear-gradient(180deg,rgba(10,35,66,0.16),rgba(10,35,66,0.88))]" />
        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-end">
          <div className="max-w-4xl pb-8">
            <p className="w-fit rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/12 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#D4AF37]">
              {dictionary.common.appName}
            </p>
            <h1 className="mt-5 font-american-diner text-5xl leading-[0.95] sm:text-7xl">{dictionary.auth.planWithAccount}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-xl">{dictionary.auth.accountIntro}</p>
            <button type="button" onClick={() => setStartedPlanning(true)} className="nyc-action mt-8 px-6 py-4 text-sm">
              {dictionary.auth.enter}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="nyc-page-shell page-bg-profile min-h-screen px-4 py-8 text-slate-950 sm:px-6">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <p className="w-fit rounded-full border border-slate-950 bg-red-700 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
            {dictionary.auth.privatePlanner}
          </p>
          <div className="space-y-3">
            <h1 className="font-american-diner text-5xl leading-none text-slate-950 sm:text-7xl">{dictionary.auth.accessTrip}</h1>
            <p className="max-w-xl text-base font-semibold text-slate-700 sm:text-lg">{dictionary.auth.accessTripCopy}</p>
            <p className="max-w-xl text-sm font-bold text-red-700">
              {isSupabaseConfigured() ? dictionary.auth.supabaseConnected : dictionary.auth.supabaseMissing}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="nyc-hard-card-white p-5 sm:p-6">
          <div className="border-b border-slate-950/20 pb-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">{mode === "login" ? dictionary.auth.login : dictionary.auth.register}</p>
            <h2 className="mt-1 font-american-diner text-4xl text-slate-950">
              {dictionary.auth.email} {language === "en" ? "&" : "y"} {dictionary.auth.password}
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            {!isSupabaseConfigured() ? (
              <div className="rounded-2xl border border-slate-950/15 bg-[#fff3d1] p-4 text-sm font-bold text-slate-900">{dictionary.auth.supabaseOnly}</div>
            ) : null}
            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">{dictionary.auth.email}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="h-12 w-full rounded-2xl border-2 border-slate-950 bg-[#fffdf4] px-3 text-base font-bold outline-none focus:ring-2 focus:ring-red-700"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">{dictionary.auth.password}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="h-12 w-full rounded-2xl border-2 border-slate-950 bg-[#fffdf4] px-3 text-base font-bold outline-none focus:ring-2 focus:ring-red-700"
              />
            </label>
          </div>

          {message ? <p className="mt-4 text-sm font-bold text-red-700">{message}</p> : null}

          <button type="submit" disabled={busy || !isSupabaseConfigured()} className="nyc-action mt-5 h-12 w-full px-4 text-sm disabled:cursor-wait disabled:opacity-70">
            {busy ? dictionary.auth.processing : mode === "login" ? dictionary.auth.login : dictionary.auth.createUser}
          </button>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-bold">
            {mode === "login" ? (
              <button type="button" onClick={() => setMode("register")} className="text-red-700 underline underline-offset-4">
                {dictionary.auth.createAccount}
              </button>
            ) : (
              <button type="button" onClick={() => setMode("login")} className="text-red-700 underline underline-offset-4">
                {dictionary.auth.alreadyHaveAccount}
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
