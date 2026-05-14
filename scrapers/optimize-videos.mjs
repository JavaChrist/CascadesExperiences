#!/usr/bin/env node
/**
 * Re-encode les vidéos de `web/public/media/videos/` pour un usage web
 * (vidéo de fond / hero) avec ffmpeg-static.
 *
 * Stratégie :
 *  - Garde les originaux 1080p dans `scrapers/output/videos-original/`
 *    (gitignoré, on peut toujours les retrouver)
 *  - Réencode en 720p H.264 CRF 28 + AAC 96k → ~8-15 MB par vidéo
 *  - Renomme : `<hash>-720p.mp4` remplace `<hash>-1080p.mp4`
 *  - Met à jour `media-index.json` avec les nouvelles tailles
 */

import { spawn } from "node:child_process";
import { readdir, rename, mkdir, stat, readFile, writeFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const VIDEO_DIR = join(ROOT, "web", "public", "media", "videos");
const BACKUP_DIR = join(ROOT, "scrapers", "output", "videos-original");
const INDEX_PATH = join(ROOT, "web", "public", "media", "media-index.json");

// Paramètres ffmpeg — bonne qualité pour vidéo de fond/hero, taille raisonnable.
// CRF 28 = compression notable, OK pour usage décoratif (bg muet ou musique).
// Si tu veux plus de qualité, baisser à 24-26 → fichiers plus gros.
const FFMPEG_ARGS = [
  "-c:v", "libx264",
  "-preset", "slower",     // meilleure compression que "medium", build plus lent (acceptable)
  "-crf", "28",
  "-profile:v", "main",
  "-level", "4.0",
  "-vf", "scale=-2:720",   // hauteur 720, largeur auto multiple de 2
  "-c:a", "aac",
  "-b:a", "96k",
  "-movflags", "+faststart", // permet la lecture pendant le téléchargement
  "-pix_fmt", "yuv420p",   // compat large (iOS, Safari)
];

function fmt(n) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function runFfmpeg(input, output) {
  return new Promise((resolveP, rejectP) => {
    const proc = spawn(
      ffmpegPath,
      ["-y", "-i", input, ...FFMPEG_ARGS, output],
      { stdio: ["ignore", "ignore", "pipe"] }
    );
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolveP();
      else rejectP(new Error(`ffmpeg exit ${code}\n${stderr.slice(-500)}`));
    });
  });
}

async function main() {
  console.log(`\n🎞️   Optimisation vidéos`);
  console.log(`ffmpeg : ${ffmpegPath}\n`);

  await mkdir(BACKUP_DIR, { recursive: true });

  const files = (await readdir(VIDEO_DIR)).filter((f) =>
    /-(\d+)p\.mp4$/.test(f)
  );
  if (!files.length) {
    console.log("Aucune vidéo à traiter.");
    return;
  }

  console.log(`${files.length} vidéo(s) à recoder en 720p\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  const results = [];

  for (const file of files) {
    const inPath = join(VIDEO_DIR, file);
    const before = (await stat(inPath)).size;
    totalBefore += before;

    // Si déjà 720p (file name finit par -720p), on a déjà fait le boulot
    const isAlready720 = /-720p\.mp4$/.test(file);
    const stem = file.replace(/-\d+p\.mp4$/, "");
    const outPath = join(VIDEO_DIR, `${stem}-720p.mp4`);
    const tmpOut = join(VIDEO_DIR, `${stem}-720p.tmp.mp4`);
    const backupPath = join(BACKUP_DIR, file);

    process.stdout.write(`  · ${file.padEnd(60)} ${fmt(before).padStart(10)} → `);

    if (isAlready720 && existsSync(backupPath)) {
      // Déjà traité dans une exécution précédente
      console.log(`(déjà 720p, original sauvé)`);
      totalAfter += before;
      results.push({ file: `videos/${file}`, bytes: before, alreadyOptimized: true });
      continue;
    }

    try {
      // Backup de l'original avant re-encodage
      if (!existsSync(backupPath)) {
        await rename(inPath, backupPath);
      }
      const sourceForEncode = backupPath;

      await runFfmpeg(sourceForEncode, tmpOut);
      // Move .tmp → final (overwrite si nécessaire)
      if (existsSync(outPath)) await unlink(outPath);
      await rename(tmpOut, outPath);

      const after = (await stat(outPath)).size;
      totalAfter += after;
      const ratio = ((after / before) * 100).toFixed(1);
      console.log(`${fmt(after).padStart(10)}  (${ratio}%)`);
      results.push({
        file: `videos/${basename(outPath)}`,
        bytes: after,
        original: { file: `(backup) ${file}`, bytes: before },
      });
    } catch (err) {
      console.log(`✗  ${err.message.split("\n")[0]}`);
    }
  }

  // Update media-index.json — remplace les sections vidéo
  try {
    const idx = JSON.parse(await readFile(INDEX_PATH, "utf8"));
    const photos = idx.items.filter((i) => i.type !== "video");
    const videoItems = await Promise.all(
      (await readdir(VIDEO_DIR))
        .filter((f) => f.endsWith(".mp4"))
        .map(async (f) => {
          const s = await stat(join(VIDEO_DIR, f));
          const m = f.match(/^(.+?)-(\d+)p\.mp4$/);
          return {
            type: "video",
            file: `videos/${f}`,
            hash: m?.[1] ?? "",
            resolution: m ? `${m[2]}p` : "",
            bytes: s.size,
          };
        })
    );
    idx.items = [...photos, ...videoItems];
    idx.totalFiles = idx.items.length;
    idx.totalBytes = idx.items.reduce((sum, i) => sum + (i.bytes ?? 0), 0);
    idx.generatedAt = new Date().toISOString();
    await writeFile(INDEX_PATH, JSON.stringify(idx, null, 2));
  } catch (err) {
    console.error("⚠️  Mise à jour media-index.json échouée :", err.message);
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`📦  Avant : ${fmt(totalBefore)}`);
  console.log(`📦  Après : ${fmt(totalAfter)}  (${((totalAfter / totalBefore) * 100).toFixed(1)} %)`);
  console.log(`💾  Économie : ${fmt(totalBefore - totalAfter)}`);
  console.log(`🗄️   Originaux sauvegardés dans scrapers/output/videos-original/`);
  console.log(`────────────────────────────────────────\n`);
}

main().catch((err) => {
  console.error("\n💥 Erreur fatale :", err);
  process.exit(1);
});
