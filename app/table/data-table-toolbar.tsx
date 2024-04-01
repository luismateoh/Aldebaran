"use client"

import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"

/*import { priorities, statuses } from "../data/data"*/
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  let locations = table.getColumn("municipality")?.getFacetedUniqueValues()

  let formattedLocations: { value: string }[] = []

  if (locations instanceof Map) {
    formattedLocations = Array.from(locations.keys()).map((municipality) => ({
      value: municipality,
    }))
  }

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
          <DataTableFacetedFilter
            column={table.getColumn("municipality")}
            title="Lugar"
            options={formattedLocations}
          />
        )}
        {table.getColumn("distances") && (
          <DataTableFacetedFilter
            column={table.getColumn("distances")}
            title="Distancias"
            options={[
              { value: "5k" },
              { value: "10k" },
              { value: "21k" },
              { value: "42k" },
            ]}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Icons.cross className="ml-2 size-4" />
          </Button>
        )}
      </div>
      {/* TODO <DataTableViewOptions table={table} />*/}
    </div>
  )
}
