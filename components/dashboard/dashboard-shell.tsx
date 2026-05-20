"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { HeaderHelpCtas } from "@/components/dashboard/sidebar-help-ctas";
import { DashboardOnboarding } from "@/components/onboarding/dashboard-onboarding";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const sidebarTheme = {
  "--sidebar": "hsl(218, 78%, 7%)",
  "--sidebar-foreground": "hsl(0, 0%, 100%)",
  "--sidebar-primary": "hsl(22, 90%, 59%)",
  "--sidebar-primary-foreground": "hsl(0, 0%, 100%)",
  "--sidebar-accent": "hsl(218, 45%, 12%)",
  "--sidebar-accent-foreground": "hsl(0, 0%, 100%)",
  "--sidebar-border": "hsl(218, 35%, 16%)",
  "--sidebar-ring": "hsl(22, 90%, 59%)",
} as React.CSSProperties;

export type DashboardUser = {
  name: string;
  email: string;
};

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMapRoute =
    pathname === "/dashboard/map" || pathname.startsWith("/dashboard/map/");
  const [sidebarOpen, setSidebarOpen] = useState(!isMapRoute);
  const wasMapRouteRef = useRef(isMapRoute);

  useEffect(() => {
    const wasMapRoute = wasMapRouteRef.current;
    if (isMapRoute && !wasMapRoute) {
      setSidebarOpen(false);
    } else if (!isMapRoute && wasMapRoute) {
      setSidebarOpen(true);
    }
    wasMapRouteRef.current = isMapRoute;
  }, [isMapRoute]);

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="dark flex min-h-svh w-full bg-[#040F20] text-white"
        style={sidebarTheme}
      >
        <AppSidebar user={user} />
        <SidebarInset className="min-w-0 flex-1 bg-[#040F20] font-inter text-white">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#040F20] px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-white hover:bg-[#F57E3A]/15 hover:text-[#F57E3A]" />
              <Separator
                orientation="vertical"
                className="mr-2 bg-white/15 data-[orientation=vertical]:h-4"
              />
              <span className="font-montserrat text-sm font-semibold text-white">
                DUI Checkpoints Locator
              </span>
            </div>
            <HeaderHelpCtas />
          </header>
          <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </SidebarInset>
        <DashboardOnboarding userEmail={user.email} />
      </SidebarProvider>
    </TooltipProvider>
  );
}
