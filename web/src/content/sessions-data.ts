import "server-only";

/**
 * Chargement des sessions depuis `web/content/sessions/*.json`.
 *
 * Server-only : ce module utilise `node:fs/promises` et fait planter le build
 * s'il est importé par un client component (cf. import "server-only" ci-dessus).
 *
 * Les fichiers JSON sont créés/édités via Decap CMS (cf. `public/admin/`)
 * ou à la main. Un fichier par session, nom = `{date}-{stage}.json`.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { StageSession } from "./stages";

const SESSIONS_DIR = path.join(process.cwd(), "content", "sessions");

/**
 * Charge toutes les sessions sur disque, triées par date croissante.
 * Renvoie [] silencieusement si le dossier n'existe pas (ex. fresh checkout).
 */
export async function loadAllSessions(): Promise<StageSession[]> {
  let entries: string[];
  try {
    entries = await readdir(SESSIONS_DIR);
  } catch {
    return [];
  }

  const sessions: StageSession[] = [];
  for (const file of entries) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = await readFile(path.join(SESSIONS_DIR, file), "utf8");
      const parsed = JSON.parse(raw) as StageSession;
      sessions.push(parsed);
    } catch (err) {
      console.warn(`[sessions] fichier ignoré ${file} :`, (err as Error).message);
    }
  }

  return sessions.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Sessions à venir (date >= aujourd'hui local), triées par date croissante.
 * `now` injectable pour les tests.
 */
export async function upcomingSessions(now = new Date()): Promise<StageSession[]> {
  const today = now.toISOString().slice(0, 10);
  const all = await loadAllSessions();
  return all.filter((s) => s.date >= today);
}
