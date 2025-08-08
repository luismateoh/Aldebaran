import React from "react"

import type { EventData } from "@/lib/types"
import { capitalize, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import SmartImage from "@/components/smart-image"
import EventLikeButton from "@/components/event-like-button"

import { Icons } from "../icons"

export default function EventCard({ event: event }: { event: EventData }) {
  return (
    <article
      id={event.id}
      className="group space-y-3"
      onCopy={(e) => {
        e.preventDefault()
      }}
    >
      <div className="relative">
        <a
          href={`/events/${event.id}/`}
          className="flex h-52 rounded-2xl bg-background transition duration-300 group-hover:-translate-y-2 group-hover:shadow-xl"
        >
          <SmartImage
            src={event.cover || undefined}
            alt={"Imagen de " + event.title}
            width={720}
            height={360}
            className="size-full overflow-hidden rounded-xl object-cover"
            eventId={event.id}
            fallbackType={event.category?.includes('marathon') ? 'marathon' : 
                        event.category?.includes('trail') ? 'trail' : 'running'}
            priority
          />
        </a>
        
        {/* Botón de like en la esquina superior derecha */}
        <div className="absolute top-3 right-3 z-10">
          <EventLikeButton
            eventId={event.id}
            initialCount={(event as any).likesCount || 0}
            variant="ghost"
            size="sm"
            showCount={true}
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge className="rounded-md capitalize">{event.category}</Badge>
        <span className="font-medium text-muted-foreground">
          {capitalize(formatDate(new Date(event.eventDate)))}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="rounded-md text-sm capitalize">
            {event.municipality}
          </Badge>
          {/* Solo mostrar altitude si existe */}
          {event.altitude && (
            <p className="flex items-center justify-center gap-1 align-middle text-muted-foreground">
              <Icons.mountain className="size-4" />
              {event.altitude}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Verificar si existe distance y convertirlo a array si es necesario */}
          {event.distance && (
            <Badge
              className="rounded-md text-sm capitalize"
              variant="secondary"
            >
              {event.distance}
            </Badge>
          )}
          {/* Manejar distances como array si existe */}
          {event.distances && Array.isArray(event.distances) && 
            event.distances
              .sort((a: any, b: any) => parseFloat(a.value || a) - parseFloat(b.value || b))
              .map((distance: any, index: number) => (
                <Badge
                  className="rounded-md text-sm capitalize"
                  variant="secondary"
                  key={`distance-${index}`}
                >
                  {typeof distance === 'string' ? distance : distance.value || distance}
                </Badge>
              ))
          }
        </div>
      </div>

      <div>
        <a href={`/events/${event.id}/`} className="group-hover:underline">
          <h2 className="line-clamp-3 font-heading text-2xl leading-snug">
            {capitalize(event.title.toUpperCase())}
          </h2>
        </a>
      </div>
    </article>
  )
}
