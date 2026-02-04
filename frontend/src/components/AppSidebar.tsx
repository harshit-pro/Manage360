import {
  LayoutDashboard,
  Users,
  MapPin,
  DollarSign,
  FileText,
  Settings,
  ChevronDown,
  BookOpen
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { currentUser, getLibraryName } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    icon: Users,
    items: [
      { title: "All Students", url: "/students" },
      { title: "Active Students", url: "/students/active" },
      { title: "Add New Student", url: "/students/new" },
    ],
  },
  {
    title: "Seat Map",
    url: "/seat-map",
    icon: MapPin,
  },
  {
    title: "Revenue & Fees",
    icon: DollarSign,
    items: [
      { title: "Monthly Collection", url: "/revenue/monthly" },
      { title: "Pending Fees", url: "/revenue/pending" },
      { title: "Renew Membership", url: "/renew" },
    ],
  },
  {
    title: "Reports",
    icon: FileText,
    items: [
      { title: "Monthly Summary", url: "/reports/monthly" },
      { title: "Defaulter Lists", url: "/reports/defaulters" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Institute Info", url: "/settings/institute" },
      { title: "Admin Account", url: "/settings/account" },
    ],
  },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex flex-col gap-2 px-4 py-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-sm">
                M
              </div>
              {open && (
                <div className="flex flex-col">
                  <h2 className="font-bold text-lg text-foreground tracking-tight leading-none">manage360</h2>
                </div>
              )}
            </div>
            {open && (
              <div className="pl-1">
                <p className="text-sm font-medium text-muted-foreground truncate max-w-[160px]">
                  {currentUser()?.name || "Guest Admin"}
                </p>
                {getLibraryName() && currentUser()?.role === 'OWNER' && (
                  <Badge variant="outline" className="mt-1 text-xs font-normal bg-muted/50">
                    {getLibraryName()}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <div key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full">
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <NavLink
                                    to={subItem.url}
                                    className={({ isActive }) =>
                                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                                    }
                                  >
                                    {subItem.title}
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url!}
                          className={({ isActive }) =>
                            isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                          }
                        >
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
