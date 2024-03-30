import type { AllEvents, EventData } from "@/lib/types"
import EventCard from "@/components/events/event-card"

export default function EventsListCards({ eventsData }: AllEvents) {
  return (
    <section>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-y-8 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
        {eventsData.map((event: EventData) => (
          <EventCard event={event} key={event.title} />
        ))}
      </div>
    </section>
  )
}
