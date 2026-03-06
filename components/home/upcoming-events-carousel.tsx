'use client'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Route } from "lucide-react"
import Link from "next/link"
import { EventData } from "@/types"

interface UpcomingEventsCarouselProps {
  events: EventData[]
}

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

export function UpcomingEventsCarousel({ events }: UpcomingEventsCarouselProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted bg-muted/30 py-12 text-center">
        <Calendar className="mx-auto mb-4 size-12 text-muted-foreground" />
        <p className="text-lg font-medium text-muted-foreground">No hay eventos próximos disponibles</p>
        <p className="mt-2 text-sm text-muted-foreground">Los eventos aparecerán aquí cuando estén configurados</p>
      </div>
    )
  }

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = parseEventDateLocal(dateString)
    if (!date) return dateString

    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para calcular días restantes
  const getDaysUntilEvent = (dateString: string) => {
    const eventDate = parseEventDateLocal(dateString)
    if (!eventDate) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const eventDay = new Date(eventDate)
    eventDay.setHours(0, 0, 0, 0)

    const diffTime = eventDay.getTime() - today.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {events.map((event) => {
          const daysUntil = getDaysUntilEvent(event.eventDate)
          
          return (
            <CarouselItem key={event.id} className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3">
              <Card className="h-full transition-shadow duration-200 hover:shadow-lg border-border/40">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="line-clamp-2 text-lg leading-tight">
                        {event.title}
                      </CardTitle>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          <span className="truncate">
                            {event.municipality}, {event.department}
                            {event.altitude && <span className="ml-1 text-xs opacity-75">({event.altitude})</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                    {daysUntil !== null && daysUntil >= 0 && (
                      <Badge variant={daysUntil <= 7 ? "destructive" : "secondary"} className="whitespace-nowrap text-xs">
                        {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `${daysUntil}d`}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 pt-0">
                  {/* Categoría */}
                  {event.category && (
                    <div className="flex justify-start">
                      <Badge variant="secondary" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>
                  )}

                  {/* Fecha */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>

                  {/* Distancias */}
                  {event.distances && event.distances.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Route className="size-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {event.distances.map((distance, index) => (
                          <Badge key={`${event.id}-distance-${index}`} variant="outline" className="text-xs">
                            {typeof distance === 'string' ? distance : distance.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}



                  {/* Botón Ver más */}
                  <div className="pt-2">
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/events/${event.id}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious className="-left-12 hidden md:flex" />
      <CarouselNext className="-right-12 hidden md:flex" />
    </Carousel>
  )
}