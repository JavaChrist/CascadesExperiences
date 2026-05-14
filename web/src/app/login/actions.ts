"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Server action de login.
 * Connecte l'utilisateur via Supabase, puis redirige vers `next` (URL passée
 * en query string par le middleware) ou /admin par défaut.
 */
export async function login(formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { ok: false, error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Mappage des messages d'erreur Supabase vers du français user-friendly
    const friendly =
      error.message === "Invalid login credentials"
        ? "Email ou mot de passe incorrect."
        : error.message === "Email not confirmed"
          ? "Email non confirmé — vérifie ta boîte de réception."
          : error.message;
    return { ok: false, error: friendly };
  }

  // `redirect` lance une exception NEXT_REDIRECT — pas de return après
  redirect(next.startsWith("/") ? next : "/admin");
}
