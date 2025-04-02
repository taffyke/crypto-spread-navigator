import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  History,
  Wallet,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

const Header = ({ sidebarCollapsed }: HeaderProps) => {
  return (
    <header className={cn(
      "h-16 border-b border-slate-700 bg-slate-900 px-4 flex items-center justify-between",
      sidebarCollapsed ? "ml-0" : "ml-0"
    )}>
      {/* Left side */}
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border border-slate-700 bg-slate-800 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Right side */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-slate-300"
          onClick={() => toast({ title: "Notifications", description: "Coming soon!" })}
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 text-[10px] font-semibold flex items-center justify-center p-0 bg-blue-600">
            3
          </Badge>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 h-9 px-2 text-sm text-white hover:bg-slate-800"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src="/avatars/user.png" />
                <AvatarFallback className="bg-blue-700 text-white">AT</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-xs text-slate-300">Alex Thompson</span>
                <span className="text-[10px] text-slate-500">Pro Account</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/portfolio" className="cursor-pointer flex items-center">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Portfolio</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/history" className="cursor-pointer flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  <span>History</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-500 focus:text-red-500"
              onClick={() => toast({ title: "Logout", description: "Logging out is not implemented in this demo" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
