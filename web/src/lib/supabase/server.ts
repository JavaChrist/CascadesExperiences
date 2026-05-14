import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Client Supabase pour Server Components, Server Actions, Route Handlers.
 *
 * Lit/écrit les cookies de session via l'API Next 16 `cookies()` (async).
 * Utilise la clé `anon` — toutes les requêtes passent par les RLS policies,
 * filtrées en fonction de l'utilisateur identifié par les cookies.
 *
 * Pour les opérations qui bypass RLS (genre promote admin), voir `admin.ts`.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `setAll` peut échouer si appelé depuis un Server Component
            // (cookies read-only à ce moment). C'est OK tant que le middleware
            // rafraîchit le token avant que la page ne se rende.
          }
        },
      },
    }
  );
}
