"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Task, defaultTasks } from "@/lib/data";

interface TaskContextType {
  tasks: Task[];
  updateTask: (updatedTask: Task) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: React.ReactNode;
  initialTasks?: Task[];
  onUpdateTask?: (updatedTask: Task) => void;
}

export function TaskProvider({ children, initialTasks = defaultTasks, onUpdateTask }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    onUpdateTask?.(updatedTask);
  }, [onUpdateTask]);

  return (
    <TaskContext.Provider value={{ tasks, updateTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
} 