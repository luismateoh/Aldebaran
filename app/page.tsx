import { siteConfig } from "@/config/site"
import { getSortedEventsData } from "@/lib/events"
import EventsListCards from "@/components/events/events-list-cards"

export const metadata = {
  title: siteConfig.title,
}

export default function IndexPage() {
  const eventsData = getSortedEventsData()
  return (
    <>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-5">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            ¡Bienvenido a Aldebaran: <br className="hidden sm:inline" />
            Tu Guía de Carreras de Atletismo en Colombia!
          </h1>
          <p className="max-w-[700px] text-lg text-accent-foreground">
            Descubre las mejores carreras de atletismo en todo Colombia con
            Aldebaran. Desde emocionantes maratones en las montañas hasta
            rápidas carreras urbanas, te ofrecemos toda la información que
            necesitas para participar y disfrutar del emocionante mundo del
            atletismo. ¡Prepárate para correr, superarte y vivir experiencias
            inolvidables con Aldebaran!
          </p>
        </div>
      </section>
      <section className="container py-5">
        <EventsListCards eventsData={eventsData} />
      </section>
    </>
  )
}
