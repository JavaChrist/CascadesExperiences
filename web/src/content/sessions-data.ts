import "server-only";

/**
 * Chargement des sessions depuis Supabase (table `public.sessions`).
 *
 * Server-only : utilise le client serveur Supabase et ne doit jamais être
 * importé par un client component (cf. import "server-only" ci-dessus).
 *
 * Phase 2 du CMS : avant, ce module lisait `web/content/sessions/*.json`
 * écrits par Decap CMS. Désormais, les sessions vivent en base et sont
 * éditables via /admin (gated par Supabase auth).
 */

import { createClient } from "@/lib/supabase/server";
import type { SessionRow } from "@/lib/supabase/types";
import type { StageSession } from "./stages";

/**
 * Convertit une ligne DB (snake_case) → notre type UI (camelCase).
 */
function rowToSession(row: SessionRow): StageSession {
  return {
    id: row.id,
    stage: row.stage,
    date: row.date,
    location: row.location,
    spotsLeft: row.spots_left,
    capacity: row.capacity,
  };
}

/**
 * Toutes les sessions en base, triées par date croissante.
 * Renvoie [] silencieusement si Supabase n'est pas joignable
 * (évite que le site entier plante pendant un incident).
 */
export async function loadAllSessions(): Promise<StageSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("[sessions] Supabase fetch failed:", error.message);
    return [];
  }

  return (data ?? []).map(rowToSession);
}

/**
 * Sessions à venir (date >= aujourd'hui local), triées par date croissante.
 * `now` injectable pour les tests.
 */
export async function upcomingSessions(
  now = new Date()
): Promise<StageSession[]> {
  const today = now.toISOString().slice(0, 10);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .gte("date", today)
    .order("date", { ascending: true });

  if (error) {
    console.error("[sessions] Supabase fetch failed:", error.message);
    return [];
  }

  return (data ?? []).map(rowToSession);
}

/**
 * Fetch une session par son id.
 * Utilisé par la page d'édition admin.
 */
export async function getSessionById(
  id: string
): Promise<StageSession | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[sessions] getSessionById failed:", error.message);
    return null;
  }
  if (!data) return null;
  return rowToSession(data);
}
