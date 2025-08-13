'use client'

import { useEventsRealtime } from "@/hooks/use-events-realtime"
import { columns } from "./columns"
import { DataTable } from "./data-table"

export default function TableView() {
  const { events, loading, error } = useEventsRealtime()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="size-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <span className="ml-2">Cargando eventos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error cargando eventos: {error}</p>
      </div>
    )
  }

  return (
    <div>
      <DataTable columns={columns} data={events} />
    </div>
  )
}
