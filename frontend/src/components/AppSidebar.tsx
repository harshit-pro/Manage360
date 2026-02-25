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
          { title: "All Students", url: "/students", icon: List },
          { title: "Active Students", url: "/students/active", icon: UserCheck },
          { title: "Add New Student", url: "/students/new", icon: UserPlus },
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
          { title: "Monthly Collection", url: "/revenue/monthly", icon: Banknote },
          { title: "Pending Fees", url: "/revenue/pending", icon: CreditCard },
          { title: "Renew Membership", url: "/renew", icon: CreditCard },
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

  // Check if any child is active
  const isChildActive =
    "children" in item &&
    item.children?.some((c) => location.pathname.startsWith(c.url));

  // Simple link item (no children)
  if (!('children' in item)) {
    const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + "/");

    if (!open) {
      // Collapsed: show icon with tooltip
      return (
        <SidebarMenuItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton asChild isActive={isActive}>
                <NavLink to={item.url}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.title}
            </TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive}>
          <NavLink to={item.url}>
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Group item with children
  if (!open) {
    // Collapsed: show icon with tooltip, clicking navigates to first child
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton isActive={isChildActive ?? false}>
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" className="p-0 min-w-[140px]">
            <div className="flex flex-col py-1">
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">
                {item.title}
              </p>
              {item.children.map((child) => (
                <NavLink
                  key={child.url}
                  to={child.url}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors ${isActive ? "text-primary font-medium" : "text-foreground"
                    }`
                  }
                >
                  <child.icon className="h-3.5 w-3.5 shrink-0" />
                  {child.title}
                </NavLink>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  }

  // Expanded: show collapsible with sub-items
  return (
    <Collapsible defaultOpen={isChildActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isChildActive ?? false} className="w-full">
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{item.title}</span>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((child) => (
              <SidebarMenuSubItem key={child.url}>
                <SidebarMenuSubButton asChild>
                  <NavLink
                    to={child.url}
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : ""
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
    <Sidebar collapsible="icon">
      {/* Brand header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-primary-foreground font-bold text-sm shadow-sm">
            M
          </div>
          {open && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base text-foreground tracking-tight leading-none">
                manage360
              </span>
              {user && (
                <span className="text-xs text-muted-foreground truncate mt-0.5">
                  {user.name || user.email || "Admin"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Library name badge — only when expanded and OWNER */}
        {open && libraryName && user?.role === "OWNER" && (
          <div className="px-2 pb-1">
            <Badge
              variant="outline"
              className="w-full justify-center text-xs font-normal bg-primary/5 border-primary/20 text-primary truncate"
            >
              {libraryName}
            </Badge>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-1 py-2">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            {open && (
              <SidebarGroupLabel className="px-2 mb-1">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
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
        <SidebarFooter className="border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center py-1">
            © 2025 manage360
          </p>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
