import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service-role key. All data access in
// this app is server-side (route handlers + server components), so the service
// role is appropriate and RLS is enforced only for any future client reads.
//
// When these env vars are absent, the app transparently falls back to the
// in-memory prototype store (see lib/backend.ts / lib/store.ts). That keeps the
// app fully working before Supabase is provisioned.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && serviceKey);
}

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
