// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"; // or wherever your code is

export const { GET, POST } = handlers;
