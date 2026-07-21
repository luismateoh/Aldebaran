'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { Heart, ArrowRight } from "lucide-react"

import type { EventData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CategoryBadge } from "@/components/ui/category-badge"
import { Button } from "@/components/ui/button"
import SmartImage from "@/components/smart-image"

/* ──────────────────────────────────────────────────────────
 * FeaturedEventCardProps
 * ────────────────────────────────────────────────────────── */
export interface FeaturedEventCardProps {
  /** Datos del evento destacado */
  event: EventData
  /** Estado guardado del corazón */
  saved?: boolean
  /** Callback al guardar */
  onSave?: (id: string) => void
  /** Clases adicionales CSS */
  className?: string
}

/* ──────────────────────────────────────────────────────────
 * FeaturedEventCard — Versión XL de EventCard
 * ──────────────────────────────────────────────────────────
 * Altura fija 560px, tipografía más grande, ocupa 2
 * columnas en el grid. Incluye descripción corta (2 líneas)
 * y botón "Ver carrera" prominente.
 *
 * Props        │ Descripción
 * ─────────────┼───────────────────────────────────────────────
 * event        │ EventData del evento
 * saved        │ Marca el corazón como "guardado"
 * onSave(id)   │ Se dispara al hacer clic en guardar
 * className    │ Clases adicionales
 *
 * Animaciones (Framer Motion):
 * ┌──────────────┬──────────────────────┬────────┐
 * │ Card         │ translateY(-4px)     │ 300ms  │
 * │ Imagen       │ scale(1.05)          │ 300ms  │
 * │ Overlay      │ opacidad → 0.8       │ 300ms  │
 * │ Botón "Ver"  │ translateX(4px)      │ 200ms  │
 * └──────────────┴──────────────────────┴────────┘
 * ────────────────────────────────────────────────────────── */
export default function FeaturedEventCard({
  event,
  saved = false,
  onSave,
  className,
}: FeaturedEventCardProps) {
  const eventDate = new Date(event.eventDate + "T00:00:00")
  const location = [event.municipality, event.department].filter(Boolean).join(", ")

  const fecha = eventDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSave?.(event.id ?? "")
  }

  return (
    <motion.article
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-card",
        "h-[560px] md:col-span-2",
        "shadow-md hover:shadow-xl",
        className,
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link
        href={`/events/${event.id ?? ""}/`}
        className="block size-full"
        aria-label={`Ver detalles de ${event.title}`}
      >
        {/* ─── Imagen de fondo ─── */}
        <div className="absolute inset-0">
          <SmartImage
            src={event.cover}
            alt={event.title}
            className={cn(
              "size-full object-cover transition-transform duration-300",
              "group-hover:scale-105",
            )}
            fallbackType={
              event.category?.includes("trail")
                ? "trail"
                : event.category?.includes("marathon")
                  ? "marathon"
                  : "running"
            }
          />
        </div>

        {/* ─── Overlay oscuro ─── */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t",
            "from-black/35 via-black/20 to-transparent",
            "dark:from-black/60 dark:via-black/30 dark:to-transparent",
            "transition-opacity duration-300",
            "group-hover:opacity-80",
          )}
        />

        {/* ─── Contenido ─── */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-8">
          {/* Badge categoría — tamaño lg */}
          {event.category && (
            <CategoryBadge
              category={event.category}
              size="lg"
              className="mb-4 self-start"
            />
          )}

          {/* Título grande */}
          <h2 className="text-3xl font-bold text-white line-clamp-2 md:text-4xl">
            {event.title}
          </h2>

          {/* Ubicación + fecha */}
          <p className="mt-2 text-base text-white/80 line-clamp-1">
            {location && <span>{location} · </span>}
            {fecha}
          </p>

          {/* Distancias */}
          {event.distances && event.distances.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {event.distances.map((d, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm"
                >
                  {typeof d === "string" ? d : d.value}
                </span>
              ))}
            </div>
          )}

          {/* Descripción corta (2 líneas) */}
          {event.snippet && (
            <p className="mt-3 text-sm text-white/70 line-clamp-2 md:text-base">
              {event.snippet}
            </p>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            {/* Corazón guardar */}
            <button
              type="button"
              onClick={handleSave}
              className={cn(
                "flex items-center gap-2 transition-colors",
                "text-white/60 hover:text-white",
              )}
              aria-label={saved ? "Quitar de guardados" : "Guardar evento"}
            >
              <Heart
                className={cn(
                  "size-6 transition-all",
                  saved && "fill-red-500 text-red-500",
                )}
              />
              {saved && (
                <span className="text-sm text-white/70">Guardado</span>
              )}
            </button>

            {/* Botón "Ver carrera" prominente */}
            <Button
              variant="secondary"
              size="lg"
              className={cn(
                "gap-2 border border-white/30 bg-white/20 text-white backdrop-blur-sm",
                "hover:bg-white/30 hover:text-white",
              )}
              asChild
            >
              <motion.span
                className="inline-flex items-center gap-2"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                Ver carrera
                <ArrowRight className="size-4" />
              </motion.span>
            </Button>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
