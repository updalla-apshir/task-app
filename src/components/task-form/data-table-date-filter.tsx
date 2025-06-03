"use client";

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type DateFilterValue = {
  type: "relative";
  value: "today" | "this-week" | "this-month" | "overdue" | "all";
};

interface DataTableDateFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableDateFilter<TData, TValue>({
  column,
  title,
}: DataTableDateFilterProps<TData, TValue>) {
  const [filterValue, setFilterValue] = React.useState<DateFilterValue>({ type: "relative", value: "all" });

  // Update local state when column filter value changes (including resets)
  React.useEffect(() => {
    const value = column?.getFilterValue() as DateFilterValue | undefined;
    setFilterValue(value || { type: "relative", value: "all" });
  }, [column?.getFilterValue()]);

  const handleFilterChange = (newValue: DateFilterValue) => {
    setFilterValue(newValue);
    if (newValue.value === "all") {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue(newValue);
    }
  };

  const getButtonText = () => {
    switch (filterValue.value) {
      case "today":
        return "Due Today";
      case "this-week":
        return "Due This Week";
      case "this-month":
        return "Due This Month";
      case "overdue":
        return "Overdue";
      default:
        return title;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-dashed",
            filterValue.value !== "all" && "border-solid"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getButtonText()}
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuItem
          onClick={() => handleFilterChange({ type: "relative", value: "all" })}
        >
          All Dates
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleFilterChange({ type: "relative", value: "today" })}
        >
          Due Today
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterChange({ type: "relative", value: "this-week" })}
        >
          Due This Week
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterChange({ type: "relative", value: "this-month" })}
        >
          Due This Month
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFilterChange({ type: "relative", value: "overdue" })}
        >
          Overdue
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 