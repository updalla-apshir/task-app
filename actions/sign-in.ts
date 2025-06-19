"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const userdata = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      enableTwoFactorAuthentication: user.enableTwoFactorAuthentication,
      role: user.role,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error("Failed to fetch user data");
  }
};

export const resetPassword = async (email: string, password: string) => {
  const NewPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: NewPassword,
      },
    });
  } catch (err) {
    console.error(err);
  }
};
