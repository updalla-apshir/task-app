// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Use the direct NextAuth export here
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
