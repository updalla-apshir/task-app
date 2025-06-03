"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableDateFilter } from "./data-table-date-filter";
import { priorities, statuses } from "@/lib/data";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const handleReset = () => {
    // Reset all filters
    table.resetColumnFilters();
    table.resetGlobalFilter();
    table.resetSorting();
    
    // Reset to first page
    table.setPageIndex(0);
  };

  const statusColumn = table.getColumn("status");
  const priorityColumn = table.getColumn("priority");
  const endAtColumn = table.getColumn("endAt");

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {statusColumn && (
          <DataTableFacetedFilter
            column={statusColumn}
            title="Status"
            options={[...statuses]}
          />
        )}
        {priorityColumn && (
          <DataTableFacetedFilter
            column={priorityColumn}
            title="Priority"
            options={[...priorities]}
          />
        )}
        {endAtColumn && (
          <DataTableDateFilter
            column={endAtColumn}
            title="Due Date"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
