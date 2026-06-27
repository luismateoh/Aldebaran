"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Route, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EventData } from "@/types"

interface UpcomingEventsAccordionProps {
  events: EventData[]
}

const FALLBACK_IMAGES = [
  "/images/home/hero-trail-running.jpg",
  "/images/home/trail-runner.jpg",
  "/images/home/runner-sunrise.jpg",
  "/images/home/pexels-marathon.jpg",
  "/images/home/running-track.jpg",
  "/images/home/sprinter-track.jpg",
]

function parseEventDateLocal(dateString: string): Date | null {
  if (!dateString) return null

  const localDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
  if (localDateMatch) {
    const year = Number(localDateMatch[1])
    const month = Number(localDateMatch[2])
    const day = Number(localDateMatch[3])
    return new Date(year, month - 1, day)
  }

  const parsed = new Date(dateString)
  return isNaN(parsed.getTime()) ? null : parsed
}

function formatDate(dateString: string) {
  const date = parseEventDateLocal(dateString)
  if (!date) return dateString

  return date.toLocaleDateString('es-CO', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function getDaysUntilEvent(dateString: string) {
  const eventDate = parseEventDateLocal(dateString)
  if (!eventDate) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const eventDay = new Date(eventDate)
  eventDay.setHours(0, 0, 0, 0)

  const diffTime = eventDay.getTime() - today.getTime()
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}

export function UpcomingEventsAccordion({ events }: UpcomingEventsAccordionProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!events || events.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted bg-muted/30 py-12 text-center">
        <Calendar className="mx-auto mb-4 size-12 text-muted-foreground" />
        <p className="text-lg font-medium text-muted-foreground">No hay eventos próximos disponibles</p>
        <p className="mt-2 text-sm text-muted-foreground">Los eventos aparecerán aquí cuando estén configurados</p>
      </div>
    )
  }

  return (
    <div className="flex h-[520px] flex-col gap-3 md:h-[480px] md:flex-row">
      {events.slice(0, 6).map((event, index) => {
        const isActive = index === activeIndex
        const daysUntil = getDaysUntilEvent(event.eventDate)
        const fallbackImage = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
        const eventImage = event.cover?.startsWith('/') ? event.cover : fallbackImage

        return (
          <div
            key={event.id}
            onClick={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-3xl border border-border",
              isActive
                ? "flex-[3] md:flex-[4]"
                : "flex-1"
            )}
          >
            {/* Background image */}
            <Image
              src={eventImage}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className={cn(
                "object-cover transition-transform duration-700",
                isActive ? "scale-100" : "scale-110 group-hover:scale-100"
              )}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
            <div className={cn(
              "absolute inset-0 bg-primary/20 mix-blend-multiply transition-opacity duration-500",
              !isActive && "opacity-60"
            )} />

            {/* Collapsed label (vertical) */}
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="whitespace-nowrap text-lg font-bold uppercase tracking-wider text-white md:-rotate-90 md:text-xl">
                  {event.title}
                </span>
              </div>
            )}

            {/* Expanded content */}
            {isActive && (
              <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8">
              <div className="mb-auto flex items-start justify-between">
                <Badge className="border-white/20 bg-white/10 text-xs font-medium text-white backdrop-blur-md">
                  {event.category || "Running"}
                </Badge>
                {daysUntil !== null && daysUntil >= 0 && (
                  <Badge className={cn(
                    "text-xs font-medium backdrop-blur-md",
                    daysUntil <= 7
                      ? "border-red-400/30 bg-red-500/20 text-white"
                      : "border-white/20 bg-white/10 text-white"
                  )}>
                    {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `En ${daysUntil}d`}
                  </Badge>
                )}
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="size-4" />
                  {event.municipality}, {event.department}
                  {event.altitude && <span className="text-xs opacity-75">({event.altitude})</span>}
                </p>

                <h3 className="mb-3 text-2xl font-bold leading-tight text-white md:text-4xl">
                  {event.title}
                </h3>

                <p className="mb-4 flex items-center gap-1.5 text-sm text-white/80">
                  <Calendar className="size-4" />
                  {formatDate(event.eventDate)}
                </p>

                {event.distances && event.distances.length > 0 && (
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <Route className="size-4 text-white/70" />
                    {event.distances.slice(0, 4).map((distance, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-white/20 bg-white/10 text-xs text-white backdrop-blur-sm"
                      >
                        {typeof distance === 'string' ? distance : distance.value}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button
                  asChild
                  size="sm"
                  className="group/btn rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90"
                >
                  <Link href={`/events/${event.id}`}>
                    Ver Detalles
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
