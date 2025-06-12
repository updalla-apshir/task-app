"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Task, defaultTasks } from "@/lib/data";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface TaskContextType {
  tasks: Task[];
  updateTask: (updatedTask: Task) => void;
  addTask: (newTask: Task) => void;
  refreshTasks: () => Promise<void>;
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
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // Update tasks whenever initialTasks changes (if it's an array)
  useEffect(() => {
    if (Array.isArray(initialTasks)) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  // Load tasks from the server with debouncing to prevent multiple rapid refreshes
  const refreshTasks = useCallback(async () => {
    const now = Date.now();
    // Prevent refreshing more than once every 500ms
    if (now - lastRefresh < 500) {
      return;
    }
    
    setLastRefresh(now);
    setLoading(true);
    
    try {
      const userId = session?.user?.id;
      const tasksData = await defaultTasks(userId);
      
      // Only update if we got data back
      if (tasksData && tasksData.length > 0) {
        setTasks(tasksData);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      toast.error("Failed to refresh tasks", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, lastRefresh]);

  // Handle async initialTasks
  useEffect(() => {
    const loadTasks = async () => {
      if (typeof initialTasks === 'function') {
        await refreshTasks();
      }
    };

    loadTasks();
  }, [initialTasks, refreshTasks]);

  const updateTask = useCallback((updatedTask: Task) => {
    console.log("TaskContext: Updating task", updatedTask);
    
    // Update local state immediately for responsive UI
    setTasks((prevTasks) => {
      // Check if the task exists
      const taskExists = prevTasks.some(task => task.id === updatedTask.id);
      
      if (taskExists) {
        // Update existing task
        return prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        );
      } else {
        // Add new task if it doesn't exist
        return [...prevTasks, updatedTask];
      }
    });
    
    // Call parent handler if provided
    if (onUpdateTask) {
      onUpdateTask(updatedTask);
    }
  }, [onUpdateTask]);

  const addTask = useCallback((newTask: Task) => {
    console.log("TaskContext: Adding task", newTask);
    
    // Add to local state
    setTasks((prevTasks) => {
      // Check if task with this ID already exists
      const taskExists = prevTasks.some(task => task.id === newTask.id);
      if (taskExists) {
        // Update it instead of adding a duplicate
        return prevTasks.map(task => 
          task.id === newTask.id ? newTask : task
        );
      }
      // Add new task
      return [...prevTasks, newTask];
    });
    
    // Call parent handler if provided
    if (onUpdateTask) {
      onUpdateTask(newTask);
    }
  }, [onUpdateTask]);

  return (
    <TaskContext.Provider value={{ tasks, updateTask, addTask, refreshTasks, loading }}>
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