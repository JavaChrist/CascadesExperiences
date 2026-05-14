/**
 * Configuration éditoriale du site.
 * Source unique pour les coordonnées, la navigation, les réseaux sociaux.
 * Tout ce qui change "tous les ans" (téléphone, mail) doit vivre ici.
 */
export const siteConfig = {
  name: "Cascades Expériences",
  shortName: "Cascades",
  tagline: "Réalisateur de sensations",
  description:
    "Stages moto wheeling et pilotage sur piste. Coaching personnalisé tous niveaux et randonnées 100 % électriques.",
  url: "https://cascadesexperiences.fr",

  contact: {
    phone: "06 99 17 75 00",
    phoneHref: "tel:+33699177500",
    email: "cascadesexperiences@gmail.com",
    hours: [
      { days: "Lun – Ven", time: "8h45 – 19h00" },
      { days: "Samedi", time: "8h45 – 18h00" },
      { days: "Dimanche", time: "Fermé" },
    ],
  },

  social: {
    youtube: "https://www.youtube.com/@cascadesexperiences",
    instagram: "https://www.instagram.com/cascadesexperiences",
    tiktok: "https://www.tiktok.com/@cascadesexperiences",
  },

  nav: [
    { label: "Accueil", href: "/" },
    { label: "Les stages", href: "/stages" },
    { label: "Rando électrique", href: "/rando-electrique" },
    { label: "Club", href: "/club" },
    { label: "Boutique", href: "/boutique" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
