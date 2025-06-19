"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hash, verify } from "@/lib/auth/password";
import {
  AccountSettingsSchema,
  PasswordUpdateSchema,
  SecuritySettingsSchema,
  PrivacySettingsSchema,
  PremiumUpgradeSchema,
} from "@/schemas/settings";

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
        role: true,
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
        role: user.role,
      },
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
        name: username,
        email,
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

    if (!user || !user.password) {
      return { error: "User not found or no password set" };
    }

    // Verify current password
    const isPasswordValid = await verify(user.password, currentPassword);
    if (!isPasswordValid) {
      return { error: { currentPassword: ["Current password is incorrect"] } };
    }

    // Hash new password
    const hashedPassword = await hash(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    revalidatePath("/settings");
    return { success: "Password updated successfully" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { error: "Failed to update password" };
  }
}

// Update security settings
export async function updateSecuritySettings(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    console.error("No user email in session");
    return { error: "Unauthorized" };
  }

  try {
    const rawValue = formData.get("twoFactorEnabled");
    console.log("Raw twoFactorEnabled value from form:", rawValue);
    
    const twoFactorEnabled = rawValue === "true";
    console.log("Converted twoFactorEnabled value:", twoFactorEnabled);

    const validatedFields = SecuritySettingsSchema.safeParse({
      twoFactorEnabled,
    });

    if (!validatedFields.success) {
      console.error("Validation error:", validatedFields.error.flatten());
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    // Get current user data to verify the change
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        email: true,
        enableTwoFactorAuthentication: true 
      }
    });
    
    console.log("Current user 2FA status:", currentUser?.enableTwoFactorAuthentication);

    if (!currentUser) {
      console.error("User not found in database");
      return { error: "User not found" };
    }

    // Update user with 2FA status
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        enableTwoFactorAuthentication: twoFactorEnabled,
      },
      select: {
        id: true,
        email: true,
        enableTwoFactorAuthentication: true,
      },
    });

    console.log("Updated user 2FA status:", updatedUser.enableTwoFactorAuthentication);

    // Make sure we always return a boolean value, defaulting to false if null
    const updatedTwoFactorEnabled = updatedUser.enableTwoFactorAuthentication === true;

    revalidatePath("/settings");

    return {
      success: `Two-factor authentication ${updatedTwoFactorEnabled ? "enabled" : "disabled"}`,
      twoFactorEnabled: updatedTwoFactorEnabled, // Always a boolean value
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
    const accountVisibility = formData.get("accountVisibility") === "true";
    const activityTracking = formData.get("activityTracking") === "true";
    const dataCollection = formData.get("dataCollection") === "true";

    const validatedFields = PrivacySettingsSchema.safeParse({
      accountVisibility,
      activityTracking,
      dataCollection,
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    // Update user privacy settings
    // This is a simplified implementation
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

    revalidatePath("/settings");
    return { success: "Privacy settings updated successfully" };
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return { error: "Failed to update privacy settings" };
  }
}

// Upgrade to premium
export async function upgradeToPremium(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    console.error("No user email in session");
    return { error: "Unauthorized" };
  }

  try {
    const validatedFields = PremiumUpgradeSchema.safeParse({
      fullName: formData.get("fullName"),
      cardNumber: formData.get("cardNumber"),
      expiryDate: formData.get("expiryDate"),
      cvv: formData.get("cvv"),
    });

    if (!validatedFields.success) {
      console.error("Validation error:", validatedFields.error.flatten());
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    // In a real app, you would process payment here
    // This is a demo so we'll just update the role

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        email: true,
        role: true
      }
    });
    
    if (!currentUser) {
      console.error("User not found in database");
      return { error: "User not found" };
    }

    // Update user role to Premium
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        role: "Premium",
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log("Updated user role:", updatedUser.role);

    revalidatePath("/settings");

    return {
      success: "Successfully upgraded to Premium!",
      role: updatedUser.role,
    };
  } catch (error) {
    console.error("Error upgrading to premium:", error);
    return { error: "Failed to upgrade to premium" };
  }
}
