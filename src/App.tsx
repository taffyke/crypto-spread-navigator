import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/lib/contexts/AppContext';
import {
  Route,
  Routes,
  BrowserRouter,
  Outlet,
  Link
} from 'react-router-dom';
import { Search, User, Bell, Settings, LogOut, HelpCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Import page components that were causing errors first to ensure they're defined
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import ContactUs from '@/pages/ContactUs';
import NotFound from '@/pages/NotFound';

// Import all other available pages with correct casing
import Dashboard from '@/pages/Dashboard';
import Scanner from '@/pages/Scanner';
import Performance from '@/pages/Performance';
import Bots from '@/pages/Bots';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import Portfolio from '@/pages/Portfolio';
import Alerts from '@/pages/Alerts';
import MarketAnalysis from '@/pages/MarketAnalysis';
import Sidebar from '@/components/layout/Sidebar';
import Charts from '@/pages/Charts';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// Create a layout with sidebar on the left
const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality here
      console.log('Searching for:', searchQuery);
      // For a real implementation, you might navigate to a search results page
      // or filter the current view
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-30 bg-slate-900 border-b border-slate-700 h-16 flex items-center px-4 pl-4 pr-6">
        <div className="flex items-center w-full gap-4">
          {/* Logo (visible only when sidebar is collapsed) */}
          {sidebarCollapsed && (
            <div className="flex items-center font-bold text-xl mr-4">
              <span className="text-blue-500">CSN</span>
            </div>
          )}
          
          {/* Spacer that pushes the right items to the edge */}
          <div className={`flex-1 flex items-center transition-all ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            {/* Global search bar */}
            <form onSubmit={handleSearch} className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                type="search"
                placeholder="Search markets, assets, exchanges..."
                className="pl-10 bg-slate-800 border-slate-700 text-white h-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right-side components */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-slate-800 text-slate-300">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-800 text-slate-300">
              <HelpCircle className="h-5 w-5" />
            </button>
            
            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 rounded-full p-1 hover:bg-slate-800 focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/profile-avatar.jpg" alt="User" />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      AT
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-2 mt-2 bg-slate-800 border-slate-700 text-white">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                  <Link to="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                  <Link to="/profile/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="hover:bg-slate-700 text-red-400 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16"> {/* Add padding-top to offset the fixed header */}
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 transition-all duration-300">
          <div className={`py-6 pl-0 pr-6 ${sidebarCollapsed ? 'ml-[5px]' : 'ml-[5px]'}`}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-4 px-6 text-slate-400 text-sm">
        <div className={`mx-auto flex flex-col md:flex-row justify-between items-center ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="mb-2 md:mb-0">
            © 2024 Crypto Spread Navigator. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/index" element={<Index />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/bots" element={<Bots />} />
              <Route path="/market-analysis" element={<MarketAnalysis />} />
              
              {/* Redirect standalone Portfolio and Alerts to profile tabs */}
              <Route path="/portfolio" element={<Profile initialTab="portfolio" />} />
              <Route path="/alerts" element={<Profile initialTab="alerts" />} />
              
              {/* Profile and profile sub-pages */}
              <Route path="/profile" element={<Profile initialTab="profile" />} />
              <Route path="/profile/portfolio" element={<Profile initialTab="portfolio" />} />
              <Route path="/profile/alerts" element={<Profile initialTab="alerts" />} />
              <Route path="/profile/risk" element={<Profile initialTab="risk" />} />
              <Route path="/profile/settings" element={<Profile initialTab="settings" />} />
              <Route path="/profile/apikeys" element={<Profile initialTab="apikeys" />} />
              
              {/* Footer pages */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<ContactUs />} />
              
              <Route path="/charts/:pair" element={<Charts />} />
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
