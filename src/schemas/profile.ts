import { z } from "zod";

export const ProfileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  bio: z.string().max(500, { message: "Bio must be less than 500 characters" }).optional(),
  avatarUrl: z.string().optional(),
}); 