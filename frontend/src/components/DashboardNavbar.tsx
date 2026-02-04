import { Bell, LogOut, User } from "lucide-react";
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
import { Link, useNavigate } from "react-router-dom";
import { currentUser, signOut } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

export function DashboardNavbar() {
  const nav = useNavigate();
  const { toast } = useToast();
  const user = currentUser();

  const onLogout = () => {
    signOut();
    toast({ title: "Signed out" });
    nav("/", { replace: true });
  };
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger />

        <div className="flex-1 flex items-center justify-center gap-6">
          <nav className="hidden md:flex gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Home</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/renew">Renew Membership</Link></Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user ? user.name : "Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
