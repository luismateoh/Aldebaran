"use client"

import { ColumnDef } from "@tanstack/react-table"

import { EventData } from "@/lib/types"

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
      return <>{title}</>
    },
  },
  {
    accessorKey: "municipality",
    header: "Lugar",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    /* cell: ({row}) => {
       const municipality = String(row.getValue("municipality"))
       const department = String(row.getValue("department"))
       return <>{municipality}, {department}</>
     }*/
  },

  {
    accessorKey: "distances",
    header: "Distancias",
    //distances are an array of strings
    enableGlobalFilter: false,
  },
  {
    accessorKey: "department",
    header: "Departamento",
    //hidden
    enableHiding: true,
  },
]
