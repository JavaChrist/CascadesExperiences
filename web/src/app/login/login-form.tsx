"use client";

import { useState, useTransition } from "react";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { login } from "./actions";

/**
 * Form de login Supabase (email + password).
 * - Validation côté client minimaliste (les vraies erreurs viennent du server)
 * - États : idle / pending / error (inline, jamais d'alert)
 */
export function LoginForm({ next }: { next: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("next", next);

    startTransition(async () => {
      const result = await login(formData);
      // En cas de succès, login() a déjà lancé un redirect — pas de return
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-paper p-6 ring-1 ring-paper-line sm:p-8"
      noValidate
    >
      <Field label="Email" name="email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass()}
        />
      </Field>

      <Field label="Mot de passe" name="password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          className={inputClass()}
        />
      </Field>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-brand/40 bg-brand-soft px-4 py-3 text-sm text-brand-dark"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} size="lg" className="w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Connexion en cours…
          </>
        ) : (
          <>
            <LogIn className="size-4" aria-hidden />
            Se connecter
          </>
        )}
      </Button>

      <p className="pt-2 text-center text-xs text-ink-muted">
        Pas de compte ? Demande à l&apos;administrateur de t&apos;en créer un.
      </p>
    </form>
  );
}

function inputClass() {
  return cn(
    "w-full rounded-lg border border-paper-line bg-paper px-3.5 py-2.5 text-sm",
    "outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20",
    "hover:border-ink/20"
  );
}

function Field({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
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
      </label>
      {children}
    </div>
  );
}
