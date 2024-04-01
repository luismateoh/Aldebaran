import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { DataTableFacetedFilterLocations } from "@/app/table/data-table-faceted-filter-locations"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const locations = reduceMunicipalitiesByDepartment(table.options.data)
  const distances = uniqueDistances(table.options.data)

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Filtrar eventos..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event: { target: { value: any } }) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("municipality") && (
          <DataTableFacetedFilterLocations
            column={table.getColumn("municipality")}
            title="Lugar"
            options={locations}
          />
        )}
        {table.getColumn("distances") && (
          <DataTableFacetedFilter
            column={table.getColumn("distances")}
            title="Distancias"
            options={distances}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Restablecer
            <Icons.cross className="ml-2 size-4" />
          </Button>
        )}
      </div>
      {/* TODO <DataTableViewOptions table={table} />*/}
    </div>
  )
}

// Helper function to reduce municipalities by department
function reduceMunicipalitiesByDepartment(
  eventsData: any
): { department: string; municipalities: string[] }[] {
  // Group by department and municipality
  const grouped = eventsData.reduce(
    (
      acc: {
        [key: string]: { department: string; municipalities: Set<string> }
      },
      event: { department: string; municipality: string }
    ) => {
      const department = event.department
      const municipality = event.municipality

      // Initialize department if it doesn't exist
      if (!acc[department]) {
        acc[department] = { department, municipalities: new Set() }
      }

      // Add municipality to department
      acc[department].municipalities.add(municipality)

      return acc
    },
    {}
  )

  // Convert municipalities in each department to array and sort
  for (const department in grouped) {
    grouped[department].municipalities = Array.from(
      grouped[department].municipalities
    ).sort()
  }

  // Sort departments and return as array
  const groupedArray: { department: string; municipalities: string[] }[] =
    Object.values(grouped)
  groupedArray.sort((a: { department: string }, b: { department: string }) =>
    a.department.localeCompare(b.department)
  )

  return groupedArray
}

// ------------------------------------------------
// Helper function to get unique distances
// Returns an array of unique distances like this
// [
//   { value: "5k" },
//   { value: "10k" },
//   { value: "21k" },
//   { value: "42k" },
// ]
function uniqueDistances(eventsData: any): { value: string }[] {
  // Get all distances
  const distances = eventsData
    .map((event: { distances: string[] }) => event.distances)
    .flat()

  // Get unique distances
  const uniqueDistancesSet: Set<string> = new Set(
    distances.map((distance: string) => distance.toLowerCase())
  )

  // Convert the Set back to an array and map to an array of objects
  const uniqueDistancesArray: { value: string }[] = Array.from(
    uniqueDistancesSet
  ).map((distance) => ({ value: distance }))

  // Sort distances numerically and case-insensitively
  uniqueDistancesArray.sort(
    (a: any, b: any) => parseFloat(a.value) - parseFloat(b.value)
  )

  return uniqueDistancesArray
}
