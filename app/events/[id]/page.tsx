import Link from "next/link"
import { formatDate } from "date-fns"
import { es } from "date-fns/locale"
import { notFound } from "next/navigation"

import { eventsService } from "@/lib/events-firebase"
import { EventData } from "@/lib/types"
import { capitalize } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import EventComments from "@/components/event-comments"
import InteractiveSection from "@/components/interactive-section"
import SeeAllEventsCta from "@/components/see-all-events-cta"
import SmartImage from "@/components/smart-image"
import DynamicEventCard from "@/components/dynamic-event-card"

type Params = {
  id: string
}

type Props = {
  params: Params
}

export async function generateMetadata({ params }: Props) {
  try {
    const eventData: EventData = await eventsService.getEventById(params.id)
    
    // Si el evento es borrador, no generar metadata
    if (eventData.draft) {
      return {
        title: 'Evento no encontrado'
      }
    }
    
    return {
      title: eventData.title.toUpperCase(),
    }
  } catch (error) {
    return {
      title: 'Evento no encontrado'
    }
  }
}

// Usar renderizado dinámico para eventos desde Firestore
export const dynamic = 'force-dynamic'

// Función auxiliar para parsear fechas de manera segura
function parseEventDate(dateString: string): Date {
  if (!dateString) {
    return new Date()
  }

  // Intentar diferentes formatos de fecha
  const date = new Date(dateString)
  if (!isNaN(date.getTime())) {
    return date
  }

  // Si es formato YYYY-MM-DD, asegurar que se parsee correctamente
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day) // month es 0-indexed en JS
  }

  // Fallback a fecha actual si no se puede parsear
  console.warn(`No se pudo parsear la fecha: ${dateString}`)
  return new Date()
}

// -< Event >-
export default async function Event({ params }: Props) {
  let eventData: EventData
  
  try {
    eventData = await eventsService.getEventById(params.id)
    
    // Si el evento es borrador, no permitir acceso público
    if (eventData.draft) {
      notFound()
    }
  } catch (error) {
    console.error('Error fetching event:', error)
    notFound()
  }

  // Convertir description de markdown a HTML si es necesario
  const contentHtml = eventData.description || ''
  
  // Parsear fecha de manera segura
  const eventDate = parseEventDate(eventData.eventDate)

  return (
    <section className="container relative max-w-7xl py-5 md:py-10">
      <InteractiveSection>
        {/* Title */}
        <h1 data-main-title className="mb-8 font-heading text-3xl md:text-4xl lg:text-5xl">
          {capitalize(eventData.title.toUpperCase())}
        </h1>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Left Sidebar with Dynamic Title */}
          <div className="lg:col-span-1">
            <DynamicEventCard eventData={eventData} eventDate={eventDate} />
          </div>

          {/* Main Content - Right Column */}
          <div className="lg:col-span-3">
            {/* Category Badge */}
            <Badge className="mb-6 rounded-md capitalize">
              {eventData.category}
            </Badge>
            
            {/* Event Image */}
            <SmartImage
              src={eventData.cover || undefined}
              alt={eventData.title}
              width={1200}
              height={400}
              className="mb-6 h-[400px] w-full overflow-hidden rounded-xl object-cover"
              eventId={eventData.id}
              fallbackType={eventData.category?.includes('marathon') ? 'marathon' : 
                          eventData.category?.includes('trail') ? 'trail' : 'running'}
              priority
            />

            {/* Event Description */}
            <div className="mb-8 space-y-4">
              <h2 className="text-2xl font-bold">
                Información del Evento
              </h2>
              
              <div className="prose prose-base max-w-none dark:prose-invert">
                {contentHtml ? (
                  contentHtml.split('\n').map((paragraph, index) => (
                    paragraph.trim() && <p key={index} className="mb-4 leading-relaxed text-foreground">{paragraph}</p>
                  ))
                ) : (
                  <p className="leading-relaxed text-foreground">
                    {eventData.snippet || 'Información no disponible.'}
                  </p>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <EventComments eventId={params.id} />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12">
          <SeeAllEventsCta />
        </div>
      </InteractiveSection>
    </section>
  )
}

/* TIP: dangerouslySetInnerHTML is a React feature that allows you to render HTML that comes from an external source as if it were regular JSX. It replaces innerHTML used by Javascript.
Here we are rendering the HTML that comes from the markdown file thanks to remark (remark converted the markdown into HTML)
*/
