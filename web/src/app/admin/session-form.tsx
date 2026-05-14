"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STAGES } from "@/content/stages";
import { cn } from "@/lib/cn";
import type { StageSession } from "@/content/stages";
import type { SessionFormErrors, SessionFormResult } from "./actions";

interface Props {
  /** Si fourni : mode édition. Sinon : mode création. */
  initial?: StageSession;
  /** Server action à appeler (createSession ou updateSession bind id). */
  action: (formData: FormData) => Promise<SessionFormResult>;
  /** Label du bouton submit selon le mode. */
  submitLabel: string;
}

/**
 * Form CRUD pour une session de stage. Mutualisé entre /admin/sessions/new
 * et /admin/sessions/[id]/edit — pré-rempli en mode édition.
 *
 * États : idle / pending / errors inline (jamais d'alert).
 */
export function SessionForm({ initial, action, submitLabel }: Props) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<SessionFormErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await action(formData);
        // Si succès, l'action a déjà fait un redirect — pas de return ici
        if (!result.ok) {
          setErrors(result.errors);
        }
      } catch (err) {
        // NEXT_REDIRECT est levé en cas de succès → on l'ignore
        // (sinon il pollue l'état)
        const msg = (err as Error)?.message ?? "";
        if (!msg.includes("NEXT_REDIRECT")) {
          setErrors({ _global: `Erreur inattendue : ${msg}` });
        }
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-paper p-6 ring-1 ring-paper-line sm:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type de stage" name="stage" error={errors.stage} required>
          <select
            id="stage"
            name="stage"
            defaultValue={initial?.stage ?? ""}
            required
            className={inputClass(!!errors.stage)}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {STAGES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date" name="date" error={errors.date} required>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={initial?.date ?? ""}
            required
            className={inputClass(!!errors.date)}
          />
        </Field>
      </div>

      <Field
        label="Lieu"
        name="location"
        hint="Ex. Pôle Mécanique de Clastres (02)"
        error={errors.location}
        required
      >
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={initial?.location ?? "Pôle Mécanique de Clastres (02)"}
          required
          className={inputClass(!!errors.location)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Places restantes"
          name="spotsLeft"
          hint="0 = Complet"
          error={errors.spotsLeft}
          required
        >
          <input
            id="spotsLeft"
            name="spotsLeft"
            type="number"
            min={0}
            defaultValue={initial?.spotsLeft ?? 8}
            required
            className={inputClass(!!errors.spotsLeft)}
          />
        </Field>

        <Field
          label="Capacité totale"
          name="capacity"
          error={errors.capacity}
          required
        >
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={initial?.capacity ?? 8}
            required
            className={inputClass(!!errors.capacity)}
          />
        </Field>
      </div>

      {errors._global && (
        <p
          role="alert"
          className="rounded-lg border border-brand/40 bg-brand-soft px-4 py-3 text-sm text-brand-dark"
        >
          {errors._global}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={pending} size="lg">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="size-4" aria-hidden />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full rounded-lg border bg-paper px-3.5 py-2.5 text-sm",
    "outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20",
    hasError
      ? "border-brand/60 focus:border-brand"
      : "border-paper-line hover:border-ink/20"
  );
}

function Field({
  label,
  name,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="flex items-baseline gap-1 text-sm font-semibold"
      >
        {label}
        {required && <span className="text-brand">*</span>}
        {hint && (
          <span className="text-xs font-normal text-ink-muted">— {hint}</span>
        )}
      </label>
      {children}
      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-xs font-medium text-brand"
        >
          {error}
        </p>
      )}
    </div>
  );
}
