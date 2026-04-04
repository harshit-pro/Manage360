import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  MapPin,
  DollarSign,
  FileText,
  Settings,
  ChevronDown,
  UserPlus,
  UserCheck,
  List,
  CreditCard,
  Banknote,
  BarChart2,
  AlertTriangle,
  Info,
  UserCog,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { currentUser, getLibraryName } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Location } from "react-router-dom";

/** Match route including query (e.g. /students?tab=all). */
function routeMatches(loc: Pick<Location, "pathname" | "search">, to: string): boolean {
  try {
    const base = "http://local";
    const target = new URL(to, base);
    if (loc.pathname !== target.pathname) return false;
    if (!target.search) return true;
    const want = new URLSearchParams(target.search);
    const have = new URLSearchParams(loc.search);
    for (const [k, v] of want.entries()) {
      if (have.get(k) !== v) return false;
    }
    return true;
  } catch (e) {
    return loc.pathname === to;
  }
}

const menuGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Students",
    items: [
      {
        title: "Students",
        icon: Users,
        children: [
          { title: "All Students", url: "/students?tab=all", icon: List },
          { title: "Active Students", url: "/students?tab=active", icon: UserCheck },
          { title: "Add New Student", url: "/students?tab=add", icon: UserPlus },
        ],
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Revenue & Fees",
        icon: DollarSign,
        children: [
          { title: "Pending Fees", url: "/revenue/pending", icon: CreditCard },
          { title: "Renew Membership", url: "/renew", icon: CreditCard },
          { title: "Record Expense", url: "/expenses", icon: Banknote },
        ],
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        title: "Reports",
        icon: FileText,
        children: [
          { title: "Monthly Summary", url: "/reports/monthly", icon: BarChart2 },
          { title: "Defaulter Lists", url: "/reports/defaulters", icon: AlertTriangle },
        ],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        icon: Settings,
        children: [
          { title: "Institute Info", url: "/settings/institute", icon: Info },
          { title: "Admin Account", url: "/settings/account", icon: UserCog },
        ],
      },
    ],
  },
];

function NavItem({
  item,
}: {
  item: (typeof menuGroups)[0]["items"][0];
}) {
  const { open } = useSidebar();
  const location = useLocation();

  const isChildActive = useMemo(() => 
    "children" in item && item.children?.some((c) => routeMatches(location, c.url)),
    [item, location]
  );

  const [isOpen, setIsOpen] = useState(isChildActive);
  
  // Sync state with route changes (e.g. if we navigate to a child from outside the sidebar)
  useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  // Simple link item (no children)
  if (!('children' in item)) {
    const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + "/");

    if (!open) {
      return (
        <SidebarMenuItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className={cn(
                  "relative h-10 w-10 transition-all duration-300",
                  isActive && "bg-primary/15 text-primary shadow-[0_0_20px_-12px_rgba(var(--primary-rgb),0.5)]"
                )}
              >
                <NavLink to={item.url}>
                  <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-300", isActive && "scale-110")} />
                  <span className="sr-only">{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-semibold bg-primary text-primary-foreground border-none">
              {item.title}
            </TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={cn(
            "relative px-4 py-2.5 transition-all duration-300 group overflow-hidden",
            isActive
              ? "bg-primary/10 text-primary font-semibold shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.1)]"
              : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <NavLink to={item.url} className="flex items-center gap-3 w-full">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
              isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted/50 group-hover:bg-muted"
            )}>
              <item.icon className="h-4 w-4 shrink-0" />
            </div>
            <span className="flex-1">{item.title}</span>
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Group item with children
  if (!open) {
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              isActive={isChildActive ?? false}
              className={cn(
                "h-10 w-10 transition-all duration-300",
                isChildActive && "bg-primary/15 text-primary"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-300", isChildActive && "scale-110")} />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" className="p-1 min-w-[160px] border shadow-xl backdrop-blur-md">
            <div className="flex flex-col gap-0.5">
              <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1">
                {item.title}
              </p>
              {item.children.map((child) => {
                const isItemActive = routeMatches(location, child.url);
                return (
                  <NavLink
                    key={child.url}
                    to={child.url}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-200",
                      isItemActive
                        ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/10"
                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <child.icon className="h-3.5 w-3.5 shrink-0" />
                    {child.title}
                  </NavLink>
                );
              })}
            </div>
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  }

  // Expanded: show collapsible with sub-items
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isChildActive ?? false}
            className={cn(
              "px-4 py-2.5 transition-all duration-300 group",
              isChildActive
                ? "bg-primary/5 text-primary font-semibold"
                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
              isChildActive ? "bg-primary/15 text-primary" : "bg-muted/50 group-hover:bg-muted"
            )}>
              <item.icon className="h-4 w-4 shrink-0" />
            </div>
            <span className="flex-1 text-left ml-3">{item.title}</span>
            <ChevronDown className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-300",
              isOpen ? "rotate-180" : "",
              isChildActive ? "opacity-100" : "opacity-40"
            )} />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <SidebarMenuSub className="ml-8 border-l border-primary/10 space-y-0.5 mt-1 py-1">
            {item.children.map((child) => (
              <SidebarMenuSubItem key={child.url}>
                <SidebarMenuSubButton asChild>
                  <NavLink
                    to={child.url}
                    className={({ isActive }) =>
                      cn(
                        "relative flex items-center gap-3 px-3 py-2 text-sm transition-all duration-200 rounded-lg",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold shadow-[0_0_0_1px_rgba(var(--primary-rgb),0.1)]"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      )
                    }
                  >
                    <child.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{child.title}</span>
                  </NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar() {
  const { open } = useSidebar();
  const user = currentUser();
  const libraryName = getLibraryName();

  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-r-0">
      {/* Brand header */}
      <SidebarHeader className="border-b border-primary/5 bg-gradient-to-b from-card to-card/50">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-[0_8px_16px_-6px_rgba(var(--primary-rgb),0.4)]">
            <span className="relative z-10">M</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          </div>
          {open && (
            <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-lg font-extrabold leading-none tracking-tight text-foreground bg-clip-text">
                Manage<span className="text-primary">360</span>
              </span>
              {user && (
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">
                  {user.name || user.email || "Admin"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Library name badge — only when expanded and OWNER */}
        {open && libraryName && user?.role === "OWNER" && (
          <div className="px-2 pb-3 animate-in fade-in slide-in-from-top-1 duration-500">
            <Badge
              variant="outline"
              className="w-full justify-center py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary transition-all duration-300 hover:bg-primary/10"
            >
              {libraryName}
            </Badge>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-4 gap-4">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label} className="p-0">
            {open && (
              <SidebarGroupLabel className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <NavItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      {open && (
        <SidebarFooter className="border-t border-primary/5 bg-card/50 px-4 py-4">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest text-center">
              © {new Date().getFullYear()} Manage360
            </p>
            <div className="flex items-center justify-center gap-1.5 opacity-50">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <div className="h-1 w-1 rounded-full bg-primary/60" />
              <div className="h-1 w-1 rounded-full bg-primary/30" />
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
