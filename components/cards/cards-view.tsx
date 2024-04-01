import { getSortedEventsData } from "@/lib/events"
import EventsListCards from "@/components/cards/events-list-cards"

export default async function CardsView() {
  const eventsData = getSortedEventsData()

  return (
    <div>
      <EventsListCards eventsData={eventsData} />
    </div>
  )
}
