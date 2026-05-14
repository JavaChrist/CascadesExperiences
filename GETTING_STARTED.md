# Démarrage rapide — Cascades Expériences

## 1. Ouvrir le projet dans Cursor

1. Décompresse le ZIP (clic droit → *Extraire tout…* ou drag-drop).
2. Ouvre **Cursor**.
3. **File → Open Folder…** puis sélectionne le dossier décompressé `CascadesExperiences/`.
4. Cursor lit automatiquement `AGENTS.md` + `CLAUDE.md` dans `web/` : l'agent saura qu'il doit consulter `web/node_modules/next/dist/docs/` avant tout code Next.js (parce que Next 16 a changé pas mal d'APIs vs ce que les modèles connaissent).

## 2. Installer les dépendances

Le ZIP n'inclut pas `node_modules` (volumineux et reconstruit à l'identique via `package-lock.json`).

Dans le terminal intégré de Cursor (`` Ctrl+` ``) :

```bash
cd web
npm install        # ~1 minute, 428 paquets
```

Optionnel — uniquement si tu veux relancer le scraping des médias Wix :

```bash
cd ../scrapers
npm install        # installe sharp pour l'optimisation d'images
```

## 3. Lancer le dev server

```bash
cd web
npm run dev
```

Ouvre <http://localhost:3000> dans Chrome. Le hot-reload s'active automatiquement à chaque sauvegarde.

## 4. Lancer un build de production

```bash
cd web
npm run build      # build Next 16 avec Turbopack
npm run start      # sert le build sur http://localhost:3000
```

## Structure rapide

```
CascadesExperiences/
├── web/                       # Application Next.js
│   ├── src/app/               # Routes (App Router)
│   ├── src/components/        # Composants UI + layout
│   ├── src/content/stages.ts  # Modèle des stages + dates de démo
│   ├── src/lib/site.ts        # Source unique pour nav, contact, réseaux
│   └── public/media/photos/   # 84 photos optimisées WebP (18.8 MB)
├── scrapers/                  # Scripts one-shot pour ré-importer les médias Wix
└── memory/                    # Notes de session (optionnel, peut être supprimé)
```

## État du projet (au moment du ZIP)

- ✅ 13 routes statiques en place (home, stages, 4 pages détail, club, boutique, contact)
- ✅ PWA (manifest + service worker)
- ✅ 84 photos du site Wix actuel intégrées
- ⏳ Vidéos Wix à exporter manuellement depuis l'admin Wix → déposer dans `web/public/media/videos/`
- ⏳ À brancher : Supabase auth, Resend (mail), Mollie (paiement), Decap CMS (édition des dates)
- ⏳ Déploiement Vercel en attente

Voir `web/README.md` pour la stack et les conventions de code.
