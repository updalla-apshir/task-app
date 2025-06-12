import { z } from "zod";

export const AccountSettingsSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
});

export const PasswordUpdateSchema = z.object({
  currentPassword: z.string().min(8, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Please confirm your password" }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const SecuritySettingsSchema = z.object({
  twoFactorEnabled: z.boolean(),
});

export const PrivacySettingsSchema = z.object({
  accountVisibility: z.boolean(),
  activityTracking: z.boolean(),
  dataCollection: z.boolean(),
}); 