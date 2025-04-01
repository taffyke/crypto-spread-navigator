
import React, { useState } from 'react';
import { Bell, Search, Settings, User, ChevronDown, Plus, Bookmark, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  className?: string;
  sidebarCollapsed: boolean;
}

const Header = ({ className, sidebarCollapsed }: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const searchInput = form.elements.namedItem('search') as HTMLInputElement;
    toast({
      title: "Search",
      description: `Searching for: ${searchInput.value}`,
      variant: "default",
    });
  };
  
  const notifications = [
    { id: 1, title: "New arbitrage opportunity", description: "BTC/USDT spread of 2.5% found", time: "5 min ago", isNew: true },
    { id: 2, title: "Trading bot alert", description: "Cross-Exchange BTC/ETH bot completed 3 trades", time: "20 min ago", isNew: true },
    { id: 3, title: "Price alert", description: "ETH price dropped 5% in the last hour", time: "1 hour ago", isNew: false }
  ];
  
  return (
    <header className={cn(
      "bg-slate-800 border-b border-slate-700 text-white h-16 flex items-center justify-between px-4",
      className
    )}>
      <div className="flex-1 flex items-center">
        <form className={cn(
          "relative w-96 max-w-md",
          sidebarCollapsed ? "ml-0" : "ml-2"
        )} onSubmit={handleSearch}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            name="search"
            type="text"
            placeholder="Search coins, exchanges, opportunities..."
            className="w-full pl-10 pr-4 py-2 bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            className="p-2 rounded-md hover:bg-slate-700 relative"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
          >
            <Bell className="h-5 w-5 text-slate-300" />
            {notifications.some(n => n.isNew) && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-medium text-white">Notifications</h3>
                <button 
                  className="text-xs text-blue-400 hover:text-blue-300"
                  onClick={() => toast({ title: "Marked all as read" })}
                >
                  Mark all as read
                </button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700 last:border-0",
                      notification.isNew ? "bg-slate-700/50" : ""
                    )}
                    onClick={() => toast({
                      title: notification.title,
                      description: notification.description
                    })}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-white flex items-center gap-2">
                        {notification.title}
                        {notification.isNew && (
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                      </h4>
                      <span className="text-xs text-slate-400">{notification.time}</span>
                    </div>
                    <p className="text-xs text-slate-400">{notification.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="p-2 border-t border-slate-700">
                <button 
                  className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-1"
                  onClick={() => toast({ title: "View all notifications" })}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="p-2 rounded-md hover:bg-slate-700"
          onClick={() => toast({
            title: "Settings",
            description: "Platform settings will be available soon",
          })}
        >
          <Settings className="h-5 w-5 text-slate-300" />
        </button>
        
        <div className="relative">
          <button 
            className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-700"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-xs font-bold">JD</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-sm font-bold">JD</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">John Doe</h3>
                    <p className="text-xs text-slate-400">Pro Trader</p>
                  </div>
                </div>
              </div>
              
              <div className="py-1">
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                  onClick={() => toast({
                    title: "My Profile",
                    description: "User profile will be available soon",
                  })}
                >
                  <User className="h-4 w-4" />
                  My Profile
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                  onClick={() => toast({
                    title: "API Keys",
                    description: "API key management will be available soon",
                  })}
                >
                  <Plus className="h-4 w-4" />
                  API Keys
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                  onClick={() => toast({
                    title: "Saved Strategies",
                    description: "Your saved strategies will be available soon",
                  })}
                >
                  <Bookmark className="h-4 w-4" />
                  Saved Strategies
                </button>
              </div>
              
              <div className="border-t border-slate-700 py-1">
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
                  onClick={() => toast({
                    title: "Sign Out",
                    description: "You have been signed out",
                    variant: "destructive",
                  })}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
