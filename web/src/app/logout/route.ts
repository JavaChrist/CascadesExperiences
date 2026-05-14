import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Route handler de logout.
 *
 * POST /logout → invalide la session Supabase et redirige vers /.
 * Côté UI : on appelle via un <form action="/logout" method="post"> ou un
 * <button onClick> qui fait un fetch POST. Pas de GET pour éviter le risque
 * CSRF (déconnexion via lien malveillant).
 */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", getSiteUrl()));
}

function getSiteUrl() {
  // En dev : http://localhost:3000 ; en prod : ton domaine Vercel.
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
