import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationManager } from '@/lib/notifications/notificationSystem';
import { securityManager } from '@/lib/security/securityManager';
import { marketAnalysisManager } from '@/lib/analytics/marketAnalysis';
import { tradingBotManager } from '@/lib/trading/tradingBot';
import { ExchangeApi, createExchangeApi, wsManager } from '@/lib/exchanges/exchangeApi';

// Create a temporary placeholder for risk manager
// We'll replace this with the proper import once fixed
const riskManager = {
  getDefaultRiskProfile: () => ({ 
    id: 'default-profile-id',
    name: 'Default Profile',
    maxPositionSize: 0.1,
    maxDrawdown: 0.05,
    maxDrawdownPerTrade: 0.02,
    stopLossEnabled: true,
    stopLossType: 'percentage',
    stopLossValue: 0.03,
    takeProfitEnabled: true,
    takeProfitType: 'percentage',
    takeProfitValue: 0.05,
    maxDailyLoss: 0.1,
    maxOpenPositions: 5,
    portfolioAllocation: {
      BTC: 0.3,
      ETH: 0.3,
      other: 0.4
    }
  }),
  getRiskProfiles: () => [
    {
      id: 'default-profile-id',
      name: 'Default Profile',
      maxPositionSize: 0.1,
      maxDrawdown: 0.05,
      maxDrawdownPerTrade: 0.02,
      stopLossEnabled: true,
      stopLossType: 'percentage',
      stopLossValue: 0.03,
      takeProfitEnabled: true,
      takeProfitType: 'percentage',
      takeProfitValue: 0.05,
      maxDailyLoss: 0.1,
      maxOpenPositions: 5,
      portfolioAllocation: {
        BTC: 0.3,
        ETH: 0.3,
        other: 0.4
      }
    }
  ],
  addRiskProfile: () => Promise.resolve('new-profile-id'),
  updateRiskProfile: () => Promise.resolve(true),
  deleteRiskProfile: () => Promise.resolve(true),
  calculatePortfolioRisk: () => ({
    totalValue: 10000,
    riskExposure: 0.05,
    diversificationScore: 0.7,
    volatilityScore: 0.6
  }),
  logRiskEvent: () => Promise.resolve(true)
};

// Define the context type
interface AppContextType {
  // Notification
  notificationManager: typeof notificationManager;
  unreadNotificationCount: number;
  
  // Security
  securityManager: typeof securityManager;
  isAuthenticated: boolean;
  isMasterKeySet: boolean;
  setMasterKey: (key: string) => Promise<boolean>;
  logout: () => void;
  
  // Exchange data
  activeExchanges: string[];
  exchangeApis: Map<string, ExchangeApi>;
  addExchange: (exchangeId: string) => void;
  removeExchange: (exchangeId: string) => void;
  
  // Market Analysis
  marketAnalysisManager: typeof marketAnalysisManager;
  
  // Trading Bots
  tradingBotManager: typeof tradingBotManager;
  
  // Risk Management
  riskManager: typeof riskManager;
  
  // App state
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

// Create the context with a default undefined value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMasterKeySet, setIsMasterKeySet] = useState(false);
  
  // App UI state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Exchange state
  const [activeExchanges, setActiveExchanges] = useState<string[]>(['binance', 'coinbase']);
  const [exchangeApis, setExchangeApis] = useState<Map<string, ExchangeApi>>(new Map());
  
  // Notification state
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  
  // Initialize the app
  useEffect(() => {
    // Initialize exchanges
    const initExchanges = async () => {
      const apiMap = new Map<string, ExchangeApi>();
      
      for (const exchangeId of activeExchanges) {
        try {
          const api = createExchangeApi(exchangeId);
          apiMap.set(exchangeId, api);
        } catch (error) {
          console.error(`Failed to initialize API for exchange ${exchangeId}:`, error);
        }
      }
      
      setExchangeApis(apiMap);
    };
    
    initExchanges();
    
    // Setup dark mode based on user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    // Apply dark mode class to the document
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
    
    // Cleanup function
    return () => {
      // Clean up WebSocket connections
      for (const exchangeId of activeExchanges) {
        wsManager.disconnect(exchangeId, 'ticker/BTC/USDT');
      }
      
      // Clean up exchange APIs
      for (const api of exchangeApis.values()) {
        api.destroy();
      }
    };
  }, []);
  
  // Update document class when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Update unread notification count
  useEffect(() => {
    // Get unread notifications count
    const updateUnreadCount = () => {
      const unreadNotifications = notificationManager.getNotifications({ unreadOnly: true });
      setUnreadNotificationCount(unreadNotifications.length);
    };
    
    // Call initially
    updateUnreadCount();
    
    // Set up interval to periodically check
    const intervalId = setInterval(updateUnreadCount, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Set master encryption key
  const setMasterKey = async (key: string): Promise<boolean> => {
    try {
      const success = await securityManager.initializeEncryption(key);
      
      if (success) {
        setIsMasterKeySet(true);
        
        // Send a notification
        notificationManager.notify(
          'Security Initialized',
          'Your encryption key has been set and security features are now active.',
          'security',
          'high',
          'system'
        );
      }
      
      return success;
    } catch (error) {
      console.error('Failed to set master key:', error);
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setIsMasterKeySet(false);
    
    // Clean up sensitive data
    // In a real app, you would clear more state here
    
    // Send a notification
    notificationManager.notify(
      'Logged Out',
      'You have been successfully logged out.',
      'system',
      'medium',
      'system'
    );
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };
  
  // Add exchange
  const addExchange = (exchangeId: string) => {
    if (activeExchanges.includes(exchangeId)) {
      return; // Already added
    }
    
    try {
      const api = createExchangeApi(exchangeId);
      
      setExchangeApis((prev) => {
        const newMap = new Map(prev);
        newMap.set(exchangeId, api);
        return newMap;
      });
      
      setActiveExchanges((prev) => [...prev, exchangeId]);
      
      // Send a notification
      notificationManager.notify(
        'Exchange Added',
        `${exchangeId.charAt(0).toUpperCase() + exchangeId.slice(1)} has been added to your active exchanges.`,
        'system',
        'medium',
        'system'
      );
    } catch (error) {
      console.error(`Failed to add exchange ${exchangeId}:`, error);
      
      // Send an error notification
      notificationManager.notify(
        'Exchange Addition Failed',
        `Failed to add ${exchangeId}. Please try again.`,
        'system',
        'high',
        'system'
      );
    }
  };
  
  // Remove exchange
  const removeExchange = (exchangeId: string) => {
    if (!activeExchanges.includes(exchangeId)) {
      return; // Not in the list
    }
    
    // Clean up connection
    wsManager.disconnect(exchangeId, 'ticker/BTC/USDT');
    
    const api = exchangeApis.get(exchangeId);
    if (api) {
      api.destroy();
    }
    
    setExchangeApis((prev) => {
      const newMap = new Map(prev);
      newMap.delete(exchangeId);
      return newMap;
    });
    
    setActiveExchanges((prev) => prev.filter(id => id !== exchangeId));
    
    // Send a notification
    notificationManager.notify(
      'Exchange Removed',
      `${exchangeId.charAt(0).toUpperCase() + exchangeId.slice(1)} has been removed from your active exchanges.`,
      'system',
      'medium',
      'system'
    );
  };
  
  // Context value
  const value: AppContextType = {
    // Notification
    notificationManager,
    unreadNotificationCount,
    
    // Security
    securityManager,
    isAuthenticated,
    isMasterKeySet,
    setMasterKey,
    logout,
    
    // Exchange data
    activeExchanges,
    exchangeApis,
    addExchange,
    removeExchange,
    
    // Market Analysis
    marketAnalysisManager,
    
    // Trading Bots
    tradingBotManager,
    
    // Risk Management
    riskManager,
    
    // App state
    isDarkMode,
    toggleDarkMode,
    isMobileMenuOpen,
    toggleMobileMenu
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}; 