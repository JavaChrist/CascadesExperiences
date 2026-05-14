import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import {
  STAGES,
  getStage,
  upcomingSessions,
  formatSessionDate,
} from "@/content/stages";

// On limite les prochaines dates affichées sur la home.
const HOME_SESSIONS_LIMIT = 4;

// Photos sélectionnées pour la galerie (parmi les photos de la home Wix).
const GALLERY_PHOTOS: { src: string; alt: string }[] = [
  { src: "/media/photos/fdbdb0_dd748b10341b4b558f1caf16a2ed67f1~mv2.webp", alt: "Cascades Expériences en piste" },
  { src: "/media/photos/fdbdb0_c072a367096245b7ae4b7317313a7421~mv2.webp", alt: "Stage moto en action" },
  { src: "/media/photos/fdbdb0_80e75bf3a1f44dd397270962a9a6ec94~mv2.webp", alt: "Pilotage circuit" },
  { src: "/media/photos/fdbdb0_a9eabe3696e942ee9515320726f88cbe~mv2.webp", alt: "Wheeling en sécurité" },
  { src: "/media/photos/fdbdb0_f0d96002dc394dbb960632f4e41eb851f000.webp", alt: "Moments club Cascades" },
  { src: "/media/photos/fdbdb0_60b4e4e60b8b4c02bb28c9a244c40c55~mv2.webp", alt: "Ambiance stage" },
];

const HERO_PHOTO = "/media/photos/fdbdb0_b1ce414227db4d129f3de209cb5a99dc~mv2.webp";

export default function HomePage() {
  const nextSessions = upcomingSessions().slice(0, HOME_SESSIONS_LIMIT);

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <Image
          src={HERO_PHOTO}
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover opacity-50"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/30 via-ink/50 to-ink"
        />

        <Container className="flex min-h-[78vh] flex-col justify-end gap-8 py-20 sm:min-h-[82vh] sm:py-28">
          <p className="inline-flex items-center gap-2 self-start rounded-full border border-paper/20 bg-paper/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-paper/80 backdrop-blur">
            {siteConfig.tagline}
          </p>

          <h1 className="max-w-3xl text-balance text-5xl font-black leading-[0.95] sm:text-6xl md:text-7xl">
            Stages moto, wheeling et pilotage sur piste.
          </h1>

          <p className="max-w-2xl text-balance text-lg text-paper/80 sm:text-xl">
            Du wheeling à la piste, en passant par les randos électriques —
            on construit ton stage autour de ton niveau et de tes envies.
            Cadre sécurisé, motos école, équipement fourni.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <LinkButton href="/stages" size="lg">
              Voir les prochaines dates
              <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
            <LinkButton href="/contact" size="lg" variant="secondary">
              Nous contacter
            </LinkButton>
          </div>
        </Container>
      </section>

      {/* ─── PROCHAINES DATES ─────────────────────────────────────────── */}
      <section className="bg-paper-muted py-16 sm:py-20">
        <Container>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                Calendrier
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Prochaines dates de stage
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

          {nextSessions.length === 0 ? (
            <p className="rounded-2xl bg-paper p-6 text-ink-muted">
              Aucune date n'est planifiée pour le moment. Reviens vite ou contacte-nous
              pour organiser une session privée.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {nextSessions.map((session) => {
                const stage = getStage(session.stage);
                const Icon = stage.icon;
                const sold = session.spotsLeft === 0;
                return (
                  <li key={`${session.stage}-${session.date}`}>
                    <Link
                      href={`/stages/${session.stage}`}
                      className="group flex h-full gap-4 rounded-2xl bg-paper p-4 ring-1 ring-paper-line transition hover:ring-brand/40"
                    >
                      <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                        <Icon className="size-6" aria-hidden />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-semibold">{stage.shortTitle}</p>
                          {sold ? (
                            <span className="text-xs font-semibold text-ink-muted">
                              Complet
                            </span>
                          ) : session.spotsLeft !== null ? (
                            <span className="text-xs font-semibold text-brand">
                              {session.spotsLeft} place{session.spotsLeft > 1 ? "s" : ""}
                            </span>
                          ) : null}
                        </div>
                        <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                          <CalendarDays className="size-3.5" aria-hidden />
                          {formatSessionDate(session.date, { withWeekday: true })}
                        </p>
                        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                          <MapPin className="size-3.5" aria-hidden />
                          {session.location}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>

      {/* ─── 4 ACTIVITÉS ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              Nos activités
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              Choisis ton terrain de jeu
            </h2>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <li key={stage.slug}>
                  <Link
                    href={`/stages/${stage.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl bg-paper ring-1 ring-paper-line transition hover:-translate-y-0.5 hover:ring-brand/40"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-paper-muted">
                      <Image
                        src={stage.coverImage}
                        alt={stage.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 grid size-10 place-items-center rounded-xl bg-paper/95 text-brand backdrop-blur">
                        <Icon className="size-5" aria-hidden />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h3 className="text-lg font-bold">{stage.shortTitle}</h3>
                      <p className="text-sm text-ink-muted">{stage.tagline}</p>
                      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-brand">
                        Découvrir
                        <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* ─── GALERIE ─────────────────────────────────────────────────── */}
      <section className="bg-ink py-16 text-paper sm:py-20">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                Ambiance
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Du wheeling, du grip, du sourire.
              </h2>
            </div>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-paper/80 hover:text-paper"
            >
              @cascadesexperiences sur Instagram
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>

          <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
            {GALLERY_PHOTOS.map((photo) => (
              <li key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ─── CTA CONTACT ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <Container className="rounded-3xl bg-brand px-6 py-12 text-paper sm:px-10 sm:py-14">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Une question ? Un stage sur-mesure ?
              </h2>
              <p className="mt-2 max-w-2xl text-paper/85">
                On répond vite — par téléphone, par mail ou via le formulaire de
                contact.
              </p>
              <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                <a
                  href={siteConfig.contact.phoneHref}
                  className="inline-flex items-center gap-2 font-semibold hover:underline"
                >
                  <Users className="size-4" aria-hidden />
                  {siteConfig.contact.phone}
                </a>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="font-semibold hover:underline"
                >
                  {siteConfig.contact.email}
                </a>
              </p>
            </div>
            <LinkButton
              href="/contact"
              size="lg"
              variant="secondary"
              className="self-start sm:self-auto"
            >
              Formulaire de contact
              <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}
