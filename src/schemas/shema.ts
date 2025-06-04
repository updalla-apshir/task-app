import * as z from "zod";

const projectStatusEnum = z.enum(["not_started", "in_progress", "completed"]);

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
  name: z.string(),
  description: z.string().nullable().optional(),
  start_date: z.coerce.date().nullable().optional(),
  due_date: z.coerce.date().nullable().optional(),
  status: projectStatusEnum.default("not_started"),
  createdAt: z.date(),
  updatedAt: z.date(),
  ownerId: z.string(), // ObjectId as string
  teamId: z.array(z.string()), // Changed to array of strings for multiple team members
  owner: z.any(), // Replace with actual `userSchema` if available
  team: z.any(), // Replace with `teamSchema`
  tasks: z.array(z.any()), // Replace with `taskSchema`
});
