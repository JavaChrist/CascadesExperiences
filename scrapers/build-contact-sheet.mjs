#!/usr/bin/env node
/**
 * Génère une planche-contact HTML pour la curation des images scrapées.
 *
 * Ouvre `scrapers/output/optim/contact-sheet.html` dans un navigateur :
 *   - grille de toutes les images optimisées avec leur n° et leur source page Wix
 *   - clic sur une image pour la (dés)électionner
 *   - bouton "Copier la sélection" → copie la liste des n° dans le presse-papiers
 *
 * Tu colles ensuite cette liste dans le chat, on copie les bons fichiers
 * dans web/public/media/ avec des noms parlants.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPTIM = resolve(__dirname, "output", "optim");
const MANIFEST = resolve(__dirname, "output", "manifest.json");

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  const webps = (await readdir(OPTIM))
    .filter((f) => f.endsWith(".webp"))
    .sort();

  // Map filename original → sources
  const sourcesByStem = new Map();
  for (const item of manifest.items) {
    if (item.type !== "image") continue;
    const stem = basename(item.localPath).replace(/\.[^.]+$/, "");
    sourcesByStem.set(stem, item.sources);
  }

  const cards = webps.map((file, i) => {
    const stem = file.replace(/\.webp$/, "");
    const sources = sourcesByStem.get(stem) ?? [];
    const sourcesShort = sources
      .map((s) => s.replace("https://www.cascadesexperiences.fr", "") || "/")
      .join(" · ");
    return `
      <label class="card" data-id="${i + 1}">
        <input type="checkbox" data-id="${i + 1}" />
        <span class="num">${i + 1}</span>
        <img src="./${file}" alt="${file}" loading="lazy" />
        <span class="meta">${sourcesShort || "(orpheline)"}</span>
      </label>`;
  });

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Curation médias Cascades — ${webps.length} images</title>
<style>
  :root { color-scheme: light dark; --brand: #e10600; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
         margin: 0; padding: 16px 20px 120px; background: #0a0a0a; color: #f5f5f5; }
  header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 16px;
           position: sticky; top: 0; background: #0a0a0a; padding: 12px 0;
           margin-bottom: 12px; border-bottom: 1px solid #222; z-index: 10; }
  h1 { font-size: 18px; margin: 0; }
  .count { color: #aaa; font-size: 14px; }
  .selection { color: var(--brand); font-weight: 600; }
  button { background: var(--brand); color: #fff; border: 0; padding: 8px 14px;
           border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; }
  button:hover { background: #b30500; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 10px; }
  .card { position: relative; display: flex; flex-direction: column; gap: 4px;
          cursor: pointer; background: #161616; border: 2px solid transparent;
          border-radius: 8px; overflow: hidden; }
  .card:hover { border-color: #444; }
  .card input { position: absolute; top: 8px; right: 8px; width: 22px; height: 22px;
                cursor: pointer; z-index: 2; }
  .card:has(input:checked) { border-color: var(--brand); }
  .card:has(input:checked)::after { content: "✓"; position: absolute; top: 6px; left: 6px;
                                     background: var(--brand); color: #fff; width: 26px;
                                     height: 26px; border-radius: 50%; display: grid;
                                     place-items: center; font-weight: 700; }
  .num { position: absolute; bottom: 30px; left: 6px; background: rgba(0,0,0,.7);
         color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 12px;
         font-variant-numeric: tabular-nums; }
  img { width: 100%; aspect-ratio: 4/3; object-fit: cover; background: #222; display: block; }
  .meta { font-size: 11px; color: #888; padding: 4px 8px; word-break: break-all; }
  .toolbar-bottom { position: fixed; bottom: 0; left: 0; right: 0;
                    background: #0a0a0a; border-top: 1px solid #222; padding: 12px 20px;
                    display: flex; gap: 12px; align-items: center; }
  textarea { flex: 1; background: #161616; color: #f5f5f5; border: 1px solid #333;
             border-radius: 6px; padding: 6px 10px; font-family: monospace; font-size: 12px;
             min-height: 38px; resize: vertical; }
</style>
</head>
<body>
  <header>
    <h1>Curation médias Cascades</h1>
    <span class="count">${webps.length} images · <span class="selection" id="selCount">0 sélectionnée</span></span>
    <span style="flex: 1"></span>
    <button id="invert">Inverser</button>
    <button id="clear">Tout désélectionner</button>
  </header>

  <div class="grid">${cards.join("")}</div>

  <div class="toolbar-bottom">
    <textarea id="output" readonly placeholder="La liste des numéros sélectionnés s'affichera ici"></textarea>
    <button id="copy">Copier la sélection</button>
  </div>

<script>
  const boxes = [...document.querySelectorAll(".card input")];
  const out = document.getElementById("output");
  const selCount = document.getElementById("selCount");

  function refresh() {
    const picked = boxes.filter(b => b.checked).map(b => +b.dataset.id).sort((a,b) => a - b);
    out.value = picked.join(", ");
    selCount.textContent = picked.length + (picked.length > 1 ? " sélectionnées" : " sélectionnée");
  }

  boxes.forEach(b => b.addEventListener("change", refresh));

  document.getElementById("clear").addEventListener("click", () => {
    boxes.forEach(b => b.checked = false); refresh();
  });
  document.getElementById("invert").addEventListener("click", () => {
    boxes.forEach(b => b.checked = !b.checked); refresh();
  });
  document.getElementById("copy").addEventListener("click", async () => {
    await navigator.clipboard.writeText(out.value);
    const btn = document.getElementById("copy");
    const old = btn.textContent;
    btn.textContent = "Copié ✓"; setTimeout(() => btn.textContent = old, 1500);
  });

  // Persistance locale
  const KEY = "cascades-curation-v1";
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
    boxes.forEach(b => { if (saved.includes(+b.dataset.id)) b.checked = true; });
  } catch {}
  boxes.forEach(b => b.addEventListener("change", () => {
    const picked = boxes.filter(b => b.checked).map(b => +b.dataset.id);
    localStorage.setItem(KEY, JSON.stringify(picked));
  }));
  refresh();
</script>
</body>
</html>
`;

  const dest = join(OPTIM, "contact-sheet.html");
  await writeFile(dest, html, "utf8");
  console.log(`✓ Planche-contact générée : ${dest}`);
  console.log(`  Ouvre-la dans ton navigateur : file:///${dest.replaceAll("\\\\", "/").replaceAll("\\", "/")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
