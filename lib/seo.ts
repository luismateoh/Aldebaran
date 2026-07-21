/**
 * SEO utilities for Aldebaran
 * Helpers for JSON-LD structured data generation
 */

import type { EventData } from "@/types"

/**
 * Generate JSON-LD Event schema for an athletics event
 * https://developers.google.com/search/docs/appearance/structured-data/event
 */
export function eventJsonLd(event: EventData): Record<string, unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aldebaran.colombia"

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.eventDate,
    description: event.snippet || event.description?.substring(0, 200) || "",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: {
      "@type": "Organization",
      name: event.organizer || "Aldebaran",
    },
  }

  // Location
  if (event.municipality || event.department) {
    const locationParts = [event.municipality, event.department].filter(Boolean)
    schema.location = {
      "@type": "Place",
      name: locationParts.join(", "),
      address: {
        "@type": "PostalAddress",
        addressLocality: event.municipality || "",
        addressRegion: event.department || "",
        addressCountry: "CO",
      },
    }
  }

  // Image
  if (event.cover) {
    schema.image = event.cover.startsWith("http")
      ? event.cover
      : `${baseUrl}${event.cover}`
  }

  // Offer / Price
  if (event.registrationFee || event.price) {
    schema.offers = {
      "@type": "Offer",
      url: event.registrationUrl || event.website || baseUrl,
      price: (event.registrationFee || event.price || "").replace(/[^0-9.,]/g, ""),
      priceCurrency: "COP",
      availability: "https://schema.org/InStock",
      validFrom: event.registrationDeadline
        ? new Date(event.registrationDeadline).toISOString()
        : new Date().toISOString(),
    }
  }

  // Performer
  schema.performer = {
    "@type": "Organization",
    name: event.organizer || "Aldebaran",
  }

  return schema
}

/**
 * Generate JSON-LD BreadcrumbList schema
 */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aldebaran.colombia"

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  }
}

/**
 * Generate JSON-LD WebSite schema
 */
export function websiteJsonLd(): Record<string, unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aldebaran.colombia"

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Aldebaran",
    url: baseUrl,
    description:
      "Tu guía de carreras de atletismo, trail running y ultra en Colombia.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/events?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

/**
 * Render a JSON-LD script tag as a string (to use with dangerouslySetInnerHTML)
 */
export function renderJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data, null, 2)
}
