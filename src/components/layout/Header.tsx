
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notificationManager } from '@/lib/notifications/notificationSystem';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

const Header = ({ sidebarCollapsed }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const searchableRoutes = [
    { name: 'Dashboard', path: '/' },
    { name: 'Scanner', path: '/scanner' },
    { name: 'Bots', path: '/bots' },
    { name: 'Market Analysis', path: '/analysis' },
    { name: 'Performance', path: '/performance' },
    { name: 'Alerts', path: '/alerts' },
    { name: 'Risk Management', path: '/risk' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Trading History', path: '/history' },
    { name: 'User Profile', path: '/profile' },
    { name: 'Settings', path: '/settings' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      const foundRoute = searchableRoutes.find(route => 
        route.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (foundRoute) {
        navigate(foundRoute.path);
        toast({
          title: "Page Found",
          description: `Navigating to ${foundRoute.name}`,
        });
        setSearchQuery('');
      } else {
        toast({
          title: "Search Result",
          description: "No matching pages found",
          variant: "destructive"
        });
      }
    }
  };

  // Sample notifications data - in a real app, this would come from the notification system
  const notifications = notificationManager.getNotifications({ limit: 5 });
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const showNotification = () => {
    setNotificationsOpen(false);
    
    // Create demo notification
    notificationManager.notify(
      "New Arbitrage Opportunity", 
      "BTC price difference detected between Binance and Coinbase: $120",
      "arbitrage_opportunity",
      "high",
      "scanner"
    );

    toast({
      title: "Notification System",
      description: "New notification has been created!",
    });
  };

  return (
    <header className={cn(
      "h-16 border-b border-slate-700 bg-slate-900 px-4 flex items-center justify-between",
      sidebarCollapsed ? "ml-0" : "ml-0"
    )}>
      {/* Left side */}
      <div className="flex items-center">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search pages..."
            className="h-9 w-64 rounded-md border border-slate-700 bg-slate-800 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      
      {/* Right side */}
      <div className="flex items-center space-x-4">
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-slate-300"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 text-[10px] font-semibold flex items-center justify-center p-0 bg-blue-600">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-slate-800 border-slate-700">
            <div className="p-3 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-medium text-white">Notifications</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => notificationManager.markAllAsRead()}
                className="text-xs text-slate-400 hover:text-white"
              >
                Mark all as read
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 border-b border-slate-700 hover:bg-slate-700 cursor-pointer ${!notification.isRead ? 'bg-slate-700/40' : ''}`}
                    onClick={() => notificationManager.markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm text-white">{notification.title}</p>
                      <span className="text-xs text-slate-500">
                        {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-slate-700 flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => showNotification()}
              >
                Demo Notification
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
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
          
          <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-white" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />
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
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem 
              className="text-red-500 focus:text-red-500"
              onClick={() => setAlertDialogOpen(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout confirmation dialog */}
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600 border-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={() => {
                toast({ 
                  title: "Logged Out", 
                  description: "You have been successfully logged out." 
                });
              }}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default Header;
