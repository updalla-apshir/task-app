"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProfileSchema } from "@/schemas/profile";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);

// Get user profile
export async function getUserProfile() {
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
        image: true,
        bio: true,
        phone: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }
    return {
      profile: {
        id: user.id,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "+25261*******",
        bio: user.bio || "This user hasn't added a bio yet.", //
        avatarUrl: user.image || "",
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { error: "Failed to fetch user profile" };
  }
}

// Update user profile
export async function updateUserProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  try {
    const validatedFields = ProfileSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      bio: formData.get("bio"),
      avatarUrl: formData.get("avatarUrl"),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { fullName, email, phone, bio, avatarUrl } = validatedFields.data;

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
        name: fullName,
        email,
        image: avatarUrl || null,
        bio: bio || null,
        phone: phone || null,
      },
    });

    // await prisma.userProfile.upsert({
    //   where: { userId: user.id },
    //   update: {
    //     phone,
    //     bio,
    //   },
    //   create: {
    //     userId: user.id,
    //     phone,
    //     bio,
    //   },
    // });

    revalidatePath("/profile");
    return { success: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { error: "Failed to update user profile" };
  }
}

// Upload avatar
export async function uploadAvatar(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { error: "Unauthorized" };
    }

    const avatarFile = formData.get("avatar") as File | null;

    if (!avatarFile || avatarFile.size === 0) {
      return { error: "No file provided" };
    }

    if (!avatarFile.type.startsWith("image/")) {
      return { error: "File must be an image" };
    }

    const buffer = Buffer.from(await avatarFile.arrayBuffer());

    const fileExt = path.extname(avatarFile.name) || ".jpg";
    const safeFileName = `avatar_${Date.now()}${fileExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    const filePath = path.join(uploadDir, safeFileName);

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write file to disk
    await writeFile(filePath, buffer);

    // Public URL for the uploaded file
    const avatarUrl = `/uploads/avatars/${safeFileName}`;

    // Update user in the database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        image: avatarUrl,
      },
    });

    // Optionally revalidate cache
    revalidatePath("/profile");

    return {
      success: "Avatar uploaded successfully",
      avatarUrl,
    };
  } catch (error) {
    console.error("Error saving avatar:", error);
    return { error: "Failed to upload avatar" };
  }
}
