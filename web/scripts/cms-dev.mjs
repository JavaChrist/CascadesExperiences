#!/usr/bin/env node
/**
 * Lance `decap-server` (proxy local de Decap CMS) depuis la racine du repo,
 * pas depuis `web/`, parce que les chemins dans `public/admin/config.yml`
 * sont écrits relativement à la racine (ex. `web/content/sessions`).
 *
 * Cross-platform : pas de `cd ..` dans le package.json (qui se comporte mal
 * sur PowerShell vs bash). On délègue à Node.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");

console.log(`[cms] proxy decap-server lancé depuis ${REPO_ROOT}`);
console.log(`[cms] ouvre http://localhost:3000/admin/ une fois Next prêt`);

// shell:true pour que Windows trouve l'exécutable `decap-server` (.cmd)
const proc = spawn("npx", ["decap-server"], {
  cwd: REPO_ROOT,
  stdio: "inherit",
  shell: true,
});

proc.on("exit", (code) => process.exit(code ?? 0));
proc.on("error", (err) => {
  console.error("[cms] erreur :", err.message);
  process.exit(1);
});
