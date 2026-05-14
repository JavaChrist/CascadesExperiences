"use client";

import dynamic from "next/dynamic";

/**
 * Wrapper qui charge `CircuitMap` côté client uniquement.
 *
 * Pourquoi : Leaflet accède à `window` dès l'import (création de l'objet `L`).
 * En SSR ça plante. `next/dynamic` avec `ssr: false` n'est utilisable que dans
 * un client component — d'où ce fichier-pont entre la page (server) et le
 * composant carte (client + Leaflet).
 */
const CircuitMap = dynamic(() => import("./circuit-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse rounded-2xl bg-paper-muted ring-1 ring-paper-line" />
  ),
});

export default CircuitMap;
