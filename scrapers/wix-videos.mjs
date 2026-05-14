#!/usr/bin/env node
/**
 * Scraper vidéo Wix — récupère les vidéos du site `cascadesexperiences.fr`
 * en résolution maximale et les dépose directement dans `web/public/media/videos/`.
 *
 * Pourquoi un script séparé de `wix-media.mjs` :
 * Les vidéos sont encodées différemment des images dans le HTML Wix —
 * elles apparaissent en clair `video/HASH/RESOLUTION/mp4/file.mp4` à l'intérieur
 * de blobs JSON entourés d'entités HTML `&quot;`. Le scraper image ne les
 * capturait pas (regex trop stricte).
 *
 * Usage :
 *   node scrapers/wix-videos.mjs
 */

import { mkdir, writeFile, stat, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const VIDEO_OUT = join(ROOT, "web", "public", "media", "videos");
const INDEX_PATH = join(ROOT, "web", "public", "media", "media-index.json");

const PAGES = [
  "https://www.cascadesexperiences.fr/",
  "https://www.cascadesexperiences.fr/about-2",
  "https://www.cascadesexperiences.fr/about-4",
  "https://www.cascadesexperiences.fr/services",
  "https://www.cascadesexperiences.fr/stage-stunt",
  "https://www.cascadesexperiences.fr/copie-de-stage-wheeling",
  "https://www.cascadesexperiences.fr/devenir-membre",
  "https://www.cascadesexperiences.fr/evenement",
  "https://www.cascadesexperiences.fr/event-list",
  "https://www.cascadesexperiences.fr/réservez-en-ligne",
  "https://www.cascadesexperiences.fr/gift-card",
  "https://www.cascadesexperiences.fr/shop",
  "https://www.cascadesexperiences.fr/shop-1",
  "https://www.cascadesexperiences.fr/shop-2",
  "https://www.cascadesexperiences.fr/personnalisation-de-formule",
];

const UA =
  "Mozilla/5.0 (compatible; CascadesVideoScraper/1.0; +contact@javachrist.fr)";

// Pattern réel dans le HTML Wix (encodé en HTML entities mais slash en clair) :
//   &quot;url&quot;:&quot;video/HASH/RES/mp4/file.mp4&quot;
const VIDEO_RE = /video\/([a-f0-9_]+)\/(\d+)p\/mp4\/file\.mp4/g;

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

async function fetchText(url) {
  const safeUrl = encodeURI(decodeURI(url));
  const res = await fetch(safeUrl, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function downloadFile(url, destPath) {
  if (existsSync(destPath)) {
    const s = await stat(destPath);
    return { skipped: true, size: s.size };
  }
  await mkdir(dirname(destPath), { recursive: true });
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  return { skipped: false, size: buf.length };
}

async function main() {
  console.log(`\n🎬  Scraper vidéo Wix — cascadesexperiences.fr`);
  console.log(`Pages à parcourir : ${PAGES.length}\n`);

  // hash → { maxRes: number, resolutions: Set<number>, sources: Set<string> }
  const videos = new Map();

  for (const url of PAGES) {
    process.stdout.write(`  · ${url.padEnd(68)} `);
    try {
      const html = await fetchText(url);
      const found = new Set();
      for (const m of html.matchAll(VIDEO_RE)) {
        const [, hash, resStr] = m;
        const res = parseInt(resStr, 10);
        if (!videos.has(hash)) {
          videos.set(hash, {
            maxRes: res,
            resolutions: new Set([res]),
            sources: new Set(),
          });
        } else {
          const v = videos.get(hash);
          v.resolutions.add(res);
          if (res > v.maxRes) v.maxRes = res;
        }
        videos.get(hash).sources.add(url);
        found.add(hash);
      }
      console.log(`✓  ${found.size} vidéo(s)`);
    } catch (err) {
      console.log(`✗  ${err.message}`);
    }
  }

  if (videos.size === 0) {
    console.log("\nAucune vidéo détectée. Le site a peut-être changé son encodage.\n");
    process.exit(0);
  }

  console.log(`\n${videos.size} vidéo(s) unique(s) à télécharger en résolution max\n`);

  await mkdir(VIDEO_OUT, { recursive: true });
  const downloaded = [];
  let totalBytes = 0;

  for (const [hash, info] of videos) {
    const url = `https://video.wixstatic.com/video/${hash}/${info.maxRes}p/mp4/file.mp4`;
    const dest = join(VIDEO_OUT, `${hash}-${info.maxRes}p.mp4`);
    process.stdout.write(`  ↓ ${hash.slice(0, 12)}…  ${info.maxRes}p  `);
    try {
      const r = await downloadFile(url, dest);
      totalBytes += r.size;
      downloaded.push({
        type: "video",
        file: `videos/${hash}-${info.maxRes}p.mp4`,
        hash,
        resolution: `${info.maxRes}p`,
        availableResolutions: [...info.resolutions]
          .sort((a, b) => b - a)
          .map((r) => `${r}p`),
        bytes: r.size,
        sources: [...info.sources],
      });
      console.log(
        `${r.skipped ? "(déjà présent)" : ""} ${formatBytes(r.size).padStart(10)}`
      );
    } catch (err) {
      console.log(`✗  ${err.message}`);
    }
  }

  // Met à jour media-index.json en ajoutant la section vidéos
  let mediaIndex = { items: [] };
  try {
    mediaIndex = JSON.parse(await readFile(INDEX_PATH, "utf8"));
  } catch {
    /* index inexistant — on en crée un */
  }

  // Retire les anciennes entrées vidéo, ajoute les nouvelles
  const photos = mediaIndex.items.filter((i) => i.type !== "video");
  mediaIndex.items = [...photos, ...downloaded];
  mediaIndex.generatedAt = new Date().toISOString();
  mediaIndex.totalFiles = mediaIndex.items.length;
  mediaIndex.totalBytes = mediaIndex.items.reduce(
    (sum, i) => sum + (i.bytes ?? 0),
    0
  );

  await writeFile(INDEX_PATH, JSON.stringify(mediaIndex, null, 2));

  console.log(`\n────────────────────────────────────────`);
  console.log(`✅  ${downloaded.length} vidéo(s) dans web/public/media/videos/`);
  console.log(`📦  Total : ${formatBytes(totalBytes)}`);
  console.log(`📄  media-index.json mis à jour`);
  console.log(`────────────────────────────────────────\n`);
}

main().catch((err) => {
  console.error("\n💥 Erreur fatale :", err);
  process.exit(1);
});
