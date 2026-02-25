import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { DashboardNavbar } from "./DashboardNavbar";

/**
 * Shared layout for all authenticated dashboard pages.
 * Used as a React Router layout route — renders children via <Outlet />.
 */
export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardNavbar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="border-t border-border bg-card px-6 py-3">
            <p className="text-xs text-muted-foreground text-center">
              © 2025 manage360 — Library Management System
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
