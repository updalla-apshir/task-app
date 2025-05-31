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
    <div className="p-4">
      {/* your page content */}
    </div>
  );
}
