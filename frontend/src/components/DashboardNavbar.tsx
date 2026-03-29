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
    <header className="sticky top-0 z-20 border-b border-border/80 bg-card/90 shadow-sm backdrop-blur-lg supports-[backdrop-filter]:bg-card/75 safe-pt">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-3 md:h-16 md:gap-4 md:px-6">
        {/* Sidebar: desktop rail toggle; on phones use bottom “Menu” — still show on md+ */}
        <SidebarTrigger className="hidden md:inline-flex touch-manipulation" />

        <div className="min-w-0 md:hidden">
          <span className="block truncate text-sm font-semibold tracking-tight text-foreground">Manage360</span>
          <span className="block truncate text-[10px] text-muted-foreground">Library workspace</span>
        </div>

        {/* Spacer — pushes actions to the right */}
        <div className="flex-1" />

        {/* Right-side actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" className="relative hidden h-11 w-11 touch-manipulation sm:inline-flex md:h-10 md:w-10">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 touch-manipulation rounded-full md:h-10 md:w-10"
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