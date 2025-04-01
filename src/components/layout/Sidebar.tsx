
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Bot, 
  Home, 
  LineChart, 
  Settings, 
  TrendingUp, 
  User,
  Bell,
  AlertTriangle,
  Wallet,
  History
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Arbitrage Scanner', href: '/scanner', icon: TrendingUp },
  { label: 'Trading Bots', href: '/bots', icon: Bot },
  { label: 'Market Analysis', href: '/analysis', icon: BarChart3 },
  { label: 'Performance', href: '/performance', icon: LineChart },
  { label: 'Alerts', href: '/alerts', icon: Bell },
  { label: 'Risk Management', href: '/risk', icon: AlertTriangle },
  { label: 'Portfolio', href: '/portfolio', icon: Wallet },
  { label: 'History', href: '/history', icon: History },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ className, collapsed = false, onToggle }: SidebarProps) => {
  const location = useLocation();
  
  return (
    <div className={cn(
      "flex flex-col h-full bg-slate-900 text-white transition-all duration-300",
      collapsed ? "w-20" : "w-64",
      className
    )}>
      <div className="p-4 flex items-center justify-between border-b border-slate-700">
        <h1 className={cn("font-bold text-xl transition-opacity", 
          collapsed ? "opacity-0 w-0" : "opacity-100")}>
          CryptoArbitrage
        </h1>
        <button 
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-slate-700"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className={cn(
                    "transition-opacity", 
                    collapsed ? "opacity-0 w-0 hidden" : "opacity-100"
                  )}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className={cn(
          "flex items-center gap-3", 
          collapsed ? "justify-center" : "justify-start"
        )}>
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className={cn(
            "transition-opacity", 
            collapsed ? "opacity-0 w-0 hidden" : "opacity-100"
          )}>
            <p className="text-sm font-medium">User Account</p>
            <p className="text-xs text-slate-400">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
