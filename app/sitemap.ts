import { MetadataRoute } from "next"
import { eventsService } from "@/lib/events-firebase"

const SITE_URL = "https://aldebaran.run"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Get all events from Firebase
    const events = await eventsService.getAllEvents()
    
    // Main site URL
    const mainUrl = {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    }

    // Event URLs
    const eventUrls = events.map((event) => ({
      url: `${SITE_URL}/events/${event.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Static pages
    const staticUrls = [
      {
        url: `${SITE_URL}/proponer`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }
    ]

    return [mainUrl, ...staticUrls, ...eventUrls]
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return basic sitemap on error
    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      }
    ]
  }
}
