"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { 
  AccountSettingsSchema, 
  PasswordUpdateSchema, 
  SecuritySettingsSchema,
  PrivacySettingsSchema
} from "@/schemas/settings";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Get user settings
export async function getUserSettings() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    return { 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      } 
    };
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return { error: "Failed to fetch user settings" };
  }
}

// Update account settings
export async function updateAccountSettings(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  try {
    const validatedFields = AccountSettingsSchema.safeParse({
      email: formData.get("email"),
      username: formData.get("username"),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { email, username } = validatedFields.data;

    // Check if email is already taken (if changing email)
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return { error: { email: ["Email already in use"] } };
      }
    }

    // Update user
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        email,
        name: username,
      },
    });

    revalidatePath("/settings");
    return { success: "Account settings updated successfully" };
  } catch (error) {
    console.error("Error updating account settings:", error);
    return { error: "Failed to update account settings" };
  }
}

// Update password
export async function updatePassword(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  try {
    const validatedFields = PasswordUpdateSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user?.password) {
      return { error: "User not found or no password set" };
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return { error: { currentPassword: ["Current password is incorrect"] } };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: "Password updated successfully" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { error: "Failed to update password" };
  }
}

// Update security settings (2FA)
export async function updateSecuritySettings(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  try {
    const validatedFields = SecuritySettingsSchema.safeParse({
      twoFactorEnabled: formData.get("twoFactorEnabled") === "true",
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { twoFactorEnabled } = validatedFields.data;

    // For this example, we'll just simulate 2FA setup
    // In a real app, you would implement actual 2FA logic here

    // Update user preferences in a real app
    // await prisma.user.update({
    //   where: { email: session.user.email },
    //   data: {
    //     twoFactorEnabled,
    //   },
    // });

    return { 
      success: twoFactorEnabled 
        ? "Two-factor authentication enabled" 
        : "Two-factor authentication disabled" 
    };
  } catch (error) {
    console.error("Error updating security settings:", error);
    return { error: "Failed to update security settings" };
  }
}

// Update privacy settings
export async function updatePrivacySettings(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  try {
    const validatedFields = PrivacySettingsSchema.safeParse({
      accountVisibility: formData.get("accountVisibility") === "true",
      activityTracking: formData.get("activityTracking") === "true",
      dataCollection: formData.get("dataCollection") === "true",
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { accountVisibility, activityTracking, dataCollection } = validatedFields.data;

    // For this example, we'll just simulate privacy settings
    // In a real app, you would store these preferences in your database

    // Update user preferences in a real app
    // await prisma.userPreferences.upsert({
    //   where: { userId: session.user.id },
    //   update: {
    //     accountVisibility,
    //     activityTracking,
    //     dataCollection,
    //   },
    //   create: {
    //     userId: session.user.id,
    //     accountVisibility,
    //     activityTracking,
    //     dataCollection,
    //   },
    // });

    return { success: "Privacy settings updated successfully" };
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return { error: "Failed to update privacy settings" };
  }
} 