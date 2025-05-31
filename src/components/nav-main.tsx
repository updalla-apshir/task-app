"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const baseMenuItemClasses = "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-hidden transition-colors hover:bg-primary/5 hover:text-primary";
const baseIconClasses = "h-4 w-4";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          if (item.items && item.items.length > 0) {
            const hasActiveChild = item.items.some(subItem => pathname === subItem.url);
            const isExactlyActive = pathname === item.url;
            
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={hasActiveChild || isExactlyActive}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip={item.title}
                      className={cn(baseMenuItemClasses, isExactlyActive && "bg-primary/10 text-primary font-medium")}
                    >
                      {item.icon && (
                        <item.icon 
                          className={cn(
                            baseIconClasses,
                            isExactlyActive ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      )}
                      <span>{item.title}</span>
                      <ChevronRight 
                        className={cn(
                          baseIconClasses,
                          "ml-auto transition-transform duration-200",
                          "group-data-[state=open]/collapsible:rotate-90",
                          isExactlyActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubItemActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={subItem.url}
                                className={cn(
                                  baseMenuItemClasses,
                                  isSubItemActive && "bg-primary/10 text-primary font-medium"
                                )}
                              >
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          } else {
            const isItemActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link
                    href={item.url}
                    className={cn(
                      baseMenuItemClasses,
                      isItemActive && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    {item.icon && (
                      <item.icon 
                        className={cn(
                          baseIconClasses,
                          isItemActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
