import Link from "next/link";
import { Mail, Phone, Clock } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/container";

/**
 * Icônes de marques — Lucide ne fournit plus les logos de marques (Instagram,
 * YouTube, TikTok) pour des raisons de trademark. On les redessine en SVG.
 */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63A6.13 6.13 0 0 0 1.92 2.05 6.13 6.13 0 0 0 .5 4.27c-.3.76-.5 1.64-.56 2.91C-.12 8.45-.13 8.86-.13 12.12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.32.81.75 1.5 1.42 2.17a6.13 6.13 0 0 0 2.22 1.42c.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a6.13 6.13 0 0 0 2.22-1.42 6.13 6.13 0 0 0 1.42-2.22c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91A6.13 6.13 0 0 0 22.07 1.92 6.13 6.13 0 0 0 19.86.5c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.12-2.12C19.46 3.5 12 3.5 12 3.5s-7.46 0-9.38.58A3 3 0 0 0 .5 6.2C-.08 8.12-.08 12-.08 12s0 3.88.58 5.8a3 3 0 0 0 2.12 2.12c1.92.58 9.38.58 9.38.58s7.46 0 9.38-.58a3 3 0 0 0 2.12-2.12c.58-1.92.58-5.8.58-5.8s0-3.88-.58-5.8ZM9.55 15.7V8.3l6.4 3.7-6.4 3.7Z" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.01a8.16 8.16 0 0 0 4.77 1.52V7.16a4.85 4.85 0 0 1-1.84-.47z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <Container className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-black tracking-tight">
            <span>Cascades</span>{" "}
            <span className="text-brand">Expériences</span>
          </p>
          <p className="mt-3 text-sm text-paper/70">{siteConfig.tagline}.</p>
          <p className="mt-2 text-sm text-paper/60">{siteConfig.description}</p>
        </div>

        <nav aria-label="Navigation pied de page">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-paper/50">
            Navigation
          </h2>
          <ul className="mt-4 space-y-2">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-paper/80 hover:text-paper"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-paper/50">
            Contact
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2 text-paper/80">
              <Phone className="size-4 shrink-0" aria-hidden />
              <a
                href={siteConfig.contact.phoneHref}
                className="hover:text-paper"
              >
                {siteConfig.contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-2 text-paper/80">
              <Mail className="size-4 shrink-0" aria-hidden />
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="break-all hover:text-paper"
              >
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex items-start gap-2 text-paper/80">
              <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
              <ul className="space-y-0.5">
                {siteConfig.contact.hours.map((h) => (
                  <li key={h.days}>
                    <span className="text-paper">{h.days}</span> · {h.time}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-paper/50">
            Suivez-nous
          </h2>
          <ul className="mt-4 flex gap-3">
            <li>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-full bg-paper/5 hover:bg-paper/15"
                aria-label="Instagram"
              >
                <InstagramIcon className="size-4" />
              </a>
            </li>
            <li>
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-full bg-paper/5 hover:bg-paper/15"
                aria-label="YouTube"
              >
                <YoutubeIcon className="size-4" />
              </a>
            </li>
            <li>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-full bg-paper/5 hover:bg-paper/15"
                aria-label="TikTok"
              >
                <TiktokIcon className="size-4" />
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-paper/10">
        <Container className="flex flex-col gap-3 py-5 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <Link href="/mentions-legales" className="hover:text-paper">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="hover:text-paper">
                Confidentialité
              </Link>
            </li>
            <li>
              <Link href="/cgv" className="hover:text-paper">
                CGV
              </Link>
            </li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}
