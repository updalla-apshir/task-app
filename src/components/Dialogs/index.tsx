"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskForm } from "./taskForm";

interface TaskDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit?: (data: any) => void;
}

export function TaskDialog({ open, setOpen, onSubmit }: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-4xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto flex flex-col">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl">Create New Task</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill out the details of the task you want to create.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <TaskForm open={open} setOpen={setOpen} onSubmit={onSubmit} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { TaskForm } from "./taskForm"; 