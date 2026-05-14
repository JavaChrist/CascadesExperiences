#!/usr/bin/env node
/**
 * Optimise les images scrapées : WebP max 2400 px de large, qualité 82.
 * Variante secondaire en JPEG quality 80 pour fallback (au cas où).
 *
 * Lit  : scrapers/output/images/
 * Écrit : scrapers/output/optim/<basename>.webp  (+ .jpg pour les > 1 MB)
 *
 * Génère aussi un index.json (taille avant/après, ratio de compression).
 */

import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import { join, resolve, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, "output", "images");
const DEST = resolve(__dirname, "output", "optim");

const MAX_WIDTH = 2400; // largeur max — au-delà on perd peu en HD écran moderne
const WEBP_QUALITY = 82;
const JPEG_QUALITY = 80;

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

async function poolMap(items, limit, fn) {
  const queue = [...items];
  const workers = Array.from({ length: limit }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await fn(item);
    }
  });
  await Promise.all(workers);
}

async function main() {
  console.log(`\n🖼️   Optimisation images Cascades`);
  console.log(`Source : ${SRC}`);
  console.log(`Dest   : ${DEST}\n`);

  await mkdir(DEST, { recursive: true });
  const files = (await readdir(SRC)).filter((f) =>
    /\.(jpe?g|png|webp)$/i.test(f)
  );

  console.log(`Fichiers à traiter : ${files.length}\n`);

  const report = [];
  let totalBefore = 0;
  let totalAfter = 0;

  await poolMap(files, 4, async (file) => {
    const inPath = join(SRC, file);
    const stem = basename(file, extname(file));
    const webpOut = join(DEST, `${stem}.webp`);

    const before = (await stat(inPath)).size;
    try {
      const img = sharp(inPath).rotate(); // respecte EXIF orientation
      const meta = await img.metadata();

      const pipeline = img.resize({
        width: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH),
        withoutEnlargement: true,
        fit: "inside",
      });

      // WebP — format principal
      await pipeline
        .clone()
        .webp({ quality: WEBP_QUALITY, effort: 5 })
        .toFile(webpOut);
      const webpSize = (await stat(webpOut)).size;

      // JPEG de fallback pour les photos (pas pour PNG <100KB qui sont des icônes)
      let jpegSize = 0;
      const isPhoto = before > 200 * 1024;
      if (isPhoto) {
        const jpgOut = join(DEST, `${stem}.jpg`);
        await pipeline
          .clone()
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .toFile(jpgOut);
        jpegSize = (await stat(jpgOut)).size;
      }

      totalBefore += before;
      totalAfter += webpSize + jpegSize;
      report.push({
        file,
        width: meta.width,
        height: meta.height,
        before,
        webp: webpSize,
        jpeg: jpegSize || null,
        ratio: ((webpSize / before) * 100).toFixed(1) + "%",
      });

      const arrow = isPhoto ? "↓↓" : "↓";
      console.log(
        `  ${arrow} ${file.padEnd(60)} ${formatBytes(before).padStart(10)} → ${formatBytes(webpSize).padStart(10)}  (${((webpSize / before) * 100).toFixed(0)}%)`
      );
    } catch (err) {
      console.error(`  ✗ ${file} — ${err.message}`);
      report.push({ file, error: err.message });
    }
  });

  await writeFile(
    join(DEST, "index.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        params: { MAX_WIDTH, WEBP_QUALITY, JPEG_QUALITY },
        totals: {
          files: report.length,
          beforeBytes: totalBefore,
          afterBytes: totalAfter,
          ratio: ((totalAfter / totalBefore) * 100).toFixed(1) + "%",
        },
        files: report,
      },
      null,
      2
    )
  );

  console.log(`\n────────────────────────────────────────`);
  console.log(`📦  Avant : ${formatBytes(totalBefore)}`);
  console.log(`📦  Après : ${formatBytes(totalAfter)}  (${((totalAfter / totalBefore) * 100).toFixed(1)} %)`);
  console.log(`💾  Économie : ${formatBytes(totalBefore - totalAfter)}`);
  console.log(`📄  Rapport : scrapers/output/optim/index.json`);
  console.log(`────────────────────────────────────────\n`);
}

main().catch((err) => {
  console.error("\n💥 Erreur fatale :", err);
  process.exit(1);
});
