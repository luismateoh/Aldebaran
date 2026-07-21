'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Route } from 'lucide-react'

import type { EventData } from '@/lib/types'
import { cn } from '@/lib/utils'
import EventCard from '@/components/cards/event-card'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SimilarEventsProps {
  currentEvent: EventData
  allEvents: EventData[]
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Normaliza una distancia a un string comparable */
function normalizeDistance(d: string | { value: string }): string {
  return (typeof d === 'string' ? d : d.value).toLowerCase().trim()
}

/** Calcula cuántas distancias coinciden entre dos eventos */
function distanceOverlap(a: EventData, b: EventData): number {
  if (!a.distances || !b.distances || a.distances.length === 0 || b.distances.length === 0) {
    return 0
  }
  const normA = a.distances.map(normalizeDistance)
  const normB = b.distances.map(normalizeDistance)
  return normA.filter((d) => normB.includes(d)).length
}

/** Normaliza categoría para comparación flexible */
function normalizeCategory(cat: string): string {
  return cat.toLowerCase().trim()
}

/* ------------------------------------------------------------------ */
/*  SimilarEvents — Grid de EventCards                                */
/* ------------------------------------------------------------------ */

export function SimilarEvents({
  currentEvent,
  allEvents,
  className,
}: SimilarEventsProps) {
  const similarEvents = useMemo(() => {
    // Filtrar: excluir el evento actual y los borradores
    const candidates = allEvents.filter(
      (e) => e.id !== currentEvent.id && !e.draft,
    )

    // Asignar puntuación de similitud
    const scored = candidates.map((event) => {
      let score = 0

      // 1. Misma categoría (peso más alto)
      if (
        event.category &&
        currentEvent.category &&
        normalizeCategory(event.category) === normalizeCategory(currentEvent.category)
      ) {
        score += 100
      }

      // 2. Mismo departamento / región
      if (
        event.department &&
        currentEvent.department &&
        event.department.toLowerCase().trim() ===
          currentEvent.department.toLowerCase().trim()
      ) {
        score += 50
      }

      // 3. Misma distancia
      const overlap = distanceOverlap(event, currentEvent)
      score += overlap * 25

      // 4. Mismo municipio (bonus extra)
      if (
        event.municipality &&
        currentEvent.municipality &&
        event.municipality.toLowerCase().trim() ===
          currentEvent.municipality.toLowerCase().trim()
      ) {
        score += 30
      }

      return { event, score }
    })

    // Ordenar por puntuación descendente y tomar top 6
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((s) => s.event)
  }, [currentEvent, allEvents])

  if (similarEvents.length === 0) return null

  return (
    <section className={cn('mt-14', className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3"
      >
        <div className="flex items-center gap-2">
          <Route className="size-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground md:text-xl">
            Carreras similares
          </h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {similarEvents.length}{' '}
          {similarEvents.length === 1 ? 'carrera' : 'carreras'}
        </span>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {similarEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: 'easeOut',
            }}
          >
            <EventCard event={event} compact />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
