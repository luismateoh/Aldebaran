import type { Metadata } from "next"
import { siteConfig } from "@/config/site"
import { HeroSection } from "@/components/home/hero-section"
import { StatsSection } from "@/components/home/stats-section"
import { ExploreCategories } from "@/components/home/explore-categories"
import { MapSection } from "@/components/home/map-section"
import { ResourcesSection } from "@/components/home/resources-section"
import { FeaturedEventsSection } from "@/components/home/featured-events-section"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { OrganizerCTA } from "@/components/cta/organizer-cta"
import { NewsletterSection } from "@/components/home/newsletter-section"
import { eventsServiceServer } from "@/lib/events-firebase-server"
import type { EventData } from "@/types"

export const metadata: Metadata = {
  title: "Descubre carreras de atletismo y trail running en Colombia",
  description:
    "Encuentra tu próxima aventura. Explora cientos de carreras de running, trail y ultra en Colombia.",
  keywords: siteConfig.keywords,
  openGraph: {
    title: "Aldebaran — Descubre carreras de atletismo y trail running en Colombia",
    description:
      "Encuentra tu próxima aventura. Explora cientos de carreras de running, trail y ultra en Colombia.",
    url: siteConfig.url,
    images: [
      {
        url: "/images/hero/hero-home.jpg",
        width: 1200,
        height: 630,
        alt: "Aldebaran - Carreras de atletismo en Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aldebaran — Descubre carreras de atletismo y trail running en Colombia",
    description:
      "Encuentra tu próxima aventura. Explora cientos de carreras de running, trail y ultra en Colombia.",
    images: ["/images/hero/hero-home.jpg"],
  },
}

function parseEventDateLocal(dateString: string): Date | null {
  if (!dateString) return null

  const localDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
  if (localDateMatch) {
    const year = Number(localDateMatch[1])
    const month = Number(localDateMatch[2])
    const day = Number(localDateMatch[3])
    return new Date(year, month - 1, day)
  }

  const parsed = new Date(dateString)
  return isNaN(parsed.getTime()) ? null : parsed
}

export default async function IndexPage() {
  let upcomingEvents: EventData[] = []
  let totalEventsCount = 0
  let departmentsCount = 0

  try {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      upcomingEvents = [
        {
          id: "sample-1",
          title: "Maratón de Bogotá 2024",
          description: "La carrera más importante del año en la capital colombiana con múltiples distancias.",
          eventDate: "2024-12-15",
          municipality: "Bogotá",
          department: "Bogotá",
          category: "Maratón",
          distances: ["5k", "10k", "21k", "42k"],
          organizer: "Fundación Maratón de Bogotá",
          snippet: "La carrera más importante del año en la capital colombiana.",
          website: "https://maratonbogota.com",
          price: "$80.000",
          draft: false,
        },
        {
          id: "sample-2",
          title: "Carrera de la Antioqueñidad",
          description: "Celebración de la cultura antioqueña a través del running.",
          eventDate: "2024-12-22",
          municipality: "Medellín",
          department: "Antioquia",
          category: "Running",
          distances: ["5k", "10k"],
          organizer: "Alcaldía de Medellín",
          snippet: "Celebra la cultura antioqueña corriendo por las calles de la ciudad de la eterna primavera.",
          price: "$50.000",
          draft: false,
        },
        {
          id: "sample-3",
          title: "Trail Running Valle del Cauca",
          description: "Una experiencia única de trail running en los paisajes del Valle del Cauca.",
          eventDate: "2025-01-10",
          municipality: "Cali",
          department: "Valle del Cauca",
          category: "Trail",
          distances: ["10k", "15k", "25k"],
          organizer: "Club Trail Cali",
          snippet: "Disfruta de los paisajes naturales del Valle del Cauca en una experiencia única.",
          price: "$60.000",
          draft: false,
        },
      ] as EventData[]
      totalEventsCount = 3
      departmentsCount = 3
    } else {
      const allEvents = await eventsServiceServer.getAllEvents()
      totalEventsCount = allEvents.length

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const threeMonthsFromToday = new Date(today)
      threeMonthsFromToday.setMonth(threeMonthsFromToday.getMonth() + 3)

      upcomingEvents = allEvents
        .filter((event) => {
          try {
            if (!event.eventDate) return false
            const eventDate = parseEventDateLocal(event.eventDate)
            return !!eventDate && eventDate >= today && eventDate <= threeMonthsFromToday
          } catch {
            return false
          }
        })
        .slice(0, 12)

      departmentsCount = new Set(allEvents.map((e) => e.department).filter(Boolean)).size
    }
  } catch (error) {
    console.error("Error loading events for homepage:", error)
    upcomingEvents = []
  }

  return (
    <>
      {/* 1. Hero */}
      <HeroSection eventsCount={totalEventsCount} departmentsCount={departmentsCount} />

      {/* 2. Stats */}
      <StatsSection eventsCount={totalEventsCount} departmentsCount={departmentsCount} />

      {/* 3. Explore Categories */}
      <ExploreCategories />

      {/* 4. Interactive Map */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
        <div className="container relative">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Explora el mapa
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Eventos por toda
              <span className="text-gradient"> Colombia</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
              Visualiza las ubicaciones de todos los eventos de atletismo del país
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border shadow-2xl">
            <MapSection events={upcomingEvents} />
          </div>
        </div>
      </section>

      {/* 5. Resources */}
      <ResourcesSection />

      {/* 6. Featured Events */}
      <FeaturedEventsSection events={upcomingEvents} />

      {/* 7. How It Works */}
      <HowItWorksSection />

      {/* 8. Organizer CTA */}
      <OrganizerCTA />

      {/* 9. Newsletter */}
      <NewsletterSection />
    </>
  )
}
