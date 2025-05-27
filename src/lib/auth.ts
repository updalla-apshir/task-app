import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import google from "next-auth/providers/google";
import github from "next-auth/providers/github";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

interface CredentialsInput {
  email: string;
  password: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as CredentialsInput;
        if (!email || !password) {
          throw new Error("Email and password are required.");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        if (!user) {
          throw new Error("Invalid credentials.");
        }

        if (!user.password) {
          throw new Error("Invalid credentials.");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password!);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials.");
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
    google,
    github,
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        if ("pendingEmail" in user) {
          token.pendingEmail = user.pendingEmail;
        } else {
          delete token.pendingEmail;
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
  },
});
