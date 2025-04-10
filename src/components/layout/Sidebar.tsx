
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  TrendingUp, 
  Bot, 
  BarChart3, 
  LineChart, 
  Bell, 
  AlertTriangle, 
  Wallet, 
  History, 
  User, 
  Settings,
  Key,
  Book
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  section?: string;
}

// Group navigation items by section
const navItems: NavItem[] = [
  // Main sections
  { label: 'Dashboard', href: '/', icon: Home, section: 'main' },
  { label: 'Arbitrage Scanner', href: '/scanner', icon: TrendingUp, section: 'main' },
  { label: 'Trading Bots', href: '/bots', icon: Bot, section: 'main' },
  { label: 'Market Analysis', href: '/market-analysis', icon: BarChart3, section: 'main' },
  { label: 'Performance', href: '/performance', icon: LineChart, section: 'main' },
  { label: 'Education', href: '/education', icon: Book, section: 'main' },
  
  // Profile and related pages
  { label: 'Profile', href: '/profile', icon: User, section: 'profile' },
  { label: 'Portfolio', href: '/profile/portfolio', icon: Wallet, section: 'profile' },
  { label: 'Alerts', href: '/profile/alerts', icon: Bell, section: 'profile' },
  { label: 'Risk Management', href: '/profile/risk', icon: AlertTriangle, section: 'profile' },
  { label: 'API Keys', href: '/profile/apikeys', icon: Key, section: 'profile' },
  { label: 'Settings', href: '/profile/settings', icon: Settings, section: 'profile' }
];

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ className, collapsed = false, onToggle }: SidebarProps) => {
  const location = useLocation();
  
  // Filter navigation items by section
  const mainNavItems = navItems.filter(item => item.section === 'main');
  const profileNavItems = navItems.filter(item => item.section === 'profile');
  
  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      // For profile main page, only highlight when exactly on /profile
      // For sub-pages, highlight when on that specific sub-page
      let isActive = false;
      
      if (item.href === '/profile') {
        isActive = location.pathname === '/profile';
      } else if (item.section === 'profile' && item.href.includes('/profile/')) {
        isActive = location.pathname === item.href;
      } else {
        isActive = location.pathname === item.href;
      }
      
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
    });
  };
  
  return (
    <div className={cn(
      "flex flex-col h-full bg-slate-900 text-white transition-all duration-300 border-r border-slate-700",
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
          {renderNavItems(mainNavItems)}
        </ul>
        
        {!collapsed && (
          <div className="mt-6 px-4 py-2">
            <h2 className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Profile & Settings</h2>
          </div>
        )}
        
        <ul className="space-y-1 px-2">
          {renderNavItems(profileNavItems)}
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
