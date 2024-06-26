import Image from "next/image"
import Link from "next/link"
import { formatDate } from "date-fns"
import { es } from "date-fns/locale"

import { getEventData } from "@/lib/events"
import { EventData } from "@/lib/types"
import { capitalize } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import AddToCalendar from "@/components/add-to-calendar"
import { BackButton } from "@/components/back-button"
import CountDownTimer from "@/components/count-down-timer"
import InteractiveSection from "@/components/interactive-section"
import SeeAllEventsCta from "@/components/see-all-events-cta"

type Params = {
  id: string
}

type Props = {
  params: Params
}

export async function generateMetadata({ params }: Props) {
  const eventData: EventData = await getEventData(params.id)

  return {
    title: eventData.title.toUpperCase(),
  }
}

// -< Event >-
export default async function Event({ params }: Props) {
  const eventData: EventData = await getEventData(params.id)
  return (
    <section className="container relative max-w-screen-md py-5 md:py-10">
      <InteractiveSection>
        <div>
          <BackButton />
          <article className="prose max-w-none dark:prose-invert">
            <Badge className="rounded-md capitalize">
              {eventData.category}
            </Badge>
            <Image
              className="my-6 w-full overflow-hidden rounded-xl"
              width={800}
              height={360}
              src={eventData.cover}
              alt={eventData.title}
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
                  {eventData.distances
                    .sort(
                      (a: any, b: any) =>
                        parseFloat(a.value) - parseFloat(b.value)
                    )
                    .map((distance) => (
                      <Badge
                        className="rounded-md text-xl sm:text-2xl"
                        key={distance}
                      >
                        {distance}
                      </Badge>
                    ))}
                </div>
              </div>
              {/* Event Date */}
              <div className="col-span-2 row-span-1 overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:col-start-3 sm:row-span-4 sm:flex-row sm:items-center sm:p-4">
                <div className="flex flex-row flex-wrap items-center justify-between gap-2 sm:h-full sm:flex-col sm:items-start">
                  <span className="text-2xl font-medium text-accent-foreground sm:flex sm:flex-col md:text-3xl">
                    {formatDate(new Date(eventData.eventDate), "dd MMMM yyyy", {
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
                      eventData.website
                        ? `Más información en <a href="${eventData.website}">${eventData.website}</a>`
                        : ""
                    }
                    location={`${eventData.municipality}, ${eventData.department}`}
                    evenDate={eventData.eventDate}
                    organizer={eventData.organizer}
                    website={eventData.website}
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
              <div className="row-span-1 flex flex-col flex-wrap justify-center overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:row-span-2 sm:p-4">
                <h2 className="m-0 font-light">Altura</h2>
                <span className="text-3xl font-medium">
                  {eventData.altitude}
                </span>
              </div>
              {/* Event Organizer */}
              <div className="col-span-2 flex flex-col flex-wrap justify-center overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:row-span-2 sm:p-4">
                <h2 className="m-0 font-light">Organiza</h2>
                <span className="text-2xl font-medium">
                  {eventData.organizer}
                </span>
              </div>
              {/* Event Registration */}
              <div className="col-span-1 flex flex-col flex-wrap justify-center overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:col-span-2 sm:row-span-2 sm:p-4">
                <h2 className="m-0 font-light">Costo</h2>
                <span className="text-2xl font-medium">
                  Desde {eventData.registrationFeed}
                </span>
              </div>
              {/* Event Website */}
              <div className="flex flex-col flex-wrap justify-center overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:col-span-1 sm:row-span-2 sm:p-4">
                <h2 className="m-0 font-light">Sitio</h2>
                <Link
                  className="text-2xl font-medium"
                  href={eventData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Web
                </Link>
              </div>
              {/* Event Temporizer */}
              <div className="col-span-2 flex flex-col justify-center gap-1 overflow-hidden rounded-lg border bg-card p-3 text-card-foreground shadow-sm sm:col-span-3 sm:row-span-2 sm:p-4">
                <h2 className="m-0 font-light">Faltan</h2>
                <CountDownTimer
                  targetDate={new Date(eventData.eventDate).getTime()}
                />
              </div>
            </div>

            <hr className="my-6" />
            {/* Event Content */}
            <div
              className="break-words"
              dangerouslySetInnerHTML={{ __html: eventData.contentHtml }}
            />
          </article>
          <SeeAllEventsCta />
        </div>
      </InteractiveSection>
    </section>
  )
}

/* TIP: dangerouslySetInnerHTML is a React feature that allows you to render HTML that comes from an external source as if it were regular JSX. It replaces innerHTML used by Javascript.
Here we are rendering the HTML that comes from the markdown file thanks to remark (remark converted the markdown into HTML)
*/
