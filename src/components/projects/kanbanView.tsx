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
import { useValue, ValueProvider } from "@/contexts/useContext";
import { useKanban } from "./kanban";
import { Project, defaultProjects } from "@/lib/project-data";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getProgressColor(progress: number): string {
  if (progress === 0) return "bg-gray-300";
  return "bg-blue-600";
}

const statusColumns = [
  { id: "not-started", name: "Not Started", color: "#94A3B8" },
  { id: "in-progress", name: "In Progress", color: "#F59E0B" },
  { id: "completed", name: "Completed", color: "#10B981" },
] as const;

type ProjectStatus = "not-started" | "in-progress" | "completed";

export default function ProjectKanban() {
  const { draggingTaskId, setDraggingTaskId } = useKanban();
  const [projects, setProjects] = React.useState<Project[]>(defaultProjects);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<ProjectStatus | null>(null);
  const { value, setValue } = useValue();

  const getFilteredProjects = (status: ProjectStatus | null) => {
    return projects.filter((project) => {
      const matchesSearch = !searchQuery || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase() || '');
      const matchesStatus = !status || project.status === status;
      return matchesSearch && matchesStatus;
    });
  };

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData("text/plain", projectId);
    setDraggingTaskId(projectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: ProjectStatus) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("text/plain");

    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? { ...project, status: newStatus }
          : project
      )
    );
    setDraggingTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  return (
    <div className="flex flex-col">
      {/* Search Input */}
      <div className="flex flex-col mb-4 md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search projects..."
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
                selectedStatus === null
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setSelectedStatus(null)}
            >
              All
            </button>
            {statusColumns.map(({ id, name, color }) => (
              <button
                key={id}
                className={`px-3 py-1 text-sm font-semibold border-b-2 transition-colors ${
                  selectedStatus === id
                    ? "border-current font-bold"
                    : "border-transparent hover:text-opacity-80"
                }`}
                style={{
                  color: color,
                  borderColor: selectedStatus === id ? color : "transparent",
                }}
                onClick={() => setSelectedStatus(id as ProjectStatus)}
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

      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {statusColumns.map((column) => {
          const columnProjects = projects.filter(p => {
            const matchesColumnStatus = p.status === column.id;
            const matchesSelectedStatus = !selectedStatus || selectedStatus === column.id;
            return matchesColumnStatus && matchesSelectedStatus;
          });
          
          return (
            <div
              key={column.id}
              className="flex flex-col rounded-lg border bg-card"
            >
              <div className="p-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column.name}</h3>
                  <Badge variant="secondary">
                    {columnProjects.length}
                  </Badge>
                </div>
              </div>
              <div
                className="p-2 flex-1 overflow-auto"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id as ProjectStatus)}
              >
                {columnProjects
                  .filter(project => 
                    !searchQuery || 
                    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    project.description?.toLowerCase().includes(searchQuery.toLowerCase() || '')
                  )
                  .map((project) => (
                    <div
                      key={project.id}
                      className="mb-2 p-3 bg-background rounded-md border shadow-sm hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, project.id)}
                      onDragEnd={handleDragEnd}
                      style={{
                        opacity: draggingTaskId === project.id ? 0.5 : 1,
                      }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{project.name}</h4>
                          <Badge
                            variant={
                              project.priority === "high"
                                ? "destructive"
                                : project.priority === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {project.priority}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-full flex items-center gap-2">
                            <div className="flex-1 relative h-2 rounded-full bg-gray-300 overflow-hidden">
                              <div
                                className="absolute left-0 top-0 h-full bg-blue-600 transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground min-w-[3ch]">
                              {project.progress}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {project.teamMembers.map((member) => (
                              <Avatar
                                key={member.id}
                                className="h-6 w-6 border-2 border-background"
                              >
                                {member.avatar ? (
                                  <img src={member.avatar} alt={member.name} />
                                ) : (
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {getInitials(member.name)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {project.startDate &&
                                format(project.startDate, "MMM d")}
                            </span>
                            <span>→</span>
                            <span>
                              {project.endDate && format(project.endDate, "MMM d")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
