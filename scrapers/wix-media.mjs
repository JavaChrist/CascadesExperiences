#!/usr/bin/env node
/**
 * Scraper Wix → récupère tous les médias (images + vidéos) du site cascadesexperiences.fr
 * en pleine résolution, et trace dans un manifest.json d'où chaque média vient.
 *
 * Sortie : scrapers/output/{images,videos}/  + scrapers/output/manifest.json
 * (le dossier output/ est gitignoré — on curatera avant de copier dans web/public/media/)
 *
 * Usage :   node scrapers/wix-media.mjs
 */

import { mkdir, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUTPUT_DIR = join(ROOT, "scrapers", "output");

// Pages issues du sitemap Wix (pages-sitemap.xml), filtrées sur celles à fort contenu visuel.
// Les pages purement légales sont exclues : pas de médias intéressants.
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
  "Mozilla/5.0 (compatible; CascadesMediaScraper/1.0; +contact@javachrist.fr)";

// Images Wix : on capture le filename de base (avant /v1/<transform>) pour obtenir l'original.
// Format type : static.wixstatic.com/media/HASH~mv2.jpg ou static.wixstatic.com/media/HASH.png
const IMG_RE =
  /https:\/\/static\.wixstatic\.com\/media\/([^"'\s>)\\?]+?\.(?:jpg|jpeg|png|webp|gif|svg))/gi;

// Vidéos Wix : on garde le chemin complet (incluant la variante de résolution).
// Format type : video.wixstatic.com/video/HASH/1080p/mp4/file.mp4
const VIDEO_RE =
  /https:\/\/video\.wixstatic\.com\/video\/([^"'\s>)\\?]+?\.mp4)/gi;

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

async function fetchText(url) {
  // Wix accepte les URLs avec caractères UTF-8 mais Node fetch peut tousser → on encode.
  const safeUrl = encodeURI(decodeURI(url));
  const res = await fetch(safeUrl, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function extractMedia(html) {
  const images = new Set();
  for (const m of html.matchAll(IMG_RE)) images.add(m[1]);

  // Pour les vidéos on regroupe par hash (premier segment) et on garde le variant
  // avec la plus haute résolution (1080p > 720p > 480p > 360p).
  const videosByHash = new Map();
  const resScore = (path) => {
    if (path.includes("/1080p/")) return 1080;
    if (path.includes("/720p/")) return 720;
    if (path.includes("/480p/")) return 480;
    if (path.includes("/360p/")) return 360;
    if (path.includes("/240p/")) return 240;
    return 0;
  };
  for (const m of html.matchAll(VIDEO_RE)) {
    const fullPath = m[1];
    const hash = fullPath.split("/")[0];
    const current = videosByHash.get(hash);
    if (!current || resScore(fullPath) > resScore(current)) {
      videosByHash.set(hash, fullPath);
    }
  }
  return { images, videos: new Set(videosByHash.values()) };
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

/**
 * Map en parallèle avec une concurrence bornée — pour ne pas matraquer le CDN.
 */
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

function safeFilename(rawKey) {
  // Les keys Wix peuvent contenir des `/` (vidéos) — on remplace pour un nom plat.
  return rawKey.replace(/[\/\\]/g, "__");
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🏍️  Scraper Wix — cascadesexperiences.fr`);
  console.log(`Pages à parcourir : ${PAGES.length}\n`);

  const allImages = new Map(); // key (filename) → Set<pageUrl>
  const allVideos = new Map(); // key (path) → Set<pageUrl>

  // 1. Crawl des pages — séquentiel pour rester poli.
  for (const url of PAGES) {
    process.stdout.write(`  · ${url.padEnd(70)} `);
    try {
      const html = await fetchText(url);
      const { images, videos } = extractMedia(html);
      for (const k of images) {
        if (!allImages.has(k)) allImages.set(k, new Set());
        allImages.get(k).add(url);
      }
      for (const k of videos) {
        if (!allVideos.has(k)) allVideos.set(k, new Set());
        allVideos.get(k).add(url);
      }
      console.log(`✓  ${images.size} img / ${videos.size} vid`);
    } catch (err) {
      console.log(`✗  ${err.message}`);
    }
  }

  console.log(
    `\nMédias uniques détectés : ${allImages.size} images, ${allVideos.size} vidéos\n`
  );

  // 2. Téléchargement parallèle.
  const manifest = {
    generatedAt: new Date().toISOString(),
    crawledPages: PAGES,
    items: [],
  };

  let totalBytes = 0;
  let failures = 0;

  console.log(`📥  Téléchargement images (concurrence 5)…`);
  await poolMap([...allImages.entries()], 5, async ([key, sources]) => {
    const url = `https://static.wixstatic.com/media/${key}`;
    const dest = join(OUTPUT_DIR, "images", safeFilename(key));
    try {
      const r = await downloadFile(url, dest);
      totalBytes += r.size;
      manifest.items.push({
        type: "image",
        key,
        sourceUrl: url,
        localPath: `scrapers/output/images/${safeFilename(key)}`,
        bytes: r.size,
        sources: [...sources],
        skipped: r.skipped,
      });
      console.log(
        `  ${r.skipped ? "·" : "↓"} ${basename(dest)}  ${formatBytes(r.size)}`
      );
    } catch (err) {
      failures++;
      console.log(`  ✗ ${basename(dest)}  ${err.message}`);
    }
  });

  console.log(`\n📥  Téléchargement vidéos (concurrence 3)…`);
  await poolMap([...allVideos.entries()], 3, async ([key, sources]) => {
    const url = `https://video.wixstatic.com/video/${key}`;
    const dest = join(OUTPUT_DIR, "videos", safeFilename(key));
    try {
      const r = await downloadFile(url, dest);
      totalBytes += r.size;
      manifest.items.push({
        type: "video",
        key,
        sourceUrl: url,
        localPath: `scrapers/output/videos/${safeFilename(key)}`,
        bytes: r.size,
        sources: [...sources],
        skipped: r.skipped,
      });
      console.log(
        `  ${r.skipped ? "·" : "↓"} ${basename(dest)}  ${formatBytes(r.size)}`
      );
    } catch (err) {
      failures++;
      console.log(`  ✗ ${basename(dest)}  ${err.message}`);
    }
  });

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(
    join(OUTPUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  console.log(`\n────────────────────────────────────────`);
  console.log(`✅  Manifest : scrapers/output/manifest.json`);
  console.log(`📦  Total : ${formatBytes(totalBytes)} (${manifest.items.length} fichiers)`);
  if (failures) console.log(`⚠️   ${failures} échec(s)`);
  console.log(`────────────────────────────────────────\n`);
}

main().catch((err) => {
  console.error("\n💥 Erreur fatale :", err);
  process.exit(1);
});
