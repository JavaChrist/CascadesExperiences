# Scrapers

Scripts utilitaires one-shot pour préparer le contenu du nouveau site.

## Pipeline d'import média

```
  cascadesexperiences.fr (Wix)
            │
            ▼
  1. wix-media.mjs           → scrapers/output/images/  (originals, pleine résolution)
            │                  scrapers/output/videos/  (vide en pratique, Wix hydrate en JS)
            │                  scrapers/output/manifest.json
            ▼
  2. optimize-images.mjs     → scrapers/output/optim/   (WebP ≤2400 px q82 + JPG fallback)
            │                  scrapers/output/optim/index.json
            ▼
  3. build-contact-sheet.mjs → scrapers/output/optim/contact-sheet.html
            │                  (grille de tri visuel — pour curation manuelle)
            ▼
  4. publish-media.mjs       → web/public/media/photos/
                               web/public/media/media-index.json
                               web/public/media/videos/.gitkeep
                               web/public/media/README.md
```

Le dossier `scrapers/output/` est **gitignoré** : il contient des originaux lourds qui ne doivent jamais entrer dans le repo. Seul ce qui sort en étape 4 (dans `web/public/media/`) est versionné.

## 1. `wix-media.mjs` — scrape les médias du site Wix

Visite chaque page (liste dans `PAGES` en tête du fichier, issue du `pages-sitemap.xml`), extrait les URLs `static.wixstatic.com/media/…` (images) et `video.wixstatic.com/video/…` (vidéos), et télécharge la **version originale pleine résolution** des images (les transformations Wix `/v1/fill/w_X,h_Y/…` sont droppées).

```bash
node scrapers/wix-media.mjs
```

> Wix charge ses vidéos en JavaScript après hydration, donc le scrape HTTP statique ne les capture pas. Pour les vidéos, exporter manuellement depuis l'admin Wix → Media Manager, puis déposer dans `web/public/media/videos/`.

## 2. `optimize-images.mjs` — sharp → WebP + JPG fallback

Re-traite chaque image dans `scrapers/output/images/` :
- redimensionne à **2400 px** de large max (respect EXIF orientation)
- exporte en **WebP** quality 82
- exporte aussi en **JPEG** quality 80 pour les photos > 200 KB (fallback)

```bash
node scrapers/optimize-images.mjs
```

Gain typique : **−90 %** de poids vs originaux Wix (386 MB → 39 MB sur ce site).

## 3. `build-contact-sheet.mjs` — planche-contact HTML

Génère `scrapers/output/optim/contact-sheet.html`, une grille de toutes les images optimisées avec :
- numéro + miniature + pages d'origine
- clic = sélection (persistée en localStorage)
- bouton "Copier la sélection" → liste des numéros à reporter dans le chat

```bash
node scrapers/build-contact-sheet.mjs
```

## 4. `publish-media.mjs` — copie vers `web/public/media/`

Copie les `.webp` retenus vers `web/public/media/photos/` et génère `media-index.json` qui mappe chaque fichier à ses pages d'origine.

```bash
node scrapers/publish-media.mjs
```

## Modifier les pages à crawler

Éditer la constante `PAGES` en tête de `wix-media.mjs`. La liste vient du `pages-sitemap.xml` Wix.
