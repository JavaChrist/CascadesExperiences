"use client";

// Import du CSS Leaflet ici (pas dans globals.css) — Tailwind v4 ne bundle pas
// proprement le CSS tiers via @import. En l'important dans le client component
// Next.js le passe au bundler côté client uniquement, là où il sert.
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

/**
 * Carte OpenStreetMap de l'adresse principale Cascades Expériences.
 * - Pas de clé API, pas de tracking, pas de banner cookies RGPD.
 * - Marker custom SVG rouge marqué « C » (couleurs marque), évite le bug
 *   classique des icônes par défaut Leaflet avec les bundlers.
 *
 * Coordonnées géocodées via Nominatim (OpenStreetMap) sur
 * "Pôle Mécanique de la Clef des Champs" — c'est le nom OSM officiel du
 * complexe que l'on connaît sous le nom usuel « Pôle Mécanique de Clastres ».
 */

const HQ = {
  coords: [49.7548819, 3.2096835] as [number, number],
  label: "Pôle Mécanique de Clastres",
  address: "D32, 02480 Artemps (Aisne)",
  osmName: "Pôle Mécanique de la Clef des Champs",
};

const brandIcon = L.divIcon({
  className: "cascades-marker",
  html: `
    <svg viewBox="0 0 28 36" width="28" height="36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10 14 22 14 22s14-12 14-22C28 6.27 21.73 0 14 0z" fill="#E10600"/>
      <circle cx="14" cy="14" r="6" fill="#ffffff"/>
      <text x="14" y="17.5" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#E10600">C</text>
    </svg>
  `,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -32],
});

export default function CircuitMap() {
  return (
    <MapContainer
      center={HQ.coords}
      zoom={15}
      scrollWheelZoom={false}
      className="h-[420px] w-full rounded-2xl ring-1 ring-paper-line z-0"
      aria-label={`Carte de ${HQ.label}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={HQ.coords} icon={brandIcon}>
        <Popup>
          <strong>{HQ.label}</strong>
          <br />
          <span style={{ fontSize: "12px", color: "#595959" }}>
            {HQ.address}
          </span>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
