import React from "react"

import type { EventData } from "@/lib/types"
import { capitalize, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import SmartImage from "@/components/smart-image"
import EventLikeButton from "@/components/event-like-button"
import { Share2, MapPin, Pin, Bookmark } from "lucide-react"

import { Icons } from "../icons"

export default function EventCard({ event: event }: { event: EventData }) {
  const [isAttending, setIsAttending] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(false)

  const eventDate = new Date(event.eventDate)
  const dayOfWeek = eventDate.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()
  const dayNumber = eventDate.getDate()
  const monthYear = eventDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `${event.title} - ${event.municipality}, ${event.department}`,
      url: window.location.origin + `/events/${event.id}/`
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
      id={event.id}
      className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/25 transition-shadow duration-300"
      onCopy={(e) => {
        e.preventDefault()
      }}
    >
      {/* Header with date and title */}
      <div className="flex">
        {/* Date section */}
        <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-4 min-w-[80px] border-r border-gray-200 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {dayOfWeek}
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white leading-none mt-1">
            {dayNumber}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {monthYear}
          </span>
        </div>

        {/* Content section */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="rounded-md capitalize text-xs">{event.category}</Badge>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.municipality}</span>
                  </div>
                  {event.altitude && (
                    <div className="flex items-center gap-1">
                      <Icons.mountain className="h-3 w-3" />
                      <span>{event.altitude}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <a href={`/events/${event.id}/`} className="group-hover:underline">
                <h2 className="font-semibold text-lg leading-tight text-gray-900 dark:text-white line-clamp-2">
                  {event.title}
                </h2>
              </a>

              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                {event.distances && Array.isArray(event.distances) && event.distances.length > 0 && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image section */}
      <div className="relative h-48">
        <a href={`/events/${event.id}/`}>
          <SmartImage
            src={event.cover || undefined}
            alt={"Imagen de " + event.title}
            width={720}
            height={360}
            className="size-full object-cover"
            eventId={event.id}
            fallbackType={event.category?.includes('marathon') ? 'marathon' : 
                        event.category?.includes('trail') ? 'trail' : 'running'}
            priority
          />
        </a>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-gray-700 border-t border-gray-200 dark:border-gray-700">
        {/* Like Button */}
        <div>
          <EventLikeButton
            eventId={event.id}
            initialCount={(event as any).likesCount || 0}
            variant="ghost"
            size="sm"
            showCount={true}
            className="w-full rounded-none py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2"
          />
        </div>
        
        {/* Attendance Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAttendance}
          className={`rounded-none py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 ${
            isAttending ? 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' : ''
          }`}
        >
          <Pin className={`h-4 w-4 ${isAttending ? 'fill-current' : ''}`} />
          <span className="text-xs hidden sm:inline">
            {isAttending ? 'Asisto' : 'Asistiré'}
          </span>
        </Button>

        {/* Save/Bookmark Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveEvent}
          className={`rounded-none py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 ${
            isSaved ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : ''
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          <span className="text-xs hidden sm:inline">
            {isSaved ? 'Guardado' : 'Guardar'}
          </span>
        </Button>
        
        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="rounded-none py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">Compartir</span>
        </Button>
      </div>
    </article>
  )
}
