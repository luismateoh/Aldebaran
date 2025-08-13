'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDate } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import EventActions from "@/components/event-actions"
import CountDownTimer from "@/components/count-down-timer"
import { Badge } from "@/components/ui/badge"
import type { EventData } from "@/lib/types"

interface DynamicEventCardProps {
  eventData: EventData
  eventDate: Date
}

export default function DynamicEventCard({ eventData, eventDate }: DynamicEventCardProps) {
  const [showTitle, setShowTitle] = useState(false)
  const [isSticky, setIsSticky] = useState(true)

  useEffect(() => {
    const titleObserver = new IntersectionObserver(
      ([entry]) => {
        // Show small title when main title is not visible
        setShowTitle(!entry.isIntersecting)
      },
      {
        threshold: 0,
        rootMargin: '-100px 0px 0px 0px' // Start hiding when title is 100px from top
      }
    )

    const commentsObserver = new IntersectionObserver(
      ([entry]) => {
        // Stop being sticky when comments section is visible
        setIsSticky(!entry.isIntersecting)
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 0px 0px'
      }
    )

    // Observe the main title that should exist in the parent
    const mainTitle = document.querySelector('h1[data-main-title]')
    if (mainTitle) {
      titleObserver.observe(mainTitle)
    }

    // Observe the comments section
    const commentsSection = document.querySelector('[data-comments-section]')
    if (commentsSection) {
      commentsObserver.observe(commentsSection)
    }

    return () => {
      if (mainTitle) {
        titleObserver.unobserve(mainTitle)
      }
      if (commentsSection) {
        commentsObserver.unobserve(commentsSection)
      }
    }
  }, [])

  return (
    <div className={`${isSticky ? 'sticky top-20' : 'relative'} z-10 space-y-4`}>
      {/* Event Title & Date Card */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        {/* Dynamic Title - only shows when main title is not visible */}
        {showTitle && (
          <div className="mb-4 transition-opacity duration-200 ease-in-out">
            <h3 className="text-xl font-bold">
              {eventData.title.toUpperCase()}
            </h3>
          </div>
        )}
        
        <div className="mb-4 space-y-2">
          <div className="text-xl font-bold uppercase text-foreground">
            {formatDate(eventDate, "EEE", { locale: es })}
          </div>
          <div className="text-4xl font-bold text-foreground">
            {formatDate(eventDate, "dd", { locale: es })}
          </div>
          <div className="text-base font-medium uppercase text-muted-foreground">
            {formatDate(eventDate, "MMMM", { locale: es })}
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Cuenta Regresiva
            </h4>
            <CountDownTimer targetDate={eventDate.getTime()} />
          </div>
        </div>

        {/* Registration Button */}
        {eventData.registrationUrl && (
          <Link
            href={eventData.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Registrarse
          </Link>
        )}

        {/* Event Actions */}
        <div className="space-y-2">
          <EventActions
            event={eventData}
            variant="vertical"
            className="w-full"
          />
        </div>
      </div>

      {/* Event Details */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Detalles</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ubicación:</span>
            <span className="font-medium">{eventData.municipality}, {eventData.department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Categoría:</span>
            <Badge className="capitalize">{eventData.category}</Badge>
          </div>
          
          {/* Distances */}
          <div>
            <span className="text-muted-foreground">Distancias:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {eventData.distances && Array.isArray(eventData.distances) ? (
                eventData.distances
                  .sort((a: any, b: any) => {
                    const aValue = typeof a === 'string' ? parseFloat(a) : parseFloat(a.value || '0')
                    const bValue = typeof b === 'string' ? parseFloat(b) : parseFloat(b.value || '0')
                    return aValue - bValue
                  })
                  .map((distance: any, index: number) => (
                    <Badge
                      key={`distance-${index}`}
                      variant="secondary"
                      className="text-xs"
                    >
                      {typeof distance === 'string' ? distance : distance.value || distance}
                    </Badge>
                  ))
              ) : eventData.distance ? (
                <Badge variant="secondary" className="text-xs">
                  {eventData.distance}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  10k
                </Badge>
              )}
            </div>
          </div>

          {eventData.organizer && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Organiza:</span>
              <span className="font-medium">{eventData.organizer}</span>
            </div>
          )}
          
          {eventData.price && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo:</span>
              <span className="font-medium">Desde {eventData.price}</span>
            </div>
          )}
          
          {eventData.altitude && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Altitud:</span>
              <span className="font-medium">{eventData.altitude}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}