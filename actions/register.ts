"use server";
import { z } from "zod";
import { userRegisterSchema } from "@/schemas/shema";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const registerUser = async (formData: z.infer<typeof userRegisterSchema>) => {
  const { email, password, confirmPassword } = formData;

  try {
    if (!email || !password || !confirmPassword) {
      return {
        success: false,
        errors: {
          general: ["All fields are required."],
        },
      };
    }

    const values = userRegisterSchema.safeParse(formData);
    if (!values.success) {
      return {
        success: false,
        errors: values.error.flatten().fieldErrors,
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        errors: { email: ["Email already exists"] },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Create JWT token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );
    const token = await new SignJWT({
      id: newUser.id,
      email: newUser.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Return success with token
    return {
      success: true,
      message: "User successfully registered",
      user: {
        id: newUser.id,
        email: newUser.email,
      },
      token,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      errors: { general: ["An error occurred during registration"] },
    };
  }
};

export { registerUser };

export const getUserData = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return "User already exists";
    }

    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return "Error checking user";
  }
};
