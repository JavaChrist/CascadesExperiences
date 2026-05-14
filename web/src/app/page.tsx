import { ArrowRight, Construction } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

// Placeholder de démarrage — sera remplacé par la vraie page d'accueil
// (héro + Prochaines dates + 4 cartes activités + galerie + contact).
export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <section className="relative isolate flex flex-1 items-center justify-center overflow-hidden bg-ink text-paper">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/5 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-paper/80">
            <Construction className="size-3.5" aria-hidden />
            Refonte en cours
          </span>

          <h1 className="text-balance text-5xl font-black leading-[0.95] sm:text-6xl md:text-7xl">
            {siteConfig.name}
          </h1>

          <p className="text-balance text-lg text-paper/70 sm:text-xl">
            {siteConfig.tagline} — stages wheeling, pilotage sur piste,
            coaching privé et rando électrique.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/stages"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-paper transition hover:bg-brand-dark focus-visible:outline-offset-4"
            >
              Voir les stages
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-paper/30 px-6 py-3 text-sm font-semibold text-paper transition hover:bg-paper/10"
            >
              Nous contacter
            </Link>
          </div>

          <p className="pt-4 text-xs text-paper/40">
            Site en cours de refonte — version définitive très prochainement.
          </p>
        </div>

        {/* Halo rouge décoratif */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-40 -z-10 h-80 bg-brand/30 blur-[140px]"
        />
      </section>
    </main>
  );
}
