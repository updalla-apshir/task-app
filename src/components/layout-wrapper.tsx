"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Topbar from "@/components/Topbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface LayoutWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  suppressHydrationWarning?: boolean;
}

export function LayoutWrapper({
  children,
  className,
  suppressHydrationWarning,
  ...props
}: LayoutWrapperProps) {
  return (
    <SidebarProvider>
      <div
        className={cn("flex min-h-screen w-full", className)}
        suppressHydrationWarning={suppressHydrationWarning}
        {...props}
      >
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <Topbar>
            <SidebarTrigger />
          </Topbar>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 