"use client";

import { ArrowDown, ArrowRight, ArrowUp, CheckCircle2, Circle } from "lucide-react";
import { Task, Option } from "./schema";

export const labels: Option[] = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
]

export const statuses: Option[] = [
  {
    label: "Completed",
    value: "completed",
    icon: CheckCircle2,
  },
  {
    label: "In Progress",
    value: "in-progress",
    icon: Circle,
  },
]

export const priorities: Option[] = [
  {
    label: "High",
    value: "HIGH",
    icon: ArrowUp,
  },
  {
    label: "Medium",
    value: "MEDIUM",
    icon: ArrowRight,
  },
  {
    label: "Low",
    value: "LOW",
    icon: ArrowDown,
  },
]

export const dateFilters: Option[] = [
  { label: "Due Today", value: "today" },
  { label: "Due This Week", value: "this-week" },
  { label: "Due This Month", value: "this-month" },
  { label: "Overdue", value: "overdue" },
]

export const tasks: Task[] = [
  {
    id: "1",
    title: "Implement User Authentication",
    priority: "HIGH",
    completed: false,
    dueDate: new Date("2024-03-15"),
    project: "Auth System",
  },
  {
    id: "2",
    title: "Design Dashboard UI",
    priority: "MEDIUM",
    completed: false,
    dueDate: new Date("2024-03-20"),
    project: "Frontend",
  },
  {
    id: "3",
    title: "API Documentation",
    priority: "LOW",
    completed: true,
    dueDate: new Date("2024-03-10"),
    project: "Backend",
  },
  {
    id: "4",
    title: "Database Design",
    priority: "LOW",
    completed: true,
    dueDate: new Date("2024-03-10"),
    project: "Backend",
  },
  {
    id: "5",
    title: "System Architecture",
    priority: "MEDIUM",
    completed: false,
    dueDate: new Date("2024-03-10"),
    project: "Backend",
  },
] 