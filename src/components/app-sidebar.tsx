"use client";

import * as React from "react";
import {
  AudioWaveform,
  BarChart2,
  CalendarDays,
  Command,
  FolderKanban,
  GalleryVerticalEnd,
  LayoutDashboard,
  ListChecks,
  Paperclip,
  Settings2,
  Users,
} from "lucide-react";

import { NavMain } from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Logo from "./Logo";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: LayoutDashboard,
    },

    {
      title: "Projects",
      url: "/projects",
      icon: FolderKanban,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: ListChecks,
      items: [
        { title: "All Tasks", url: "/tasks" },
        { title: "Due today", url: "/tasks/today" },
        { title: "Upcoming", url: "/tasks/upcoming" },
        { title: "Completed", url: "/tasks/completed" },
      ],
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: CalendarDays,
    },
    {
      title: "Teams",
      url: "/teams",
      icon: Users,
    },
    {
      title: "Files",
      url: "/files",
      icon: Paperclip,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart2,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen } = useSidebar();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    if (state === "collapsed") {
      setIsHovered(true);
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (isHovered) {
      setIsHovered(false);
      setOpen(false);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <SidebarHeader className="border-b border-border/50">
        <Logo isCollapsed={state === "collapsed"} />
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
