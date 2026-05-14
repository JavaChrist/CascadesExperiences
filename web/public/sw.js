// Service worker minimal — permet l'installation PWA (critère "installable")
// sans cache offline complexe pour le moment.
// Quand on voudra du vrai offline, on migrera vers Serwist.

const VERSION = "v0.1.0";

self.addEventListener("install", (event) => {
  // Active immédiatement la nouvelle version
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Stratégie minimale : on laisse le réseau gérer.
// Les Push Notifications seront ajoutées plus tard si besoin.
self.addEventListener("fetch", (event) => {
  // Pass-through volontaire — pas de stratégie de cache pour l'instant.
});
