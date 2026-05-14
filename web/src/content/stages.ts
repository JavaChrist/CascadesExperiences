/**
 * Modèle des stages et données de démonstration.
 *
 * Les `sessions` sont des dates planifiées éditables — quand on branchera
 * Decap CMS (cf. todo), elles seront chargées depuis des fichiers Markdown
 * et ce module exposera la même forme.
 */
import type { LucideIcon } from "lucide-react";
import { Zap, Target, User, Mountain } from "lucide-react";

export type StageType = "wheeling" | "conduite" | "prive" | "rando-electrique";

export type Stage = {
  slug: StageType;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  /** Couverture (chemin /media/photos/...) — sélectionnée parmi les photos scrapées Wix */
  coverImage: string;
  icon: LucideIcon;
  /** Durée typique d'une session */
  duration: string;
  /** Niveau requis */
  level: "Débutant" | "Tous niveaux" | "Intermédiaire" | "Confirmé";
  /** Tarif indicatif — sera remplacé par les vrais tarifs depuis Mollie / produits Wix */
  priceFrom?: number; // en euros
  /** Ce qu'on apprend / fait dans le stage */
  highlights: string[];
};

export type StageSession = {
  /** Référence vers Stage.slug */
  stage: StageType;
  /** Date ISO (YYYY-MM-DD) */
  date: string;
  /** Lieu */
  location: string;
  /** Places restantes (null = inconnu) */
  spotsLeft: number | null;
  /** Capacité totale */
  capacity: number;
};

// ────────────────────────────────────────────────────────────────────────────
// Catalogue des stages — données fixes
// ────────────────────────────────────────────────────────────────────────────

export const STAGES: Stage[] = [
  {
    slug: "wheeling",
    title: "Stage Wheeling",
    shortTitle: "Wheeling",
    tagline: "Maîtrise la roue arrière en sécurité",
    description:
      "Apprends à lever la roue, contrôler l'équilibre, gérer le frein arrière et descendre proprement. Cadre sécurisé, motos école, équipement fourni.",
    coverImage: "/media/photos/fdbdb0_c67293467e284177a89973390fe45c26~mv2.webp",
    icon: Zap,
    duration: "Journée (8h-18h)",
    level: "Tous niveaux",
    priceFrom: 290,
    highlights: [
      "Position et points clés du wheeling",
      "Décollage progressif et contrôle au gaz",
      "Gestion du frein arrière pour la sécurité",
      "Vidéo retour à chaud pour analyser tes runs",
    ],
  },
  {
    slug: "conduite",
    title: "Stage Pilotage sur piste",
    shortTitle: "Pilotage",
    tagline: "Maniabilité, agilité, précision",
    description:
      "Travail technique sur la trajectoire, le freinage et le placement en virage. Évolution sur piste fermée, encadrement par moniteurs diplômés.",
    coverImage: "/media/photos/fdbdb0_b1ce414227db4d129f3de209cb5a99dc~mv2.webp",
    icon: Target,
    duration: "Journée",
    level: "Tous niveaux",
    priceFrom: 320,
    highlights: [
      "Position de pilotage et regard",
      "Trajectoire et points de corde",
      "Freinage dégressif, transferts de charge",
      "Enchaînements et rythme",
    ],
  },
  {
    slug: "prive",
    title: "Stage Privé",
    shortTitle: "Coaching privé",
    tagline: "Coaching 100 % personnalisé",
    description:
      "Un moniteur rien que pour toi. On définit ensemble tes objectifs (wheeling, pilotage, perf' track day…) et on construit la séance autour.",
    coverImage: "/media/photos/fdbdb0_f8c26d061fde41c2a9982431f1dc10f5~mv2.webp",
    icon: User,
    duration: "1/2 journée à plusieurs jours",
    level: "Tous niveaux",
    highlights: [
      "Bilan de tes points à travailler",
      "Programme sur-mesure",
      "Débrief individuel, plan de progression",
    ],
  },
  {
    slug: "rando-electrique",
    title: "Randonnée Électrique",
    shortTitle: "Rando élec",
    tagline: "L'aventure 100 % silencieuse",
    description:
      "Découverte de la moto électrique en pleine nature. Pas de niveau requis : on s'adapte au groupe, équipement fourni, parcours encadré.",
    coverImage: "/media/photos/fdbdb0_180e8eca19fb4ddfa5358279a162512c~mv2.webp",
    icon: Mountain,
    duration: "1/2 journée",
    level: "Débutant",
    priceFrom: 150,
    highlights: [
      "Aucune expérience moto requise",
      "Motos électriques fournies",
      "Parcours nature accompagné",
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Dates de démonstration — à remplacer par les vraies via Decap CMS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Sessions de démo. Format minimal pour résoudre dès maintenant le pain point
 * UX principal du site Wix actuel : "voir les dates en un coup d'œil".
 *
 * À branchement Decap : remplacer par un chargement depuis `web/content/sessions/*.md`.
 */
export const SESSIONS: StageSession[] = [
  { stage: "wheeling",         date: "2026-06-08", location: "Circuit du Vigeant (86)",   spotsLeft: 3,  capacity: 8 },
  { stage: "conduite",         date: "2026-06-15", location: "Circuit de Carole (93)",    spotsLeft: 5,  capacity: 10 },
  { stage: "rando-electrique", date: "2026-06-22", location: "Forêt de Rambouillet (78)", spotsLeft: 4,  capacity: 6 },
  { stage: "wheeling",         date: "2026-07-06", location: "Circuit du Vigeant (86)",   spotsLeft: 8,  capacity: 8 },
  { stage: "conduite",         date: "2026-07-13", location: "Circuit du Vigeant (86)",   spotsLeft: 6,  capacity: 10 },
  { stage: "wheeling",         date: "2026-09-14", location: "Circuit de Carole (93)",    spotsLeft: 7,  capacity: 8 },
  { stage: "rando-electrique", date: "2026-09-28", location: "Forêt de Rambouillet (78)", spotsLeft: 6,  capacity: 6 },
];

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

export function getStage(slug: StageType): Stage {
  const stage = STAGES.find((s) => s.slug === slug);
  if (!stage) throw new Error(`Stage inconnu : ${slug}`);
  return stage;
}

/** Sessions à venir, triées par date croissante (`now` injectable pour les tests). */
export function upcomingSessions(now = new Date()): StageSession[] {
  const today = now.toISOString().slice(0, 10);
  return [...SESSIONS]
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Formate une date ISO (YYYY-MM-DD) en français : "8 juin 2026" / "lun. 8 juin". */
export function formatSessionDate(
  iso: string,
  opts: { withWeekday?: boolean } = {}
): string {
  // On parse en local pour éviter les surprises de fuseau.
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: opts.withWeekday ? "short" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** "juin 2026" pour le regroupement par mois. */
export function formatMonthLabel(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Clé de mois stable pour le tri/group : "2026-06". */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}
