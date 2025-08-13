import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UpcomingEventsCarousel } from "@/components/home/upcoming-events-carousel"
import { EventsMapWrapper } from "@/components/home/events-map-wrapper"
import { Calendar, MapPin, Users, Zap, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { eventsServiceServer } from "@/lib/events-firebase-server"
import type { EventData } from "@/types"

export const metadata = {
  title: siteConfig.title,
  keywords: siteConfig.keywords,
}

export default async function IndexPage() {
  // Obtener eventos para el carrusel y mapa
  let upcomingEvents: EventData[] = []
  
  try {
    console.log('🏠 Loading events for homepage...')
    
    // Verificar si Firebase está configurado
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.warn('⚠️ Firebase Admin not configured, using sample events for development')
      // Eventos de ejemplo para desarrollo
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
    } else {
      const allEvents = await eventsServiceServer.getAllEvents()
      console.log(`📊 Loaded ${allEvents.length} events from server`)
      
      // Filtrar próximos eventos (próximos 3 meses)
      const now = new Date()
      const threeMonthsFromNow = new Date()
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
      
      upcomingEvents = allEvents
        .filter(event => {
          try {
            if (!event.eventDate) return false
            const eventDate = new Date(event.eventDate)
            return eventDate >= now && eventDate <= threeMonthsFromNow
          } catch (error) {
            console.warn('Invalid event date:', event.eventDate, error)
            return false
          }
        })
        .slice(0, 12) // Máximo 12 eventos en el carrusel
      
      console.log(`✅ Filtered to ${upcomingEvents.length} upcoming events`)
    }
  } catch (error) {
    console.error('❌ Error loading events for homepage:', error)
    // Continuar con array vacío si hay error
    upcomingEvents = []
  }

  return (
    <>
      {/* Disclaimer de construcción - solo en producción */}
      {process.env.NODE_ENV === 'production' && (
        <div className="border-b bg-yellow-50 dark:bg-yellow-950/20">
          <div className="container flex h-14 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">🚧 Sitio en construcción temporal</span>
              <span className="hidden sm:inline">- Algunos datos pueden estar desactualizados</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container grid items-center gap-6 pb-8 pt-12 md:py-20">
        <div className="flex max-w-[980px] flex-col items-start gap-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl lg:text-5xl">
            ¡Bienvenido a Aldebaran! <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Tu Guía de Atletismo en Colombia
            </span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Descubre las mejores carreras de atletismo en todo Colombia. 
            Desde emocionantes maratones hasta divertidas carreras familiares, 
            encuentra tu próximo desafío y vive experiencias inolvidables.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/events">
                <Calendar className="mr-2 size-5" />
                Ver Todos los Eventos
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/propose-event">
                <Plus className="mr-2 size-5" />
                Proponer Evento
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Eventos Actualizados</h3>
              <p className="text-sm text-muted-foreground">
                Información siempre actualizada de carreras en todo Colombia
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Ubicaciones Detalladas</h3>
              <p className="text-sm text-muted-foreground">
                Encuentra eventos cerca de ti con mapas interactivos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Comunidad</h3>
              <p className="text-sm text-muted-foreground">
                Conecta con otros corredores y comparte experiencias
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Events Carousel */}
      <section className="container py-12 md:py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Próximos Eventos
            </h2>
            <p className="mt-2 text-muted-foreground">
              Descubre las carreras que se acercan
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/events">
              Ver todos
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
        
        <UpcomingEventsCarousel events={upcomingEvents} />
      </section>

      {/* Events Map */}
      <section className="container py-12 md:py-16">
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
            Mapa de Eventos
          </h2>
          <p className="text-muted-foreground">
            Explora las ubicaciones de los eventos de atletismo en Colombia
          </p>
        </div>
        
        <EventsMapWrapper events={upcomingEvents} />
      </section>

      {/* Call to Action */}
      <section className="container py-12 md:py-16">
        <div className="rounded-2xl bg-primary/5 p-8 text-center md:p-12">
          <div className="mx-auto max-w-2xl">
            <Zap className="mx-auto mb-4 size-12 text-primary" />
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              ¿Organizas un evento?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Comparte tu evento con miles de corredores en Colombia. 
              Es grátis y fácil de usar.
            </p>
            <Button asChild size="lg">
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
