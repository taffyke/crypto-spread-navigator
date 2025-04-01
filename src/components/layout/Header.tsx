
import React from 'react';
import { Bell, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
  sidebarCollapsed: boolean;
}

const Header = ({ className, sidebarCollapsed }: HeaderProps) => {
  return (
    <header className={cn(
      "bg-slate-800 border-b border-slate-700 text-white h-16 flex items-center justify-between px-4",
      className
    )}>
      <div className="flex-1 flex items-center">
        <div className={cn(
          "relative w-96 max-w-md",
          sidebarCollapsed ? "ml-0" : "ml-2"
        )}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search coins, exchanges, opportunities..."
            className="w-full pl-10 pr-4 py-2 bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-slate-700 relative">
          <Bell className="h-5 w-5 text-slate-300" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <button className="p-2 rounded-md hover:bg-slate-700">
          <Settings className="h-5 w-5 text-slate-300" />
        </button>
        
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-xs font-bold">JD</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
