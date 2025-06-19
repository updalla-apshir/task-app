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

export const PremiumUpgradeSchema = z.object({
  fullName: z.string().min(3, { message: "Full name is required" }),
  cardNumber: z.string()
    .min(16, { message: "Card number must be at least 16 digits" })
    .max(19, { message: "Card number cannot exceed 19 digits" })
    .regex(/^\d+$/, { message: "Card number must contain only digits" }),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Expiry date must be in MM/YY format" }),
  cvv: z.string()
    .min(3, { message: "CVV must be at least 3 digits" })
    .max(4, { message: "CVV cannot exceed 4 digits" })
    .regex(/^\d+$/, { message: "CVV must contain only digits" }),
}); 