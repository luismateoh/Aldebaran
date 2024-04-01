//https://github.com/shadcn-ui/ui/tree/f47bb973bebaa38cb1bda8c56076ec962516a9bb/apps/www/app/(app)/examples/tasks/components

import { getSortedEventsData } from "@/lib/events"

import { columns } from "./columns"
import { DataTable } from "./data-table"

export default async function DemoPage() {
  const eventsData = getSortedEventsData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={eventsData} />
    </div>
  )
}
