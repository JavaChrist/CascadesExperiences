"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Header sticky, mobile-first.
 * Mobile : logo + burger → tiroir plein écran.
 * Desktop : nav horizontale + CTA "Réserver".
 *
 * Aucun `alert()` ni dropdown natif — tout custom, accessible au clavier.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Ferme le menu au changement de route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Verrouille le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-paper-line bg-paper/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-baseline gap-2 font-black tracking-tight"
          aria-label="Accueil Cascades Expériences"
        >
          <span className="text-lg sm:text-xl">Cascades</span>
          <span className="text-lg text-brand sm:text-xl">Expériences</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {siteConfig.nav.slice(1).map((item) => (
            <NavLink key={item.href} href={item.href} active={pathname === item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={siteConfig.contact.phoneHref}
            className="hidden items-center gap-2 text-sm font-medium text-ink-soft hover:text-brand md:inline-flex"
          >
            <Phone className="size-4" aria-hidden />
            {siteConfig.contact.phone}
          </a>
          <LinkButton href="/stages" size="sm" className="hidden sm:inline-flex">
            Réserver
          </LinkButton>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 grid size-10 place-items-center rounded-full hover:bg-paper-muted lg:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </Container>

      {/* Tiroir mobile */}
      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-x-0 top-16 z-30 origin-top overflow-hidden bg-paper transition-[max-height,opacity] duration-200 lg:hidden",
          open ? "max-h-[calc(100dvh-4rem)] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        )}
        aria-hidden={!open}
      >
        <Container className="flex flex-col gap-1 py-4">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-3 text-base font-semibold",
                pathname === item.href
                  ? "bg-brand-soft text-brand"
                  : "text-ink hover:bg-paper-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-3 border-t border-paper-line pt-4">
            <a
              href={siteConfig.contact.phoneHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft"
            >
              <Phone className="size-4" aria-hidden />
              {siteConfig.contact.phone}
            </a>
          </div>
        </Container>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors",
        active ? "text-brand" : "text-ink-soft hover:text-ink"
      )}
    >
      {children}
    </Link>
  );
}
