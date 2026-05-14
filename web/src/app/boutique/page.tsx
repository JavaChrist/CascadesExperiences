import type { Metadata } from "next";
import {
  Gift,
  Shirt,
  Sticker,
  Package,
  CreditCard,
  Settings,
} from "lucide-react";
import { UnderConstruction } from "@/components/layout/under-construction";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Boutique Cascades — cartes cadeaux, options stage personnalisables et goodies. Bientôt disponible avec paiement sécurisé.",
};

export default function BoutiquePage() {
  return (
    <UnderConstruction
      eyebrow="Boutique"
      title="Cartes cadeaux et options — bientôt en ligne"
      intro="On prépare une boutique simple et claire : carte cadeau à offrir, options
        pour personnaliser ton stage (vidéo retour, formule premium, transport
        moto…), et quelques goodies Cascades. Paiement sécurisé."
      features={[
        {
          icon: Gift,
          title: "Carte cadeau",
          description:
            "À offrir pour un stage au choix. Valable 12 mois sur tout le catalogue.",
        },
        {
          icon: Settings,
          title: "Options stage",
          description:
            "Personnalise ta journée : montage vidéo, prise de vue drone, transport moto.",
        },
        {
          icon: Package,
          title: "Pack premium",
          description:
            "Stage + repas + photo officielle + clip souvenir HD livré sous 7 jours.",
        },
        {
          icon: Shirt,
          title: "T-shirts & casquettes",
          description: "Goodies Cascades pour rouler dans les couleurs du Club.",
        },
        {
          icon: Sticker,
          title: "Stickers & accessoires",
          description: "Stickers casque, porte-clés, plaque immat, etc.",
        },
        {
          icon: CreditCard,
          title: "Paiement sécurisé",
          description:
            "Carte bancaire (Mollie), confirmation immédiate par e-mail.",
        },
      ]}
    />
  );
}
