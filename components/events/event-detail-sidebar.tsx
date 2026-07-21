"use client"

import { motion } from "framer-motion"
import {
  Calendar,
  Heart,
  Share2,
  ExternalLink,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CountdownCard } from "@/components/events/countdown-card"
import EventActions from "@/components/event-actions"
import AddToCalendar from "@/components/add-to-calendar"
import type { EventData } from "@/lib/types"

export interface EventDetailSidebarProps {
  event: EventData
  eventDate: string | Date
  className?: string
}

export function EventDetailSidebar({
  event,
  eventDate,
  className,
}: EventDetailSidebarProps) {
  const location =
    event.municipality && event.department
      ? `${event.municipality}, ${event.department}`
      : "Colombia"

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      className={cn("space-y-6 lg:sticky lg:top-24", className)}
    >
      {/* Countdown */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-center font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {new Date(eventDate) > new Date()
            ? "Tiempo restante"
            : "Fecha del evento"}
        </h3>
        <CountdownCard targetDate={eventDate} size="compact" />
      </div>

      {/* Register Button */}
      <Button
        size="lg"
        className="w-full gap-2 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        asChild
      >
        <a
          href={event.registrationUrl || event.website || "#"}
          target={event.registrationUrl || event.website ? "_blank" : undefined}
          rel={
            event.registrationUrl || event.website
              ? "noopener noreferrer"
              : undefined
          }
        >
          <ExternalLink className="h-5 w-5" />
          Inscribirme ahora
          <ChevronRight className="h-4 w-4" />
        </a>
      </Button>

      {/* Event Info Mini */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Detalles rápidos
        </h3>
        <div className="space-y-2.5 text-sm">
          {event.organizer && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Organizador</span>
              <span className="font-medium text-foreground">
                {event.organizer}
              </span>
            </div>
          )}
          {event.category && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Categoría</span>
              <span className="font-medium capitalize text-foreground">
                {event.category}
              </span>
            </div>
          )}
          {event.eventDate && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fecha</span>
              <span className="font-medium text-foreground">
                {new Date(event.eventDate).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ubicación</span>
            <span className="text-right font-medium text-foreground">
              {location}
            </span>
          </div>
        </div>
      </div>

      {/* Actions: Save, Share, Calendar */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Acciones
        </h3>
        <div className="flex flex-col gap-2">
          <EventActions
            event={event}
            variant="vertical"
            className="w-full"
          />
          <AddToCalendar
            title={event.title}
            description={event.snippet || event.description || ""}
            location={location}
            evenDate={event.eventDate}
            organizer={event.organizer || ""}
            website={event.website || ""}
          />
        </div>
      </div>
    </motion.aside>
  )
}
