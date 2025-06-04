"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { AssigneeSelect } from "@/components/AssigneeSelect";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { Role } from "@/types/user";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createProject } from "../../../actions/project";
import { ProjectStatus } from "@/types/project";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(["not-started", "in-progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  assignedTo: z
    .array(z.string())
    .min(1, "At least one team member must be assigned"),
});

type ProjectFormValues = z.infer<typeof formSchema>;

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface ProjectFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  teamMembers?: TeamMember[];
  currentUserId: string;
  onSubmit?: (data: ProjectFormValues) => void;
}

export function ProjectForm({
  open,
  setOpen,
  teamMembers = [],
  currentUserId,
}: ProjectFormProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const userRole = session?.user?.role ?? Role.User;
  const isPremiumUser = userRole === Role.Premium;
  const hasTeamMembers = teamMembers.length > 0;

  const handleRedirectToTeam = () => {
    setOpen(false);
    router.push("/team");
  };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "not-started",
      priority: "medium",
      assignedTo: isPremiumUser
        ? hasTeamMembers
          ? [teamMembers[0].id]
          : []
        : [currentUserId],
    },
  });

  const [startDateOpen, setStartDateOpen] = React.useState(false);
  const [endDateOpen, setEndDateOpen] = React.useState(false);

  const handleSubmit = async (data: ProjectFormValues) => {
    if (isPremiumUser && !hasTeamMembers) {
      handleRedirectToTeam();
      return;
    }

    try {
      const now = new Date();
      const projectPayload = {
        name: data.name,
        description: data.description ?? null,
        start_date: data.startDate ?? null,
        due_date: data.endDate ?? null,
        status: data.status.replace("-", "_") as "not_started" | "in_progress" | "completed",
        createdAt: now,
        updatedAt: now,
        ownerId: currentUserId,
        ...(data.assignedTo.length > 0 ? { teamId: data.assignedTo[0] } : {}),
        tasks: [],
        team: null,
        owner: null
      };

      const res = await createProject(projectPayload);
      if (res.success) {
        toast.success("Project created successfully");
        router.refresh();
        setOpen(false);
      } else {
        console.error('Project creation failed:', res.error);
        toast.error(Array.isArray(res.error) ? res.error[0]?.message : res.error || "Failed to create project");
      }
    } catch (error) {
      console.error('Project creation error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  // Check if form submission should be disabled
  const isSubmitDisabled = isPremiumUser && !hasTeamMembers;

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogContent className="w-full max-w-4xl overflow-visible">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isPremiumUser
                ? "As a premium user, you can assign projects to team members."
                : "Fill out the details of the project you want to create."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {isPremiumUser && !hasTeamMembers && (
          <Alert className="mx-6 mt-6">
            <Users className="h-4 w-4" />
            <AlertTitle>Team Members Required</AlertTitle>
            <AlertDescription>
              As a premium user, you need to add team members before creating a
              project.{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={handleRedirectToTeam}
              >
                Add team members now
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
                {/* Project Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter project name"
                          {...field}
                          disabled={isSubmitDisabled}
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
                        disabled={isSubmitDisabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
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
                                disabled={isSubmitDisabled}
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
                            style={{ zIndex: 1000, position: "relative" }}
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
                                return endDate ? date > endDate : false;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <div className="relative z-50">
                        <Popover
                          open={endDateOpen}
                          onOpenChange={setEndDateOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isSubmitDisabled}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick an end date</span>
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
                            style={{ zIndex: 1000, position: "relative" }}
                            forceMount
                            collisionPadding={20}
                            avoidCollisions={true}
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setEndDateOpen(false);
                              }}
                              disabled={(date: Date) => {
                                const startDate = form.watch("startDate");
                                return startDate ? date < startDate : false;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Team Assignment field */}
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <FormControl>
                        <AssigneeSelect
                          value={field.value}
                          onChange={field.onChange}
                          teamMembers={teamMembers}
                          currentUserId={currentUserId}
                          onRedirectToTeam={handleRedirectToTeam}
                        />
                      </FormControl>
                      {isPremiumUser && !hasTeamMembers && (
                        <p className="text-sm text-muted-foreground">
                          Add team members to start assigning tasks
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project description"
                        className="min-h-[100px]"
                        {...field}
                        disabled={isSubmitDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                {isPremiumUser && !hasTeamMembers ? (
                  <Button type="button" onClick={handleRedirectToTeam}>
                    Add Team Members
                  </Button>
                ) : (
                  <Button type="submit">Create Project</Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
