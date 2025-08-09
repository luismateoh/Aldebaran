'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Share2, 
  ExternalLink, 
  Calendar,
  MapPin,
  Copy,
  Check
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import EventLikeButton from '@/components/event-like-button'
import EventAttendanceButton from '@/components/event-attendance-button'
import { cn } from '@/lib/utils'
import type { EventData } from '@/types'

interface EventActionsProps {
  event: EventData
  variant?: 'horizontal' | 'vertical'
  className?: string
}

export default function EventActions({ 
  event, 
  variant = 'horizontal',
  className 
}: EventActionsProps) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${event.id}`
    const shareData = {
      title: event.title,
      text: `${event.snippet || 'Evento de running en Colombia'}`,
      url
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleAddToCalendar = () => {
    if (!event.eventDate) return

    const startDate = new Date(event.eventDate)
    const endDate = new Date(startDate)
    endDate.setHours(startDate.getHours() + 4) // Asumimos 4 horas de duración

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const calendarUrl = [
      'https://calendar.google.com/calendar/render?action=TEMPLATE',
      `text=${encodeURIComponent(event.title)}`,
      `dates=${formatDate(startDate)}/${formatDate(endDate)}`,
      `details=${encodeURIComponent(event.snippet || 'Evento de running en Colombia')}`,
      `location=${encodeURIComponent(`${event.municipality}, ${event.department}`)}`
    ].join('&')

    window.open(calendarUrl, '_blank')
  }

  const handleViewLocation = () => {
    const query = encodeURIComponent(`${event.municipality}, ${event.department}`)
    const mapsUrl = `https://www.google.com/maps/search/${query}`
    window.open(mapsUrl, '_blank')
  }

  const handleGoToWebsite = () => {
    const websiteUrl = event.website || event.registrationUrl
    if (websiteUrl) {
      window.open(websiteUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const isHorizontal = variant === 'horizontal'

  const buttonSize = variant === 'vertical' ? 'xs' : 'sm'
  const iconSize = variant === 'vertical' ? 'size-3' : 'size-4'
  const textSize = variant === 'vertical' ? 'text-xs' : 'text-sm'

  return (
    <div className={cn(
      "flex gap-1",
      isHorizontal ? "flex-row flex-wrap" : "flex-col",
      className
    )}>
      {/* Botón de Like */}
      {event.id && (
        <EventLikeButton
          eventId={event.id}
          variant="outline"
          size={buttonSize as any}
          showCount={true}
          className={variant === 'vertical' ? 'h-7 px-2 py-0.5 text-xs' : ''}
        />
      )}

      {/* Botón de Asistencia - solo para eventos pasados o actuales */}
      {event.id && event.eventDate && new Date(event.eventDate) <= new Date() && (
        <EventAttendanceButton
          eventId={event.id}
          eventTitle={event.title}
          eventDate={event.eventDate}
          className={variant === 'vertical' ? 'h-7 px-2 py-0.5 text-xs' : ''}
        />
      )}

      {/* Botón de Compartir */}
      <Button
        variant="outline"
        size={buttonSize as any}
        onClick={handleShare}
        className={cn(
          "flex items-center justify-center gap-1",
          variant === 'vertical' && 'h-7 px-2 py-0.5'
        )}
      >
        <Share2 className={iconSize} />
        <span className={textSize}>Compartir</span>
      </Button>

      {/* Botón de Agregar al Calendario */}
      {event.eventDate && (
        <Button
          variant="outline"
          size={buttonSize as any}
          onClick={handleAddToCalendar}
          className={cn(
            "flex items-center justify-center gap-1",
            variant === 'vertical' && 'h-7 px-2 py-0.5'
          )}
        >
          <Calendar className={iconSize} />
          <span className={textSize}>Calendario</span>
        </Button>
      )}

      {/* Botón de Ver Ubicación */}
      {event.municipality && event.department && (
        <Button
          variant="outline"
          size={buttonSize as any}
          onClick={handleViewLocation}
          className={cn(
            "flex items-center justify-center gap-1",
            variant === 'vertical' && 'h-7 px-2 py-0.5'
          )}
        >
          <MapPin className={iconSize} />
          <span className={textSize}>Ubicación</span>
        </Button>
      )}

      {/* Botón de Sitio Web */}
      {(event.website || event.registrationUrl) && (
        <Button
          variant="outline"
          size={buttonSize as any}
          onClick={handleGoToWebsite}
          className={cn(
            "flex items-center justify-center gap-1",
            variant === 'vertical' && 'h-7 px-2 py-0.5'
          )}
        >
          <ExternalLink className={iconSize} />
          <span className={textSize}>Sitio Web</span>
        </Button>
      )}
    </div>
  )
}