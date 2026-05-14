# Cascades Expériences — Refonte du site

Refonte du site [cascadesexperiences.fr](https://cascadesexperiences.fr) (actuellement hébergé chez Wix) en site moderne, mobile-first, installable (PWA), avec un back-office propre.

> Stages moto wheeling et pilotage sur piste, coaching privé, randonnées électriques. Adresse principale : **Pôle Mécanique de Clastres (02480 Artemps)**.

## Structure du dépôt

```
CascadesExperiences/
├── web/                          # Application Next.js (App Router + Tailwind v4 + TS)
│   ├── src/app/                  # Routes (public + /login + /admin)
│   ├── src/components/           # Composants UI réutilisables
│   ├── src/content/              # Catalogue stages + accès Supabase
│   ├── src/lib/                  # Helpers (supabase, cn, site config)
│   ├── public/media/             # Photos optimisées + vidéos (scrapées du Wix)
│   ├── supabase/schema.sql       # Schéma DB à exécuter dans Supabase Dashboard
│   └── .env.local                # Credentials Supabase (gitignored)
└── scrapers/                     # Scripts one-shot (récupération médias Wix)
```

## Stack

| Brique | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 16** (App Router) + React 19 | SSR, Server Actions, App Router |
| Styling | **Tailwind v4** (`@import "tailwindcss"` + `@theme`) | Design tokens en CSS-first, plus de `tailwind.config.js` |
| Icônes | `lucide-react` uniquement | Cohérence, pas d'émojis dans l'UI |
| Auth | **Supabase** (`@supabase/ssr`) | Auth + DB + RLS, stack unifiée |
| Database / CMS | **Supabase Postgres** | Édition via `/admin` custom, RLS pour la sécurité |
| Cartes | **Leaflet** + tiles OSM | Pas de clé API, pas de tracking RGPD |
| Paiement | Mollie (à brancher) | — |
| PWA | Manifest natif Next 16 + service worker minimal | Installable, prête pour push notifications |
| Hébergement | Vercel | Déploiement auto sur push main |

## Démarrage rapide

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

Pour valider une build de production :

```bash
cd web
npm run build
```

## Configuration Supabase

Le CMS et l'auth utilisent un projet Supabase. Sans les credentials, les pages publiques fonctionnent en mode dégradé (sessions vides) mais `/admin` et `/login` plantent.

### 1. Variables d'environnement

Copier `web/.env.local.example` en `web/.env.local` (gitignored) et remplir avec tes clés (Supabase Dashboard → Settings → API) :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # publique, bridée par RLS
SUPABASE_SERVICE_ROLE_KEY=...        # SECRET — bypass tous les RLS
```

### 2. Schéma de base

Dans Supabase Dashboard → SQL Editor → New query, coller le contenu de `web/supabase/schema.sql` et **Run**. Ça crée :

- Enum `stage_type` (wheeling / conduite / prive / rando-electrique)
- Table `sessions` (les dates planifiées des stages) + index
- Table `profiles` (1:1 avec `auth.users`, ajoute un champ `role`)
- Triggers (auto-création du profile au signup, `updated_at`)
- Helper SQL `is_admin(uid)` utilisé par les policies
- RLS : lecture publique des sessions, écriture réservée aux admins
- Seed des 7 sessions de démo

### 3. Premier user admin

1. **Supabase Dashboard → Authentication → Users → Add user** : entre ton email + mot de passe.
2. **SQL Editor** :
   ```sql
   update public.profiles set role = 'admin' where email = 'ton@email.fr';
   ```
3. Connecte-toi sur `/login` → tu arrives sur `/admin` avec accès complet aux sessions.

## Conventions de code

- **Feedback utilisateur** : jamais `alert()` / `confirm()` / `prompt()` natifs — toujours une modale custom (`web/src/components/ui/modal.tsx`) ou un message inline.
- **Icônes** : `lucide-react` uniquement. Pas d'émojis dans l'UI rendue à l'utilisateur final (OK dans les commentaires et la doc).
- **Mobile-first** : tous les écrans pensés mobile d'abord, puis responsive desktop.
- **Doc Next.js** : avant tout code Next.js, consulter `web/node_modules/next/dist/docs/` — les API ont changé en 16 (`middleware` → `proxy`, `cookies()` async, etc.).
- **Server-only** : tout module qui touche le filesystem ou Supabase côté serveur importe `"server-only"` en tête, pour planter le build si accidentellement importé côté client.

## Roadmap

- [x] Scaffold Next.js + Tailwind + PWA + design tokens
- [x] Pipeline médias Wix (84 photos WebP + 3 vidéos 720p compressées)
- [x] Page d'accueil avec hero vidéo + bloc Prochaines dates
- [x] Page `/stages` avec calendrier filtrable groupé par mois (pain point UX résolu)
- [x] Pages détail stages (4 routes SSG)
- [x] Pages "en construction" élégantes pour Club et Boutique
- [x] Page Contact avec formulaire (server action) + carte OSM du Pôle Mécanique de Clastres
- [x] CMS Phase 1 : Decap CMS local-only (abandonné au profit de Supabase)
- [x] **CMS Phase 2 : Supabase** — sessions en base, auth email/password, `/admin` custom avec CRUD + RLS
- [ ] Verify bout en bout : login → `/admin` → create / edit / delete une session
- [ ] Strip Decap : retirer `decap-server`, `concurrently`, `public/admin/`, `content/sessions/`, `scripts/cms-dev.mjs` (à faire dès que la Phase 2 est validée)
- [ ] Branchement Mollie (checkout réservation, webhook)
- [ ] SEO/perf (sitemap.xml, robots.txt, icônes PWA, audit Lighthouse > 95)
- [ ] Déploiement Vercel preview avec env vars Supabase

## Commands utiles

```bash
# Développement
cd web && npm run dev              # serveur Next sur :3000

# Build de production (vérification)
cd web && npm run build

# Scrapers (one-shot, depuis la racine du repo)
node scrapers/wix-media.mjs        # photos
node scrapers/wix-videos.mjs       # vidéos
node scrapers/optimize-videos.mjs  # compression ffmpeg
```
