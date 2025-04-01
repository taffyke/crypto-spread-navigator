
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/pages/Dashboard';
import Scanner from '@/pages/Scanner';
import Bots from '@/pages/Bots';
import { useLocation, Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';

// Component for "Coming Soon" pages
const ComingSoonPage = ({ pageName }: { pageName: string }) => {
  return (
    <div className="flex items-center justify-center h-full w-full p-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{pageName}</h2>
        <p className="text-slate-400 mb-8">
          We're working hard to bring you real-time {pageName.toLowerCase()} features. 
          Stay tuned for updates coming soon!
        </p>
        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full rounded-full" style={{ width: '70%' }}></div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Development in progress: 70%</p>
      </div>
    </div>
  );
};

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);
  
  // Determine which page to show based on the current path
  const renderContent = () => {
    const path = location.pathname;
    
    if (path === '/scanner') {
      return <Scanner />;
    } else if (path === '/bots') {
      return <Bots />;
    } else if (path === '/analysis') {
      return <ComingSoonPage pageName="Market Analysis" />;
    } else if (path === '/performance') {
      return <ComingSoonPage pageName="Performance Analytics" />;
    } else if (path === '/alerts') {
      return <ComingSoonPage pageName="Alerts Configuration" />;
    } else if (path === '/risk') {
      return <ComingSoonPage pageName="Risk Management" />;
    } else if (path === '/portfolio') {
      return <ComingSoonPage pageName="Portfolio Tracking" />;
    } else if (path === '/history') {
      return <ComingSoonPage pageName="Trading History" />;
    } else if (path === '/profile') {
      return <ComingSoonPage pageName="User Profile" />;
    } else if (path === '/settings') {
      return <ComingSoonPage pageName="Settings" />;
    }
    
    // Default to Dashboard for other routes
    return <Dashboard />;
  };
  
  return (
    <div className="min-h-screen flex bg-slate-900 text-white">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarCollapsed={sidebarCollapsed} />
        
        <main className="flex-1 overflow-y-auto bg-slate-900">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
