import { Search, Plus, Bell, Settings, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Navigation Links */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary"></div>
            <span className="font-semibold">Dashboard</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Overview</a>
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Projects</a>
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Analytics</a>
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Reports</a>
          </nav>
        </div>

        {/* Search, Actions, and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="w-64 pl-9"
            />
          </div>

          {/* New Project Button */}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p>John Doe</p>
                  <p className="text-muted-foreground">john@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}