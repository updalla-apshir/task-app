"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Task, defaultTasks } from "@/lib/data";
import { useSession } from "next-auth/react";

interface TaskContextType {
  tasks: Task[];
  updateTask: (updatedTask: Task) => void;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: React.ReactNode;
  initialTasks?: Task[] | (() => Promise<Task[]>);
  onUpdateTask?: (updatedTask: Task) => void;
}

export function TaskProvider({ 
  children, 
  initialTasks = [], 
  onUpdateTask 
}: TaskProviderProps) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>(Array.isArray(initialTasks) ? initialTasks : []);
  const [loading, setLoading] = useState(typeof initialTasks === 'function');

  useEffect(() => {
    const loadTasks = async () => {
      if (typeof initialTasks === 'function') {
        setLoading(true);
        try {
          const userId = session?.user?.id;
          const tasksData = await defaultTasks(userId);
          setTasks(tasksData);
        } catch (error) {
          console.error("Failed to load tasks:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTasks();
  }, [initialTasks, session?.user?.id]);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    onUpdateTask?.(updatedTask);
  }, [onUpdateTask]);

  return (
    <TaskContext.Provider value={{ tasks, updateTask, loading }}>
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