"use client";

import { useSession, signOut } from "next-auth/react";
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
import { use, useEffect, useState } from "react";
import { getUserProfile } from "../../actions/profile";
import { getUserNotifications } from "../../actions/reminder&notif";
import { Badge } from "./ui/badge";

const userProvile = async () => {
  const res = await getUserProfile();
  return res.profile?.avatarUrl;
};

// Define notification type for TypeScript
interface Notification {
  id: string;
  read: boolean;
}

export default function Topbar({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(
    session?.user?.image || null
  );
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user profile avatar URL and update when session changes
  useEffect(() => {
    let isMounted = true;
    const fetchAvatar = async () => {
      const url = await userProvile();
      if (isMounted) {
        setAvatarUrl(url || session?.user?.image || null);
      }
    };
    fetchAvatar();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.image]);

  // Fetch unread notifications count
  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      if (session?.user?.id) {
        const notifications = await getUserNotifications(session.user.id);
        if (isMounted) {
          const count = notifications.filter((notif: Notification) => !notif.read).length;
          setUnreadCount(count);
        }
      }
    };

    if (session?.user?.id) {
      fetchNotifications();
      // Set up interval to refresh notifications
      const interval = setInterval(fetchNotifications, 60000); // Check every minute
      return () => {
        clearInterval(interval);
        isMounted = false;
      };
    }
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  if (status === "loading") return null;

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
        {/* Left Section */}
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-2">{children}</div>

          <div className="hidden md:block w-full max-w-sm">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary" />
              <input
                type="search"
                placeholder="Search anything..."
                className="w-full h-10 pl-10 pr-4 text-sm rounded-full bg-muted/30 backdrop-blur-sm placeholder:text-muted-foreground/80 text-foreground outline-none border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/20 focus:bg-muted/50 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full hover:bg-muted/50 transition-colors"
            asChild
          >
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 min-w-5 text-[10px] flex items-center justify-center px-1"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Link>
          </Button>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={avatarUrl || "/user.png"}
                    alt={session.user?.name || "User"}
                    key={avatarUrl}
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
              className="w-64 p-2 rounded-xl border bg-popover/95 backdrop-blur-sm shadow-lg"
            >
              <div className="flex items-center gap-3 p-2 rounded-md">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarImage
                    src={avatarUrl || "/user.png"}
                    alt={session.user?.name || "User Avatar"}
                    key={avatarUrl}
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
                  href="/notifications"
                  className="flex items-center gap-2 py-1.5"
                >
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto text-[10px] h-5 min-w-5 flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  )}
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

              <DropdownMenuItem
                onClick={() => signOut()}
                className="rounded-md text-red-500 hover:text-red-600 cursor-pointer focus:text-red-600"
              >
                <span className="flex w-full items-center gap-2 py-1.5 text-sm font-medium">
                  Log out
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
