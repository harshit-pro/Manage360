import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, BarChart2, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, match: (p: string) => p === "/dashboard" },
  { to: "/students", label: "Students", icon: Users, match: (p: string) => p.startsWith("/students") },
  { to: "/renew", label: "Renew", icon: CreditCard, match: (p: string) => p.startsWith("/renew") },
  { to: "/reports/monthly", label: "Summary", icon: BarChart2, match: (p: string) => p.startsWith("/reports") },
] as const;

/**
 * Thumb-zone navigation for phones. “Menu” opens the same sheet sidebar as the desktop rail.
 */
export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around gap-1 rounded-[2rem] border border-white/20 bg-card/80 px-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
        {items.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "relative flex h-12 w-12 flex-col items-center justify-center transition-all duration-300 active:scale-90",
                active ? "text-primary" : "text-muted-foreground/70 hover:text-foreground"
              )}
            >
              {active && (
                <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-in fade-in zoom-in duration-300" />
              )}
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-300",
                active ? "scale-110 stroke-[2.5px]" : "scale-100"
              )} />
              <span className={cn(
                "mt-0.5 text-[9px] font-bold uppercase tracking-wider transition-all duration-300",
                active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              )}>
                {label}
              </span>
              {active && (
                <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),1)]" />
              )}
            </Link>
          );
        })}
        
        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          className="flex h-12 w-12 flex-col items-center justify-center text-muted-foreground/70 transition-all duration-300 active:scale-90 hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider opacity-0">Menu</span>
        </button>
      </div>
    </nav>
  );
}
