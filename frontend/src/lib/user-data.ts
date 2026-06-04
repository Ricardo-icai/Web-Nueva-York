import { readSession, userScopedStorageKey } from "@/lib/auth";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export type TravelProfilePayload = {
  tripId?: string;
  name: string;
  nationality: string;
  startDate: string;
  endDate: string;
  travelers: number;
  pace: string;
  accommodation: {
    address: string;
    lat: number;
    lng: number;
  };
};

export type SavedRoutePayload = {
  routeKey: string;
  title: string;
  payload: unknown;
};

async function currentSupabaseUserId() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await getSupabaseBrowserClient();
  const { data, error } = (await supabase?.auth.getUser()) ?? { data: null, error: null };
  if (error || !data?.user?.id) return null;
  return data.user.id;
}

function localEmail() {
  return readSession()?.email;
}

export async function loadTravelProfile(baseKey: string) {
  const localKey = userScopedStorageKey(baseKey, localEmail());
  if (isSupabaseConfigured()) {
    const userId = await currentSupabaseUserId();
    if (userId) {
      const supabase = await getSupabaseBrowserClient();
      const { data } = await supabase!
        .from("travel_profiles")
        .select("trip_id,name,nationality,start_date,end_date,travelers,pace,accommodation")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        const profile = {
          tripId: data.trip_id ?? undefined,
          name: data.name,
          nationality: data.nationality,
          startDate: data.start_date,
          endDate: data.end_date,
          travelers: data.travelers,
          pace: data.pace,
          accommodation: data.accommodation,
        } as TravelProfilePayload;
        localStorage.setItem(localKey, JSON.stringify(profile));
        return profile;
      }
    }
  }

  try {
    const raw = localStorage.getItem(localKey);
    return raw ? (JSON.parse(raw) as TravelProfilePayload) : null;
  } catch {
    return null;
  }
}

export async function saveTravelProfile(baseKey: string, profile: TravelProfilePayload) {
  const localKey = userScopedStorageKey(baseKey, localEmail());
  localStorage.setItem(localKey, JSON.stringify(profile));

  const userId = await currentSupabaseUserId();
  if (!userId) return;

  const supabase = await getSupabaseBrowserClient();
  await supabase!.from("travel_profiles").upsert(
    {
      user_id: userId,
      trip_id: profile.tripId ?? null,
      name: profile.name,
      nationality: profile.nationality,
      start_date: profile.startDate,
      end_date: profile.endDate,
      travelers: profile.travelers,
      pace: profile.pace,
      accommodation: profile.accommodation,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function loadFavorites(baseKey: string, favoriteType: string) {
  const localKey = userScopedStorageKey(baseKey, localEmail());
  if (isSupabaseConfigured()) {
    const userId = await currentSupabaseUserId();
    if (userId) {
      const supabase = await getSupabaseBrowserClient();
      const { data } = await supabase!
        .from("user_favorites")
        .select("item_ids")
        .eq("user_id", userId)
        .eq("favorite_type", favoriteType)
        .maybeSingle();

      if (Array.isArray(data?.item_ids)) {
        localStorage.setItem(localKey, JSON.stringify(data.item_ids));
        return data.item_ids as string[];
      }
    }
  }

  try {
    const raw = localStorage.getItem(localKey);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveFavorites(baseKey: string, favoriteType: string, itemIds: string[]) {
  const localKey = userScopedStorageKey(baseKey, localEmail());
  localStorage.setItem(localKey, JSON.stringify(itemIds));

  const userId = await currentSupabaseUserId();
  if (!userId) return;

  const supabase = await getSupabaseBrowserClient();
  await supabase!.from("user_favorites").upsert(
    {
      user_id: userId,
      favorite_type: favoriteType,
      item_ids: itemIds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,favorite_type" },
  );
}

export async function saveRoute(route: SavedRoutePayload) {
  const userId = await currentSupabaseUserId();
  if (!userId) return;

  const supabase = await getSupabaseBrowserClient();
  await supabase!.from("user_routes").upsert(
    {
      user_id: userId,
      route_key: route.routeKey,
      title: route.title,
      payload: route.payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,route_key" },
  );
}
