"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker /sw.js côté client.
 * Monté une seule fois depuis le layout racine.
 * Désactivé en développement pour ne pas polluer le HMR.
 */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
      } catch (err) {
        console.error("[sw] enregistrement échoué", err);
      }
    };

    register();
  }, []);

  return null;
}
