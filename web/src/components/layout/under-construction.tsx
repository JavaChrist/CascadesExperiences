import { Construction, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  features: Feature[];
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Layout réutilisable pour les pages "à venir" — Club, Boutique, etc.
 *
 * Ce n'est PAS une 404 ni une coming-soon vide : on explique précisément ce
 * que la page proposera, pour conserver la confiance du visiteur en attendant
 * la livraison finale.
 */
export function UnderConstruction({
  eyebrow,
  title,
  intro,
  features,
  ctaLabel = "Nous contacter",
  ctaHref = "/contact",
}: Props) {
  return (
    <>
      <section className="border-b border-paper-line bg-paper-muted py-14 sm:py-20">
        <Container>
          <p className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand ring-1 ring-paper-line">
            <Construction className="size-3.5" aria-hidden />
            Section en cours de construction
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-brand">
            {eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl text-balance text-4xl font-black tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-balance text-lg text-ink-soft">
            {intro}
          </p>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            Ce qu'on prépare
          </h2>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li
                  key={feature.title}
                  className="rounded-2xl bg-paper p-6 ring-1 ring-paper-line"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-bold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    {feature.description}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-12 flex flex-col items-start gap-3 rounded-2xl bg-ink p-8 text-paper sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xl font-bold">
                Tu veux être prévenu·e du lancement ?
              </p>
              <p className="mt-1 text-paper/70">
                Contacte-nous, on te tient au courant en direct.
              </p>
            </div>
            <LinkButton href={ctaHref} variant="primary" size="lg">
              {ctaLabel}
              <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}
