import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client. Supabase is used ONLY as a PostgreSQL database here:
 * no Supabase Auth, no sessions, no browser access. Import this from server code only.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set on the server.");
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  return client;
}
