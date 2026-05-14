import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Client Supabase avec la clé `service_role` — bypass TOUS les RLS.
 *
 * ⚠️ NE JAMAIS exposer côté client. Ce fichier importe "server-only" pour
 * que Next.js plante au build si on tente de l'importer dans un client component.
 *
 * Usage : opérations admin qui ne passent pas par l'utilisateur (ex. déclencher
 * un email transactionnel, valider un webhook Mollie qui doit écrire en base
 * sans qu'un user soit connecté).
 *
 * Pour les actions admin du CMS (CRUD sessions), on continue avec le client
 * `server.ts` + RLS — l'admin authentifié a déjà le droit d'écrire via policy.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
