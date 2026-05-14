import Link from "next/link";
import {
  Plus,
  Pencil,
  CalendarDays,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { loadAllSessions } from "@/content/sessions-data";
import {
  STAGES,
  getStage,
  formatSessionDate,
  formatMonthLabel,
  monthKey,
} from "@/content/stages";
import { DeleteSessionButton } from "./delete-session-button";
import { cn } from "@/lib/cn";

interface SearchParams {
  created?: string;
  updated?: string;
  deleted?: string;
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const allSessions = await loadAllSessions();

  // Group by month pour lisibilité (passé + futur)
  const grouped = allSessions.reduce<
    Record<string, typeof allSessions>
  >((acc, session) => {
    const key = monthKey(session.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(session);
    return acc;
  }, {});

  // Tri descendant : mois les plus récents/futurs en premier
  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const today = new Date().toISOString().slice(0, 10);
  const upcomingCount = allSessions.filter((s) => s.date >= today).length;
  const pastCount = allSessions.length - upcomingCount;

  // Flash messages depuis les query params (set par les server actions)
  const flash = params.created
    ? "Session créée."
    : params.updated
      ? "Session mise à jour."
      : params.deleted
        ? "Session supprimée."
        : null;

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            CMS
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
            Sessions de stage
          </h1>
          <p className="mt-2 text-ink-soft">
            {upcomingCount} à venir · {pastCount} passée
            {pastCount > 1 ? "s" : ""} · {allSessions.length} au total
          </p>
        </div>
        <LinkButton href="/admin/sessions/new" size="md">
          <Plus className="size-4" aria-hidden />
          Nouvelle session
        </LinkButton>
      </header>

      {flash && (
        <p
          role="status"
          className="mb-6 inline-flex items-center gap-2 rounded-lg bg-brand-soft px-4 py-3 text-sm font-semibold text-brand ring-1 ring-brand/20"
        >
          <CheckCircle2 className="size-4" aria-hidden />
          {flash}
        </p>
      )}

      {allSessions.length === 0 ? (
        <div className="rounded-2xl bg-paper p-10 text-center ring-1 ring-paper-line">
          <p className="font-semibold">Aucune session pour l&apos;instant.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Crée la première via le bouton « Nouvelle session ».
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {months.map((month) => (
            <section key={month}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">
                {formatMonthLabel(grouped[month][0].date)}
              </h2>
              <ul className="space-y-2">
                {grouped[month].map((session) => {
                  const stage = getStage(session.stage);
                  const Icon = stage.icon;
                  const isPast = session.date < today;
                  const isFull = session.spotsLeft === 0;
                  const sessionLabel = `${stage.shortTitle} — ${formatSessionDate(session.date)}`;

                  return (
                    <li
                      key={session.id}
                      className={cn(
                        "flex flex-col gap-3 rounded-2xl bg-paper p-4 ring-1 ring-paper-line sm:flex-row sm:items-center",
                        isPast && "opacity-60"
                      )}
                    >
                      <div className="flex flex-1 items-center gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                          <Icon className="size-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-baseline gap-2 font-bold">
                            {stage.shortTitle}
                            <span className="text-xs font-normal text-ink-muted">
                              {formatSessionDate(session.date, {
                                withWeekday: true,
                              })}
                            </span>
                            {isPast && (
                              <span className="rounded-full bg-ink-muted/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                                Passée
                              </span>
                            )}
                            {isFull && !isPast && (
                              <span className="rounded-full bg-ink-muted/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                                Complet
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
                            <MapPin
                              className="size-3.5 shrink-0 text-ink-muted"
                              aria-hidden
                            />
                            <span className="truncate">{session.location}</span>
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                            <CalendarDays
                              className="size-3 shrink-0"
                              aria-hidden
                            />
                            <span>
                              {session.spotsLeft}/{session.capacity} places
                              restantes
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Link
                          href={`/admin/sessions/${session.id}/edit`}
                          className="inline-flex size-9 items-center justify-center rounded-lg border border-paper-line text-ink-muted transition hover:border-brand hover:bg-brand-soft hover:text-brand"
                          aria-label={`Modifier ${sessionLabel}`}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                        <DeleteSessionButton
                          sessionId={session.id}
                          sessionLabel={sessionLabel}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* Légende des stages (utile pour rappel pendant la création) */}
      <aside className="mt-12 rounded-2xl bg-paper p-5 ring-1 ring-paper-line">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Types de stage disponibles
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {STAGES.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.slug} className="flex items-center gap-2">
                <Icon className="size-4 text-brand" aria-hidden />
                <span className="font-semibold">{s.shortTitle}</span>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
