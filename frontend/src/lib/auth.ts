import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export type StoredUser = {
  email: string;
  passwordHash: string;
  confirmed: boolean;
  createdAt: string;
  lastLoginAt?: string;
};

export type StoredSession = {
  email: string;
  startedAt: string;
};

export const AUTH_USERS_KEY = "nyc_auth_users_v1";
export const AUTH_SESSION_KEY = "nyc_auth_session_v1";
export const AUTH_UPDATED_EVENT = "nyc-auth-updated";

export { isSupabaseConfigured };

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function readUsers(): Record<string, StoredUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(AUTH_USERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, StoredUser>) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveUsers(users: Record<string, StoredUser>) {
  window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

export function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(email: string) {
  window.localStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify({ email: normalizeEmail(email), startedAt: new Date().toISOString() }),
  );
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

export function clearSession() {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

export async function signOutCurrentUser() {
  if (isSupabaseConfigured()) {
    await (await getSupabaseBrowserClient())?.auth.signOut();
  }
  clearSession();
}

export async function getCurrentAuthUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await getSupabaseBrowserClient();
  const { data, error } = (await supabase?.auth.getUser()) ?? { data: null, error: null };
  if (error || !data?.user?.email) return null;
  saveSession(data.user.email);
  return data.user;
}

export async function signInWithEmailPassword(email: string, password: string) {
  if (!isSupabaseConfigured()) return { handledBySupabase: false as const };
  const supabase = await getSupabaseBrowserClient();
  const { data, error } = await supabase!.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });
  if (error) return { handledBySupabase: true as const, error: error.message };
  if (data.user?.email) saveSession(data.user.email);
  return { handledBySupabase: true as const, user: data.user };
}

export async function signUpWithEmailPassword(email: string, password: string) {
  if (!isSupabaseConfigured()) return { handledBySupabase: false as const };
  const supabase = await getSupabaseBrowserClient();
  const { data, error } = await supabase!.auth.signUp({
    email: normalizeEmail(email),
    password,
  });
  if (error) {
    const duplicateEmail = /already|registered|exists|unique/i.test(error.message);
    return {
      handledBySupabase: true as const,
      error: duplicateEmail ? undefined : error.message,
      emailAlreadyRegistered: duplicateEmail,
    };
  }
  const emailAlreadyRegistered = Boolean(data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);
  if (emailAlreadyRegistered) {
    return {
      handledBySupabase: true as const,
      emailAlreadyRegistered: true,
    };
  }
  if (data.session && data.user?.email) saveSession(data.user.email);
  return {
    handledBySupabase: true as const,
    user: data.user,
    needsEmailConfirmation: !data.session,
    emailAlreadyRegistered: false,
  };
}

export function userScopedStorageKey(baseKey: string, email?: string | null) {
  const cleanEmail = email ? normalizeEmail(email).replace(/[^a-z0-9]+/g, "_") : "guest";
  return `${baseKey}:${cleanEmail}`;
}

export async function hashPassword(email: string, password: string) {
  const value = `${normalizeEmail(email)}:${password}`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoded = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `fallback-${Math.abs(hash)}`;
}
