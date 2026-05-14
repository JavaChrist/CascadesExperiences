"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Largeur max (sm = 24rem, md = 32rem, lg = 42rem). Default: md */
  size?: "sm" | "md" | "lg";
  /** Empêche la fermeture via Escape / clic backdrop. Pour les modales critiques. */
  dismissable?: boolean;
}

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
} as const;

/**
 * Modale custom — remplace les alert()/confirm() natifs interdits par la
 * convention projet. Utilise le <dialog> natif pour l'accessibilité (focus
 * trap + Escape gérés par le navigateur).
 *
 * Usage :
 *   const [open, setOpen] = useState(false);
 *   <Modal open={open} onClose={() => setOpen(false)} title="Supprimer ?">
 *     ...contenu + boutons
 *   </Modal>
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  dismissable = true,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync open prop ↔ DOM dialog state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Lock scroll quand ouverte
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Backdrop click → close (sauf si !dismissable)
  function handleClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (!dismissable) return;
    if (event.target === dialogRef.current) {
      onClose();
    }
  }

  // Escape via natif dialog : intercepte si !dismissable
  function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    if (!dismissable) {
      event.preventDefault();
      return;
    }
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onCancel={handleCancel}
      className={cn(
        "rounded-2xl bg-paper p-0 shadow-2xl ring-1 ring-paper-line backdrop:bg-ink/60",
        SIZES[size],
        "w-[calc(100%-2rem)]"
      )}
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div className="flex items-start justify-between gap-4 border-b border-paper-line p-5">
        <div>
          <h2 id="modal-title" className="text-lg font-bold tracking-tight">
            {title}
          </h2>
          {description && (
            <p
              id="modal-description"
              className="mt-1 text-sm text-ink-muted"
            >
              {description}
            </p>
          )}
        </div>
        {dismissable && (
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 grid size-8 shrink-0 place-items-center rounded-full hover:bg-paper-muted"
            aria-label="Fermer"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
