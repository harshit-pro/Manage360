import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, Wallet, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, match: (p: string) => p === "/dashboard" },
  { to: "/students", label: "Students", icon: Users, match: (p: string) => p.startsWith("/students") },
  { to: "/renew", label: "Renew", icon: CreditCard, match: (p: string) => p.startsWith("/renew") },
  { to: "/revenue/pending", label: "Fees", icon: Wallet, match: (p: string) => p.startsWith("/revenue") },
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
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/90 shadow-[0_-8px_30px_-12px_hsl(var(--foreground)/0.12)] backdrop-blur-xl supports-[backdrop-filter]:bg-card/75 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-1 px-1 pt-1">
        {items.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 touch-manipulation transition-colors active:scale-[0.97]",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground active:bg-muted/80",
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active && "stroke-[2.25px]")} aria-hidden />
              <span className="max-w-full truncate text-[10px] font-semibold leading-tight tracking-tight">
                {label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          className="flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-muted-foreground touch-manipulation transition-colors active:scale-[0.97] active:bg-muted/80"
        >
          <Menu className="h-5 w-5 shrink-0" aria-hidden />
          <span className="max-w-full truncate text-[10px] font-semibold leading-tight tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
