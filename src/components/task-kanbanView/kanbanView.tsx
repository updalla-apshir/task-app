"use client";

import React, { useState } from "react";
import {
  KanbanBoard,
  KanbanCards,
  KanbanCard,
  KanbanHeader,
  Status,
  Feature,
} from "./kanban";

import { Task, Priority } from "@/lib/data";
import { updateTaskCompletionStatus } from "../../../actions/task";
import { toast } from "sonner";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { useTasks } from "@/contexts/TaskContext";
import { cn } from "@/lib/utils";
import {
  format,
  isAfter,
  isBefore,
  isToday,
  isThisWeek,
  isThisMonth,
  startOfToday,
  isValid,
} from "date-fns";
import { useValue } from "@/contexts/useContext";

// Define priorities with proper typing
const priorityColumns: Array<{ id: Priority; name: string; color: string }> = [
  { id: "HIGH", name: "High Priority", color: "#EF4444" },
  { id: "MEDIUM", name: "Medium Priority", color: "#F59E0B" },
  { id: "LOW", name: "Low Priority", color: "#10B981" },
];

export default function TaskKanban() {
  const { tasks, updateTask } = useTasks();
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(
    null
  );
  const [completionFilter, setCompletionFilter] = useState<
    "all" | "completed" | "incomplete"
  >("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  return (
    <TaskKanbanContent
      tasks={tasks}
      updateTask={updateTask}
      selectedPriority={selectedPriority}
      setSelectedPriority={setSelectedPriority}
      completionFilter={completionFilter}
      setCompletionFilter={setCompletionFilter}
      dateFilter={dateFilter}
      setDateFilter={setDateFilter}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      tasksPerPage={tasksPerPage}
    />
  );
}

type DateFilter = "all" | "today" | "this-week" | "this-month" | "overdue";

interface TaskKanbanContentProps {
  tasks: Task[];
  updateTask: (task: Task) => void;
  selectedPriority: Priority | null;
  setSelectedPriority: (priority: Priority | null) => void;
  completionFilter: "all" | "completed" | "incomplete";
  setCompletionFilter: (filter: "all" | "completed" | "incomplete") => void;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  tasksPerPage: number;
}

function TaskKanbanContent({
  tasks,
  updateTask,
  selectedPriority,
  setSelectedPriority,
  completionFilter,
  setCompletionFilter,
  dateFilter,
  setDateFilter,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  tasksPerPage,
}: TaskKanbanContentProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const { value, setValue } = useValue();

  // Filter tasks based on criteria
  const filteredTasks = tasks
    .filter(task => !task.deleted) // Filter out deleted tasks
    .filter((f) => !selectedPriority || f.priority === selectedPriority)
    .filter((f) => {
      if (completionFilter === "all") return true;
      return completionFilter === "completed" ? f.isCompleted : !f.isCompleted;
    })
    .filter((f) => {
      if (!f.due_date) return true;

      const today = startOfToday();
      const dueDate = new Date(f.due_date);

      if (!isValid(dueDate)) return true;

      switch (dateFilter) {
        case "today":
          return isToday(dueDate);
        case "this-week":
          return isThisWeek(dueDate);
        case "this-month":
          return isThisMonth(dueDate);
        case "overdue":
          return isBefore(dueDate, today) && !f.isCompleted;
        default:
          return true;
      }
    })
    .filter((f) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      const titleMatch = f.title && f.title.toLowerCase().includes(query);
      const descMatch = f.desc && f.desc.toLowerCase().includes(query);
      const projectMatch = f.project && f.project.toLowerCase().includes(query);

      return titleMatch || descMatch || projectMatch;
    });

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const paginatedTasks = filteredTasks.slice(
    startIndex,
    startIndex + tasksPerPage
  );

  // Group tasks by priority for the current page
  const tasksByPriority = priorityColumns.reduce(
    (acc, priority) => {
      acc[priority.id] = paginatedTasks.filter(
        (task) => task.priority === priority.id
      );
      return acc;
    },
    {} as Record<Priority, Task[]>
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = paginatedTasks.findIndex((f) => f.id === active.id);
      const newIndex = paginatedTasks.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = [...tasks];
        const globalOldIndex = tasks.findIndex((f) => f.id === active.id);
        const globalNewIndex = tasks.findIndex((f) => f.id === over.id);

        const [movedItem] = newTasks.splice(globalOldIndex, 1);
        // Update priority based on the target column
        const targetColumn = priorityColumns.find((p) => p.id === over.id);
        if (targetColumn) {
          movedItem.priority = targetColumn.id;
          updateTask(movedItem);
        }
        newTasks.splice(globalNewIndex, 0, movedItem);
      }
    }
  }

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search tasks, descriptions, or projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority Filter */}
          <div className="flex space-x-4 md:space-x-6">
            <button
              className={`px-2 py-1 text-sm font-semibold border-b-2 transition-colors ${
                selectedPriority === null
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setSelectedPriority(null)}
            >
              All Priorities
            </button>
            {priorityColumns.map((priority) => (
              <button
                key={priority.id}
                className={`px-2 py-1 text-sm font-semibold border-b-2 transition-colors ${
                  selectedPriority === priority.id
                    ? "border-current"
                    : "border-transparent hover:text-opacity-80"
                }`}
                style={{
                  color: priority.color,
                  borderColor:
                    selectedPriority === priority.id
                      ? priority.color
                      : "transparent",
                }}
                onClick={() => setSelectedPriority(priority.id)}
              >
                {priority.name}
              </button>
            ))}
          </div>

          {/* List View Button */}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setValue("task")}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            List View
          </Button>
        </div>

        {/* Date and Completion Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Date Filter */}
          <div className="flex space-x-4 md:space-x-6">
            {[
              { value: "all", label: "All Dates" },
              { value: "today", label: "Due Today" },
              { value: "this-week", label: "Due This Week" },
              { value: "this-month", label: "Due This Month" },
              { value: "overdue", label: "Overdue" },
            ].map(({ value, label }) => (
              <button
                key={value}
                className={`px-3 py-1 text-sm font-semibold border-b-2 transition-colors ${
                  dateFilter === value
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setDateFilter(value as DateFilter)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Completion Filter */}
          <div className="flex gap-2">
            {[
              { value: "all", label: "All Tasks" },
              { value: "completed", label: "Completed" },
              { value: "incomplete", label: "Incomplete" },
            ].map(({ value, label }) => (
              <button
                key={value}
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  completionFilter === value
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() =>
                  setCompletionFilter(value as typeof completionFilter)
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorityColumns.map((priority) => (
            <KanbanBoard key={priority.id} id={priority.id}>
              <div className="flex items-center justify-between mb-2">
                <KanbanHeader name={priority.name} color={priority.color} />
                <span className="text-xs font-medium text-gray-500">
                  {tasksByPriority[priority.id]?.length || 0} /{" "}
                  {
                    filteredTasks.filter((f) => f.priority === priority.id)
                      .length
                  }{" "}
                  tasks
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {tasksByPriority[priority.id]?.map((task, index) => (
                  <KanbanCard
                    key={task.id}
                    id={task.id}
                    name={task.title}
                    desc={task.desc}
                    startAt={task.start_date}
                    endAt={task.due_date}
                    status={task.status}
                    priority={task.priority}
                    isCompleted={task.isCompleted}
                    project={task.project}
                    index={index}
                    parent={priority.id}
                    onToggleComplete={async (id) => {
                      // Create updated task with toggled completion status
                      const updatedTask = {
                        ...task,
                        isCompleted: !task.isCompleted,
                        status: !task.isCompleted
                          ? {
                              id: "2",
                              name: "Completed",
                              color: "#10B981",
                            }
                          : {
                              id: "1",
                              name: "In Progress",
                              color: "#3B82F6",
                            },
                        isOptimistic: true
                      };
                      
                      // Use the context's updateTask which is connected to the shared handler
                      updateTask(updatedTask);
                    }}
                  >
                    {/* Project Badge */}
                    {task.project && (
                      <div className="mt-2">
                        <span
                          className={cn(
                            "inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold",
                            task.isCompleted ? "text-gray-500" : "text-gray-700"
                          )}
                        >
                          {task.project}
                        </span>
                      </div>
                    )}

                    {/* Completion Status */}
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.isCompleted ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                      <span
                        className={cn(
                          "text-xs",
                          task.isCompleted
                            ? "text-green-600"
                            : "text-yellow-600"
                        )}
                      >
                        {task.isCompleted ? "Completed" : "In Progress"}
                      </span>
                    </div>
                  </KanbanCard>
                ))}
              </div>
            </KanbanBoard>
          ))}
        </div>
      </DndContext>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 gap-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg border ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              // Show first page, last page, current page, and pages around current
              const shouldShow =
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(currentPage - pageNum) <= 1;

              if (!shouldShow) {
                // Show ellipsis if there's a gap
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return (
                    <span key={pageNum} className="text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg border ${
                    currentPage === pageNum
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg border ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Next
          </button>

          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}
