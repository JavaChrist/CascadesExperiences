import type { Metadata } from "next";
import { Trophy, Users, Calendar, Gift, Sparkles, BadgePercent } from "lucide-react";
import { UnderConstruction } from "@/components/layout/under-construction";

export const metadata: Metadata = {
  title: "Club Cascades",
  description:
    "Le Club Cascades — abonnement annuel pour les passionnés : tarifs préférentiels sur les stages, accès prioritaire aux dates, événements réservés.",
};

export default function ClubPage() {
  return (
    <UnderConstruction
      eyebrow="Adhérents & partenaires"
      title="Club Cascades — bientôt accessible"
      intro="Le Club Cascades regroupera les passionnés qui veulent rouler souvent à
        tarif avantageux. Tarifs préférentiels, accès prioritaire aux dates,
        événements privés — on prépare tout ça. Adhésion en ligne très bientôt."
      features={[
        {
          icon: BadgePercent,
          title: "Tarifs préférentiels",
          description:
            "Remise sur chaque stage du catalogue (wheeling, pilotage, rando) toute l'année.",
        },
        {
          icon: Calendar,
          title: "Accès prioritaire aux dates",
          description:
            "Ouverture anticipée du calendrier 7 jours avant tout le monde.",
        },
        {
          icon: Users,
          title: "Événements réservés",
          description:
            "Track days privés, sorties club, sessions de coaching avancé.",
        },
        {
          icon: Trophy,
          title: "Programme de fidélité",
          description:
            "Cumule des points à chaque stage, débloque des sessions offertes.",
        },
        {
          icon: Gift,
          title: "Cadeaux annuels",
          description:
            "T-shirt, autocollants, accessoires Cascades à chaque renouvellement.",
        },
        {
          icon: Sparkles,
          title: "Espace membre",
          description:
            "Suivi de ton historique de stages, photos perso, vidéos retour.",
        },
      ]}
    />
  );
}
