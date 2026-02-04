import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { DashboardNavbar } from "./DashboardNavbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
          <footer className="border-t border-border bg-card px-6 py-4">
            <p className="text-sm text-muted-foreground text-center">
              © Study Library Admin Portal 2025 – Managed by Harshit Mishra
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
