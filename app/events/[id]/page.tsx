import Link from "next/link"
import { formatDate } from "date-fns"
import { es } from "date-fns/locale"
import { notFound } from "next/navigation"

import { eventsService } from "@/lib/events-firebase"
import { EventData } from "@/lib/types"
import { capitalize } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import AddToCalendar from "@/components/add-to-calendar"
import { BackButton } from "@/components/back-button"
import CountDownTimer from "@/components/count-down-timer"
import EventComments from "@/components/event-comments"
import InteractiveSection from "@/components/interactive-section"
import SeeAllEventsCta from "@/components/see-all-events-cta"
import SmartImage from "@/components/smart-image"

type Params = {
  id: string
}

type Props = {
  params: Params
}

export async function generateMetadata({ params }: Props) {
  try {
    const eventData: EventData = await eventsService.getEventById(params.id)
    return {
      title: eventData.title.toUpperCase(),
    }
  } catch (error) {
    return {
      title: 'Evento no encontrado'
    }
  }
}

// Generar páginas estáticas para todos los eventos
export async function generateStaticParams() {
  try {
    const events = await eventsService.getAllEvents()
    return events.map((event) => ({
      id: event.id,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

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
  } catch (error) {
    console.error('Error fetching event:', error)
    notFound()
  }

  // Convertir description de markdown a HTML si es necesario
  const contentHtml = eventData.description || ''
  
  // Parsear fecha de manera segura
  const eventDate = parseEventDate(eventData.eventDate)

  return (
    <section className="container relative max-w-screen-md py-5 md:py-10">
      <InteractiveSection>
        <div>
          <BackButton />
          <article className="prose max-w-none dark:prose-invert">
            <Badge className="rounded-md capitalize">
              {eventData.category}
            </Badge>
            <SmartImage
              src={eventData.cover || undefined}
              alt={eventData.title}
              width={800}
              height={360}
              className="my-6 w-full overflow-hidden rounded-xl"
              eventId={eventData.id}
              fallbackType={eventData.category?.includes('marathon') ? 'marathon' : 
                          eventData.category?.includes('trail') ? 'trail' : 'running'}
              priority
            />
            {/* Event Title */}
            <h1 className="my-4 font-heading text-3xl md:text-4xl">
              {capitalize(eventData.title.toUpperCase())}
            </h1>

            {/* Event Meta */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:grid-rows-8 sm:gap-4">
              {/* Event Distances */}
              <div className="col-span-2 row-span-1 flex flex-wrap items-center justify-between gap-2 overflow-hidden rounded-lg border bg-card p-3 align-middle text-card-foreground shadow-sm sm:col-span-2 sm:row-span-2 sm:p-4">
                <h2 className="m-0 pr-2 font-light">Distancias</h2>

                <div className="flex flex-wrap gap-2">
                  {/* Manejar distances como array */}
                  {eventData.distances && Array.isArray(eventData.distances) ? (
                    eventData.distances
                      .sort((a: any, b: any) => {
                        const aValue = typeof a === 'string' ? parseFloat(a) : parseFloat(a.value || '0')
                        const bValue = typeof b === 'string' ? parseFloat(b) : parseFloat(b.value || '0')
                        return aValue - bValue
                      })
                      .map((distance: any, index: number) => (
                        <Badge
                          className="rounded-md text-xl sm:text-2xl"
                          key={`distance-${index}`}
                        >
                          {typeof distance === 'string' ? distance : distance.value || distance}
                        </Badge>
                      ))
                  ) : eventData.distance ? (
                    <Badge className="rounded-md text-xl sm:text-2xl">
                      {eventData.distance}
                    </Badge>
                  ) : (
                    <Badge className="rounded-md text-xl sm:text-2xl">
                      10k
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Event Date */}
              <div className="col-span-2 row-span-1 overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:col-start-3 sm:row-span-4 sm:flex-row sm:items-center sm:p-4">
                <div className="flex flex-row flex-wrap items-center justify-between gap-2 sm:h-full sm:flex-col sm:items-start">
                  <span className="text-2xl font-medium text-accent-foreground sm:flex sm:flex-col md:text-3xl">
                    {formatDate(eventDate, "dd MMMM yyyy", {
                      locale: es,
                    })
                      .split(" ")
                      .map((word, index) => (
                        <span key={index} className="capitalize sm:text-4xl">
                          {capitalize(word)}{" "}
                        </span>
                      ))}
                  </span>
                  <AddToCalendar
                    title={eventData.title.toUpperCase()}
                    description={
                      eventData.registrationUrl
                        ? `Más información en <a href="${eventData.registrationUrl}">${eventData.registrationUrl}</a>`
                        : ""
                    }
                    location={`${eventData.municipality}, ${eventData.department}`}
                    evenDate={eventData.eventDate}
                    organizer={eventData.organizer}
                    website={eventData.registrationUrl}
                  />
                </div>
              </div>
              
              {/* Event Location */}
              <div className="row-span-1 flex flex-col flex-wrap justify-center overflow-hidden text-ellipsis rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:row-span-2 sm:p-4">
                <h2 className="m-0 font-light">Ubicación</h2>
                <div className="flex flex-wrap items-baseline align-middle">
                  <span className="truncate pr-2 text-2xl font-medium capitalize sm:text-3xl">
                    {eventData.municipality}
                  </span>
                  <span className="capitalisze text-xl font-medium">
                    {eventData.department}
                  </span>
                </div>
              </div>
              
              {/* Event Altitude */}
              {eventData.altitude && (
                <div className="row-span-1 flex flex-col flex-wrap justify-center overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:row-span-2 sm:p-4">
                  <h2 className="m-0 font-light">Altura</h2>
                  <span className="text-3xl font-medium">
                    {eventData.altitude}
                  </span>
                </div>
              )}
              
              {/* Event Organizer */}
              {eventData.organizer && (
                <div className="col-span-2 flex flex-col flex-wrap justify-center overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:row-span-2 sm:p-4">
                  <h2 className="m-0 font-light">Organiza</h2>
                  <span className="text-2xl font-medium">
                    {eventData.organizer}
                  </span>
                </div>
              )}
              
              {/* Event Registration */}
              {eventData.price && (
                <div className="col-span-1 flex flex-col flex-wrap justify-center overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:col-span-2 sm:row-span-2 sm:p-4">
                  <h2 className="m-0 font-light">Costo</h2>
                  <span className="text-2xl font-medium">
                    Desde {eventData.price}
                  </span>
                </div>
              )}
              
              {/* Event Website */}
              {eventData.registrationUrl && (
                <div className="flex flex-col flex-wrap justify-center overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:col-span-1 sm:row-span-2 sm:p-4">
                  <h2 className="m-0 font-light">Sitio</h2>
                  <Link
                    className="text-2xl font-medium"
                    href={eventData.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Web
                  </Link>
                </div>
              )}
              
              {/* Event Temporizer */}
              <div className="col-span-2 flex flex-col justify-center gap-1 overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:col-span-3 sm:row-span-2 sm:p-4">
                <h2 className="m-0 font-light">Faltan</h2>
                <CountDownTimer
                  targetDate={eventDate.getTime()}
                />
              </div>
            </div>

            <hr className="my-6" />
            
            {/* Event Content */}
            <div className="break-words prose prose-lg max-w-none dark:prose-invert">
              {contentHtml.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
          <SeeAllEventsCta />
        </div>
        
        {/* Comentarios de la comunidad */}
        <EventComments eventId={params.id} />
      </InteractiveSection>
    </section>
  )
}

/* TIP: dangerouslySetInnerHTML is a React feature that allows you to render HTML that comes from an external source as if it were regular JSX. It replaces innerHTML used by Javascript.
Here we are rendering the HTML that comes from the markdown file thanks to remark (remark converted the markdown into HTML)
*/
