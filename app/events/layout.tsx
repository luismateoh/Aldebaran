import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Eventos — Encuentra tu próxima carrera en Colombia",
  description:
    "Explora todas las carreras de atletismo, trail running y ultras en Colombia. Filtra por categoría, distancia y ubicación.",
  openGraph: {
    title: "Eventos — Encuentra tu próxima carrera en Colombia",
    description:
      "Explora todas las carreras de atletismo, trail running y ultras en Colombia. Filtra por categoría, distancia y ubicación.",
    url: `${siteConfig.url}/events`,
    images: [
      {
        url: "/images/hero/hero-events.jpg",
        width: 1200,
        height: 630,
        alt: "Eventos de atletismo en Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventos — Encuentra tu próxima carrera en Colombia",
    description:
      "Explora todas las carreras de atletismo, trail running y ultras en Colombia. Filtra por categoría, distancia y ubicación.",
    images: ["/images/hero/hero-events.jpg"],
  },
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
