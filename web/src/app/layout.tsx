import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { RegisterSW } from "@/components/register-sw";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cascadesexperiences.fr"),
  title: {
    default: "Cascades Expériences — Réalisateur de sensations",
    template: "%s · Cascades Expériences",
  },
  description:
    "Stages moto wheeling et pilotage sur piste. Coaching personnalisé tous niveaux et randonnées 100 % électriques.",
  applicationName: "Cascades Expériences",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cascades",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Cascades Expériences",
    title: "Cascades Expériences — Réalisateur de sensations",
    description:
      "Stages wheeling, pilotage sur piste, coaching privé et rando électrique.",
  },
};

export const viewport: Viewport = {
  themeColor: "#E10600",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <RegisterSW />
      </body>
    </html>
  );
}
