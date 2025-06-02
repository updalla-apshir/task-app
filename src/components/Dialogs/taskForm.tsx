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

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  status: z.enum(["planned", "in-progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
});

type TaskFormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit?: (data: TaskFormValues) => void;
}

export function TaskForm({ open, setOpen, onSubmit }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "planned",
      priority: "medium",
    } as TaskFormValues,
  });

  const [startDateOpen, setStartDateOpen] = React.useState(false);
  const [dueDateOpen, setDueDateOpen] = React.useState(false);

  const handleSubmit = (data: TaskFormValues) => {
    if (onSubmit) {
      onSubmit(data);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogContent className="w-full max-w-4xl overflow-visible">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Create New Task
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill out the details of the task you want to create.
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
                        <Input placeholder="Enter task title" {...field} />
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
                                const dueDate = form.watch("dueDate");
                                return dueDate ? date > dueDate : false;
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
                  name="dueDate"
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
                                return startDate ? date < startDate : false;
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <div className="flex justify-end gap-4 p-6 border-t bg-muted/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
