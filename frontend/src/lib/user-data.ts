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

type NightlifeFavoriteRow = {
  item_id: string;
};

type ShoppingFavoriteRow = {
  item_id: string;
};

function requireSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("La aplicacion no esta conectada a Supabase.");
  }
}

async function currentSupabaseUserId() {
  requireSupabase();
  const supabase = await getSupabaseBrowserClient();
  const { data, error } = (await supabase?.auth.getUser()) ?? { data: null, error: null };
  if (error || !data?.user?.id) throw new Error("No hay una sesion valida en Supabase.");
  return data.user.id;
}

function localEmail() {
  return readSession()?.email;
}

function normalizeRemoteTravelProfile(remote: Partial<TravelProfilePayload>): TravelProfilePayload {
  const remoteAccommodation = remote.accommodation;
  return {
    tripId: remote.tripId,
    name: remote.name?.trim() || "",
    nationality: remote.nationality?.trim() || "",
    startDate: remote.startDate || "",
    endDate: remote.endDate || "",
    travelers: remote.travelers && remote.travelers > 0 ? remote.travelers : 0,
    pace: remote.pace?.trim() || "",
    accommodation: {
      address: remoteAccommodation?.address?.trim() || "",
      lat: Number.isFinite(remoteAccommodation?.lat) ? remoteAccommodation!.lat : 0,
      lng: Number.isFinite(remoteAccommodation?.lng) ? remoteAccommodation!.lng : 0,
    },
  };
}

export async function loadTravelProfile(baseKey: string) {
  requireSupabase();
  const localKey = userScopedStorageKey(baseKey, localEmail());
  const userId = await currentSupabaseUserId();
  const supabase = await getSupabaseBrowserClient();
  const { data } = await supabase!
    .from("travel_profiles")
    .select("trip_id,name,nationality,start_date,end_date,travelers,pace,accommodation")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) {
    const remoteProfile = {
      tripId: data.trip_id ?? undefined,
      name: data.name,
      nationality: data.nationality,
      startDate: data.start_date,
      endDate: data.end_date,
      travelers: data.travelers,
      pace: data.pace,
      accommodation: data.accommodation,
    } as Partial<TravelProfilePayload>;
    const profile = normalizeRemoteTravelProfile(remoteProfile);
    localStorage.setItem(localKey, JSON.stringify(profile));
    return profile;
  }

  return null;
}

export async function saveTravelProfile(baseKey: string, profile: TravelProfilePayload) {
  requireSupabase();
  const localKey = userScopedStorageKey(baseKey, localEmail());
  localStorage.setItem(localKey, JSON.stringify(profile));

  const userId = await currentSupabaseUserId();
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
  requireSupabase();
  const localKey = userScopedStorageKey(baseKey, localEmail());
  const userId = await currentSupabaseUserId();
  const supabase = await getSupabaseBrowserClient();

  if (favoriteType === "nightlife") {
    const { data } = await supabase!
      .from("favorite_nightlife")
      .select("item_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const itemIds = (data ?? []).map((row) => (row as NightlifeFavoriteRow).item_id).filter(Boolean);
    localStorage.setItem(localKey, JSON.stringify(itemIds));
    return itemIds;
  }

  if (favoriteType === "shopping") {
    const { data } = await supabase!
      .from("favorite_shopping")
      .select("item_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const itemIds = (data ?? []).map((row) => (row as ShoppingFavoriteRow).item_id).filter(Boolean);
    localStorage.setItem(localKey, JSON.stringify(itemIds));
    return itemIds;
  }

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

  return [];
}

export async function saveFavorites(baseKey: string, favoriteType: string, itemIds: string[]) {
  requireSupabase();
  const localKey = userScopedStorageKey(baseKey, localEmail());
  localStorage.setItem(localKey, JSON.stringify(itemIds));

  const userId = await currentSupabaseUserId();
  const supabase = await getSupabaseBrowserClient();

  if (favoriteType === "nightlife") {
    await supabase!.from("favorite_nightlife").delete().eq("user_id", userId);

    if (itemIds.length > 0) {
      await supabase!.from("favorite_nightlife").upsert(
        itemIds.map((itemId) => ({
          user_id: userId,
          item_id: itemId,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "user_id,item_id" },
      );
    }
    return;
  }

  if (favoriteType === "shopping") {
    await supabase!.from("favorite_shopping").delete().eq("user_id", userId);

    if (itemIds.length > 0) {
      await supabase!.from("favorite_shopping").upsert(
        itemIds.map((itemId) => ({
          user_id: userId,
          item_id: itemId,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "user_id,item_id" },
      );
    }
    return;
  }

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
  requireSupabase();
  const userId = await currentSupabaseUserId();
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
