const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type SupabaseBrowserClient = Awaited<ReturnType<typeof createSupabaseClient>>;

let browserClient: SupabaseBrowserClient | null = null;

async function createSupabaseClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export async function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  browserClient ??= await createSupabaseClient();
  return browserClient;
}
