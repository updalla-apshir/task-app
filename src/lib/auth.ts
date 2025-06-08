import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import google from "next-auth/providers/google";
import github from "next-auth/providers/github";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@/types/user";
import { JWT } from "next-auth/jwt";

interface CredentialsInput {
  email: string;
  password: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  // Configure trusted hosts
  trustHost: true,

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

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
          throw new Error("Invalid credentials.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials.");
        }

        // Map custom role to the expected string union type
        return user;
      },
    }),
    google,
    github,
  ],

  session: {
    strategy: "jwt",
    maxAge: 86400, // 24 hours in seconds
    updateAge: 0,
  },

  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: {
        id?: string;
      };
    }) {
      // First login: user is available
      if (user?.id) {
        token.id = user.id;
      }

      // Always fetch role from DB using token.id
      if (token?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });

        token.role = (dbUser?.role ?? Role.User) as Role;
      }

      return token;
    },
    session({ session, token }) {
      console.log("SESSION callback token:", token); // ✅ Should now include role
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (!user?.email || !account?.provider || !account?.providerAccountId) {
        return false; // Reject if crucial data is missing
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: true },
      });

      if (existingUser) {
        const isLinked = existingUser.accounts.some(
          (acc) => acc.provider === account.provider
        );

        if (!isLinked) {
          // Link this new OAuth account to the existing user
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
            },
          });
        }
      }

      return true;
    },
  },

  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
  },
});
