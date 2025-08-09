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
      className="group bg-white dark:bg-gray-900 overflow-hidden"
      onCopy={(e) => {
        e.preventDefault()
      }}
    >
      {/* Card Header */}
      <div className="flex p-4 items-start">
        {/* Date section - siguiendo especificaciones Figma */}
        <div className="w-[62px] text-center mr-6 flex flex-col justify-center h-[102px]">
          <div className="text-xs font-semibold text-[#6B7280] uppercase leading-none">
            DOM
          </div>
          <div className="text-2xl font-bold text-[#111827] leading-none mt-2">
            {dayNumber}
          </div>
          <div className="text-xs text-[#6B7280] mt-2">
            {monthShort.toUpperCase()}
          </div>
        </div>

        {/* Vertical line separator */}
        <div className="w-px bg-black h-[102px] mr-6"></div>

        {/* Details section */}
        <div className="flex-1 flex flex-col justify-center h-[102px]">
          {/* First row: Category badge + Location */}
          <div className="flex items-center gap-2 mb-2">
            <Badge className="rounded-md capitalize text-xs">
              {event.category}
            </Badge>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
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
            <h2 className="font-semibold text-lg leading-tight text-gray-900 dark:text-white line-clamp-2">
              {event.title}
            </h2>
          </a>

          {/* Distance badges */}
          {event.distances && Array.isArray(event.distances) && event.distances.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
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
      <div className="relative h-48 bg-gradient-to-br from-cyan-400 to-green-400 rounded-lg overflow-hidden mx-4 mb-2">
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
      <div className="flex items-center justify-end p-3 text-sm text-gray-600 dark:text-gray-400 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="p-1 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Share2 className="size-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveEvent}
          className={`p-1 h-auto hover:bg-gray-50 dark:hover:bg-gray-800 ${
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
          className="p-1 h-auto hover:bg-gray-50 dark:hover:bg-gray-800"
        />
      </div>
    </article>
  )
}
