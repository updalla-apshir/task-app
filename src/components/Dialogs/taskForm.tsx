"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { taskSchema } from "@/schemas/shema";
import { createTask, updateTask } from "../../../actions/task";
import { getProjects } from "../../../actions/project";
import { formatTaskFromForm } from "@/lib/data";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormDescription } from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { Priority } from "@/lib/data";
import { TaskPriority } from "@prisma/client";

// Define a schema for our form that matches the form fields
const formSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["completed", "pending"]),
  priority: z.enum(["Low", "Medium", "High"]),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  projectId: z.string().min(1, "Project is required"),
});

type LocalFormValues = z.infer<typeof formSchema>;

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface TaskFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit?: (task: any) => void; // Changed to return the task data
  currentUserId?: string;
  projects?: Project[];
  initialData?: any; // Task data for editing
  selectedDate?: Date | null; // Add selectedDate parameter
}

export function TaskForm({
  open,
  setOpen,
  onSubmit,
  currentUserId,
  projects: initialProjects = [],
  initialData,
  selectedDate, // Add selectedDate parameter
}: TaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [cachedProjects, setCachedProjects] = useState<{
    [key: string]: Project;
  }>({});
  const isEditMode = !!initialData;
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch projects only once and cache them
  const fetchProjects = useCallback(async () => {
    try {
      // Check if we already have projects in state
      if (projects.length > 0) return;

      // Check if we have cached projects in localStorage
      const cachedProjectsData = localStorage.getItem("projects");
      if (cachedProjectsData) {
        const parsedProjects = JSON.parse(cachedProjectsData);
        if (parsedProjects.length > 0) {
          setProjects(parsedProjects);

          // Create a map for quick lookups
          const projectMap = parsedProjects.reduce(
            (acc: any, project: Project) => {
              acc[project.id] = project;
              return acc;
            },
            {}
          );
          setCachedProjects(projectMap);

          // Still fetch in background to update cache
          getProjects().then((freshProjects) => {
            if (freshProjects && freshProjects.length > 0) {
              setProjects(freshProjects);
              localStorage.setItem("projects", JSON.stringify(freshProjects));

              // Update the map
              const updatedMap = freshProjects.reduce(
                (acc: any, project: Project) => {
                  acc[project.id] = project;
                  return acc;
                },
                {}
              );
              setCachedProjects(updatedMap);
            }
          });
          return;
        }
      }

      // Fetch projects if no cache
      const projectsData = await getProjects();
      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData);
        localStorage.setItem("projects", JSON.stringify(projectsData));

        // Create a map for quick lookups
        const projectMap = projectsData.reduce((acc: any, project: Project) => {
          acc[project.id] = project;
          return acc;
        }, {});
        setCachedProjects(projectMap);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    }
  }, [projects]);

  // Fetch projects when component mounts
  useEffect(() => {
    if (initialProjects.length === 0) {
      fetchProjects();
    } else {
      // Create a map for the initial projects
      const projectMap = initialProjects.reduce(
        (acc: any, project: Project) => {
          acc[project.id] = project;
          return acc;
        },
        {}
      );
      setCachedProjects(projectMap);
    }
  }, [initialProjects, fetchProjects]);

  const form = useForm<LocalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title || "",
          description: initialData.description || "",
          status: initialData.isCompleted ? "completed" : "pending",
          priority: initialData.priority || "Medium",
          startDate: initialData.start_date ? new Date(initialData.start_date) : undefined,
          endDate: initialData.due_date ? new Date(initialData.due_date) : undefined,
          projectId: initialData.project_id || "",
        }
      : {
          title: "",
          description: "",
          status: "pending",
          priority: "Medium",
          projectId: "",
          startDate: new Date(),
          endDate: selectedDate || new Date(), // Use selectedDate if available
        },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        status: initialData.isCompleted ? "completed" : "pending",
        priority: initialData.priority || "Medium",
        startDate: initialData.start_date ? new Date(initialData.start_date) : undefined,
        endDate: initialData.due_date ? new Date(initialData.due_date) : undefined,
        projectId: initialData.project_id || "",
      });
    }
  }, [initialData, form]);

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  const handleSubmit = async (data: LocalFormValues) => {
    try {
      setIsLoading(true);
      const now = new Date();
      
      // Prepare task data in the format expected by the server
      const taskPayload = {
        title: data.title,
        description: data.description || "",
        status: data.status,
        priority: data.priority,
        startDate: data.startDate || now,
        endDate: data.endDate || now,
        createdAt: now,
        projectId: data.projectId,
        createdBy: userId || currentUserId,
      };

      console.log("Submitting task payload:", taskPayload);

      // Create an optimistic task object with raw data
      const rawOptimisticTask = {
        id: isEditMode ? initialData.id : `temp-${Date.now()}`,
        title: data.title,
        description: data.description || "",
        start_date: data.startDate || now,
        due_date: data.endDate || now,
        status: data.status,
        priority: data.priority,
        created_at: now,
        project_id: data.projectId,
        created_by: userId || currentUserId,
        project: {
          name: cachedProjects[data.projectId]?.name || "Loading...",
        },
        isOptimistic: true,
      };

      // Format the task with proper structure for display
      const displayTask = formatTaskFromForm(rawOptimisticTask);

      // Call onSubmit with optimistic data immediately
      if (onSubmit) {
        onSubmit(displayTask);
      }

      let res;

      // Make the actual API call
      if (isEditMode && initialData) {
        res = await updateTask(initialData.id, taskPayload);
      } else {
        res = await createTask(taskPayload);
      }

      if (res.success) {
        form.reset();
        
        // Show success toast - keep it here but don't show another one in the parent component
        toast.success(
          isEditMode ? "Task updated successfully" : "Task created successfully"
        );
        
        setOpen(false);

        // Update with real data if needed
        if (onSubmit && res.task) {
          // Format the task with proper structure and mark as optimistic update
          const taskWithProject = formatTaskFromForm({
            ...res.task,
            project: {
              name: cachedProjects[res.task.project_id]?.name || "Unknown Project"
            },
            isOptimistic: true, // Add flag for optimistic updates
          });
          
          // Call onSubmit to update the UI immediately
          onSubmit(taskWithProject);
        }
      } else {
        // If there was an error, we should inform the user and rollback the optimistic update
        console.error(
          isEditMode ? "Task update failed:" : "Task creation failed:",
          res.error
        );
        toast.error(
          Array.isArray(res.error)
            ? res.error[0]?.message
            : res.error ||
                (isEditMode ? "Failed to update task" : "Failed to create task")
        );

        // Signal failure to parent component to revert optimistic update
        if (onSubmit) {
          onSubmit({ id: rawOptimisticTask.id, error: true });
        }
      }
    } catch (error) {
      console.error("Task submission error:", error);
      toast.error("An unexpected error occurred");

      // Signal failure to parent component
      if (onSubmit && isEditMode) {
        onSubmit({ id: initialData.id, error: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogContent className="w-full max-w-4xl overflow-visible">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {isEditMode ? "Edit Task" : "Create New Task"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEditMode
                ? "Update the details of your task."
                : "Fill out the details of the task you want to create."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className="p-6 space-y-6 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 300px)" }}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter task title"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <div className="relative z-50">
                        <Popover
                          open={startDateOpen}
                          onOpenChange={setStartDateOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isLoading}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a start date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            align="center"
                            side="bottom"
                            sideOffset={5}
                            style={{
                              zIndex: 1000,
                              position: "relative",
                            }}
                            forceMount
                            collisionPadding={20}
                            avoidCollisions={true}
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setStartDateOpen(false);
                              }}
                              disabled={(date: Date) => {
                                const endDate = form.watch("endDate");
                                return endDate instanceof Date
                                  ? date > endDate
                                  : false;
                              }}
                              initialFocus
                              className="rounded-md border shadow-md"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Due Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <div className="relative z-50">
                        <Popover
                          open={dueDateOpen}
                          onOpenChange={setDueDateOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isLoading}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a due date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            align="center"
                            side="bottom"
                            sideOffset={5}
                            style={{
                              zIndex: 1000,
                              position: "relative",
                            }}
                            forceMount
                            collisionPadding={20}
                            avoidCollisions={true}
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setDueDateOpen(false);
                              }}
                              disabled={(date: Date) => {
                                const startDate = form.watch("startDate");
                                return startDate instanceof Date
                                  ? date < startDate
                                  : false;
                              }}
                              initialFocus
                              className="rounded-md border shadow-md"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Project Selection */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.length > 0 ? (
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No projects available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {projects.length === 0 && (
                      <p className="text-sm text-amber-500 mt-1">
                        You need to create a project first
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status - Only show when editing an existing task */}
              {isEditMode && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "completed"}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? "completed" : "pending");
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Completed</FormLabel>
                        <FormDescription>
                          Mark this task as completed
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {/* Description - Full Width */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Add more details about the task..."
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || projects.length === 0}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2">
                        {isEditMode ? "Updating..." : "Creating..."}
                      </span>
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    </>
                  ) : (
                    <>{isEditMode ? "Update" : "Create"} Task</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
