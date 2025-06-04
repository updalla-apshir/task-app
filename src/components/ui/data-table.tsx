import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReactNode } from "react";

interface DataTableProps<TData extends Record<string, any>> {
  data: TData[];
  columns: {
    accessorKey: string;
    header: string;
    cell?: ({ row }: { row: { original: TData } }) => ReactNode;
  }[];
}

export function DataTable<TData extends Record<string, any>>({ data, columns }: DataTableProps<TData>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.accessorKey}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={i}>
            {columns.map((column) => (
              <TableCell key={column.accessorKey}>
                {column.cell ? column.cell({ row: { original: row } }) : String(row[column.accessorKey])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 