"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { deleteSession } from "./actions";

interface Props {
  sessionId: string;
  /** Texte descriptif pour la modale (ex. "Wheeling — 8 juin 2026"). */
  sessionLabel: string;
}

/**
 * Bouton "Supprimer" + modale de confirmation custom.
 * Politique projet : pas de `confirm()` natif → modale custom obligatoire.
 */
export function DeleteSessionButton({ sessionId, sessionLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteSession(sessionId);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-paper-line text-ink-muted transition hover:border-brand/40 hover:bg-brand-soft hover:text-brand"
        aria-label={`Supprimer ${sessionLabel}`}
      >
        <Trash2 className="size-4" aria-hidden />
      </button>

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        title="Supprimer cette session ?"
        description={`Tu es sur le point de supprimer définitivement « ${sessionLabel} ». Cette action est irréversible.`}
        size="sm"
        dismissable={!pending}
      >
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-brand/40 bg-brand-soft px-4 py-3 text-sm text-brand-dark"
          >
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Suppression…
              </>
            ) : (
              <>
                <Trash2 className="size-4" aria-hidden />
                Supprimer définitivement
              </>
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}
