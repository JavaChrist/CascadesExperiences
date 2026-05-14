# Cascades Expériences — Refonte du site

Refonte du site [cascadesexperiences.fr](https://cascadesexperiences.fr) (actuellement hébergé chez Wix) en site moderne, mobile-first, installable (PWA).

> Stages moto wheeling et pilotage sur piste, coaching privé, randonnées électriques.

## Structure du dépôt

```
CascadesExperiences/
├── web/             # Application Next.js (App Router + Tailwind v4 + TypeScript)
├── scrapers/        # Scripts utilitaires (récupération des médias Wix, etc.)
└── docs/            # Documentation métier, audits, briefs
```

## Stack

- **Framework** : Next.js 16 (App Router) + React 19
- **Styling** : Tailwind CSS v4 + design tokens custom (`bg-brand`, `text-ink`…)
- **Icônes** : `lucide-react` (uniquement, pas d'émojis dans l'UI)
- **Auth** : Supabase (à brancher)
- **Paiement** : Mollie (à brancher)
- **CMS** : Decap/Sanity (à brancher pour les dates de stages)
- **PWA** : manifest natif Next 16 + service worker minimal
- **Hébergement** : Vercel

## Démarrage rapide

```bash
cd web
npm install        # déjà fait lors du scaffold
npm run dev        # http://localhost:3000
```

Pour valider qu'une build de production passe :

```bash
cd web
npm run build
```

## Conventions

- **Feedback utilisateur** : jamais `alert()` / `confirm()` natifs — toujours une modale custom ou un toast.
- **Icônes** : seules les icônes Lucide sont autorisées dans l'UI. Pas d'émojis.
- **Mobile-first** : tous les écrans pensés mobile d'abord.
- **Doc Next.js** : avant tout code Next.js, consulter `web/node_modules/next/dist/docs/` — les API ont changé en 16.

## Roadmap (extrait)

- [x] Scaffold Next.js + Tailwind + PWA
- [ ] Scraper les médias du site Wix actuel
- [ ] Page d'accueil + bloc "Prochaines dates"
- [ ] Page `/stages` avec calendrier filtrable (corrige le pain point UX principal du site actuel)
- [ ] Pages détail stages (wheeling / conduite / privé / rando électrique)
- [ ] Pages "en construction" élégantes pour Club et Boutique
- [ ] Branchement Supabase (auth) et Mollie (paiement)
- [ ] Déploiement Vercel + bascule progressive du domaine
