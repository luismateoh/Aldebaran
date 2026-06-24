import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { Hero } from "@/components/home/hero"
import { StatsBar } from "@/components/home/stats-bar"
import { DistanceLevels } from "@/components/home/distance-levels"
import { MotivationalBanner } from "@/components/home/motivational-banner"
import { HowItWorks } from "@/components/home/how-it-works"
import { UpcomingEventsCarousel } from "@/components/home/upcoming-events-carousel"
import { EventsMapWrapper } from "@/components/home/events-map-wrapper"
import { Calendar, MapPin, Users, ArrowRight, Plus, Zap, Trophy, Heart, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { eventsServiceServer } from "@/lib/events-firebase-server"
import type { EventData } from "@/types"

export const metadata = {
  title: siteConfig.title,
  keywords: siteConfig.keywords,
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
          draft: false
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
          draft: false
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
          draft: false
        }
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
        .filter(event => {
          try {
            if (!event.eventDate) return false
            const eventDate = parseEventDateLocal(event.eventDate)
            return !!eventDate && eventDate >= today && eventDate <= threeMonthsFromToday
          } catch {
            return false
          }
        })
        .slice(0, 12)

      departmentsCount = new Set(allEvents.map(e => e.department).filter(Boolean)).size
    }
  } catch (error) {
    console.error('Error loading events for homepage:', error)
    upcomingEvents = []
  }

  const features = [
    {
      icon: Search,
      title: "Descubre Eventos",
      description: "Explora carreras y competencias en todo el país con información detallada y actualizada.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: MapPin,
      title: "Mapa Interactivo",
      description: "Visualiza eventos geográficamente y encuentra carreras cerca de tu ubicación.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Heart,
      title: "Comunidad Activa",
      description: "Conecta con otros corredores, comenta eventos y comparte tus experiencias.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Trophy,
      title: "Todo Tipo de Carreras",
      description: "Desde 5K recreativos hasta maratones competitivos y trail running extremo.",
      color: "from-amber-500 to-orange-500",
    },
  ]

  return (
    <>
      {/* Hero */}
      <Hero eventsCount={totalEventsCount} />

      {/* Stats Bar */}
      <StatsBar eventsCount={totalEventsCount} departmentsCount={departmentsCount} />

      {/* Distance Levels - Elije tu desafío */}
      <DistanceLevels events={upcomingEvents} />

      {/* Features Section */}
      <section className="container py-20 md:py-28">
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Por qué Aldebaran
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Todo lo que necesitas para
            <br />
            <span className="text-gradient">tu próxima carrera</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            La plataforma más completa para descubrir y participar en eventos de atletismo en Colombia.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                style={{
                  animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className={`mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg transition-transform group-hover:scale-110`}>
                  <Icon className="size-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <div className={`absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${feature.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10`} />
              </div>
            )
          })}
        </div>
      </section>

      {/* Motivational Banner */}
      <MotivationalBanner />

      {/* How It Works */}
      <HowItWorks />

      {/* Upcoming Events Carousel */}
      <section className="container py-20 md:py-28">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              No te lo pierdas
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Próximos Eventos
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Las carreras más emocionantes que se acercan en Colombia
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="group rounded-full">
            <Link href="/events">
              Ver todos
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <UpcomingEventsCarousel events={upcomingEvents} />
      </section>

      {/* Events Map */}
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
            <EventsMapWrapper events={upcomingEvents} />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container py-20 md:py-28">
        <div className="relative overflow-hidden rounded-3xl p-12 text-center md:p-20">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero/cta-bg.jpg"
              alt="Corredores celebrando"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/95 to-red-600/90 mix-blend-multiply" />
          </div>

          {/* Decorative elements */}
          <div className="pointer-events-none absolute -left-20 -top-20 z-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 z-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-20 mx-auto max-w-2xl">
            <div className="mb-6 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Zap className="size-8 text-white" />
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-extrabold text-white md:text-5xl">
              ¿Organizas un evento?
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Comparte tu evento con miles de corredores en toda Colombia.
              Es gratis y fácil de usar.
            </p>
            <Button
              asChild
              size="lg"
              className="h-14 rounded-full bg-white px-10 text-base font-bold text-primary hover:bg-white/90"
            >
              <Link href="/propose-event">
                <Plus className="mr-2 size-5" />
                Proponer tu Evento
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
