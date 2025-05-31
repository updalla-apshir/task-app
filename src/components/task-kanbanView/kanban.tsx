"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DndContext, rectIntersection, useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
import type { ReactNode } from "react";

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Feature = {
  id: string;
  name: string;
  desc?: string;
  startAt: Date;
  endAt: Date;
  status: Status;
  priority: "Low" | "Medium" | "High";
  progress: number; // optional progress (0-100), if you want manual override
};

export type KanbanBoardProps = {
  id: Status["id"];
  children: ReactNode;
  className?: string;
};

export const KanbanBoard = ({ id, children, className }: KanbanBoardProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      className={cn(
        "flex h-full min-h-40 flex-col gap-2 rounded-md border bg-secondary p-2 text-xs shadow-sm outline-2 transition-all",
        isOver ? "outline-primary" : "outline-transparent",
        className
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};

export type KanbanCardProps = Pick<
  Feature,
  "id" | "name" | "priority" | "desc" | "startAt" | "endAt" | "progress"
> & {
  index: number;
  parent: string;
  status?: Status;
  onProgressChange?: (id: string, progress: number) => void;
  children?: ReactNode;
  className?: string;
};

const priorityColors = {
  Low: "bg-green-300 text-green-900",
  Medium: "bg-yellow-300 text-yellow-900",
  High: "bg-red-300 text-red-900",
};

function formatDate(date: Date) {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

export const KanbanCard = ({
  id,
  name,
  priority,
  index,
  parent,
  desc,
  startAt,
  endAt,
  progress,
  status,
  onProgressChange,
  children,
  className,
}: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: { index, parent },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formattedDate = formatDate(endAt);

  return (
    <Card
      className={cn(
        "rounded-md p-3 shadow-sm touch-none",
        isDragging && "cursor-grabbing opacity-50",
        className
      )}
      style={style}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
    >
      <div className="flex justify-between items-center mb-1">
        <p className="m-0 font-semibold text-sm">{name}</p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            priorityColors[priority]
          )}
        >
          {priority}
        </span>
      </div>

      {/* Description */}
      {desc && <p className="text-xs mb-2 text-gray-700">{desc}</p>}

      {/* Dates */}
      <p className="text-xs text-gray-500 mb-2">
        Due: <time dateTime={endAt.toISOString()}>{formattedDate}</time>
      </p>

      {/* Progress Bar */}
      <div
        className="w-full bg-gray-200 rounded h-3 cursor-pointer"
        onClick={(e) => {
          if (onProgressChange) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const newProgress = Math.round((x / width) * 100);
            onProgressChange(id, Math.max(0, Math.min(100, newProgress)));
          }
        }}
      >
        <div
          className="h-3 rounded bg-blue-500 transition-all"
          style={{ width: `${progress}%` }}
          title={`${progress}% complete`}
        />
      </div>

      {children}
    </Card>
  );
};

export type KanbanCardsProps = {
  children: ReactNode;
  className?: string;
};

export const KanbanCards = ({ children, className }: KanbanCardsProps) => (
  <div className={cn("flex gap-4 flex-wrap overflow-x-auto", className)}>
    {children}
  </div>
);

export type KanbanHeaderProps =
  | {
      children: ReactNode;
    }
  | {
      name: Status["name"];
      color: Status["color"];
      className?: string;
    };

export const KanbanHeader = (props: KanbanHeaderProps) =>
  "children" in props ? (
    props.children
  ) : (
    <div className={cn("flex shrink-0 items-center gap-2", props.className)}>
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: props.color }}
      />
      <p className="m-0 font-semibold text-sm">{props.name}</p>
    </div>
  );

export type KanbanProviderProps = {
  children: ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  className?: string;
};

export const KanbanProvider = ({
  children,
  onDragEnd,
  className,
}: KanbanProviderProps) => (
  <DndContext collisionDetection={rectIntersection} onDragEnd={onDragEnd}>
    <div
      className={cn("grid w-full auto-cols-fr grid-flow-col gap-4", className)}
    >
      {children}
    </div>
  </DndContext>
);
