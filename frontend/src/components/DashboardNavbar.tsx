import { Bell, LogOut, User } from "lucide-react";
import { useState } from "react";
import { LibraryProfileDialog } from "@/components/LibraryProfileDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { currentUser, signOut } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

export function DashboardNavbar() {
  const nav = useNavigate();
  const { toast } = useToast();
  const user = currentUser();
  const [openProfile, setOpenProfile] = useState(false);

  const onLogout = () => {
    signOut();
    toast({ title: "Signed out successfully" });
    nav("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-card/60 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-card/40">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 md:px-8">
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <span className="text-sm font-bold">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none tracking-tight text-foreground">Manage360</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Workspace</span>
          </div>
        </div>

        <SidebarTrigger className="hidden md:flex h-10 w-10 rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-95" />

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="group relative h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:bg-primary/10 sm:flex"
          >
            <Bell className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-card bg-destructive group-hover:scale-110 transition-transform" />
          </Button>

          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group flex items-center gap-2 px-2 h-10 rounded-xl hover:bg-primary/5 transition-all duration-300"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <User className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <div className="hidden lg:flex flex-col items-start gap-0">
                  <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
                    {user?.name ?? "Account"}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    {user?.role?.toLowerCase() ?? "admin"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-2 p-2 border-white/10 shadow-2xl backdrop-blur-xl">
              <DropdownMenuLabel className="p-3">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm leading-none">
                    {user?.name ?? "Account"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate opacity-70">
                    {user?.email ?? "manage360@admin.com"}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-white/5 mx--2" />

              <DropdownMenuItem 
                onClick={() => setOpenProfile(true)}
                className="flex items-center gap-2 p-2.5 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/5 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <span className="font-medium">Profile Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/5 mx--2" />

              <DropdownMenuItem
                onClick={onLogout}
                className="flex items-center gap-2 p-2.5 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/5 text-destructive">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>

            <LibraryProfileDialog open={openProfile} setOpen={setOpenProfile} />
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}