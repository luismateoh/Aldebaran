"use client"

import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EventData } from "@/lib/types"

export interface EventMapProps {
  event: EventData
  className?: string
}

export function EventMap({ event, className }: EventMapProps) {
  const location = `${event.municipality}, ${event.department}, Colombia`
  const encodedLocation = encodeURIComponent(location)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("space-y-4", className)}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-heading-3 font-semibold text-foreground">
            Ubicación
          </h2>
          <p className="text-sm text-muted-foreground">
            {location}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <iframe
          src={`https://www.google.com/maps/embed/v1/place?key=&q=${encodedLocation}&center=${encodedLocation}&zoom=12&language=es`}
          width="100%"
          height="350"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa - ${location}`}
          className="bg-surface"
          onError={(e) => {
            // Fallback if no API key: use the simpler embed
            const target = e.currentTarget
            target.src = `https://maps.google.com/maps?q=${encodedLocation}&output=embed&hl=es`
          }}
        />
      </div>

      {event.website && (
        <a
          href={`https://www.google.com/maps/search/${encodedLocation}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          <MapPin className="h-4 w-4" />
          Abrir en Google Maps
        </a>
      )}
    </motion.section>
  )
}
