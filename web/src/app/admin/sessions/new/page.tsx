import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SessionForm } from "../../session-form";
import { createSession } from "../../actions";

export default function NewSessionPage() {
  return (
    <>
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour à la liste
      </Link>

      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          Création
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
          Nouvelle session
        </h1>
        <p className="mt-2 text-ink-soft">
          Renseigne le type de stage, la date, le lieu, et les places.
        </p>
      </header>

      <div className="max-w-2xl">
        <SessionForm action={createSession} submitLabel="Créer la session" />
      </div>
    </>
  );
}
