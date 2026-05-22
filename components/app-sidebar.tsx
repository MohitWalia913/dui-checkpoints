"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Map,
  Megaphone,
  Scale,
} from "lucide-react";
import { SidebarHelpCtas } from "@/components/dashboard/sidebar-help-ctas";
import type { DashboardUser } from "@/components/dashboard/dashboard-shell";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import logo from "@/app/logo.png";

const NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Checkpoints",
    url: "/dashboard/checkpoints",
    icon: CalendarClock,
  },
  {
    title: "Map",
    url: "/dashboard/map",
    icon: Map,
  },
  {
    title: "Legal",
    url: "/dashboard/legal",
    icon: Scale,
  },
  {
    title: "Report Checkpoint",
    url: "/dashboard/report",
    icon: Megaphone,
  },
  {
    title: "Review Reports",
    url: "/dashboard/reports",
    icon: ClipboardList,
  },
] as const;

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: DashboardUser }) {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="font-montserrat border-r border-[#1a2d4a]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="DUI Checkpoints Locator"
              className="hover:bg-[#F57E3A]/15 data-[active=true]:bg-[#F57E3A]/20"
            >
              <Link href="/dashboard">
                <Image
                  src={logo}
                  alt="DUI Checkpoints Locator — Statewide, Real-time Alerts"
                  className="h-9 w-auto max-w-[200px] object-contain object-left group-data-[collapsible=icon]:hidden"
                  priority
                />
                <Image
                  src="/favicon.svg"
                  alt="DUI Checkpoints Locator"
                  width={28}
                  height={28}
                  className="hidden rounded-sm group-data-[collapsible=icon]:block"
                  priority
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/50 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.url === "/dashboard"
                  ? pathname === "/dashboard"
                  : item.url === "/dashboard/checkpoints"
                    ? pathname === "/dashboard/checkpoints" ||
                      pathname.startsWith("/dashboard/checkpoints/")
                    : item.url === "/dashboard/map"
                      ? pathname === "/dashboard/map" ||
                        pathname.startsWith("/dashboard/map/")
                      : item.url === "/dashboard/legal"
                        ? pathname === "/dashboard/legal" ||
                          pathname.startsWith("/dashboard/legal/")
                        : item.url === "/dashboard/reports"
                          ? pathname === "/dashboard/reports" ||
                            pathname.startsWith("/dashboard/reports/")
                          : pathname === item.url ||
                            pathname.startsWith(`${item.url}/`);

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    className="text-white/90 hover:bg-[#F57E3A]/15 hover:text-white data-[active=true]:bg-[#F57E3A] data-[active=true]:text-white"
                  >
                    <Link href={item.url}>
                      <item.icon className={isActive ? "text-white" : "text-[#F57E3A]"} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-0 border-t border-white/10 pt-2">
        <SidebarHelpCtas />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
