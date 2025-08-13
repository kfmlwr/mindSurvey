"use client";

import { LogOut } from "lucide-react";
import * as React from "react";
import { Logo } from "~/components/Logo";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar";
import { usePathname, Link } from "~/i18n/navigation";
import { logoutAction } from "./logout-action";

const data = [
  {
    title: "Overview",
    url: "#",
    items: [
      {
        title: "Teams",
        url: "/admin/team",
      },
      {
        title: "Admins",
        url: "/admin/users",
      },
      {
        title: "Tags",
        url: "/admin/tags",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="py-8">
        <div className="relative h-20 w-full">
          <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground/60 uppercase">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <form action={logoutAction}>
                  <SidebarMenuButton type="submit" className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                    Abmelden
                  </SidebarMenuButton>
                </form>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
