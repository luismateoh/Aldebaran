import React from "react"

import type { EventData } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import SmartImage from "@/components/smart-image"
import EventLikeButton from "@/components/event-like-button"
import { Share2, MapPin, Pin, Bookmark } from "lucide-react"

import { Icons } from "../icons"

export default function EventCard({ event: event }: { event: EventData }) {
  const [isAttending, setIsAttending] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(false)
  const [likesCount, setLikesCount] = React.useState((event as any).likesCount || 1)

  // Fix timezone issue by creating date in local timezone
  const eventDate = new Date(event.eventDate + 'T00:00:00')
  const dayOfWeek = eventDate.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()
  const dayNumber = eventDate.getDate()
  const monthYear = eventDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
  const monthShort = eventDate.toLocaleDateString('es-ES', { month: 'short' })

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `${event.title} - ${event.municipality}, ${event.department}`,
      url: window.location.origin + `/events/${event.id || ''}/`
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(shareData.url)
      // TODO: Mostrar toast notification
    }
  }

  const handleAttendance = () => {
    setIsAttending(!isAttending)
    // TODO: Implementar lógica para guardar asistencia en Firebase
    // TODO: Agregar al perfil del usuario
    console.log(`Asistencia ${!isAttending ? 'marcada' : 'desmarcada'} para:`, event.title)
  }

  const handleSaveEvent = () => {
    setIsSaved(!isSaved)
    // TODO: Implementar lógica para guardar evento en favoritos
    console.log(`Evento ${!isSaved ? 'guardado' : 'removido'} de favoritos:`, event.title)
  }


  return (
    <article
      id={event.id || ''}
      className="group overflow-hidden bg-white dark:bg-gray-900"
      onCopy={(e) => {
        e.preventDefault()
      }}
    >
      {/* Card Header */}
      <div className="flex items-start p-4">
        {/* Date section - siguiendo especificaciones Figma */}
        <div className="mr-6 flex h-[102px] w-[62px] flex-col justify-center text-center">
          <div className="text-xs font-semibold uppercase leading-none text-[#6B7280]">
            DOM
          </div>
          <div className="mt-2 text-2xl font-bold leading-none text-[#111827]">
            {dayNumber}
          </div>
          <div className="mt-2 text-xs text-[#6B7280]">
            {monthShort.toUpperCase()}
          </div>
        </div>

        {/* Vertical line separator */}
        <div className="mr-6 h-[102px] w-px bg-black"></div>

        {/* Details section */}
        <div className="flex h-[102px] flex-1 flex-col justify-center">
          {/* First row: Category badge + Location */}
          <div className="mb-2 flex items-center gap-2">
            <Badge className="rounded-md text-xs capitalize">
              {event.category}
            </Badge>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="size-3" />
                <span>{event.municipality}</span>
              </div>
              {event.altitude && (
                <div className="flex items-center gap-1">
                  <Icons.mountain className="size-3" />
                  <span>{event.altitude}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Event title */}
          <a href={`/events/${event.id || ''}/`} className="group-hover:underline">
            <h2 className="line-clamp-2 text-lg font-semibold leading-tight text-gray-900 dark:text-white">
              {event.title.toUpperCase()}
            </h2>
          </a>

          {/* Distance badges */}
          {event.distances && Array.isArray(event.distances) && event.distances.length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex flex-wrap gap-1">
                {event.distances.map((distance: any, index: number) => (
                  <Badge
                    variant="outline"
                    className="text-xs"
                    key={`distance-${index}`}
                  >
                    {typeof distance === 'string' ? distance : distance.value || distance}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image section */}
      <div className="relative mx-4 mb-2 h-48 overflow-hidden rounded-lg bg-gradient-to-br from-cyan-400 to-green-400">
        <a href={`/events/${event.id || ''}/`} className="absolute inset-0">
          <SmartImage
            src={event.cover || undefined}
            alt={"Imagen de " + event.title}
            width={720}
            height={360}
            className="size-full object-cover"
            eventId={event.id || ''}
            fallbackType={event.category?.includes('marathon') ? 'marathon' : 
                        event.category?.includes('trail') ? 'trail' : 'running'}
            priority
          />
        </a>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 p-3 text-sm text-gray-600 dark:text-gray-400">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="h-auto p-1 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Share2 className="size-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveEvent}
          className={`h-auto p-1 hover:bg-gray-50 dark:hover:bg-gray-800 ${
            isSaved ? 'text-blue-600 dark:text-blue-400' : ''
          }`}
        >
          <Bookmark className={`size-4 ${isSaved ? 'fill-current' : ''}`} />
        </Button>

        <EventLikeButton
          eventId={event.id || ''}
          initialCount={(event as any).likesCount || 1}
          variant="ghost"
          size="sm"
          showCount={true}
          className="h-auto p-1 hover:bg-gray-50 dark:hover:bg-gray-800"
        />
      </div>
    </article>
  )
}
