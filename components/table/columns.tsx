"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"

import { EventData } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<EventData>[] = [
  {
    accessorKey: "eventDate",
    header: "Fecha",
  },
  {
    accessorKey: "title",
    header: "Nombre",
    cell: ({ row }) => {
      const title = String(row.getValue("title")).toUpperCase()
      return (
        <Button variant="link" asChild>
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
          {distances.map((distance) => (
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
      const allDistances = distances
        .flat()
        .map((distance) => distance.toLowerCase())
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
