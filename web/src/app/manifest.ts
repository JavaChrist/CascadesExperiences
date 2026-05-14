import type { MetadataRoute } from "next";

// PWA manifest — Next 16 conventional file.
// Doc : node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cascades Expériences",
    short_name: "Cascades",
    description:
      "Stages moto wheeling, pilotage sur piste et randonnées électriques.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#e10600",
    lang: "fr-FR",
    categories: ["sports", "education", "lifestyle"],
    icons: [
      // TODO: générer les vraies icônes (192, 512, maskable) à partir du logo Cascades
      // et les déposer dans public/icons/.
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
