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
    name: "Implement User Authentication",
    priority: "HIGH",
    isCompleted: false,
    startAt: new Date(),
    endAt: new Date("2024-03-15"),
    status: { id: "1", name: "In Progress", color: "#F59E0B" },
    project: "Auth System",
    desc: "Implement user authentication using NextAuth.js"
  },
  {
    id: "2",
    name: "Design Dashboard UI",
    priority: "MEDIUM",
    isCompleted: false,
    startAt: new Date(),
    endAt: new Date("2024-03-20"),
    status: { id: "1", name: "In Progress", color: "#F59E0B" },
    project: "Frontend",
    desc: "Create a responsive dashboard UI using Tailwind CSS"
  },
  {
    id: "3",
    name: "API Documentation",
    priority: "LOW",
    isCompleted: true,
    startAt: new Date("2024-03-01"),
    endAt: new Date("2024-03-10"),
    status: { id: "3", name: "Done", color: "#10B981" },
    project: "Backend",
    desc: "Document all API endpoints and their usage"
  },
  {
    id: "4",
    name: "Database Design",
    priority: "LOW",
    isCompleted: true,
    startAt: new Date("2024-03-01"),
    endAt: new Date("2024-03-10"),
    status: { id: "3", name: "Done", color: "#10B981" },
    project: "Backend",
    desc: "Design and implement the database schema"
  },
  {
    id: "5",
    name: "System Architecture",
    priority: "MEDIUM",
    isCompleted: false,
    startAt: new Date(),
    endAt: new Date("2024-03-10"),
    status: { id: "1", name: "In Progress", color: "#F59E0B" },
    project: "Backend",
    desc: "Define the overall system architecture and components"
  },
] 