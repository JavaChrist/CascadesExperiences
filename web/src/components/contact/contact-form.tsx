"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STAGES } from "@/content/stages";
import { cn } from "@/lib/cn";
import {
  sendContactMessage,
  type ContactInput,
  type ContactResult,
} from "@/app/contact/actions";

const TOPICS = [
  { value: "stage", label: "Réserver un stage" },
  { value: "prive", label: "Stage privé / sur-mesure" },
  { value: "club", label: "Adhésion club" },
  { value: "boutique", label: "Boutique / carte cadeau" },
  { value: "autre", label: "Autre question" },
];

type FieldErrors = Extract<ContactResult, { ok: false }>["errors"];

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSubmitError(null);

    const data = new FormData(event.currentTarget);
    const input: ContactInput = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? "") || undefined,
      topic: String(data.get("topic") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    startTransition(async () => {
      try {
        const result = await sendContactMessage(input);
        if (result.ok) {
          setDone(true);
        } else {
          setErrors(result.errors);
        }
      } catch (err) {
        console.error("[contact] erreur envoi", err);
        setSubmitError(
          "Une erreur est survenue. Réessaie dans un instant ou écris-nous directement par mail."
        );
      }
    });
  }

  if (done) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 rounded-2xl bg-brand-soft p-10 text-center ring-1 ring-brand/20"
      >
        <span className="grid size-14 place-items-center rounded-full bg-brand text-paper">
          <CheckCircle2 className="size-7" aria-hidden />
        </span>
        <h2 className="text-2xl font-black tracking-tight">Message envoyé</h2>
        <p className="max-w-sm text-ink-soft">
          On revient vers toi très vite — en général dans la journée. Pense à
          vérifier tes spams si tu attends notre réponse par mail.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            setDone(false);
            setErrors({});
          }}
        >
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-paper p-6 ring-1 ring-paper-line sm:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom" name="name" error={errors.name} required>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={inputClass(!!errors.name)}
          />
        </Field>
        <Field label="Email" name="email" error={errors.email} required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass(!!errors.email)}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Téléphone" name="phone" hint="Optionnel" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass(!!errors.phone)}
          />
        </Field>
        <Field label="Sujet" name="topic" error={errors.topic} required>
          <select
            id="topic"
            name="topic"
            defaultValue=""
            required
            className={inputClass(!!errors.topic)}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {TOPICS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
            <optgroup label="Stage spécifique">
              {STAGES.map((s) => (
                <option key={s.slug} value={`stage:${s.slug}`}>
                  {s.title}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>
      </div>

      <Field
        label="Message"
        name="message"
        hint="10 caractères minimum — niveau, objectifs, dates voulues…"
        error={errors.message}
        required
      >
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={cn(inputClass(!!errors.message), "min-h-[140px] resize-y")}
        />
      </Field>

      {submitError && (
        <p
          role="alert"
          className="rounded-lg border border-brand/40 bg-brand-soft px-4 py-3 text-sm text-brand-dark"
        >
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-xs text-ink-muted">
          En envoyant ce formulaire tu acceptes notre{" "}
          <a href="/confidentialite" className="underline hover:text-ink">
            politique de confidentialité
          </a>
          .
        </p>
        <Button type="submit" disabled={pending} size="lg">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Envoi…
            </>
          ) : (
            <>
              Envoyer
              <Send className="size-4" aria-hidden />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers visuels
// ────────────────────────────────────────────────────────────────────────────

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
      <label htmlFor={name} className="flex items-baseline gap-1 text-sm font-semibold">
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
          className="text-xs font-medium text-brand"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
