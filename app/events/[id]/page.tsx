import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { eventsService, getAllEvents } from "@/lib/events-firebase"
import type { EventData } from "@/lib/types"
import { siteConfig } from "@/config/site"
import { capitalize, markdownToHtml } from "@/lib/utils"
import { eventJsonLd, renderJsonLd } from "@/lib/seo"
import { Button } from "@/components/ui/button"
import { ExternalLink, ChevronRight } from "lucide-react"
import InteractiveSection from "@/components/interactive-section"
import SeeAllEventsCta from "@/components/see-all-events-cta"

// ── Event detail components ─────────────────────────────────────────────────
import { EventDetailHero } from "@/components/events/event-detail-hero"
import { EventDetailInfo } from "@/components/events/event-detail-info"
import { EventMap } from "@/components/events/event-map"
import { ElevationProfile } from "@/components/events/elevation-profile"
import type { ElevationPoint } from "@/components/events/elevation-profile"
import { EventGallery } from "@/components/events/event-gallery"
import CommentsWrapper from "@/components/events/event-comments-wrapper"
import { EventFAQ } from "@/components/events/event-faq"
import { SimilarEvents } from "@/components/events/similar-events"
import { EventDetailSidebar } from "@/components/events/event-detail-sidebar"

// ── Types ───────────────────────────────────────────────────────────────────
type Params = { id: string }
type Props = { params: Promise<Params> }

// ── Helpers ─────────────────────────────────────────────────────────────────
function parseEventDate(dateString: string): Date {
  if (!dateString) return new Date()
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number)
    return new Date(year, month - 1, day)
  }
  const date = new Date(dateString)
  if (!isNaN(date.getTime())) return date
  console.warn(`No se pudo parsear la fecha: ${dateString}`)
  return new Date()
}

/** Generate synthetic elevation data from altitude value */
function generateElevationData(altitudeStr: string | undefined): ElevationPoint[] {
  const baseAlt = altitudeStr
    ? parseInt(altitudeStr.replace(/[^0-9]/g, ""), 10) || 200
    : 200

  const points: ElevationPoint[] = []
  const numPoints = 20
  const totalDistance = 10

  for (let i = 0; i < numPoints; i++) {
    const distance = (i / (numPoints - 1)) * totalDistance
    const variation = Math.sin((i / numPoints) * Math.PI * 3) * baseAlt * 0.05
    const trend = (i / (numPoints - 1)) * baseAlt * 0.08
    points.push({
      distance: Math.round(distance * 10) / 10,
      elevation: Math.round(baseAlt + variation + trend),
    })
  }
  return points
}

// ── Metadata (SEO) ──────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params
    const eventData: EventData = await eventsService.getEventById(id)

    if (eventData.draft) {
      return { title: "Evento no encontrado" }
    }

    const title = `${eventData.title} — Aldebaran`
    const description =
      eventData.snippet ||
      `Carrera de ${eventData.category || "atletismo"} en ${eventData.municipality}, ${eventData.department}.${eventData.eventDate ? ` Fecha: ${new Date(eventData.eventDate).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}` : ""}`

    return {
      title,
      description,
      openGraph: {
        title: eventData.title,
        description,
        type: "article",
        locale: "es_CO",
        siteName: "Aldebaran",
        url: `${siteConfig.url}/events/${id}`,
        images: eventData.cover
          ? [{ url: eventData.cover, width: 1200, height: 630, alt: eventData.title }]
          : [{ url: "/images/hero/hero-events.jpg", width: 1200, height: 630, alt: "Evento de atletismo" }],
      },
      twitter: {
        card: "summary_large_image",
        title: eventData.title,
        description,
        images: eventData.cover ? [eventData.cover] : ["/images/hero/hero-events.jpg"],
      },
    }
  } catch {
    return { title: "Evento no encontrado" }
  }
}

// ── Dynamic rendering ───────────────────────────────────────────────────────
export const dynamic = "force-dynamic"

// ── Page Component ──────────────────────────────────────────────────────────
export default async function Event({ params }: Props) {
  let eventData: EventData
  let allEvents: EventData[] = []
  const { id } = await params

  try {
    eventData = await eventsService.getEventById(id)

    if (eventData.draft) {
      notFound()
    }

    // Fetch all events for the Similar Events section
    try {
      allEvents = await getAllEvents()
    } catch (err) {
      console.error("Error fetching all events:", err)
    }
  } catch (error) {
    console.error("Error fetching event:", error)
    notFound()
  }

  // Convert markdown description to HTML
  const contentHtml = eventData.description
    ? await markdownToHtml(eventData.description)
    : ""

  // Parse event date
  const eventDate = parseEventDate(eventData.eventDate)

  // Generate elevation data
  const elevationData = generateElevationData(eventData.altitude)

  // Build gallery images array
  const galleryImages: string[] = []
  if (eventData.cover) {
    galleryImages.push(eventData.cover)
  }

  // Generate JSON-LD structured data
  const jsonLd = eventJsonLd(eventData)

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(jsonLd) }}
      />

      {/* ─── 1. Hero Section ─────────────────────────────────────── */}
      <EventDetailHero event={eventData} />

      {/* ─── 2. Quick Info + Countdown ───────────────────────────── */}
      <EventDetailInfo event={eventData} eventDate={eventDate} />

      {/* ─── 3. Main Content ─────────────────────────────────────── */}
      <section className="container relative max-w-7xl py-6 md:py-10">
        <InteractiveSection>
          <div className="grid gap-10 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
            {/* ── Content Column ──────────────────────────────────── */}
            <div className="min-w-0 space-y-12">
              {/* Title */}
              <h2
                data-main-title
                className="font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl"
              >
                {capitalize(eventData.title.toUpperCase())}
              </h2>

              {/* 3a. Description */}
              <section className="space-y-4">
                <h2 className="font-heading text-heading-3 font-semibold text-foreground">
                  Descripción del Evento
                </h2>
                <div className="prose prose-base max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground">
                  {contentHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                  ) : (
                    <p className="leading-relaxed text-foreground">
                      {eventData.snippet || "Información no disponible."}
                    </p>
                  )}
                </div>
              </section>

              {/* 3b. Map */}
              <EventMap event={eventData} />

              {/* 3c. Elevation Profile */}
              <section className="space-y-4">
                <h2 className="font-heading text-heading-3 font-semibold text-foreground">
                  Perfil de Elevación
                </h2>
                <ElevationProfile data={elevationData} />
              </section>

              {/* 3d. Gallery */}
              {galleryImages.length > 0 && (
                <EventGallery
                  images={galleryImages}
                  eventTitle={eventData.title}
                />
              )}

              {/* 3e. Comments */}
              <CommentsWrapper eventId={id} />

              {/* 3f. FAQ */}
              <EventFAQ event={eventData} />
            </div>

            {/* ── Sidebar Column (sticky on desktop) ─────────────── */}
            <EventDetailSidebar event={eventData} eventDate={eventDate} />
          </div>

          {/* ─── 4. Similar Events ─────────────────────────────────── */}
          {allEvents.length > 0 && (
            <SimilarEvents
              currentEvent={eventData}
              allEvents={allEvents}
              className="mt-12"
            />
          )}

          {/* ─── 5. Final CTA ───────────────────────────────────────── */}
          <div className="mt-12">
            <SeeAllEventsCta />
          </div>
        </InteractiveSection>
      </section>

      {/* ─── Mobile Floating Register Button ───────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur-lg lg:hidden">
        <Button
          size="lg"
          className="w-full gap-2 text-base font-semibold shadow-lg"
          asChild
        >
          <a
            href={eventData.registrationUrl || eventData.website || "#"}
            target={
              eventData.registrationUrl || eventData.website
                ? "_blank"
                : undefined
            }
            rel={
              eventData.registrationUrl || eventData.website
                ? "noopener noreferrer"
                : undefined
            }
          >
            <ExternalLink className="h-5 w-5" />
            Inscribirme ahora
            <ChevronRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </>
  )
}
