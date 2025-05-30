import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
    <div className="flex">
      {/* <ModeToggle />
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
      )} */}
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1">
          <Topbar>
            <SidebarTrigger />
          </Topbar>
          <main className="p-4"> {/* your page content */} </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
