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
    toast({ title: "Signed out" });
    nav("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Sidebar toggle */}
        <SidebarTrigger />

        {/* Spacer — pushes actions to the right */}
        <div className="flex-1" />

        {/* Right-side actions */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="User menu"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm">
                    {user?.name ?? "Account"}
                  </span>
                  {user?.email && (
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setOpenProfile(true)}>
                Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>

            <LibraryProfileDialog open={openProfile} setOpen={setOpenProfile} />
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}