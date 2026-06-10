const serverApiBaseUrl =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.RENDER_EXTERNAL_URL ??
  "http://127.0.0.1:4000";

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function getServerApiUrl(path: string) {
  return `${serverApiBaseUrl}${normalizePath(path)}`;
}

export async function serverApiFetch(path: string, init?: RequestInit) {
  return fetch(getServerApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}
