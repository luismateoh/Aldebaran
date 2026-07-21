'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { EventData } from "@/lib/types"
import {
  SectionLabel,
  SectionTitle,
  SectionSubtitle,
} from "@/components/typography/section-typography"
import EventCard from "@/components/cards/event-card"
import FeaturedEventCard from "@/components/cards/featured-event-card"
import { Button } from "@/components/ui/button"

/* ──────────────────────────────────────────────────────────
 * FeaturedEventsSectionProps
 * ────────────────────────────────────────────────────────── */
export interface FeaturedEventsSectionProps {
  /** Lista de eventos a mostrar (máximo 6) */
  events: EventData[]
  /** Callback al guardar un evento */
  onSave?: (id: string) => void
  /** Set de IDs de eventos guardados */
  savedEvents?: Set<string>
  /** Clases adicionales */
  className?: string
}

/* ── Animation variants ── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

/* ──────────────────────────────────────────────────────────
 * FeaturedEventsSection
 * ──────────────────────────────────────────────────────────
 * Grid de carreras destacadas con alternancia de tarjetas
 * normales (EventCard) y destacadas (FeaturedEventCard). Las
 * tarjetas featured ocupan 2 columnas en desktop. Animaciones
 * stagger al entrar en viewport.
 *
 * Layout (desktop, 6 eventos):
 * ┌───────────────────┬──────────┐
 * │ FEATURED (col-2)  │ Normal   │
 * ├──────────┬───────────────────┤
 * │ Normal   │ FEATURED (col-2)  │
 * ├──────────┼──────────┬────────┤
 * │ Normal   │ Normal   │ Normal │
 * └──────────┴──────────┴────────┘
 * ────────────────────────────────────────────────────────── */
export function FeaturedEventsSection({
  events,
  onSave,
  savedEvents,
  className,
}: FeaturedEventsSectionProps) {
  const displayEvents = events.slice(0, 6)

  if (displayEvents.length === 0) return null

  /* Cada 3ra tarjeta (índice 0, 3) es featured */
  const isFeatured = (index: number) => index % 3 === 0

  return (
    <section className={className}>
      <div className="container py-20 md:py-28">
        {/* ── Header ── */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <SectionLabel>No te pierdas lo que viene</SectionLabel>
            <SectionTitle className="mt-2">Próximos eventos</SectionTitle>
            <SectionSubtitle className="mt-3">
              Las carreras más emocionantes que se acercan en Colombia
            </SectionSubtitle>
          </div>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="group shrink-0 rounded-full"
          >
            <Link href="/events">
              Ver todos
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* ── Grid de eventos ── */}
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {displayEvents.map((event, index) => {
            const featured = isFeatured(index)
            const saved = savedEvents?.has(event.id ?? "")

            return (
              <motion.div
                key={event.id ?? `event-${index}`}
                variants={cardVariants}
                className={
                  featured
                    ? "md:col-span-2 lg:col-span-2"
                    : ""
                }
              >
                {featured ? (
                  <FeaturedEventCard
                    event={event}
                    saved={saved}
                    onSave={onSave}
                  />
                ) : (
                  <EventCard
                    event={event}
                    saved={saved}
                    onSave={onSave}
                  />
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
