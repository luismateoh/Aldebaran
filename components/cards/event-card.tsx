'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Heart } from "lucide-react"

import type { EventData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CategoryBadge } from "@/components/ui/category-badge"
import SmartImage from "@/components/smart-image"

/* ──────────────────────────────────────────────────────────
 * EventCardProps
 * ────────────────────────────────────────────────────────── */
export interface EventCardProps {
  /** Datos del evento a mostrar */
  event: EventData
  /** Versión destacada (XL) — más grande, con descripción */
  featured?: boolean
  /** Marcar el corazón como guardado */
  saved?: boolean
  /** Versión compacta — menos detalles */
  compact?: boolean
  /** Callback al hacer click en guardar */
  onSave?: (id: string) => void
  /** Clases adicionales */
  className?: string
}

/* ──────────────────────────────────────────────────────────
 * EventCard — Poster-style card for athletics events
 * ──────────────────────────────────────────────────────────
 * Props         │ Descripción
 * ──────────────┼───────────────────────────────────────────────
 * event         │ EventData del evento (FirebaseEventData)
 * featured      │ Altura 560px + descripción + botón grande
 * saved         │ Estado visual del corazón (fill red)
 * compact       │ Oculta distancias y descripción
 * onSave(id)    │ Callback al presionar guardar
 * className     │ Clases adicionales
 *
 * Animaciones (Framer Motion):
 * ┌──────────────┬──────────────────────┬────────┐
 * │ Elemento     │ Hover effect         │ Tiempo │
 * ├──────────────┼──────────────────────┼────────┤
 * │ Card         │ translateY(-4px)     │ 300ms  │
 * │ Imagen       │ scale(1.05)          │ 300ms  │
 * │ Overlay      │ opacidad  → 0.8      │ 300ms  │
 * └──────────────┴──────────────────────┴────────┘
 * ────────────────────────────────────────────────────────── */
export default function EventCard({
  event,
  featured = false,
  saved = false,
  compact = false,
  onSave,
  className,
}: EventCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

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
        "h-[420px]",
        featured && "h-[560px]",
        "shadow-md hover:shadow-xl",
        className,
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link
        href={`/events/${event.id ?? ""}/`}
        className={cn(
          "block size-full",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        )}
        aria-label={`Ver detalles de ${event.title}`}
      >
        {/* ─── Imagen de fondo ─── */}
        <div className="absolute inset-0">
          <SmartImage
            src={event.cover}
            alt={event.title}
            className={cn(
              "size-full object-cover transition-transform duration-300 ease-out",
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

        {/* ─── Overlay oscuro ───
         *   light: ~35 %  →  black/35  al centro
         *   dark:  ~60 %  →  black/60
         *   hover: más transparente (opacity-80)
         */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t",
            "from-black/35 via-black/20 to-transparent",
            "dark:from-black/60 dark:via-black/30 dark:to-transparent",
            "transition-opacity duration-300 ease-out",
            "group-hover:opacity-80",
          )}
        />

        {/* ─── Contenido superpuesto ─── */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6">
          {/* Badge de categoría */}
          {event.category && (
            <CategoryBadge
              category={event.category}
              size={featured ? "lg" : "sm"}
              className="mb-3 self-start"
            />
          )}

          {/* Título */}
          <h3
            className={cn(
              "font-bold text-white",
              featured ? "text-2xl" : "text-xl",
              "line-clamp-2",
            )}
          >
            {event.title}
          </h3>

          {/* Ciudad + Fecha */}
          <p className="mt-1 text-sm text-white/80 line-clamp-1">
            {location && <span>{location} · </span>}
            {fecha}
          </p>

          {/* Distancias (excepto compact) */}
          {!compact &&
            event.distances &&
            event.distances.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {event.distances.map((d, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs text-white backdrop-blur-sm"
                  >
                    {typeof d === "string" ? d : d.value}
                  </span>
                ))}
              </div>
            )}

          {/* Descripción corta (solo Featured) */}
          {featured && event.snippet && (
            <p className="mt-2 text-sm text-white/70 line-clamp-2">
              {event.snippet}
            </p>
          )}

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            {/* Corazón — Guardar */}
            <button
              type="button"
              onClick={handleSave}
              className={cn(
                "flex items-center gap-1.5 transition-colors duration-200",
                "text-white/60 hover:text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded-lg",
              )}
              aria-label={saved ? "Quitar de guardados" : "Guardar evento"}
            >
              <Heart
                className={cn(
                  "size-5 transition-all duration-200",
                  saved && "fill-red-500 text-red-500",
                )}
              />
              {saved && (
                <span className="text-xs text-white/70">Guardado</span>
              )}
            </button>

            {/* Botón Ver → */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors duration-200",
                "border border-white/30 bg-white/20 text-white backdrop-blur-sm",
                "hover:bg-white/30",
                featured
                  ? "px-4 py-2 text-sm"
                  : "px-3 py-1.5 text-xs",
              )}
            >
              Ver {featured ? "carrera" : "→"}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
