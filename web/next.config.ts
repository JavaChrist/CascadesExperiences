import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// Racine du workspace Turbopack — explicitement `web/` (le dossier de ce fichier).
// Sans ça, Next remonte vers le parent dès qu'un autre lockfile traîne au-dessus
// et résout mal les modules. Doc :
// node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/turbopack.md
const WEB_ROOT = dirname(fileURLToPath(import.meta.url));

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: WEB_ROOT,
  },
  // Images : on autorisera le CDN Wix le temps de récupérer les médias,
  // puis on basculera tout en local dans /public/media.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static.wixstatic.com" },
      { protocol: "https", hostname: "video.wixstatic.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Rewrites — `/admin` doit servir `public/admin/index.html` (Decap CMS).
  // Sans ça, Next renvoie un 404 parce qu'aucune route App Router ne matche.
  async rewrites() {
    return [
      { source: "/admin", destination: "/admin/index.html" },
      { source: "/admin/", destination: "/admin/index.html" },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
