// components/Topbar.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Menu, User } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { auth, signOut } from "@/lib/auth";

export default async function Topbar({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-semibold">Not signed in</h2>
        <Button asChild variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4 max-w-screen-2xl mx-auto">
        {/* Left Section: Logo/Menu + Search */}
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-2">{children}</div>

          {/* Search Bar */}
          <div className="hidden md:block w-full max-w-sm">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />

              <input
                type="search"
                placeholder="Search anything..."
                className="w-full h-10 pl-10 pr-4 text-sm rounded-full bg-muted/30 backdrop-blur-sm placeholder:text-muted-foreground/80 text-foreground outline-none border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/20 focus:bg-muted/50 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Right Section: Actions + User */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full hover:bg-muted/50 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </Button>

            <ModeToggle />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user?.image || "/user.png"}
                    alt={session.user?.name || "User"}
                  />
                  <AvatarFallback className="bg-primary/5">
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-flex text-sm font-medium">
                  {session.user?.name || session.user?.email?.split("@")[0]}
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-64 p-2 rounded-xl border dark:bg-[#0e0c0b] bg-popover/95 backdrop-blur-sm shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            >
              <div className="flex items-center gap-3 p-2 rounded-md">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarImage
                    src={session.user?.image || "/user.png"}
                    alt={session.user?.name || "User"}
                  />
                  <AvatarFallback className="bg-primary/5">
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {session.user?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.user?.email}
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild className="rounded-md cursor-pointer">
                <Link
                  href="/account"
                  className="flex items-center gap-2 py-1.5"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-md cursor-pointer">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 py-1.5"
                >
                  <Menu className="h-4 w-4" />
                  <span className="text-sm">Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <DropdownMenuItem className="rounded-md text-red-500 hover:text-red-600 cursor-pointer focus:text-red-600">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 py-1.5"
                  >
                    <span className="text-sm font-medium">Log out</span>
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
