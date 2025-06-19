import { Skeleton } from "@/components/ui/skeleton";

export const TableSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-[250px]" />
    <div className="border rounded-lg">
      <div className="border-b h-12" />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 border-b last:border-0"
        >
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  </div>
); 