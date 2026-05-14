import type { Metadata } from "next";
import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/components/contact/contact-form";
import CircuitMap from "@/components/contact/circuit-map-client";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Une question, un projet de stage sur-mesure ? Contacte Cascades Expériences par téléphone, e-mail ou via le formulaire — réponse rapide.",
};

export default function ContactPage() {
  return (
    <>
      {/* En-tête */}
      <section className="border-b border-paper-line bg-paper-muted py-12 sm:py-16">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Contact
          </p>
          <h1 className="mt-2 max-w-2xl text-balance text-4xl font-black tracking-tight sm:text-5xl">
            Une question, un projet ?
          </h1>
          <p className="mt-3 max-w-2xl text-balance text-lg text-ink-soft">
            On répond généralement dans la journée. Précise ton niveau et tes
            envies pour qu'on revienne vers toi avec une proposition concrète.
          </p>
        </Container>
      </section>

      {/* Form + coordonnées */}
      <section className="py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              Écris-nous
            </h2>
            <p className="mt-2 text-ink-muted">
              Tous les champs marqués <span className="text-brand">*</span> sont
              obligatoires.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-5">
            <h2 className="sr-only">Nous joindre directement</h2>

            <InfoCard
              icon={Phone}
              title="Par téléphone"
              primary={
                <a
                  href={siteConfig.contact.phoneHref}
                  className="font-bold hover:text-brand"
                >
                  {siteConfig.contact.phone}
                </a>
              }
              secondary="Le moyen le plus rapide pour les réservations de dernière minute."
            />

            <InfoCard
              icon={Mail}
              title="Par e-mail"
              primary={
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="break-all font-bold hover:text-brand"
                >
                  {siteConfig.contact.email}
                </a>
              }
              secondary="Idéal pour les demandes détaillées avec pièces jointes."
            />

            <InfoCard
              icon={Clock}
              title="Horaires"
              primary={
                <ul className="space-y-0.5 text-sm">
                  {siteConfig.contact.hours.map((h) => (
                    <li key={h.days}>
                      <span className="font-semibold">{h.days}</span> · {h.time}
                    </li>
                  ))}
                </ul>
              }
            />

            <InfoCard
              icon={MapPin}
              title="Adresse principale"
              primary={
                <address className="not-italic text-sm text-ink-soft">
                  <span className="block font-bold text-ink">
                    {siteConfig.contact.address.label}
                  </span>
                  <span className="block">{siteConfig.contact.address.street}</span>
                  <span className="block">
                    {siteConfig.contact.address.postal}{" "}
                    {siteConfig.contact.address.city} (
                    {siteConfig.contact.address.region})
                  </span>
                </address>
              }
              secondary="Les stages se déroulent ici. Le lieu exact d'une session est précisé à la réservation."
            />
          </aside>
        </Container>
      </section>

      {/* Carte de l'adresse principale */}
      <section className="bg-paper-muted py-12 sm:py-16">
        <Container>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                Nous trouver
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                Adresse principale
              </h2>
            </div>
            <p className="max-w-md text-sm text-ink-muted">
              Les stages se déroulent sur différents circuits — le lieu exact
              est confirmé à la réservation.
            </p>
          </div>
          <CircuitMap />
        </Container>
      </section>
    </>
  );
}

function InfoCard({
  icon: Icon,
  title,
  primary,
  secondary,
}: {
  icon: typeof Mail;
  title: string;
  primary: React.ReactNode;
  secondary?: string;
}) {
  return (
    <div className="rounded-2xl bg-paper p-5 ring-1 ring-paper-line">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
          <Icon className="size-5" aria-hidden />
        </span>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          {title}
        </p>
      </div>
      <div className="mt-3 text-ink">{primary}</div>
      {secondary && <p className="mt-1 text-sm text-ink-muted">{secondary}</p>}
    </div>
  );
}
