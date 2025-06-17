import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardLayout />
    </div>
  );
}
