# Scrapers

Scripts utilitaires one-shot pour préparer le contenu du nouveau site.

## Pipeline d'import média

```
  cascadesexperiences.fr (Wix)
            │
            ├── IMAGES (HTML statique) ───────────────────────────┐
            │                                                     ▼
            │  1. wix-media.mjs           → scrapers/output/images/
            │  2. optimize-images.mjs     → scrapers/output/optim/
            │  3. build-contact-sheet.mjs → contact-sheet.html
            │  4. publish-media.mjs       → web/public/media/photos/
            │
            └── VIDÉOS (encodées en JSON inline) ─────────────────┐
                                                                  ▼
               A. wix-videos.mjs        → web/public/media/videos/ (1080p brut)
               B. optimize-videos.mjs   → web/public/media/videos/ (720p H.264)
                                          scrapers/output/videos-original/ (backup 1080p)
```

Le dossier `scrapers/output/` est **gitignoré** : il contient des originaux lourds qui ne doivent jamais entrer dans le repo. Seul ce qui sort vers `web/public/media/` est versionné.

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

## A. `wix-videos.mjs` — scrape les vidéos Wix

Les vidéos Wix sont encodées dans le HTML sous forme JSON inline (entourées d'entités `&quot;`), pas en URL directe — d'où un script dédié. Trouve les hash de vidéo et leur résolution max, puis télécharge en MP4 1080p directement dans `web/public/media/videos/`.

```bash
node scrapers/wix-videos.mjs
```

## B. `optimize-videos.mjs` — recompresse via ffmpeg-static

Re-encode les vidéos de `web/public/media/videos/` en 720p H.264 CRF 28 (taille ÷ 3 environ, qualité acceptable pour fond/hero). Les originaux 1080p sont déplacés vers `scrapers/output/videos-original/` (gitignoré, conservés pour ré-encodage avec d'autres paramètres si besoin).

```bash
node scrapers/optimize-videos.mjs
```

Si tu veux une qualité différente : éditer `FFMPEG_ARGS` dans le script (CRF 24 = meilleure qualité, CRF 32 = plus léger ; `scale=-2:480` pour passer en 480p).

## Modifier les pages à crawler

Éditer la constante `PAGES` en tête de `wix-media.mjs` ou `wix-videos.mjs`. La liste vient du `pages-sitemap.xml` Wix.
