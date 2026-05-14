"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight, Filter } from "lucide-react";
import {
  STAGES,
  getStage,
  formatSessionDate,
  formatMonthLabel,
  monthKey,
  type StageType,
  type StageSession,
} from "@/content/stages";
import { cn } from "@/lib/cn";

type StageFilter = StageType | "all";

interface Props {
  sessions: StageSession[];
}

/**
 * Calendrier interactif des stages.
 * — Filtre par type (toggle pills) — mobile-first
 * — Option "masquer complets"
 * — Sessions groupées par mois
 *
 * Résout le pain UX principal du Wix actuel : voir les dates en un coup d'œil.
 */
export function SessionsExplorer({ sessions }: Props) {
  const [filter, setFilter] = useState<StageFilter>("all");
  const [hideFull, setHideFull] = useState(false);

  // Comptage par type pour les pills (utile : on voit tout de suite la dispo)
  const countsByStage = useMemo(() => {
    const c: Record<string, number> = { all: sessions.length };
    for (const s of sessions) c[s.stage] = (c[s.stage] ?? 0) + 1;
    return c;
  }, [sessions]);

  const visible = useMemo(() => {
    return sessions.filter((s) => {
      if (filter !== "all" && s.stage !== filter) return false;
      if (hideFull && s.spotsLeft === 0) return false;
      return true;
    });
  }, [sessions, filter, hideFull]);

  // Group by month (already sorted by date upstream)
  const grouped = useMemo(() => {
    const map = new Map<string, StageSession[]>();
    for (const s of visible) {
      const key = monthKey(s.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return [...map.entries()];
  }, [visible]);

  return (
    <div>
      {/* ── Filtres ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Filtrer par type de stage"
          className="-mx-1 flex flex-wrap items-center gap-1.5"
        >
          <FilterPill
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={countsByStage.all}
          >
            Tous
          </FilterPill>
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <FilterPill
                key={stage.slug}
                active={filter === stage.slug}
                onClick={() => setFilter(stage.slug)}
                count={countsByStage[stage.slug] ?? 0}
              >
                <Icon className="size-3.5" aria-hidden />
                {stage.shortTitle}
              </FilterPill>
            );
          })}
        </div>

        <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={hideFull}
            onChange={(e) => setHideFull(e.target.checked)}
            className="size-4 accent-brand"
          />
          Masquer les complets
        </label>
      </div>

      {/* ── Liste ────────────────────────────────────────────────────── */}
      <div className="mt-10 space-y-12">
        {grouped.length === 0 ? (
          <EmptyState
            onReset={() => {
              setFilter("all");
              setHideFull(false);
            }}
          />
        ) : (
          grouped.map(([key, items]) => (
            <section key={key}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-brand">
                {formatMonthLabel(items[0].date)}
              </h2>
              <ul className="mt-3 grid gap-3 lg:grid-cols-2">
                {items.map((session) => (
                  <SessionCard
                    key={`${session.stage}-${session.date}`}
                    session={session}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sous-composants
// ────────────────────────────────────────────────────────────────────────────

function FilterPill({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
        active
          ? "border-brand bg-brand text-paper"
          : "border-paper-line bg-paper text-ink-soft hover:border-ink/30 hover:text-ink"
      )}
    >
      {children}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
          active ? "bg-paper/20 text-paper" : "bg-paper-muted text-ink-muted"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SessionCard({ session }: { session: StageSession }) {
  const stage = getStage(session.stage);
  const Icon = stage.icon;
  const sold = session.spotsLeft === 0;
  const lowStock =
    session.spotsLeft !== null && session.spotsLeft > 0 && session.spotsLeft <= 2;

  return (
    <li>
      <article
        className={cn(
          "flex h-full flex-col gap-4 rounded-2xl bg-paper p-5 ring-1 ring-paper-line transition hover:ring-brand/40",
          sold && "opacity-70"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icon className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {stage.shortTitle}
              </p>
              <p className="text-lg font-bold leading-tight">
                {formatSessionDate(session.date, { withWeekday: true })}
              </p>
            </div>
          </div>

          {sold ? (
            <span className="rounded-full bg-ink-muted/15 px-2.5 py-1 text-xs font-semibold text-ink-muted">
              Complet
            </span>
          ) : session.spotsLeft !== null ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                lowStock ? "bg-brand text-paper" : "bg-brand-soft text-brand"
              )}
            >
              {session.spotsLeft} place{session.spotsLeft > 1 ? "s" : ""}
            </span>
          ) : null}
        </div>

        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-ink-soft">
            <CalendarDays className="size-4 shrink-0 text-ink-muted" aria-hidden />
            <span>{stage.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-ink-soft">
            <MapPin className="size-4 shrink-0 text-ink-muted" aria-hidden />
            <span className="truncate">{session.location}</span>
          </div>
          <div className="flex items-center gap-2 text-ink-soft sm:col-span-2">
            <Filter className="size-4 shrink-0 text-ink-muted" aria-hidden />
            <span>Niveau&nbsp;: {stage.level}</span>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-paper-line pt-4">
          {stage.priceFrom !== undefined ? (
            <p className="text-sm">
              <span className="text-ink-muted">à partir de</span>{" "}
              <span className="font-bold tabular-nums">{stage.priceFrom} €</span>
            </p>
          ) : (
            <p className="text-sm text-ink-muted">Sur devis</p>
          )}

          <Link
            href={`/stages/${stage.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-paper transition hover:bg-brand-dark"
            aria-disabled={sold}
          >
            {sold ? "Voir le stage" : "Réserver"}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </article>
    </li>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl bg-paper-muted px-6 py-12 text-center">
      <p className="text-base font-semibold">Aucune session ne correspond.</p>
      <p className="mt-1 text-sm text-ink-muted">
        Essaie en élargissant les filtres, ou contacte-nous pour organiser une
        session privée.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper px-4 py-2 text-sm font-semibold text-ink hover:border-ink/30"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}
