"use client"

import React, { useState } from "react"

import type { AllEvents, EventData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import EventCard from "@/components/cards/event-card"

export default function EventsListCards({ eventsData }: AllEvents) {
  const [limit, setLimit] = useState(6)

  const onLoadMore = () => {
    setLimit(limit + 6)
  }

  const renderEvents = () => {
    return eventsData
      .slice(0, limit)
      .map((event: EventData) => <EventCard event={event} key={event.id} />)
  }

  return (
    <section>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-y-8 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
        {renderEvents()}
      </div>
      {limit < eventsData.length && (
        <div className="mt-8 flex justify-center">
          <Button
            className="shadow"
            variant="secondary"
            size="sm"
            onClick={onLoadMore}
          >
            Mostrar más
          </Button>
        </div>
      )}
    </section>
  )
}
