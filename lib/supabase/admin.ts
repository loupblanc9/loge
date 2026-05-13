import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

let cached: SupabaseClient | null = null;

/** Client serveur avec service_role — ne jamais exposer au navigateur. */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const env = getEnv();
  const url = env.SUPABASE_URL!;
  const key = env.SUPABASE_SERVICE_ROLE_KEY!;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
