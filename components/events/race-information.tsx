"use client"

import { Calendar, MapPin, Route, Mountain, TrendingUp, Tag, Clock, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { EventData } from "@/lib/types"

export interface RaceInformationProps {
  event: EventData
  className?: string
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  className?: string
}

function InfoItem({ icon, label, value, className }: InfoItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-surface",
        className
      )}
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-semibold text-foreground">
          {value}
        </div>
      </div>
    </div>
  )
}

function formatEventDate(eventDate: string): { date: string; time?: string } {
  try {
    const date = new Date(eventDate)
    if (isNaN(date.getTime())) return { date: eventDate }

    const formatted = format(date, "EEEE, d 'de' MMMM 'del' yyyy", { locale: es })
    // Capitalize first letter
    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1)

    // Check if there's a time component
    const timeMatch = eventDate.match(/\d{2}:\d{2}/)
    const time = timeMatch ? timeMatch[0] : undefined

    return { date: capitalized, time }
  } catch {
    return { date: eventDate }
  }
}

export function RaceInformation({ event, className }: RaceInformationProps) {
  const { date, time } = formatEventDate(event.eventDate)

  const items: InfoItemProps[] = [
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Fecha",
      value: (
        <div>
          <span>{date}</span>
          {time && (
            <span className="ml-1.5 text-xs text-muted-foreground">
              {time}
            </span>
          )}
        </div>
      ),
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "Lugar",
      value: (
        <span>
          {event.municipality}, {event.department}
        </span>
      ),
    },
    {
      icon: <Route className="h-5 w-5" />,
      label: "Distancias",
      value: (
        <div className="flex flex-wrap gap-1.5">
          {event.distances && Array.isArray(event.distances) && event.distances.length > 0
            ? event.distances.map((d: any, i: number) => {
                const val = typeof d === "string" ? d : d?.value || d
                return (
                  <Badge key={`dist-${i}`} variant="secondary" className="text-xs">
                    {val}
                  </Badge>
                )
              })
            : event.distance
              ? (
                <Badge variant="secondary" className="text-xs">
                  {event.distance}
                </Badge>
              )
              : (
                <span className="text-muted-foreground">No especificadas</span>
              )}
        </div>
      ),
    },
    {
      icon: <Mountain className="h-5 w-5" />,
      label: "Altitud",
      value: event.altitude
        ? (
          <span>{event.altitude.replace(/\$[^$]*\$/g, "").trim()}</span>
        )
        : (
          <span className="text-muted-foreground">No disponible</span>
        ),
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Desnivel",
      value: (
        <span className="text-muted-foreground">
          No disponible
        </span>
      ),
    },
    {
      icon: <Tag className="h-5 w-5" />,
      label: "Categoría",
      value: event.category
        ? (
          <Badge className="capitalize">{event.category}</Badge>
        )
        : (
          <span className="text-muted-foreground">No especificada</span>
        ),
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Tiempo límite",
      value: (
        <span className="text-muted-foreground">
          No especificado
        </span>
      ),
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: "Precio",
      value: event.price
        ? (
          <span className="font-semibold text-success">{event.price}</span>
        )
        : (
          <span className="text-muted-foreground">No disponible</span>
        ),
    },
  ]

  // Filter out fields that are truly not applicable based on event data patterns.
  // For now we show all items but use "No disponible" fallback for missing data.
  const visibleItems = items

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-heading text-heading-4 font-semibold text-foreground">
        Información de la carrera
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleItems.map((item, index) => (
          <InfoItem key={index} {...item} />
        ))}
      </div>
    </div>
  )
}
