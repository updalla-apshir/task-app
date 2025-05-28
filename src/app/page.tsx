import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/lib/auth";
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
    <div className="flex min-h-screen items-center justify-center flex-col">
      <ModeToggle />
      {session.user && (
        <div>
          <p>User: {session.user.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button size="sm" variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
