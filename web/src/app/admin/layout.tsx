import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Espace d'administration Cascades Expériences.",
  robots: { index: false, follow: false },
};

/**
 * Layout de la zone /admin/*.
 *
 * Le proxy.ts a déjà filtré : si on arrive ici, l'utilisateur est authentifié.
 * On vérifie en plus qu'il a le rôle `admin` côté DB. Sinon on le déconnecte
 * "logiquement" — redirect vers /login avec un message d'erreur.
 *
 * Forced dynamic : on ne veut pas qu'une vieille page admin soit cachée.
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Cas théoriquement déjà géré par proxy.ts, mais ceinture + bretelles
    redirect("/login?next=/admin");
  }

  // Récupère le rôle depuis profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    // L'utilisateur est connecté mais pas admin → on le sort de l'espace
    redirect("/?notAdmin=1");
  }

  const displayName = profile.full_name || profile.email || user.email || "Admin";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper-muted">
      {/* Sous-header admin */}
      <div className="border-b border-paper-line bg-paper">
        <Container className="flex h-14 items-center justify-between gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-bold"
          >
            <LayoutDashboard className="size-4 text-brand" aria-hidden />
            Admin
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-ink-muted sm:inline">
              Connecté en tant que{" "}
              <span className="font-semibold text-ink">{displayName}</span>
            </span>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-ink/30 hover:text-ink"
              >
                <LogOut className="size-3.5" aria-hidden />
                Déconnexion
              </button>
            </form>
          </div>
        </Container>
      </div>

      <Container className="py-8 sm:py-12">{children}</Container>
    </div>
  );
}
