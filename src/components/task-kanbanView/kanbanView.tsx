"use client";

import React, { useState, useEffect } from "react";
import {
  KanbanBoard,
  KanbanCards,
  KanbanCard,
  KanbanHeader,
  Status,
  Feature,
} from "./kanban"; // your kanban components

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
import { Settings2 } from "lucide-react";
import { Button } from "../ui/button";
import { useValue, ValueProvider } from "@/hooks/useContext";

// Define statuses
const exampleStatuses: Status[] = [
  { id: "1", name: "Planned", color: "#6B7280" },
  { id: "2", name: "In Progress", color: "#F59E0B" },
  { id: "3", name: "Done", color: "#10B981" },
];

// Helper function to get status based on progress
const getStatusFromProgress = (progress: number): Status => {
  if (progress === 0) return exampleStatuses[0]; // Planned
  if (progress === 100) return exampleStatuses[2]; // Done
  return exampleStatuses[1]; // In Progress
};

// Raw feature data with date strings
const rawFeatures: Feature[] = [
  {
    id: "1",
    name: "AI Scene Analysis",
    desc: "Analyze scenes using AI to improve production quality.",
    startAt: new Date("2025-05-01"),
    endAt: new Date("2025-06-15"),
    status: exampleStatuses[0],
    priority: "High",
    progress: 10,
  },
  {
    id: "2",
    name: "Collaborative Editing",
    desc: "Allow multiple users to edit videos simultaneously.",
    startAt: new Date("2025-04-01"),
    endAt: new Date("2025-05-20"),
    status: exampleStatuses[1],
    priority: "Medium",
    progress: 20,
  },
  {
    id: "3",
    name: "AI-Powered Color Grading",
    desc: "Use AI to automatically grade colors.",
    startAt: new Date("2025-03-01"),
    endAt: new Date("2025-04-30"),
    status: exampleStatuses[2],
    priority: "Low",
    progress: 80,
  },
  // Additional features can be added here
];

export default function TaskKanban() {
  const [features, setFeatures] = useState<Feature[]>(() =>
    rawFeatures.map((f) => ({
      ...f,
      startAt: new Date(f.startAt),
      endAt: new Date(f.endAt),
      status: getStatusFromProgress(f.progress),
    }))
  );

  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;

  return (
    <TaskKanbanContent
      features={features}
      setFeatures={setFeatures}
      selectedStatusId={selectedStatusId}
      setSelectedStatusId={setSelectedStatusId}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      tasksPerPage={tasksPerPage}
    />
  );
}

function TaskKanbanContent({
  features,
  setFeatures,
  selectedStatusId,
  setSelectedStatusId,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  tasksPerPage,
}: {
  features: Feature[];
  setFeatures: React.Dispatch<React.SetStateAction<Feature[]>>;
  selectedStatusId: string | null;
  setSelectedStatusId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  tasksPerPage: number;
}) {
  const { value, setValue } = useValue();

  // Enhanced sensors configuration
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

  // Filter features by selected status and search query
  const filteredFeatures = features
    .filter((f) => !selectedStatusId || f.status.id === selectedStatusId)
    .filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

  // Calculate pagination
  const totalPages = Math.ceil(filteredFeatures.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const paginatedFeatures = filteredFeatures.slice(
    startIndex,
    startIndex + tasksPerPage
  );

  // Update features with new status when progress changes
  const updateFeatureProgress = (featureId: string, newProgress: number) => {
    setFeatures((prevFeatures) =>
      prevFeatures.map((feature) =>
        feature.id === featureId
          ? {
              ...feature,
              progress: newProgress,
              status: getStatusFromProgress(newProgress),
            }
          : feature
      )
    );
  };

  // Handles drag end event
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = paginatedFeatures.findIndex((f) => f.id === active.id);
      const newIndex = paginatedFeatures.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFeatures = [...features];
        const globalOldIndex = features.findIndex((f) => f.id === active.id);
        const globalNewIndex = features.findIndex((f) => f.id === over.id);

        const [movedItem] = newFeatures.splice(globalOldIndex, 1);
        newFeatures.splice(globalNewIndex, 0, movedItem);

        setFeatures(newFeatures);
      }
    }
  }

  return (
    <div className="p-4 mx-auto">
      {/* Search Input */}
      <div className="flex flex-col mb-4 md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters and List View */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
          {/* Status Filter Bar */}
          <div className="flex flex-wrap space-x-4 md:space-x-6 border-b border-gray-300 pb-2 md:pb-0 md:border-b-0">
            <button
              className={`px-3 py-1 text-sm font-semibold border-b-2 transition-colors ${
                selectedStatusId === null
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setSelectedStatusId(null)}
            >
              All
            </button>
            {exampleStatuses.map(({ id, name, color }) => (
              <button
                key={id}
                className={`px-3 py-1 text-sm font-semibold border-b-2 transition-colors ${
                  selectedStatusId === id
                    ? "border-current font-bold"
                    : "border-transparent hover:text-opacity-80"
                }`}
                style={{
                  color: color,
                  borderColor: selectedStatusId === id ? color : "transparent",
                }}
                onClick={() => setSelectedStatusId(id)}
              >
                {name}
              </button>
            ))}
          </div>

          {/* List View Button */}
          <div className="self-start md:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setValue("task")}
            >
              List View
            </Button>
          </div>
        </div>
      </div>

      {/* Task List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <KanbanBoard id="tasks">
          <KanbanHeader
            name={
              selectedStatusId
                ? exampleStatuses.find((s) => s.id === selectedStatusId)
                    ?.name || "Tasks"
                : "All Tasks"
            }
            color={
              selectedStatusId
                ? exampleStatuses.find((s) => s.id === selectedStatusId)
                    ?.color || "#000"
                : "#000"
            }
          />
          <SortableContext
            items={paginatedFeatures.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <KanbanCards>
              {paginatedFeatures.length === 0 ? (
                <p className="p-4 text-center text-gray-500">No tasks found.</p>
              ) : (
                paginatedFeatures.map(
                  ({
                    id,
                    name,
                    priority,
                    desc,
                    startAt,
                    endAt,
                    status,
                    progress,
                  }) => (
                    <KanbanCard
                      key={id}
                      id={id}
                      index={paginatedFeatures.findIndex((f) => f.id === id)}
                      parent="tasks"
                      name={name}
                      priority={priority}
                      desc={desc}
                      startAt={startAt}
                      endAt={endAt}
                      status={status}
                      progress={progress}
                      onProgressChange={updateFeatureProgress}
                    />
                  )
                )
              )}
            </KanbanCards>
          </SortableContext>
        </KanbanBoard>
      </DndContext>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
