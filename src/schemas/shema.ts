import * as z from "zod";
import { TaskPriority, ProjectStatus } from "@prisma/client";

const projectStatusEnum = z.nativeEnum(ProjectStatus);
const projectPriority = z.nativeEnum(TaskPriority);

export const userRegisterSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
  });

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: projectStatusEnum,
  priority: projectPriority,
  createdAt: z
    .date()
    .optional()
    .default(() => new Date()),
  updatedAt: z
    .date()
    .optional()
    .default(() => new Date()),
  ownerId: z.string(),
  assignedTo: z.array(z.string()),
  owner: z.any().optional(),
  team: z.any().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["completed", "pending"]),
  priority: projectPriority,
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  createdAt: z.date(),
  projectId: z.string(),
  createdBy: z.string().optional(),
});
