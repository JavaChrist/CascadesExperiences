import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Espace réservé à l'équipe Cascades Expériences.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/admin";

  return (
    <section className="grid min-h-[70vh] place-items-center py-12 sm:py-16">
      <Container width="narrow">
        <div className="mx-auto max-w-md">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Espace équipe
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Connexion
          </h1>
          <p className="mt-2 text-ink-soft">
            Réservé à l&apos;équipe Cascades Expériences.
          </p>

          <div className="mt-8">
            <LoginForm next={next} />
          </div>
        </div>
      </Container>
    </section>
  );
}
