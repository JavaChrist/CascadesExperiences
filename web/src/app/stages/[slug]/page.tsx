import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Trophy,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import {
  STAGES,
  getStage,
  formatSessionDate,
  type StageType,
} from "@/content/stages";
import { upcomingSessions } from "@/content/sessions-data";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/cn";

// Génération statique des 4 pages détail
export function generateStaticParams() {
  return STAGES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stage = STAGES.find((s) => s.slug === slug);
  if (!stage) return {};
  return {
    title: stage.title,
    description: stage.description,
    openGraph: {
      title: `${stage.title} · Cascades Expériences`,
      description: stage.tagline,
      images: [stage.coverImage],
    },
  };
}

export default async function StageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stage = STAGES.find((s) => s.slug === slug);
  if (!stage) notFound();

  const allUpcoming = await upcomingSessions();
  const sessionsForStage = allUpcoming.filter(
    (s) => s.stage === (stage.slug as StageType)
  );
  const Icon = stage.icon;

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <Image
          src={stage.coverImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover opacity-40"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/40 via-ink/55 to-ink"
        />
        <Container className="flex min-h-[60vh] flex-col justify-end gap-6 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-paper/10 px-3 py-1.5 text-xs uppercase tracking-[0.18em] backdrop-blur">
            <Icon className="size-3.5" aria-hidden />
            <Link href="/stages" className="hover:underline">
              Les stages
            </Link>
            <span aria-hidden>/</span>
            <span>{stage.shortTitle}</span>
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-black leading-[0.95] sm:text-5xl md:text-6xl">
            {stage.title}
          </h1>
          <p className="max-w-2xl text-balance text-lg text-paper/85">
            {stage.tagline}.
          </p>

          <dl className="grid grid-cols-2 gap-4 text-sm sm:max-w-2xl sm:grid-cols-4">
            <Stat icon={Clock} label="Durée" value={stage.duration} />
            <Stat icon={Trophy} label="Niveau" value={stage.level} />
            <Stat
              icon={CalendarDays}
              label="Prochaines dates"
              value={
                sessionsForStage.length === 0
                  ? "Sur demande"
                  : `${sessionsForStage.length} session${sessionsForStage.length > 1 ? "s" : ""}`
              }
            />
            <Stat
              icon={MapPin}
              label="Tarif"
              value={
                stage.priceFrom !== undefined
                  ? `dès ${stage.priceFrom} €`
                  : "Sur devis"
              }
            />
          </dl>
        </Container>
      </section>

      {/* ── CORPS ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <Container className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              Au programme
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-ink-soft">
              {stage.description}
            </p>

            <h3 className="mt-10 text-lg font-bold tracking-tight">
              Ce qu'on travaille
            </h3>
            <ul className="mt-4 space-y-3">
              {stage.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-ink-soft">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Side : carte coordonnées + CTA */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-paper-muted p-6 ring-1 ring-paper-line">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-brand">
                Une question&nbsp;?
              </h3>
              <p className="mt-2 text-ink-soft">
                On répond vite — par téléphone ou par mail.
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-ink-muted">Téléphone</dt>
                  <dd>
                    <a
                      href={siteConfig.contact.phoneHref}
                      className="font-semibold hover:text-brand"
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Mail</dt>
                  <dd>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="break-all font-semibold hover:text-brand"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </dd>
                </div>
              </dl>
              <LinkButton href="/contact" size="md" className="mt-6 w-full">
                Formulaire de contact
              </LinkButton>
            </div>
          </aside>
        </Container>
      </section>

      {/* ── DATES DE CE STAGE ─────────────────────────────────────── */}
      <section className="bg-paper-muted py-12 sm:py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                Calendrier
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                Prochaines dates {stage.shortTitle}
              </h2>
            </div>
            <Link
              href="/stages"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Toutes les dates
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          {sessionsForStage.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-paper p-6 text-ink-muted">
              Aucune date n'est planifiée pour le moment. Contacte-nous pour
              organiser une session privée — réponse rapide.
            </p>
          ) : (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {sessionsForStage.map((session) => {
                const sold = session.spotsLeft === 0;
                const lowStock =
                  session.spotsLeft !== null &&
                  session.spotsLeft > 0 &&
                  session.spotsLeft <= 2;
                return (
                  <li
                    key={session.date}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl bg-paper p-4 ring-1 ring-paper-line",
                      sold && "opacity-70"
                    )}
                  >
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                      <CalendarDays className="size-5" aria-hidden />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">
                        {formatSessionDate(session.date, { withWeekday: true })}
                      </p>
                      <p className="text-sm text-ink-muted">
                        {session.location}
                      </p>
                    </div>
                    {sold ? (
                      <span className="rounded-full bg-ink-muted/15 px-2.5 py-1 text-xs font-semibold text-ink-muted">
                        Complet
                      </span>
                    ) : session.spotsLeft !== null ? (
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          lowStock
                            ? "bg-brand text-paper"
                            : "bg-brand-soft text-brand"
                        )}
                      >
                        {session.spotsLeft} place
                        {session.spotsLeft > 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-paper/15 bg-paper/5 p-3 backdrop-blur">
      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-paper/60">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 font-bold leading-tight">{value}</dd>
    </div>
  );
}
