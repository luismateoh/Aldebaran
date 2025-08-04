import React from "react"

import type { EventData } from "@/lib/types"
import { capitalize, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import SmartImage from "@/components/smart-image"

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
      <a
        href={`/events/${event.id}/`}
        className="flex h-52 rounded-2xl bg-background transition duration-300 group-hover:-translate-y-2 group-hover:shadow-xl"
      >
        <SmartImage
          src={event.cover}
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
          <p className="flex items-center justify-center gap-1 align-middle text-muted-foreground">
            <Icons.mountain className="size-4" />
            {event.altitude}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {event.distances
            .sort((a: any, b: any) => parseFloat(a.value) - parseFloat(b.value))
            .map((distance: string) => (
              <Badge
                className="rounded-md text-sm capitalize"
                variant="secondary"
                key={distance}
              >
                {distance}
              </Badge>
            ))}
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
