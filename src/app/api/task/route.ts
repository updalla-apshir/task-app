// app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Adjust path if needed
import { getTasksForUser } from "../../../../actions/task";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await getTasksForUser(userId);

    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
