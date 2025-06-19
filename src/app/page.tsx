import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col">
        Not signed in
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardLayout />
    </div>
  );
}
