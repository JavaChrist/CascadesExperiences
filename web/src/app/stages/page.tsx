import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SessionsExplorer } from "@/components/stages/sessions-explorer";
import { upcomingSessions } from "@/content/stages";

export const metadata: Metadata = {
  title: "Les stages",
  description:
    "Toutes les dates de stages Cascades Expériences — wheeling, pilotage sur piste, coaching privé et randonnée électrique. Filtre par type, vois les places restantes en direct.",
};

export default function StagesPage() {
  const sessions = upcomingSessions();

  return (
    <>
      {/* En-tête */}
      <section className="border-b border-paper-line bg-paper-muted py-12 sm:py-16">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Calendrier
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Toutes les prochaines dates
          </h1>
          <p className="mt-3 max-w-2xl text-balance text-lg text-ink-soft">
            Choisis ton stage et ta date — les places restantes sont mises à
            jour en direct. Pas de date qui te convient&nbsp;? On peut organiser
            une session privée, contacte-nous.
          </p>
        </Container>
      </section>

      {/* Calendrier interactif */}
      <section className="py-12 sm:py-16">
        <Container>
          <SessionsExplorer sessions={sessions} />
        </Container>
      </section>
    </>
  );
}
