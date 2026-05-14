# Démarrage rapide — Cascades Expériences

## 1. Ouvrir le projet dans Cursor

1. Décompresse le ZIP (clic droit → *Extraire tout…*) ou récupère le repo via `git clone`.
2. Ouvre **Cursor**.
3. **File → Open Folder…** puis sélectionne le dossier `CascadesExperiences/`.
4. Cursor lit automatiquement `AGENTS.md` + `CLAUDE.md` dans `web/` : l'agent saura qu'il doit consulter `web/node_modules/next/dist/docs/` avant tout code Next.js (Next 16 a changé pas mal d'APIs : `middleware` → `proxy`, `cookies()` async, etc.).

## 2. Installer les dépendances

```bash
cd web
npm install        # ~1 minute, paquets Next + Tailwind + Supabase + Leaflet…
```

Optionnel — uniquement si tu veux relancer le scraping des médias Wix :

```bash
cd ../scrapers
npm install        # installe sharp et ffmpeg-static
```

## 3. Configurer Supabase

Le CMS et l'auth tournent sur Supabase. Sans les credentials, `/admin` et `/login` plantent, et `/stages` affichera 0 sessions.

### 3a. Variables d'environnement

```bash
cp web/.env.local.example web/.env.local
```

Puis va sur **Supabase Dashboard → Settings → API** et remplis :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # publique (bridée par RLS)
SUPABASE_SERVICE_ROLE_KEY=...        # SECRET — bypass tous les RLS
```

Le fichier `.env.local` est gitignored, jamais commit.

### 3b. Schéma de base

Dans **Supabase Dashboard → SQL Editor → New query**, colle le contenu de `web/supabase/schema.sql` et clique **Run**. Ça crée les tables, les RLS, les triggers, et seed 7 sessions de démo.

### 3c. Premier user admin

1. **Authentication → Users → Add user** : entre ton email + mot de passe.
2. Dans le **SQL Editor**, lance :
   ```sql
   update public.profiles set role = 'admin' where email = 'ton@email.fr';
   ```

## 4. Lancer le dev server

```bash
cd web
npm run dev
```

Ouvre <http://localhost:3000> dans Chrome.

- **Pages publiques** : `/`, `/stages`, `/stages/wheeling` (etc.), `/club`, `/boutique`, `/contact`
- **Admin** : `/admin` (redirige vers `/login` si pas authentifié)

## 5. Lancer un build de production

```bash
cd web
npm run build      # build Next 16 avec Turbopack
npm run start      # sert le build sur :3000
```

## Structure rapide

```
CascadesExperiences/
├── web/
│   ├── src/app/                  # Routes Next (public + /login + /admin)
│   ├── src/components/           # Composants UI + layout
│   ├── src/content/              # stages.ts (catalogue) + sessions-data.ts (fetch Supabase)
│   ├── src/lib/supabase/         # Clients browser / server / admin / types
│   ├── src/lib/site.ts           # Source unique pour nav, contact, réseaux
│   ├── src/proxy.ts              # Proxy Next (refresh tokens + protection /admin)
│   ├── public/media/photos/      # 84 photos WebP (18.8 MB)
│   ├── public/media/videos/      # 3 vidéos H.264 720p (80 MB)
│   ├── supabase/schema.sql       # Schéma à lancer dans Supabase Dashboard
│   └── .env.local                # Credentials (gitignored)
└── scrapers/                     # Scripts one-shot pour ré-importer les médias Wix
```

## État du projet

- ✅ Toutes les pages publiques (home, /stages, 4 détails, club, boutique, contact avec carte)
- ✅ PWA (manifest + service worker)
- ✅ 84 photos + 3 vidéos du site Wix intégrées
- ✅ CMS Supabase : `/admin` avec liste + new + edit + delete + auth email/password
- ⏳ Test bout en bout du flux admin à finir (login → edit → publish → voir sur /stages)
- ⏳ Strip de Decap CMS (legacy, abandonné — `public/admin/`, `content/sessions/`, deps `decap-server`/`concurrently`)
- ⏳ Branchement Mollie pour la réservation
- ⏳ SEO/perf (sitemap, robots.txt, icônes PWA)
- ⏳ Déploiement Vercel preview

Voir `README.md` à la racine pour la stack complète et les conventions.
