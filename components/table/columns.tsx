"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { EventData } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<EventData>[] = [
  {
    accessorKey: "eventDate",
    header: "Fecha",
    //format date to "DD MMM YYYY"
    cell: ({ row }) => {
      const date = new Date(row.getValue("eventDate"))
      const formattedDate = format(date, "dd MMM yyyy", { locale: es })
      const dateParts = formattedDate.split(" ")
      dateParts[1] = dateParts[1].toUpperCase()
      return dateParts.join(" ")
    },
  },
  {
    accessorKey: "title",
    header: "Nombre",
    cell: ({ row }) => {
      const title = String(row.getValue("title")).toUpperCase()
      return (
        <Button className="px-0" variant="link" asChild>
          <Link
            className="px-0 font-semibold"
            href={`/events/${row.getValue("id")}`}
          >
            {title}
          </Link>
        </Button>
      )
    },
  },
  {
    accessorKey: "municipality",
    header: "Lugar",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    cell: ({ row }) => {
      const municipality = String(row.getValue("municipality"))
      const department = String(row.getValue("department"))
      return (
        <div>
          <div className="font-medium">{municipality}</div>
          <div>{department}</div>
        </div>
      )
    },
  },

  {
    accessorKey: "distances",
    header: "Distancias",
    filterFn: (row, id, value) => {
      const rowDistances = row.getValue(id) as string[]
      return value.some((selectedDistance: string) =>
        rowDistances.includes(selectedDistance)
      )
    },
    cell: ({ row }) => {
      const distances = row.getValue("distances") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {distances
            .sort((a: any, b: any) => parseFloat(a.value) - parseFloat(b.value))
            .map((distance) => (
              <Badge
                variant="small"
                className="rounded-md font-bold"
                key={distance}
              >
                {distance}
              </Badge>
            ))}
        </div>
      )
    },
    getUniqueValues: ({ distances }) => {
      if (!distances) return []
      const allDistances = distances
        .flat()
        .map((distance) => {
          if (typeof distance === 'string') return distance.toLowerCase()
          if (typeof distance === 'object' && distance.value) return distance.value.toLowerCase()
          return String(distance).toLowerCase()
        })
      const uniqueDistancesSet = new Set(allDistances)
      return Array.from(uniqueDistancesSet)
    },

    enableGlobalFilter: false,
  },
  {
    accessorKey: "department",
    header: "Departamento",
    //hidden
    enableHiding: true,
  },
  {
    accessorKey: "id",
    header: "ID",
    enableGlobalFilter: false,
    enableHiding: true,
  },
]
