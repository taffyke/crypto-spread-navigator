
import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/pages/Dashboard';
import Scanner from '@/pages/Scanner';
import Bots from '@/pages/Bots';
import { useLocation, Navigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Determine which page to show based on the current path
  const renderContent = () => {
    const path = location.pathname;
    
    if (path === '/scanner') {
      return <Scanner />;
    } else if (path === '/bots') {
      return <Bots />;
    } else if (path === '/analysis' || path === '/performance' || 
               path === '/alerts' || path === '/risk' || 
               path === '/portfolio' || path === '/history' || 
               path === '/profile' || path === '/settings') {
      // Show a toast notification for routes that aren't fully implemented yet
      setTimeout(() => {
        toast({
          title: "Coming Soon",
          description: "This feature is under development and will be available soon!",
          variant: "default",
        });
      }, 100);
      return <Navigate to="/" />;
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
