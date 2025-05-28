"use server";

// import { Resend } from "resend";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { generate6DigitCode } from "@/lib/generate6DigitCode";
import bcrypt from "bcryptjs";

// Check for required environment variables
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  throw new Error("Missing email configuration. Please set GMAIL_USER and GMAIL_APP_PASSWORD in your environment variables.");
}

// const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});


export async function sendVerificationCodeEmail(to: string) {
  console.log("Starting verification code email process for:", to);
  
  try {
    // Generate new code
    const code = generate6DigitCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1 * 60 * 1000); // 

    console.log("Generated verification code, expiry:", expiresAt);

    // Delete any existing OTP for this email
    await prisma.oTP.deleteMany({
      where: {
        email: to,
      },
    });

    console.log("Deleted existing OTPs");

    // Create new OTP with hashed password
    await prisma.oTP.create({
      data: {
        email: to,
        code,
        expiresAt,
      },
    });

    console.log("Created new OTP in database");

    // Send email
    const data = await transporter.sendMail({
      from: '"Task Manager App" <your.email@gmail.com>',
      to,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verification Code</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #4a5568; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          <p>This code will expire in 1 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    console.log("Email sent successfully");
    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function verifyCode(email: string, inputCode: string): Promise<boolean | "expired"> {
  try {
    console.log("Verifying code for email:", email);
    console.log("Input code:", inputCode);
    
    // First, find OTP by email and code (ignore expiry for now)
    const otp = await prisma.oTP.findFirst({
      where: {
        email,
        code: inputCode,
      },
    });

    if (!otp) {
      console.log("No OTP found for:", email);
      console.log("Checking all OTPs for this email...");
      
      const allOtps = await prisma.oTP.findMany({
        where: { email },
      });
      
      if (allOtps.length > 0) {
        console.log("Found OTPs for email:", allOtps.map(otp => ({
          code: otp.code,
          expiresAt: otp.expiresAt
        })));
      } else {
        console.log("No OTPs found for this email at all");
      }
      
      return false; // No such OTP at all
    }

    console.log("Found OTP:", {
      code: otp.code,
      inputCode,
      expiresAt: otp.expiresAt,
      now: new Date()
    });

    // Check if OTP is expired
    if (otp.expiresAt <= new Date()) {
      console.log("OTP expired for:", email);
      return "expired"; // OTP found but expired
    }

    // OTP valid, delete it
    await prisma.oTP.delete({
      where: {
        id: otp.id,
      },
    });

    console.log("OTP verified successfully for:", email);
    return true;
  } catch (error) {
    console.error("Verification error:", error);
    // Handle other errors if necessary
    return false;
  }
}


export async function cleanupExpiredOTPs() {
  try {
    const result = await prisma.oTP.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    console.log("Cleaned up expired OTPs:", result.count);
  } catch (error) {
    console.error("Cleanup error:", error);
  }
}