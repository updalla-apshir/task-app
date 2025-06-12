"use client";

import * as React from "react";
import { format, isSameDay, isSameMonth, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskForm } from "@/components/Dialogs/taskForm";
import { TaskProvider } from "@/contexts/TaskContext";
import { Task, defaultTasks } from "@/lib/data";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { updateTaskCompletionStatus } from "../../../actions/task";
import { getProjects } from "../../../actions/project";

const priorityColorMap: Record<string, string> = {
  // Uppercase keys (from frontend)
  "HIGH": "bg-red-500",
  "MEDIUM": "bg-amber-500",
  "LOW": "bg-emerald-500",
  // Lowercase keys (from database)
  "High": "bg-red-500",
  "Medium": "bg-amber-500",
  "Low": "bg-emerald-500",
};

function getPriorityColor(priority: string | undefined): string {
  if (!priority) return "bg-gray-500";
  return priorityColorMap[priority] || "bg-gray-500";
}

function CalendarPageContent() {
  const [date, setDate] = React.useState<Date>(new Date());
  const [viewMode, setViewMode] = React.useState<"month" | "day">("month");
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = React.useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = React.useState(false);
  const [availableProjects, setAvailableProjects] = React.useState<any[]>([]);
  
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  // Fetch projects when needed
  const fetchProjects = React.useCallback(async () => {
    if (userId) {
      try {
        const projects = await getProjects();
        console.log("Calendar: Projects fetched:", projects);
        setAvailableProjects(projects);
        return projects;
      } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
      }
    }
    return [];
  }, [userId]);
  
  // Fetch projects when the component mounts
  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  // Fetch tasks query
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Task[]>({
    queryKey: ["tasks", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await defaultTasks(userId);
    },
    retry: 2,
    staleTime: 10000,
    refetchOnWindowFocus: true,
    enabled: !!userId,
  });

  // Handle task update
  const handleTaskUpdate = React.useCallback(async (updatedTask: Task) => {
    try {
      if (updatedTask.deleted) return;
      
      // For completion status changes
      if (typeof updatedTask.isCompleted === 'boolean') {
        try {
          // Show loading toast
          const toastId = toast.loading("Updating task status...", { duration: 1500 });
          
          const result = await updateTaskCompletionStatus(updatedTask.id, updatedTask.isCompleted);
          
          if (result.success) {
            // Update toast to success
            toast.success(updatedTask.isCompleted ? "Task completed!" : "Task marked as in progress", {
              id: toastId,
              duration: 2000
            });
            
            // Refresh data after update with a slight delay
            setTimeout(() => {
              refetch();
            }, 300);
          } else {
            // Update toast to error
            toast.error(result.error || "Failed to update task", {
              id: toastId,
              duration: 3000
            });
            
            throw new Error(result.error || "Unknown error");
          }
        } catch (err) {
          console.error('Failed to update task status:', err);
          toast.error("Failed to update task status", {
            duration: 3000
          });
        }
      }
      
      // For other updates (from form)
      if (updatedTask.isOptimistic) {
        console.log("Handling optimistic update in calendar:", updatedTask);
        setTimeout(() => {
          refetch();
        }, 300);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("An error occurred while updating the task", {
        duration: 3000
      });
    }
  }, [refetch]);

  // Handle task form submission
  const handleTaskSubmit = React.useCallback((task: any) => {
    console.log("Task submitted in calendar:", task);
    
    // Refresh data from server with a slight delay to ensure server has processed the change
    setTimeout(() => {
      refetch();
    }, 300);
    
    // Close the dialogs if open
    if (showAddTaskModal) setShowAddTaskModal(false);
    if (showEditTaskModal) setShowEditTaskModal(false);
  }, [refetch, showAddTaskModal, showEditTaskModal]);

  // Filter tasks for the current month
  const currentMonthTasks = React.useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    return tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return dueDate >= monthStart && dueDate <= monthEnd;
    });
  }, [tasks, date]);

  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    return currentMonthTasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return isSameDay(dueDate, day);
    });
  };

  // Navigate to previous or next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setDate(currentDate => {
      const newDate = new Date(currentDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Open task details modal
  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Prepare task data for editing
  const prepareTaskForEdit = (task: Task) => {
    console.log("Preparing task for edit:", task);
    
    // Find a default project ID if available
    let projectId = "";
    if (availableProjects && availableProjects.length > 0) {
      projectId = availableProjects[0].id;
    }
    
    // Convert project string to project_id
    // This is needed because the task form expects project_id but our Task type has project as string
    return {
      ...task,
      // Add project_id field using the first available project
      project_id: projectId,
      // Ensure priority is in the correct format (Low, Medium, High)
      priority: task.priority === "HIGH" ? "High" : task.priority === "MEDIUM" ? "Medium" : task.priority === "LOW" ? "Low" : task.priority,
      // Ensure description is available
      description: task.desc
    };
  };

  // Days of the current month
  const days = React.useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(date),
      end: endOfMonth(date)
    });
  }, [date]);

  // Fix the isSameDay type error by ensuring selectedDay is not null
  const setSelectedDayHandler = (day: Date) => {
    if (selectedDay) {
      setSelectedDay(isSameDay(day, selectedDay) ? null : day);
    } else {
      setSelectedDay(day);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading tasks...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        Error loading tasks: {error?.message}
      </div>
    );
  }

  return (
    <TaskProvider 
      initialTasks={tasks}
      onUpdateTask={handleTaskUpdate}
    >
      <div className="flex h-screen">
        {/* Sidebar for task management */}
        <div className="hidden md:flex w-80 flex-col border-r p-4 h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <Button 
              size="sm" 
              onClick={() => setShowAddTaskModal(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "MMMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {selectedDay 
                  ? `Tasks for ${format(selectedDay, "MMMM d, yyyy")}` 
                  : "All Tasks This Month"}
              </h3>
              
              {(selectedDay ? getTasksForDay(selectedDay) : currentMonthTasks).map((task) => (
                <motion.div
                  key={task.id}
                  layoutId={`task-${task.id}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="group rounded-md border p-3 hover:border-primary cursor-pointer transition-all duration-200 hover:shadow-sm"
                  onClick={() => openTaskDetails(task)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-6 rounded-full",
                        getPriorityColor(task.priority)
                      )} />
                      <div>
                        <h4 className={cn(
                          "text-sm font-medium transition-colors",
                          task.isCompleted ? "text-muted-foreground line-through" : ""
                        )}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(task.due_date), "MMM d")}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "size-2 rounded-full mr-1",
                      task.isCompleted ? "bg-emerald-500" : "bg-amber-500"
                    )} />
                  </div>
                </motion.div>
              ))}
              
              {(selectedDay 
                ? getTasksForDay(selectedDay) 
                : currentMonthTasks).length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">
                  No tasks {selectedDay ? "for this day" : "this month"}
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Main calendar view */}
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-none p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-lg ml-2">{format(date, "MMMM yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDate(new Date())}
                >
                  Today
                </Button>
                <Button 
                  size="sm" 
                  className="md:hidden" 
                  onClick={() => setShowAddTaskModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Task
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-7 gap-px border rounded-lg bg-muted">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div 
                  key={day} 
                  className="p-2 text-center text-sm font-medium bg-background"
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar grid padding for first day of month */}
              {Array.from({ length: days[0].getDay() }).map((_, index) => (
                <div key={`empty-${index}`} className="bg-background min-h-24" />
              ))}
              
              {/* Calendar days */}
              {days.map((day) => {
                const dayTasks = getTasksForDay(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                
                return (
                  <div 
                    key={day.toISOString()}
                    className={cn(
                      "bg-background p-1 min-h-24 hover:bg-accent/10 relative transition-colors",
                      isSelected ? "ring-2 ring-primary" : "",
                      !isSameMonth(day, date) ? "opacity-50" : ""
                    )}
                    onClick={() => setSelectedDayHandler(day)}
                  >
                    <div className="flex justify-between items-start p-1">
                      <span className={cn(
                        "text-sm font-medium leading-none w-6 h-6 flex items-center justify-center rounded-full",
                        isToday(day) ? "bg-primary text-primary-foreground" : ""
                      )}>
                        {format(day, "d")}
                      </span>
                      
                      {dayTasks.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(day);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="mt-1 space-y-1 max-h-[80px] overflow-hidden">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "text-xs rounded px-1.5 py-0.5 truncate cursor-pointer",
                            task.isCompleted ? "bg-muted text-muted-foreground line-through" : "bg-accent/30"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            openTaskDetails(task);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "size-1.5 rounded-full",
                              getPriorityColor(task.priority)
                            )} />
                            <span>{task.title}</span>
                          </div>
                        </div>
                      ))}
                      
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-muted-foreground px-1.5">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Task Modal */}
      <TaskForm 
        open={showAddTaskModal} 
        setOpen={setShowAddTaskModal} 
        selectedDate={selectedDay}
        onSubmit={handleTaskSubmit}
        currentUserId={userId}
        projects={availableProjects}
      />
      
      {/* Edit Task Modal */}
      {selectedTask && (
        <TaskForm 
          open={showEditTaskModal} 
          setOpen={setShowEditTaskModal} 
          initialData={prepareTaskForEdit(selectedTask)}
          onSubmit={handleTaskSubmit}
          currentUserId={userId}
          projects={availableProjects}
        />
      )}
      
      {/* Task Details Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-8 rounded-full",
                  getPriorityColor(selectedTask.priority)
                )} />
                <div>
                  <h3 className={cn(
                    "text-lg font-medium",
                    selectedTask.isCompleted ? "text-muted-foreground line-through" : ""
                  )}>
                    {selectedTask.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedTask.due_date), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              
              {selectedTask.desc && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTask.desc}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Status</h4>
                  <div className="flex items-center gap-1">
                    <div className={cn(
                      "size-2 rounded-full",
                      getPriorityColor(selectedTask.priority)
                    )} />
                    <span className="text-sm">
                      {selectedTask.isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Priority</h4>
                  <div className="flex items-center gap-1">
                    <div className={cn(
                      "size-2 rounded-full",
                      getPriorityColor(selectedTask.priority)
                    )} />
                    <span className="text-sm">
                      {selectedTask.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Project</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTask.project || "No project"}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTaskModal(false);
                    // Open edit modal with selected task
                    setShowEditTaskModal(true);
                  }}
                >
                  Edit
                </Button>
                
                <Button
                  variant={selectedTask.isCompleted ? "outline" : "default"}
                  onClick={() => {
                    handleTaskUpdate({
                      ...selectedTask,
                      isCompleted: !selectedTask.isCompleted,
                    });
                    setShowTaskModal(false);
                  }}
                >
                  {selectedTask.isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TaskProvider>
  );
}

export default function CalendarPage() {
  return <CalendarPageContent />;
} 