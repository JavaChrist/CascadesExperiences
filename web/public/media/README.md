# web/public/media — médias du site

## photos/
Photos issues du site Wix actuel, optimisées en WebP (max 2400 px, qualité 82).
84 fichiers, 18.8 MB au total.

Le fichier `media-index.json` mappe chaque image à ses pages d'origine Wix, ce qui aide à retrouver où la replacer dans la refonte.

## videos/
**À compléter par l'utilisateur** — les vidéos Wix sont chargées en JavaScript après hydration et n'ont pas pu être scrapées en HTTP statique.

Pour les récupérer :
1. Connecte-toi à l'admin Wix.
2. Va dans **Media Manager**.
3. Télécharge les vidéos en MP4 (qualité originale).
4. Dépose-les ici, dans `web/public/media/videos/`.

Format conseillé : MP4 H.264, max 1080p, 6-8 Mbps. Si nécessaire on les ré-encodera ensuite avec ffmpeg.
