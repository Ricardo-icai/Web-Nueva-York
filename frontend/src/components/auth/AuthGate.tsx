"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AUTH_UPDATED_EVENT,
  hashPassword,
  normalizeEmail,
  readSession,
  readUsers,
  saveSession,
  saveUsers,
} from "@/lib/auth";

type Props = {
  children: ReactNode;
};

type Mode = "login" | "register" | "confirm";

function createConfirmationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function AuthGate({ children }: Props) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [typedCode, setTypedCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const cleanEmail = useMemo(() => normalizeEmail(email), [email]);

  useEffect(() => {
    const refresh = () => {
      const session = readSession();
      const users = readUsers();
      setAuthenticated(Boolean(session?.email && users[session.email]?.confirmed));
      setReady(true);
    };

    refresh();
    window.addEventListener(AUTH_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  async function handleLogin() {
    setBusy(true);
    setMessage("");
    try {
      const users = readUsers();
      const user = users[cleanEmail];
      const passwordHash = await hashPassword(cleanEmail, password);

      if (!user || user.passwordHash !== passwordHash) {
        setMessage("Correo o contrasena incorrectos.");
        return;
      }

      if (!user.confirmed) {
        const nextCode = createConfirmationCode();
        setConfirmCode(nextCode);
        setMode("confirm");
        setMessage("Confirma el correo antes de entrar.");
        return;
      }

      users[cleanEmail] = { ...user, lastLoginAt: new Date().toISOString() };
      saveUsers(users);
      saveSession(cleanEmail);
      setAuthenticated(true);
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

      const users = readUsers();
      if (users[cleanEmail]?.confirmed) {
        setMessage("Este correo ya esta registrado. Entra con tu contrasena.");
        setMode("login");
        return;
      }

      const nextCode = createConfirmationCode();
      users[cleanEmail] = {
        email: cleanEmail,
        passwordHash: await hashPassword(cleanEmail, password),
        confirmed: false,
        createdAt: new Date().toISOString(),
      };
      saveUsers(users);
      setConfirmCode(nextCode);
      setTypedCode("");
      setMode("confirm");
      setMessage("Te pido confirmacion del correo para crear tu sesion.");
    } finally {
      setBusy(false);
    }
  }

  function handleConfirm() {
    setMessage("");
    if (typedCode.trim() !== confirmCode) {
      setMessage("El codigo no coincide.");
      return;
    }

    const users = readUsers();
    const user = users[cleanEmail];
    if (!user) {
      setMode("register");
      setMessage("Vuelve a crear el usuario.");
      return;
    }

    users[cleanEmail] = { ...user, confirmed: true, lastLoginAt: new Date().toISOString() };
    saveUsers(users);
    saveSession(cleanEmail);
    setAuthenticated(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "login") void handleLogin();
    if (mode === "register") void handleRegister();
    if (mode === "confirm") handleConfirm();
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-red-700" />
      </div>
    );
  }

  if (authenticated) return <>{children}</>;

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
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border-2 border-slate-950 bg-white p-5 shadow-[7px_7px_0_#111827] sm:p-6"
        >
          <div className="border-b-2 border-dashed border-slate-950 pb-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">
              {mode === "login" ? "Log in" : mode === "register" ? "Registro" : "Confirmacion"}
            </p>
            <h2 className="mt-1 font-american-diner text-4xl text-slate-950">
              {mode === "confirm" ? "Confirma tu correo" : "Usuario y contrasena"}
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">Correo</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={mode === "confirm"}
                required
                autoComplete="email"
                className="h-12 w-full rounded-md border-2 border-slate-950 bg-[#fffdf4] px-3 text-base font-bold outline-none focus:ring-2 focus:ring-red-700 disabled:opacity-70"
              />
            </label>

            {mode !== "confirm" ? (
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
            ) : (
              <div className="space-y-3">
                <div className="rounded-md border-2 border-red-700 bg-red-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Codigo demo</p>
                  <p className="mt-1 font-mono text-2xl font-black tracking-[0.18em] text-slate-950">{confirmCode}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    Sin servicio de email configurado, lo muestro aqui para poder confirmar el flujo.
                  </p>
                </div>
                <label className="block space-y-1">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">Codigo de confirmacion</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={typedCode}
                    onChange={(event) => setTypedCode(event.target.value)}
                    required
                    className="h-12 w-full rounded-md border-2 border-slate-950 bg-[#fffdf4] px-3 text-base font-bold tracking-[0.16em] outline-none focus:ring-2 focus:ring-red-700"
                  />
                </label>
              </div>
            )}
          </div>

          {message ? <p className="mt-4 text-sm font-bold text-red-700">{message}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 h-12 w-full rounded-md border-2 border-slate-950 bg-red-700 px-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[4px_4px_0_#111827] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? "Procesando..." : mode === "login" ? "Entrar" : mode === "register" ? "Crear usuario" : "Confirmar correo"}
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
            {mode === "confirm" ? (
              <button
                type="button"
                onClick={() => {
                  setConfirmCode(createConfirmationCode());
                  setTypedCode("");
                }}
                className="text-slate-700 underline underline-offset-4"
              >
                Nuevo codigo
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </main>
  );
}
