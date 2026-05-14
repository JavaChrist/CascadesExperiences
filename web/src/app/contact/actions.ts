"use server";

/**
 * Server action du formulaire de contact.
 *
 * Pour l'instant : valide les champs et log côté serveur. Les envois réels
 * (Resend / Supabase / mailto-fallback) seront branchés quand on connectera
 * Supabase et un provider mail. Cette fonction expose déjà une API stable
 * — input shape + ContactResult — pour qu'on puisse swapper l'implémentation
 * sans toucher au composant client.
 */

export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
};

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string>>;

export type ContactResult =
  | { ok: true }
  | { ok: false; errors: ContactFieldErrors };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(input: ContactInput): ContactFieldErrors | null {
  const errors: ContactFieldErrors = {};
  if (!input.name?.trim()) errors.name = "Indique-nous ton nom.";
  if (!input.email?.trim()) {
    errors.email = "L'email est requis.";
  } else if (!EMAIL_RE.test(input.email.trim())) {
    errors.email = "Cet email n'a pas l'air valide.";
  }
  if (!input.topic) errors.topic = "Choisis un sujet.";
  if (!input.message?.trim() || input.message.trim().length < 10) {
    errors.message = "Quelques mots de plus pour qu'on te réponde au mieux ?";
  }
  return Object.keys(errors).length ? errors : null;
}

export async function sendContactMessage(
  input: ContactInput
): Promise<ContactResult> {
  const errors = validate(input);
  if (errors) {
    return { ok: false, errors };
  }

  // ───────────────────────────────────────────────────────────────────
  // TODO: brancher l'envoi réel (Resend, Supabase row, etc.)
  // Pour l'instant on log côté serveur pour qu'aucun message ne soit perdu
  // pendant la phase MVP — les logs Vercel le conservent.
  // ───────────────────────────────────────────────────────────────────
  console.log("[contact] nouveau message", {
    from: `${input.name} <${input.email}>`,
    phone: input.phone || "—",
    topic: input.topic,
    preview: input.message.slice(0, 200),
    at: new Date().toISOString(),
  });

  // Petite latence simulée pour que l'état "envoi en cours" soit visible
  await new Promise((r) => setTimeout(r, 400));

  return { ok: true };
}
