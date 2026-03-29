import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { DashboardNavbar } from "./DashboardNavbar";
import { MobileBottomNav } from "./MobileBottomNav";

/**
 * Shared layout for all authenticated dashboard pages.
 * Used as a React Router layout route — renders children via <Outlet />.
 */
export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh min-h-[100dvh] w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardNavbar />
          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-6 md:py-6 md:pb-6">
            <div className="mx-auto w-full min-w-0 max-w-[1600px] animate-in fade-in duration-300">
              <Outlet />
            </div>
          </main>
          <footer className="hidden border-t border-border bg-card/80 px-4 py-3 backdrop-blur md:block">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Manage360 — built for desk and mobile
            </p>
          </footer>
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
