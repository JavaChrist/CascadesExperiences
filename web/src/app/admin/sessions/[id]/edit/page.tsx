import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SessionForm } from "../../../session-form";
import { updateSession } from "../../../actions";
import { getSessionById } from "@/content/sessions-data";
import { getStage, formatSessionDate } from "@/content/stages";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionById(id);
  if (!session) notFound();

  const stage = getStage(session.stage);

  // Server action partielle : on bind l'id côté serveur pour ne pas l'exposer
  // dans le formData côté client.
  async function actionWithId(formData: FormData) {
    "use server";
    return updateSession(id, formData);
  }

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
          Modification
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
          {stage.shortTitle} — {formatSessionDate(session.date)}
        </h1>
        <p className="mt-2 text-ink-soft">
          Modifie les champs et clique sur Enregistrer.
        </p>
      </header>

      <div className="max-w-2xl">
        <SessionForm
          initial={session}
          action={actionWithId}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </>
  );
}
