"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DndContext, rectIntersection, useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
import type { ReactNode } from "react";
import { Check, Circle } from "lucide-react";
import type { Priority } from "@/lib/data";
import { format, isValid } from "date-fns";

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Feature = {
  id: string;
  title: string;
  desc?: string;
  status: "todo" | "in_progress" | "done";
  label: string;
  priority: Priority;
  dueDate?: Date;
  completed: boolean;
  project?: string;
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

export type KanbanCardProps = {
  id: string;
  name: string;
  desc?: string;
  startAt: string | Date;
  endAt: string | Date;
  status: Status;
  priority: Priority;
  isCompleted: boolean;
  project?: string;
  index: number;
  parent: string;
  onToggleComplete?: (id: string) => void;
  children?: ReactNode;
  className?: string;
};

const priorityColors: Record<string, string> = {
  HIGH: "bg-red-300 text-red-900",
  MEDIUM: "bg-yellow-300 text-yellow-900",
  LOW: "bg-green-300 text-green-900",
} as const;

function getDate(date: string | Date): Date {
  return date instanceof Date ? date : new Date(date);
}

export const KanbanCard = ({
  id,
  name,
  priority,
  index,
  parent,
  desc,
  endAt,
  isCompleted,
  status,
  onToggleComplete,
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

  const date = getDate(endAt);
  const formattedDate = isValid(date) ? format(date, "MMM d, yyyy") : "Invalid date";

  return (
    <Card
      className={cn(
        "rounded-md p-3 shadow-sm touch-none hover:shadow-md transition-shadow",
        isDragging && "cursor-grabbing opacity-50",
        className
      )}
      style={style}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2 flex-1">
          {/* Completion Toggle Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleComplete?.(id);
            }}
            className={cn(
              "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              isCompleted 
                ? "bg-green-500 border-green-500 text-white hover:bg-green-600" 
                : "border-gray-300 hover:border-gray-400"
            )}
          >
            {isCompleted ? (
              <Check className="w-3 h-3" />
            ) : (
              <Circle className="w-3 h-3 text-transparent" />
            )}
          </button>
          
          <div className="flex-1">
            <p className={cn(
              "m-0 font-semibold text-sm",
              isCompleted && "line-through text-gray-500"
            )}>
              {name}
            </p>
            
            {/* Description */}
            {desc && (
              <p className={cn(
                "text-xs mb-2 text-gray-700",
                isCompleted && "line-through text-gray-400"
              )}>
                {desc}
              </p>
            )}
          </div>
        </div>

        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            priorityColors[priority]
          )}
        >
          {priority}
        </span>
      </div>

      {/* Due Date */}
      <p className="text-xs text-gray-500 mb-2">
        Due: <time dateTime={date.toISOString()}>{formattedDate}</time>
      </p>

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
