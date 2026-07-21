"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroBanner } from "@/components/home/hero-banner"
import { ArrowRight, MapPin } from "lucide-react"

export interface HeroSectionProps {
  eventsCount: number
  departmentsCount: number
  /** Override the hero carousel images. Defaults to hero-home and hero-trail-running. */
  heroImages?: string[]
}

/**
 * HeroSection – envuelve HeroBanner con contenido real de Aldebaran.
 * Muestra título, subtítulo, CTAs y stats inline.
 */
export function HeroSection({
  eventsCount,
  departmentsCount,
  heroImages = ["/images/hero/hero-home.jpg", "/images/home/hero-trail-running.jpg"],
}: HeroSectionProps) {
  return (
    <HeroBanner
      title="Encuentra tu próxima aventura"
      subtitle="Descubre las mejores carreras de atletismo, trail running y ultrafondo en Colombia. Filtra por distancia, departamento y fecha para encontrar tu desafío perfecto."
      label={`${
        eventsCount > 0
          ? `${eventsCount} eventos activos`
          : "La plataforma de atletismo"
      } en Colombia`}
      images={heroImages}
      actions={
        <>
          <Button
            asChild
            size="lg"
            className="group h-14 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary-hover"
          >
            <Link href="/events">
              Explorar carreras
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="h-14 rounded-full border border-white/30 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md hover:bg-white/10 hover:text-white"
          >
            <Link href="/events#map">
              <MapPin className="mr-2 size-5" />
              Ver mapa
            </Link>
          </Button>
        </>
      }
      stats={[
        { value: `${Math.max(eventsCount, 0).toLocaleString("es-CO")}+`, label: "Eventos" },
        { value: `${Math.max(departmentsCount, 0)}+`, label: "Departamentos" },
        { value: "5K–100K", label: "Distancias" },
        { value: "Comunidad", label: "Activa" },
      ]}
    />
  )
}
