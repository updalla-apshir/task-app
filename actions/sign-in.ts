"use server";
import { userLoginSchema } from "@/schemas/shema";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sendVerificationCodeEmail } from "./send-email";
import twoFaAuth from "@/app/(auth)/2fa-auth/page";

export const loginUser = async (formData: z.infer<typeof userLoginSchema>) => {
  const { email, password } = formData;
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const parsedData = userLoginSchema.safeParse(formData);
    if (!parsedData.success) {
      throw new Error("Invalid input data");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User does not exist");
    if (!user.password) throw new Error("User does not have a password set");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid password");

    const isTwoFactorEnabled = user.enableTwoFactorAuthentication;
    if (isTwoFactorEnabled) {
      if (user.email) {
        await sendVerificationCodeEmail(user.email);
        return { requires2fa: true, email: user.email };
      } else {
        throw new Error("User email is null");
      }
    }

    const res: any = await signIn(
      "credentials",
      {
        email: user.email,
        password: formData.password,
      },
      { redirectTo: "/" }
    );
    if (!res || !res.ok) {
      throw new Error("Login failed");
    }
    return { ok: true }; // Indicate successful login
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Optional: rethrow or return error info
  }
};


export const userdata= async(email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return user;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error("Failed to fetch user data");
  }
}