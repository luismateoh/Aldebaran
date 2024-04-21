import {
  getAllEventsByMonth,
  getAllEventsIds,
  getSortedEventsData,
} from "@/lib/events"
import EventsListCards from "@/components/cards/events-list-cards"

export default async function CardsView() {
  const eventsData = getSortedEventsData()
  const eventsIds = getAllEventsIds()
  const eventsByMonth = getAllEventsByMonth()
  console.log(eventsByMonth)

  return (
    <div>
      <EventsListCards eventsData={eventsData} />
    </div>
  )
}
