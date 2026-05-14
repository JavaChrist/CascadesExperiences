import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Client Supabase pour les Client Components (browser).
 * - Utilise la clé `anon` (publique, bridée par RLS)
 * - Gère automatiquement la persistance de session dans les cookies
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
