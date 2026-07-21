"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { ImageWithFallback, getFallbackFromCategory } from "@/components/ui/image-with-fallback"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, MapPin, Route, ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { EventData } from "@/types"

// ---------------------------------------------------------------------------
// Dynamic import del mapa interactivo (SSR off porque usa Leaflet)
// ---------------------------------------------------------------------------
const EventsMapWrapper = dynamic(
  () =>
    import("@/components/home/events-map-wrapper").then(
      (mod) => ({ default: mod.EventsMapWrapper })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl bg-muted">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    ),
  }
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MapSectionProps {
  events: EventData[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

function getEventCover(event: EventData): string {
  if (event.cover) return event.cover
  const category = (event.category || "").toLowerCase()
  if (category.includes("marat") || category.includes("42"))
    return "/images/defaults/marathon-default.jpg"
  if (category.includes("trail")) return "/images/defaults/trail-default.jpg"
  return "/images/defaults/event-default.jpg"
}

// ---------------------------------------------------------------------------
// EventSidebar — panel lateral con info del evento seleccionado
// ---------------------------------------------------------------------------
function EventSidebar({ event }: { event: EventData }) {
  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lg"
    >
      {/* Imagen del evento */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <ImageWithFallback
          src={getEventCover(event)}
          alt={event.title || "Evento"}
          fill
          sizes="(max-width: 1024px) 100vw, 30vw"
          className="object-cover transition-transform duration-700 hover:scale-105"
          fallbackVariant={getFallbackFromCategory(event.category)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badge de categoría sobre la imagen */}
        {event.category && (
          <div className="absolute left-4 top-4">
            <Badge className="bg-white/20 text-white backdrop-blur-md hover:bg-white/30">
              {event.category}
            </Badge>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          {/* Título */}
          <h3 className="mb-3 text-xl font-bold leading-tight tracking-tight">
            {event.title}
          </h3>

          {/* Metadatos */}
          <div className="mb-4 space-y-2.5 text-sm">
            {/* Ubicación */}
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-primary" />
              <span>
                {[event.municipality, event.department]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>

            {/* Fecha */}
            {event.eventDate && (
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Calendar className="size-4 shrink-0 text-primary" />
                <span>{formatDate(event.eventDate)}</span>
              </div>
            )}

            {/* Distancias */}
            {event.distances && event.distances.length > 0 && (
              <div className="flex items-start gap-2.5 text-muted-foreground">
                <Route className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="flex flex-wrap gap-1.5">
                  {event.distances.map((d, i) => (
                    <Badge
                      key={`${event.id}-dist-${i}`}
                      variant="secondary"
                      className="rounded-full text-xs font-medium"
                    >
                      {typeof d === "string" ? d : d.value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón CTA */}
        <Button asChild className="group mt-auto w-full rounded-full">
          <Link href={`/events/${event.id}`}>
            Ver detalles
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// MapSection — componente principal
// ---------------------------------------------------------------------------
export function MapSection({ events }: MapSectionProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | undefined>(
    events.length > 0 ? events[0].id : undefined
  )

  const featuredEvent = useMemo(
    () => events.find((e) => e.id === selectedEvent) || events[0] || null,
    [events, selectedEvent]
  )

  if (events.length === 0) return null

  return (
    <section className="relative py-20 md:py-28">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 z-0 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 z-0 size-72 translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="container relative z-10">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Explora el mapa
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Encuentra carreras
            <span className="text-gradient"> cerca de ti</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Visualiza todos los eventos de atletismo en Colombia, selecciona uno
            en el mapa y descubre los detalles de tu próximo desafío.
          </p>
        </motion.div>

        {/* ─── Mapa + Sidebar ─── */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Mapa — 70% en desktop */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-border shadow-2xl lg:w-[70%]"
          >
            <div className="h-[420px] sm:h-[480px] md:h-[520px] lg:h-[550px]">
              <EventsMapWrapper
                events={events}
                selectedEvent={selectedEvent}
                onSelectEvent={setSelectedEvent}
              />
            </div>

            {/* Hint flotante */}
            <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background/80 px-4 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur-md">
              <MapPin className="mr-1.5 inline-block size-3.5 text-primary" />
              Haz clic en los marcadores para ver más información
            </div>
          </motion.div>

          {/* Sidebar — 30% en desktop */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="lg:w-[30%]"
          >
            {featuredEvent ? (
              <EventSidebar event={featuredEvent} />
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Selecciona un evento en el mapa
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
