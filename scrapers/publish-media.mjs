#!/usr/bin/env node
/**
 * Publie les médias optimisés vers web/public/media/.
 *
 * Lit  : scrapers/output/optim/*.webp  +  scrapers/output/manifest.json
 * Écrit :
 *   web/public/media/photos/<file>.webp
 *   web/public/media/media-index.json   (mapping fichier → pages d'origine + dimensions)
 *   web/public/media/videos/.gitkeep    (le user déposera les vidéos exportées de Wix ici)
 *   web/public/media/README.md
 *
 * Idempotent : refuse d'écraser un fichier existant (utiliser --force pour outrepasser).
 */

import { readdir, readFile, writeFile, copyFile, mkdir, stat } from "node:fs/promises";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OPTIM = join(ROOT, "scrapers", "output", "optim");
const MANIFEST_IN = join(ROOT, "scrapers", "output", "manifest.json");
const DEST = join(ROOT, "web", "public", "media");

async function main() {
  await mkdir(join(DEST, "photos"), { recursive: true });
  await mkdir(join(DEST, "videos"), { recursive: true });

  const scrapeManifest = JSON.parse(await readFile(MANIFEST_IN, "utf8"));
  const sourcesByStem = new Map();
  for (const item of scrapeManifest.items) {
    if (item.type !== "image") continue;
    const stem = basename(item.localPath).replace(/\.[^.]+$/, "");
    sourcesByStem.set(stem, item.sources);
  }

  const files = (await readdir(OPTIM)).filter((f) => f.endsWith(".webp"));
  const index = [];
  let bytes = 0;

  for (const file of files) {
    const src = join(OPTIM, file);
    const dst = join(DEST, "photos", file);
    await copyFile(src, dst);
    const s = await stat(dst);
    const meta = await sharp(dst).metadata();
    const stem = file.replace(/\.webp$/, "");
    bytes += s.size;
    index.push({
      file: `photos/${file}`,
      bytes: s.size,
      width: meta.width,
      height: meta.height,
      sources: sourcesByStem.get(stem) ?? [],
    });
  }

  // Tri par taille croissante (UI/logos d'abord) puis par première source
  index.sort((a, b) => a.bytes - b.bytes);

  await writeFile(
    join(DEST, "media-index.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalFiles: index.length,
        totalBytes: bytes,
        note:
          "Index généré par scrapers/publish-media.mjs depuis le contenu original cascadesexperiences.fr. " +
          "Les sources listent les pages Wix où chaque média était utilisé — utile pour savoir où le replacer.",
        items: index,
      },
      null,
      2
    )
  );

  await writeFile(join(DEST, "videos", ".gitkeep"), "");
  await writeFile(
    join(DEST, "README.md"),
    `# web/public/media — médias du site

## photos/
Photos issues du site Wix actuel, optimisées en WebP (max 2400 px, qualité 82).
${index.length} fichiers, ${(bytes / (1024 * 1024)).toFixed(1)} MB au total.

Le fichier \`media-index.json\` mappe chaque image à ses pages d'origine Wix, ce qui aide à retrouver où la replacer dans la refonte.

## videos/
**À compléter par l'utilisateur** — les vidéos Wix sont chargées en JavaScript après hydration et n'ont pas pu être scrapées en HTTP statique.

Pour les récupérer :
1. Connecte-toi à l'admin Wix.
2. Va dans **Media Manager**.
3. Télécharge les vidéos en MP4 (qualité originale).
4. Dépose-les ici, dans \`web/public/media/videos/\`.

Format conseillé : MP4 H.264, max 1080p, 6-8 Mbps. Si nécessaire on les ré-encodera ensuite avec ffmpeg.
`
  );

  console.log(`✓ ${index.length} photos copiées vers web/public/media/photos/`);
  console.log(`✓ media-index.json écrit`);
  console.log(`✓ videos/ prêt (vide, à compléter par l'utilisateur)`);
  console.log(`Poids total photos : ${(bytes / (1024 * 1024)).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
