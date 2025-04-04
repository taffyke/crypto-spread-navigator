import React, { useState } from 'react';
import { Bot, Play, Pause, Settings, Plus, ChevronDown, AlertTriangle, Trash2, BarChart3, X, Save, Calendar, Clock, Bell, ChartBar, History, FileText, RefreshCw, Copy, Zap, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface TradingBot {
  id: string;
  name: string;
  type: 'arbitrage' | 'triangular' | 'statistical' | 'custom';
  status: 'active' | 'paused' | 'stopped';
  profitToday: number;
  profitTotal: number;
  exchanges: string[];
  pairs: string[];
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  tradesTaken: number;
  successRate: number;
  lastActivity: Date | null;
  accuracySettings: {
    slippage: number;
    minProfitThreshold: number;
    maxExecutionTime: number;
    gasLimit: number;
  };
  // Additional advanced settings
  schedule?: {
    enabled: boolean;
    startTime?: string;
    endTime?: string;
    daysOfWeek?: string[];
    interval?: number; // in minutes
  };
  riskManagement?: {
    dailyLossLimit: number; // in USD
    maxTradesPerDay: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
    cooldownAfterLoss: number; // in minutes
  };
  notifications?: {
    onTrade: boolean;
    onError: boolean;
    onProfit: boolean;
    profitThreshold: number;
    emailNotifications: boolean;
  };
  networkPreferences?: {
    preferredNetworks: string[]; // Networks in order of preference
    autoSelectBestNetwork: boolean;
    allowCrossChainArbitrage: boolean;
    maxGasPrice: number; // Maximum gas price willing to pay
    networkFeeReserve: number; // Amount to reserve for network fees
  };
}

const mockBots: TradingBot[] = [
  {
    id: 'universal-bot',
    name: 'Universal Auto-Execute Bot',
    type: 'custom',
    status: 'active',
    profitToday: 45.67,
    profitTotal: 892.31,
    exchanges: ['Any Exchange with API Keys'],
    pairs: ['Any Trading Pair'],
    riskLevel: 'medium',
    createdAt: new Date('2023-09-01'),
    tradesTaken: 124,
    successRate: 94.8,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000),
    accuracySettings: {
      slippage: 0.3,
      minProfitThreshold: 0.15,
      maxExecutionTime: 45,
      gasLimit: 0.01
    },
    schedule: {
      enabled: true,
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      interval: 1
    },
    riskManagement: {
      dailyLossLimit: 200,
      maxTradesPerDay: 100,
      stopLossPercentage: 1.0,
      takeProfitPercentage: 2.5,
      cooldownAfterLoss: 10
    },
    notifications: {
      onTrade: true,
      onError: true,
      onProfit: true,
      profitThreshold: 2.0,
      emailNotifications: true
    },
    networkPreferences: {
      preferredNetworks: ['ETH', 'BSC', 'SOL'],
      autoSelectBestNetwork: true,
      allowCrossChainArbitrage: false,
      maxGasPrice: 100,
      networkFeeReserve: 20
    }
  },
  {
    id: 'bot-1',
    name: 'Cross-Exchange BTC/ETH',
    type: 'arbitrage',
    status: 'active',
    profitToday: 128.45,
    profitTotal: 2361.87,
    exchanges: ['Binance', 'Coinbase'],
    pairs: ['BTC/USDT', 'ETH/USDT'],
    riskLevel: 'medium',
    createdAt: new Date('2023-10-15'),
    tradesTaken: 347,
    successRate: 92.4,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000),
    accuracySettings: {
      slippage: 0.5,
      minProfitThreshold: 0.2,
      maxExecutionTime: 30,
      gasLimit: 0.01
    },
    schedule: {
      enabled: false,
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      interval: 5
    },
    riskManagement: {
      dailyLossLimit: 100,
      maxTradesPerDay: 50,
      stopLossPercentage: 1.5,
      takeProfitPercentage: 3.0,
      cooldownAfterLoss: 15
    },
    notifications: {
      onTrade: true,
      onError: true,
      onProfit: false,
      profitThreshold: 5.0,
      emailNotifications: false
    }
  },
  {
    id: 'bot-2',
    name: 'Triangular Arbitrage SOL',
    type: 'triangular',
    status: 'paused',
    profitToday: 0,
    profitTotal: 876.23,
    exchanges: ['Kraken'],
    pairs: ['SOL/BTC', 'BTC/USDT', 'SOL/USDT'],
    riskLevel: 'high',
    createdAt: new Date('2023-11-22'),
    tradesTaken: 124,
    successRate: 86.3,
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    accuracySettings: {
      slippage: 1.0,
      minProfitThreshold: 0.5,
      maxExecutionTime: 15,
      gasLimit: 0.02
    },
    schedule: {
      enabled: false,
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      interval: 5
    },
    riskManagement: {
      dailyLossLimit: 100,
      maxTradesPerDay: 50,
      stopLossPercentage: 1.5,
      takeProfitPercentage: 3.0,
      cooldownAfterLoss: 15
    },
    notifications: {
      onTrade: true,
      onError: true,
      onProfit: false,
      profitThreshold: 5.0,
      emailNotifications: false
    }
  },
  {
    id: 'bot-3',
    name: 'Low Risk USDC/USDT',
    type: 'statistical',
    status: 'active',
    profitToday: 15.22,
    profitTotal: 487.65,
    exchanges: ['Binance', 'KuCoin', 'Gate.io'],
    pairs: ['USDC/USDT'],
    riskLevel: 'low',
    createdAt: new Date('2024-01-05'),
    tradesTaken: 845,
    successRate: 98.7,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000),
    accuracySettings: {
      slippage: 0.1,
      minProfitThreshold: 0.05,
      maxExecutionTime: 60,
      gasLimit: 0.005
    },
    schedule: {
      enabled: false,
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      interval: 5
    },
    riskManagement: {
      dailyLossLimit: 100,
      maxTradesPerDay: 50,
      stopLossPercentage: 1.5,
      takeProfitPercentage: 3.0,
      cooldownAfterLoss: 15
    },
    notifications: {
      onTrade: true,
      onError: true,
      onProfit: false,
      profitThreshold: 5.0,
      emailNotifications: false
    }
  }
];

const botTemplates = [
  {
    name: 'Cross-Exchange Arbitrage',
    description: 'Buy low on one exchange, sell high on another',
    type: 'arbitrage',
    complexity: 'Beginner',
    expectedProfit: '1-3%'
  },
  {
    name: 'Triangular Arbitrage',
    description: 'Trade between three pairs to capture price inefficiencies',
    type: 'triangular',
    complexity: 'Intermediate',
    expectedProfit: '0.5-2%'
  },
  {
    name: 'Statistical Arbitrage',
    description: 'Use mean reversion strategies between correlated assets',
    type: 'statistical',
    complexity: 'Advanced',
    expectedProfit: '1-5%'
  },
  {
    name: 'Custom Strategy',
    description: 'Build your own custom trading strategy',
    type: 'custom',
    complexity: 'Variable',
    expectedProfit: 'Variable'
  }
];

const availableExchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Gate.io', 'OKX', 'Bybit'];
const availablePairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 'DOT/USDT', 'USDC/USDT'];
const availableNetworks = ['ETH', 'BSC', 'SOL', 'AVAX', 'MATIC', 'ARB', 'OP', 'TRX', 'ADA'];

const Bots = () => {
  const [activeBots, setActiveBots] = useState<TradingBot[]>(mockBots);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBotModal, setShowBotModal] = useState(false);
  const [editingBot, setEditingBot] = useState<TradingBot | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'risk' | 'notifications' | 'networks'>('basic');
  const [newBot, setNewBot] = useState<Partial<TradingBot>>({
    name: '',
    type: 'arbitrage',
    exchanges: [],
    pairs: [],
    riskLevel: 'medium',
    accuracySettings: {
      slippage: 0.5,
      minProfitThreshold: 0.2,
      maxExecutionTime: 30,
      gasLimit: 0.01
    },
    schedule: {
      enabled: false,
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      interval: 5
    },
    riskManagement: {
      dailyLossLimit: 100,
      maxTradesPerDay: 50,
      stopLossPercentage: 1.5,
      takeProfitPercentage: 3.0,
      cooldownAfterLoss: 15
    },
    notifications: {
      onTrade: true,
      onError: true,
      onProfit: false,
      profitThreshold: 5.0,
      emailNotifications: false
    },
    networkPreferences: {
      preferredNetworks: ['ETH', 'BSC', 'SOL'],
      autoSelectBestNetwork: true,
      allowCrossChainArbitrage: false,
      maxGasPrice: 100,
      networkFeeReserve: 20
    }
  });
  
  // Universal bot active trades
  const [universalBotTrades, setUniversalBotTrades] = useState<{
    id: string;
    pair: string;
    buyExchange: string;
    sellExchange: string;
    amount: number;
    startTime: Date;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    profit?: number;
  }[]>([]);
  
  // Universal bot settings
  const [universalBotSettings, setUniversalBotSettings] = useState({
    capital: 100, // Default trade capital amount in USD
    minSpread: 1.5, // Minimum spread percentage to trigger auto-execution
    apiVerification: 'strict' as 'strict' | 'moderate' | 'lenient', // API verification level
    autoStart: false, // Whether to auto-start trades without confirmation
    maxConcurrentTrades: 3, // Maximum number of concurrent trades
    maxDailyCapital: 1000, // Maximum daily capital to use
    enabledExchanges: ['Binance', 'Coinbase', 'Kraken', 'KuCoin'], // Enabled exchanges for universal bot
    preferredNetworks: ['ETH', 'BSC', 'SOL'], // Preferred networks for transfers in priority order
    minBalance: 50, // Minimum balance to maintain in exchange accounts
    riskLimit: 'medium' as 'low' | 'medium' | 'high', // Risk tolerance level
    allowCrossChainArbitrage: false, // Whether to allow cross-chain arbitrage
    maxGasPrice: 100, // Maximum gas price in GWEI
    networkFeeReserve: 20 // Amount to reserve for network fees
  });
  
  // Check URL parameters for universal bot activation
  React.useEffect(() => {
    // In a real implementation, this would parse URL parameters
    // and load the opportunity details from an API or state management
    const urlParams = new URLSearchParams(window.location.search);
    const isUniversalActivated = urlParams.get('universal') === 'true';
    const opportunityId = urlParams.get('opportunityId');
    
    if (isUniversalActivated && opportunityId) {
      // Simulate getting opportunity data
      // In production, this would come from your state management or API
      simulateReceiveOpportunityData(opportunityId);
      
      // Highlight the universal bot
      highlightUniversalBot();
    }
  }, []);
  
  // Simulate receiving opportunity data and activating the universal bot
  const simulateReceiveOpportunityData = (opportunityId: string) => {
    // Mock opportunity data - in production this would come from your API
    const mockOpportunity = {
      id: opportunityId,
      pair: 'BTC/USDT',
      buyExchange: 'Binance',
      sellExchange: 'Coinbase',
      buyPrice: 29500,
      sellPrice: 30100,
      spreadPercentage: 2.03,
      timestamp: new Date()
    };
    
    // Start a new trade with the universal bot
    const newTrade = {
      id: `trade-${Date.now()}`,
      pair: mockOpportunity.pair,
      buyExchange: mockOpportunity.buyExchange,
      sellExchange: mockOpportunity.sellExchange,
      amount: 100, // Default $100 USD
      startTime: new Date(),
      status: 'pending' as const
    };
    
    setUniversalBotTrades(prev => [...prev, newTrade]);
    
    // Show notification that universal bot is activated
    toast({
      title: "Universal Bot Activated",
      description: `Starting execution for ${mockOpportunity.pair} between ${mockOpportunity.buyExchange} and ${mockOpportunity.sellExchange}`,
      variant: "default",
    });
    
    // Simulate trade execution flow
    setTimeout(() => {
      // Update trade status to executing
      setUniversalBotTrades(prev => prev.map(trade => 
        trade.id === newTrade.id ? { ...trade, status: 'executing' } : trade
      ));
      
      toast({
        title: "Trade Executing",
        description: `Buying ${mockOpportunity.pair} on ${mockOpportunity.buyExchange}...`,
        variant: "default",
      });
      
      // Simulate completion after 5 seconds
      setTimeout(() => {
        const profit = (mockOpportunity.spreadPercentage / 100) * 100; // % of $100
        
        // Update trade to completed with profit
        setUniversalBotTrades(prev => prev.map(trade => 
          trade.id === newTrade.id ? { 
            ...trade, 
            status: 'completed',
            profit
          } : trade
        ));
        
        // Update universal bot stats
        setActiveBots(prev => prev.map(bot => 
          bot.id === 'universal-bot' ? { 
            ...bot, 
            profitToday: bot.profitToday + profit,
            profitTotal: bot.profitTotal + profit,
            tradesTaken: bot.tradesTaken + 1,
            lastActivity: new Date()
          } : bot
        ));
        
        toast({
          title: "Trade Completed",
          description: `Successfully executed ${mockOpportunity.pair} arbitrage with $${profit.toFixed(2)} profit`,
          variant: "default",
        });
      }, 5000);
    }, 2000);
  };
  
  // Highlight the universal bot card
  const highlightUniversalBot = () => {
    const universalBotElement = document.getElementById('universal-bot');
    if (universalBotElement) {
      universalBotElement.scrollIntoView({ behavior: 'smooth' });
      universalBotElement.classList.add('border-blue-500', 'bg-blue-500/10');
      setTimeout(() => {
        universalBotElement.classList.remove('border-blue-500', 'bg-blue-500/10');
      }, 3000);
    }
  };

  const handleBotAction = (botId: string, action: 'start' | 'pause' | 'stop' | 'delete' | 'edit' | 'settings') => {
    if (action === 'start') {
      setActiveBots(prevBots => 
        prevBots.map(bot => 
          bot.id === botId ? { ...bot, status: 'active', lastActivity: new Date() } : bot
        )
      );
      
      toast({
        title: "Bot Started",
        description: `Bot has been started and is now active`,
      });
    } 
    else if (action === 'pause') {
      setActiveBots(prevBots => 
        prevBots.map(bot => 
          bot.id === botId ? { ...bot, status: 'paused' } : bot
        )
      );
      
      toast({
        title: "Bot Paused",
        description: `Bot has been paused and will not execute trades`,
      });
    } 
    else if (action === 'stop') {
      setActiveBots(prevBots => 
        prevBots.map(bot => 
          bot.id === botId ? { ...bot, status: 'stopped' } : bot
        )
      );
      
      toast({
        title: "Bot Stopped",
        description: `Bot has been stopped`,
      });
    } 
    else if (action === 'delete') {
      setActiveBots(prevBots => prevBots.filter(bot => bot.id !== botId));
      
      toast({
        title: "Bot Deleted",
        description: `Bot has been permanently deleted`,
      });
    } 
    else if (action === 'edit') {
      const bot = activeBots.find(b => b.id === botId);
      if (bot) {
        setEditingBot(bot);
        setNewBot({ ...bot });
        setActiveTab('basic');
        setShowBotModal(true);
      }
    }
    else if (action === 'settings') {
      const bot = activeBots.find(b => b.id === botId);
      if (bot) {
        // Populate the settings modal with the bot's current settings
        // This would be done via a state variable in a real app
        
        // For demonstration purposes, we'll just show a toast
        if (bot.id === 'universal-bot') {
          // For universal bot, show the expanded settings section if it's collapsed
          highlightUniversalBot();
          toast({
            title: "Universal Bot Settings",
            description: "The universal bot settings have been expanded for editing.",
          });
        } else {
          // For other bots, open the edit modal with the advanced tab selected
          setEditingBot(bot);
          setNewBot({ ...bot });
          setActiveTab('risk');
          setShowBotModal(true);
          
          toast({
            title: "Bot Settings",
            description: `Opening advanced settings for ${bot.name}`,
          });
        }
      }
    }
  };

  const handleCreateBot = (templateType: string) => {
    setNewBot({
      name: '',
      type: templateType as any,
      exchanges: [],
      pairs: [],
      riskLevel: 'medium',
      accuracySettings: {
        slippage: 0.5,
        minProfitThreshold: 0.2,
        maxExecutionTime: 30,
        gasLimit: 0.01
      },
      schedule: {
        enabled: false,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        interval: 5
      },
      riskManagement: {
        dailyLossLimit: 100,
        maxTradesPerDay: 50,
        stopLossPercentage: 1.5,
        takeProfitPercentage: 3.0,
        cooldownAfterLoss: 15
      },
      notifications: {
        onTrade: true,
        onError: true,
        onProfit: false,
        profitThreshold: 5.0,
        emailNotifications: false
      },
      networkPreferences: {
        preferredNetworks: ['ETH', 'BSC', 'SOL'],
        autoSelectBestNetwork: true,
        allowCrossChainArbitrage: false,
        maxGasPrice: 100,
        networkFeeReserve: 20
      }
    });
    setEditingBot(null);
    setShowBotModal(true);
    setShowTemplates(false);
  };

  const handleSaveBot = () => {
    if (!newBot.name) {
      toast({
        title: "Error",
        description: "Bot name is required",
        variant: "destructive",
      });
      return;
    }

    if (newBot.exchanges && newBot.exchanges.length === 0) {
      toast({
        title: "Error",
        description: "At least one exchange must be selected",
        variant: "destructive",
      });
      return;
    }

    if (newBot.pairs && newBot.pairs.length === 0) {
      toast({
        title: "Error",
        description: "At least one trading pair must be selected",
        variant: "destructive",
      });
      return;
    }

    // If editing an existing bot
    if (editingBot) {
      const updatedBots = activeBots.map(bot => {
        if (bot.id === editingBot.id) {
          return {
            ...bot,
            ...newBot,
            status: 'active',
            lastActivity: new Date(),
          } as TradingBot;
        }
        return bot;
      });

      setActiveBots(updatedBots);
      toast({
        title: "Bot Updated",
        description: `${newBot.name} has been updated`,
      });
    } 
    // Creating a new bot
    else {
      // Create new bot with all required properties
      const newBotComplete: TradingBot = {
        id: `bot-${Date.now()}`,
        name: newBot.name || 'New Bot',
        type: newBot.type || 'arbitrage',
        status: 'active',
        profitToday: 0,
        profitTotal: 0,
        exchanges: newBot.exchanges || [],
        pairs: newBot.pairs || [],
        riskLevel: newBot.riskLevel || 'medium',
        createdAt: new Date(),
        tradesTaken: 0,
        successRate: 100,
        lastActivity: null,
        accuracySettings: newBot.accuracySettings || {
          slippage: 0.5,
          minProfitThreshold: 0.2,
          maxExecutionTime: 30,
          gasLimit: 0.01
        },
        // Share the same verification methods as the universal bot
        // This ensures all bots use consistent API and capital checks
        schedule: newBot.schedule || {
          enabled: false,
          daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          interval: 5
        },
        riskManagement: newBot.riskManagement || {
          dailyLossLimit: universalBotSettings.maxDailyCapital / 10, // 10% of max daily capital
          maxTradesPerDay: universalBotSettings.maxConcurrentTrades * 10, // 10x concurrent trades
          stopLossPercentage: 1.5,
          takeProfitPercentage: 3.0,
          cooldownAfterLoss: 15
        },
        notifications: newBot.notifications || {
          onTrade: true,
          onError: true,
          onProfit: false,
          profitThreshold: 5.0,
          emailNotifications: false
        },
        // Add network preferences, using universal bot settings as default
        networkPreferences: newBot.networkPreferences || {
          preferredNetworks: universalBotSettings.preferredNetworks,
          autoSelectBestNetwork: true,
          allowCrossChainArbitrage: false,
          maxGasPrice: 100,
          networkFeeReserve: 20
        }
      };
      
      setActiveBots([...activeBots, newBotComplete]);
      toast({
        title: "Bot Created",
        description: `${newBotComplete.name} has been created and is now active`,
      });
    }
    
    // Close the modal
    setShowBotModal(false);
  };

  const handleToggleExchange = (exchange: string) => {
    if (!newBot.exchanges) return;
    
    if (newBot.exchanges.includes(exchange)) {
      setNewBot({
        ...newBot,
        exchanges: newBot.exchanges.filter(e => e !== exchange)
      });
    } else {
      setNewBot({
        ...newBot,
        exchanges: [...newBot.exchanges, exchange]
      });
    }
  };

  const handleTogglePair = (pair: string) => {
    if (!newBot.pairs) return;
    
    if (newBot.pairs.includes(pair)) {
      setNewBot({
        ...newBot,
        pairs: newBot.pairs.filter(p => p !== pair)
      });
    } else {
      setNewBot({
        ...newBot,
        pairs: [...newBot.pairs, pair]
      });
    }
  };

  // Add function to handle selecting all exchanges
  const selectAllExchanges = () => {
    setNewBot(prevBot => ({
      ...prevBot,
      exchanges: [...availableExchanges]
    }));
    
    toast({
      title: "All Exchanges Selected",
      description: "Bot will monitor all available exchanges",
    });
  };
  
  // Add function to handle selecting all pairs
  const selectAllPairs = () => {
    setNewBot(prevBot => ({
      ...prevBot,
      pairs: [...availablePairs]
    }));
    
    toast({
      title: "All Trading Pairs Selected",
      description: "Bot will monitor all available trading pairs",
    });
  };
  
  // Format relative time
  const formatRelativeTime = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };
  
  // Add method to manually execute a trade with the universal bot
  const handleExecuteWithUniversalBot = () => {
    // Show modal to input trade details
    toast({
      title: "Manual Universal Bot Execution",
      description: "Enter the pair and exchanges to execute a trade",
      variant: "default",
    });
    
    // In a real implementation, this would open a modal to input trade details
    // For now, we'll simulate creating a random trade
    const randomTrade = createRandomTrade();
    processUniversalBotTrade(randomTrade);
  };
  
  // Create a random trade for simulation
  const createRandomTrade = () => {
    const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'ADA/USDT'];
    const exchanges = ['Binance', 'Coinbase', 'KuCoin', 'Kraken', 'Bybit'];
    
    // Pick random pair and exchanges
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    let buyExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    let sellExchange;
    
    // Make sure sell exchange is different from buy
    do {
      sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    } while (sellExchange === buyExchange);
    
    // Generate random prices that create a spread
    const basePrice = 100 + Math.random() * 900;
    const buyPrice = basePrice;
    const sellPrice = basePrice * (1 + (0.01 + Math.random() * 0.04)); // 1-5% spread
    const spreadPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;
    
    return {
      id: `opportunity-${Date.now()}`,
      pair,
      buyExchange,
      sellExchange,
      buyPrice,
      sellPrice,
      spreadPercentage,
      timestamp: new Date()
    };
  };
  
  // Process a trade with the universal bot
  const processUniversalBotTrade = (opportunity: any) => {
    // Check API restrictions first
    const checkApiRestrictions = () => {
      // In production, this would check against actual API rate limits
      // Here we'll simulate that certain exchanges have restrictions
      
      const restrictedExchanges = ['Bybit', 'OKX']; // Simulated restricted exchanges
      
      if (restrictedExchanges.includes(opportunity.buyExchange) || 
          restrictedExchanges.includes(opportunity.sellExchange)) {
        
        toast({
          title: "API Restrictions Detected",
          description: `${
            restrictedExchanges.includes(opportunity.buyExchange) ? opportunity.buyExchange : opportunity.sellExchange
          } has trading restrictions. Please verify API permissions.`,
          variant: "destructive",
        });
        
        return false;
      }
      
      return true;
    };
    
    // First check API restrictions
    if (!checkApiRestrictions()) {
      return;
    }
    
    // Create a new trade entry
    const newTrade = {
      id: `trade-${Date.now()}`,
      pair: opportunity.pair,
      buyExchange: opportunity.buyExchange,
      sellExchange: opportunity.sellExchange,
      amount: 100, // Default $100
      startTime: new Date(),
      status: 'pending' as const
    };
    
    // Add to universal bot trades
    setUniversalBotTrades(prev => [...prev, newTrade]);
    
    // Show notification
    toast({
      title: "Trade Added to Queue",
      description: `Added ${opportunity.pair} trade to universal bot execution queue`,
      variant: "default",
    });
    
    // Simulate execution flow
    setTimeout(() => {
      // Update status to executing
      setUniversalBotTrades(prev => prev.map(trade => 
        trade.id === newTrade.id ? { ...trade, status: 'executing' } : trade
      ));
      
      toast({
        title: "Executing Trade",
        description: `Buying ${opportunity.pair} on ${opportunity.buyExchange}...`,
        variant: "default",
      });
      
      // Simulate completion after some time
      setTimeout(() => {
        // Random success or failure (90% success rate)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          const profit = (opportunity.spreadPercentage / 100) * 100; // % of $100
          
          // Update trade status
          setUniversalBotTrades(prev => prev.map(trade => 
            trade.id === newTrade.id ? { 
              ...trade, 
              status: 'completed',
              profit
            } : trade
          ));
          
          // Update universal bot statistics
          setActiveBots(prev => prev.map(bot => 
            bot.id === 'universal-bot' ? { 
              ...bot, 
              profitToday: bot.profitToday + profit,
              profitTotal: bot.profitTotal + profit,
              tradesTaken: bot.tradesTaken + 1,
              successRate: ((bot.successRate * bot.tradesTaken) + 100) / (bot.tradesTaken + 1),
              lastActivity: new Date()
            } : bot
          ));
          
          toast({
            title: "Trade Completed",
            description: `Successfully executed ${opportunity.pair} with $${profit.toFixed(2)} profit`,
            variant: "default",
          });
        } else {
          // Update trade as failed
          setUniversalBotTrades(prev => prev.map(trade => 
            trade.id === newTrade.id ? { 
              ...trade, 
              status: 'failed'
            } : trade
          ));
          
          // Update universal bot statistics
          setActiveBots(prev => prev.map(bot => 
            bot.id === 'universal-bot' ? { 
              ...bot, 
              tradesTaken: bot.tradesTaken + 1,
              successRate: ((bot.successRate * bot.tradesTaken)) / (bot.tradesTaken + 1),
              lastActivity: new Date()
            } : bot
          ));
          
          toast({
            title: "Trade Failed",
            description: `Failed to execute ${opportunity.pair} due to market conditions`,
            variant: "destructive",
          });
        }
        
        // After 30 seconds, remove completed/failed trades from the active list
        setTimeout(() => {
          setUniversalBotTrades(prev => prev.filter(trade => 
            trade.id !== newTrade.id || 
            (trade.status !== 'completed' && trade.status !== 'failed')
          ));
        }, 30000);
      }, 3000 + Math.random() * 2000); // Random execution time between 3-5 seconds
    }, 1000);
  };

  // Add function to handle toggling a network
  const handleToggleNetwork = (network: string) => {
    if (!newBot.networkPreferences?.preferredNetworks) return;
    
    if (newBot.networkPreferences.preferredNetworks.includes(network)) {
      setNewBot({
        ...newBot,
        networkPreferences: {
          ...newBot.networkPreferences,
          preferredNetworks: newBot.networkPreferences.preferredNetworks.filter(n => n !== network)
        }
      });
    } else {
      setNewBot({
        ...newBot,
        networkPreferences: {
          ...newBot.networkPreferences,
          preferredNetworks: [...newBot.networkPreferences.preferredNetworks, network]
        }
      });
    }
  };

  // First, add new state variables for analytics and history modals
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedBotForAnalytics, setSelectedBotForAnalytics] = useState<TradingBot | null>(null);
  const [selectedBotForHistory, setSelectedBotForHistory] = useState<TradingBot | null>(null);
  const [botTrades, setBotTrades] = useState<{
    id: string;
    botId: string;
    pair: string;
    buyExchange: string;
    sellExchange: string;
    amount: number;
    profit: number;
    timestamp: Date;
    status: 'completed' | 'failed';
    network: string;
    gasFee: number;
  }[]>([]);
  
  // Add this function to generate mock trade history when viewing history
  const generateMockTradeHistory = (botId: string) => {
    const bot = activeBots.find(b => b.id === botId);
    if (!bot) return [];
    
    const trades = [];
    const daysBack = 14; // Generate data for the last 14 days
    const tradesPerDay = Math.max(1, Math.floor(bot.tradesTaken / daysBack));
    
    for (let i = 0; i < daysBack; i++) {
      const dayTrades = Math.max(1, tradesPerDay + Math.floor(Math.random() * 3) - 1);
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      for (let j = 0; j < dayTrades; j++) {
        const pair = bot.pairs[Math.floor(Math.random() * bot.pairs.length)];
        const buyExchange = bot.exchanges[Math.floor(Math.random() * bot.exchanges.length)];
        let sellExchange;
        do {
          sellExchange = bot.exchanges[Math.floor(Math.random() * bot.exchanges.length)];
        } while (sellExchange === buyExchange && bot.exchanges.length > 1);
        
        const amount = 50 + Math.random() * 150;
        const isSuccess = Math.random() < (bot.successRate / 100);
        const profit = isSuccess ? (amount * (0.5 + Math.random() * 3) / 100) : 0;
        const timestamp = new Date(date);
        timestamp.setHours(Math.floor(Math.random() * 24));
        timestamp.setMinutes(Math.floor(Math.random() * 60));
        
        // Get a random network from the bot's preferred networks
        const networks = bot.networkPreferences?.preferredNetworks || ['ETH', 'BSC', 'SOL'];
        const network = networks[Math.floor(Math.random() * networks.length)];
        
        // Calculate a realistic gas fee based on the network
        let gasFee = 0;
        if (network === 'ETH') {
          gasFee = 3 + Math.random() * 12; // Higher gas fees for ETH
        } else if (network === 'BSC') {
          gasFee = 0.1 + Math.random() * 0.5; // Low gas fees for BSC
        } else if (network === 'SOL') {
          gasFee = 0.001 + Math.random() * 0.01; // Very low gas fees for SOL
        } else if (network === 'MATIC') {
          gasFee = 0.01 + Math.random() * 0.1; // Low gas fees for Polygon
        } else {
          gasFee = 0.5 + Math.random() * 2; // Average gas fees for other networks
        }
        
        trades.push({
          id: `trade-${botId}-${i}-${j}`,
          botId,
          pair,
          buyExchange,
          sellExchange,
          amount,
          profit,
          timestamp,
          status: isSuccess ? 'completed' : 'failed',
          network,
          gasFee
        });
      }
    }
    
    // Sort trades by timestamp (newest first)
    return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };
  
  // Add function to calculate analytics data based on trade history
  const calculateAnalytics = (trades: any[]) => {
    if (!trades || trades.length === 0) return null;
    
    // Filter completed trades
    const completedTrades = trades.filter(trade => trade.status === 'completed');
    
    // Calculate total profit
    const totalProfit = completedTrades.reduce((sum, trade) => sum + trade.profit, 0);
    
    // Calculate success rate
    const successRate = trades.length > 0 ? 
      (completedTrades.length / trades.length) * 100 : 0;
    
    // Calculate average profit per trade
    const avgProfit = completedTrades.length > 0 ? 
      totalProfit / completedTrades.length : 0;
    
    // Calculate total gas fees spent
    const totalGasFees = trades.reduce((sum, trade) => sum + trade.gasFee, 0);
    
    // Calculate profit by network
    const networkProfits = {};
    completedTrades.forEach(trade => {
      if (!networkProfits[trade.network]) {
        networkProfits[trade.network] = 0;
      }
      networkProfits[trade.network] += trade.profit;
    });
    
    // Calculate best performing pairs
    const pairProfits = {};
    completedTrades.forEach(trade => {
      if (!pairProfits[trade.pair]) {
        pairProfits[trade.pair] = 0;
      }
      pairProfits[trade.pair] += trade.profit;
    });
    
    // Sort pairs by profit
    const bestPairs = Object.entries(pairProfits)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([pair, profit]) => ({ pair, profit }));
    
    // Calculate profit by exchange
    const exchangeProfits = {};
    completedTrades.forEach(trade => {
      if (!exchangeProfits[trade.sellExchange]) {
        exchangeProfits[trade.sellExchange] = 0;
      }
      exchangeProfits[trade.sellExchange] += trade.profit;
    });
    
    // Calculate hourly distribution
    const hourlyDistribution = Array(24).fill(0);
    completedTrades.forEach(trade => {
      const hour = trade.timestamp.getHours();
      hourlyDistribution[hour]++;
    });
    
    // Calculate average execution time (not available in mock data but would be good to have)
    const avgExecutionTime = 3.5; // Mock value in seconds
    
    return {
      totalProfit,
      successRate,
      avgProfit,
      totalGasFees,
      networkProfits,
      bestPairs,
      exchangeProfits,
      hourlyDistribution,
      avgExecutionTime,
      totalTrades: trades.length,
      completedTrades: completedTrades.length,
      failedTrades: trades.length - completedTrades.length
    };
  };
  
  // Update the action buttons to open modals instead of showing toasts
  // Replace the History button in the action buttons section with the following:
  
  // Change the handleShowHistory function for the button
  const handleShowHistory = (bot: TradingBot) => {
    setSelectedBotForHistory(bot);
    const history = generateMockTradeHistory(bot.id);
    setBotTrades(history);
    setShowHistoryModal(true);
  };
  
  // Change the handleShowAnalytics function for the button
  const handleShowAnalytics = (bot: TradingBot) => {
    setSelectedBotForAnalytics(bot);
    const history = generateMockTradeHistory(bot.id);
    setBotTrades(history);
    setShowAnalyticsModal(true);
  };

  // Update the existing JSX at around line 1250 where the action buttons are defined
  // Replace the two Button components with these updated ones (replace both buttons):
  /* 
  <Button
    variant="outline"
    size="sm"
    className="flex-1 h-8 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300"
    onClick={() => handleShowHistory(bot)}
  >
    <History className="h-3 w-3 mr-1" />
    History
  </Button>
  <Button
    variant="outline"
    size="sm"
    className="flex-1 h-8 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300"
    onClick={() => handleShowAnalytics(bot)}
  >
    <ChartBar className="h-3 w-3 mr-1" />
    Analytics
  </Button>
  */

  // Add the modals at the very end of the component, right before the final closing tags
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Trading Bots</h1>
        <p className="text-sm md:text-base text-slate-400">
          Create and manage automated trading bots to execute arbitrage strategies
        </p>
      </div>
      
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setEditingBot(null);
              setActiveTab('basic');
              setNewBot({
                name: '',
                type: 'arbitrage',
                exchanges: [],
                pairs: [],
                riskLevel: 'medium',
                accuracySettings: {
                  slippage: 0.5,
                  minProfitThreshold: 0.2,
                  maxExecutionTime: 30,
                  gasLimit: 0.01
                },
                schedule: {
                  enabled: false,
                  daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  interval: 5
                },
                riskManagement: {
                  dailyLossLimit: 100,
                  maxTradesPerDay: 50,
                  stopLossPercentage: 1.5,
                  takeProfitPercentage: 3.0,
                  cooldownAfterLoss: 15
                },
                notifications: {
                  onTrade: true,
                  onError: true,
                  onProfit: false,
                  profitThreshold: 5.0,
                  emailNotifications: false
                },
                networkPreferences: {
                  preferredNetworks: ['ETH', 'BSC', 'SOL'],
                  autoSelectBestNetwork: true,
                  allowCrossChainArbitrage: false,
                  maxGasPrice: 100,
                  networkFeeReserve: 20
                }
              });
              setShowBotModal(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Bot
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: "Analytics View",
                description: "Viewing detailed bot performance analytics",
              });
            }}
            className="flex items-center gap-2"
          >
            <ChartBar className="h-4 w-4" />
            Analytics
          </Button>
          
          {/* Add Quick Universal Bot button */}
          <Button
            variant="outline"
            onClick={handleExecuteWithUniversalBot}
            className="flex items-center gap-2 bg-blue-900/20 text-blue-400 border-blue-500/50 hover:bg-blue-800/30"
          >
            <Globe className="h-4 w-4" />
            Quick Execute
          </Button>
        </div>
        
        <div className="text-sm text-slate-400">
          {activeBots.filter(bot => bot.status === 'active').length} Active Bots / {activeBots.length} Total
        </div>
      </div>
      
      {activeBots.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
          <Bot className="h-12 w-12 mx-auto mb-3 text-slate-500" />
          <h3 className="text-lg font-medium text-white mb-2">No Trading Bots Yet</h3>
          <p className="text-slate-400 mb-4">Create your first bot to start automating your trading strategies</p>
          <Button
            onClick={() => setShowTemplates(true)}
          >
            Create Your First Bot
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeBots.map(bot => (
            <div 
              key={bot.id}
              id={bot.id}
              className={cn(
                "bg-slate-800 border rounded-lg overflow-hidden",
                bot.status === 'active' 
                  ? "border-green-600/50" 
                  : bot.status === 'paused'
                    ? "border-yellow-600/50"
                    : "border-slate-700",
                bot.id === 'universal-bot' && "transition-all duration-300"
              )}
            >
              <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    bot.status === 'active' 
                      ? "bg-green-500" 
                      : bot.status === 'paused'
                        ? "bg-yellow-500"
                        : "bg-slate-500"
                  )}></div>
                  <h3 className="font-medium text-white truncate max-w-[200px]">{bot.name}</h3>
                  {bot.schedule?.enabled && (
                    <Badge variant="outline" className="ml-2 h-5 bg-slate-700 text-blue-300 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Scheduled
                    </Badge>
                  )}
                  {bot.id === 'universal-bot' && (
                    <Badge variant="outline" className="ml-2 h-5 bg-blue-900/40 text-blue-300 text-xs border-blue-500/50">
                      <Globe className="h-3 w-3 mr-1" />
                      Universal
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 p-0 hover:bg-slate-700"
                    onClick={() => handleBotAction(bot.id, 'settings')}
                    title="Advanced Settings"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                  </Button>
                  {bot.status === 'active' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 p-0 hover:bg-slate-700"
                      onClick={() => handleBotAction(bot.id, 'pause')}
                      title="Pause Bot"
                    >
                      <Pause className="h-4 w-4 text-green-400" />
                    </Button>
                  ) : bot.status === 'paused' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 p-0 hover:bg-slate-700"
                      onClick={() => handleBotAction(bot.id, 'start')}
                      title="Start Bot"
                    >
                      <Play className="h-4 w-4 text-yellow-400" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 p-0 hover:bg-slate-700"
                      onClick={() => handleBotAction(bot.id, 'start')}
                      title="Start Bot"
                    >
                      <Play className="h-4 w-4 text-slate-400" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 p-0 hover:bg-slate-700"
                    onClick={() => handleBotAction(bot.id, 'edit')}
                    title="Edit Bot"
                  >
                    <BarChart3 className="h-4 w-4 text-slate-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 p-0 hover:bg-slate-700 hover:text-red-400"
                    onClick={() => handleBotAction(bot.id, 'delete')}
                    title="Delete Bot"
                  >
                    <Trash2 className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                {/* Universal bot active trades section */}
                {bot.id === 'universal-bot' && universalBotTrades.length > 0 && (
                  <div className="mb-4 bg-blue-900/20 border border-blue-900/30 rounded-lg p-3">
                    <h4 className="text-sm text-blue-300 font-medium mb-2 flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      Active Execution Queue
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {universalBotTrades.map(trade => (
                        <div key={trade.id} className="bg-slate-800/60 rounded p-2 text-xs border border-slate-700/50">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-white">{trade.pair}</span>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-full text-xs",
                              trade.status === 'pending' ? "bg-yellow-900/30 text-yellow-400" :
                              trade.status === 'executing' ? "bg-blue-900/30 text-blue-400" :
                              trade.status === 'completed' ? "bg-green-900/30 text-green-400" :
                              "bg-red-900/30 text-red-400"
                            )}>
                              {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-400">
                            <div>Buy: <span className="text-white">{trade.buyExchange}</span></div>
                            <div>Sell: <span className="text-white">{trade.sellExchange}</span></div>
                            <div>Amount: <span className="text-white">${trade.amount}</span></div>
                            <div>
                              {trade.status === 'completed' && trade.profit ? (
                                <>Profit: <span className="text-green-400">${trade.profit.toFixed(2)}</span></>
                              ) : (
                                <>Started: <span className="text-white">{formatRelativeTime(trade.startTime)}</span></>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Profit Today</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      bot.profitToday > 0 
                        ? "text-green-400" 
                        : bot.profitToday < 0
                          ? "text-red-400"
                          : "text-white"
                    )}>
                      ${bot.profitToday.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Total Profit</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      bot.profitTotal > 0 
                        ? "text-green-400" 
                        : bot.profitTotal < 0
                          ? "text-red-400"
                          : "text-white"
                    )}>
                      ${bot.profitTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {/* Add advanced metrics bar */}
                <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-700/30 p-2 rounded">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Trades</p>
                    <p className="text-sm font-bold text-white">{bot.tradesTaken}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Success</p>
                    <p className={cn(
                      "text-sm font-bold",
                      bot.successRate > 90 ? "text-green-400" : 
                      bot.successRate > 75 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {bot.successRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Risk</p>
                    <p className={cn(
                      "text-sm font-bold",
                      bot.riskLevel === 'low' ? "text-green-400" : 
                      bot.riskLevel === 'medium' ? "text-yellow-400" : "text-red-400"
                    )}>
                      {bot.riskLevel.charAt(0).toUpperCase() + bot.riskLevel.slice(1)}
                    </p>
                  </div>
                </div>
                
                {/* Special description for universal bot */}
                {bot.id === 'universal-bot' && (
                  <div className="mb-3 bg-slate-700/30 rounded-lg p-2 text-xs text-slate-300">
                    <p>This universal bot automatically executes arbitrage opportunities from any supported exchanges where you have configured API keys. It checks for sufficient balance before executing trades.</p>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Default Trade Capital:</span>
                        <div className="flex items-center">
                          <span className="text-xs mr-1">$</span>
                          <input 
                            type="number" 
                            className="w-20 bg-slate-800 border border-slate-600 rounded py-1 px-2 text-xs text-white"
                            value={bot.id === 'universal-bot' ? universalBotSettings.capital : 100}
                            onChange={(e) => {
                              if (bot.id === 'universal-bot') {
                                setUniversalBotSettings({
                                  ...universalBotSettings,
                                  capital: Math.max(10, Math.min(10000, parseInt(e.target.value) || 100))
                                });
                              }
                            }}
                            min="10"
                            max="10000"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Min Spread to Execute:</span>
                        <div className="flex items-center">
                          <input 
                            type="number" 
                            className="w-16 bg-slate-800 border border-slate-600 rounded py-1 px-2 text-xs text-white"
                            value={bot.id === 'universal-bot' ? universalBotSettings.minSpread : 1.5}
                            onChange={(e) => {
                              if (bot.id === 'universal-bot') {
                                setUniversalBotSettings({
                                  ...universalBotSettings,
                                  minSpread: Math.max(0.5, Math.min(10, parseFloat(e.target.value) || 1.5))
                                });
                              }
                            }}
                            min="0.5"
                            max="10"
                            step="0.1"
                          />
                          <span className="text-xs ml-1">%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">API Verification:</span>
                        <div className="flex items-center">
                          <select
                            className="bg-slate-800 border border-slate-600 rounded py-1 px-2 text-xs text-white"
                            value={bot.id === 'universal-bot' ? universalBotSettings.apiVerification : 'strict'}
                            onChange={(e) => {
                              if (bot.id === 'universal-bot') {
                                setUniversalBotSettings({
                                  ...universalBotSettings,
                                  apiVerification: e.target.value as 'strict' | 'moderate' | 'lenient'
                                });
                              }
                            }}
                          >
                            <option value="strict">Strict</option>
                            <option value="moderate">Moderate</option>
                            <option value="lenient">Lenient</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Auto-start Trades:</span>
                        <div>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-3 w-3 rounded border-slate-700 bg-slate-800 text-blue-500"
                              checked={bot.id === 'universal-bot' ? universalBotSettings.autoStart : false}
                              onChange={(e) => {
                                if (bot.id === 'universal-bot') {
                                  setUniversalBotSettings({
                                    ...universalBotSettings,
                                    autoStart: e.target.checked
                                  });
                                }
                              }}
                            />
                            <span className="text-white">{bot.id === 'universal-bot' && universalBotSettings.autoStart ? 'On' : 'Off'}</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Preferred Networks:</span>
                        <select
                          className="bg-slate-800 border border-slate-600 rounded py-1 px-2 text-xs text-white"
                          value=""
                          onChange={(e) => {
                            if (bot.id === 'universal-bot' && e.target.value) {
                              // Add network if not already in the list
                              if (!universalBotSettings.preferredNetworks.includes(e.target.value)) {
                                setUniversalBotSettings({
                                  ...universalBotSettings,
                                  preferredNetworks: [...universalBotSettings.preferredNetworks, e.target.value]
                                });
                              }
                            }
                          }}
                        >
                          <option value="">Select network...</option>
                          {availableNetworks.map(network => (
                            <option key={network} value={network}>{network}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Display selected networks with remove option */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {universalBotSettings.preferredNetworks.map(network => (
                          <div key={network} className="bg-slate-800 text-xs text-white rounded px-1.5 py-0.5 flex items-center">
                            {network}
                            <button 
                              className="ml-1 text-slate-400 hover:text-red-400"
                              onClick={() => {
                                if (bot.id === 'universal-bot') {
                                  setUniversalBotSettings({
                                    ...universalBotSettings,
                                    preferredNetworks: universalBotSettings.preferredNetworks.filter(n => n !== network)
                                  });
                                }
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Allow Cross-Chain:</span>
                        <div>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-3 w-3 rounded border-slate-700 bg-slate-800 text-blue-500"
                              checked={bot.id === 'universal-bot' ? universalBotSettings.allowCrossChainArbitrage || false : false}
                              onChange={(e) => {
                                if (bot.id === 'universal-bot') {
                                  setUniversalBotSettings({
                                    ...universalBotSettings,
                                    allowCrossChainArbitrage: e.target.checked
                                  });
                                }
                              }}
                            />
                            <span className="text-white">{bot.id === 'universal-bot' && universalBotSettings.allowCrossChainArbitrage ? 'On' : 'Off'}</span>
                          </label>
                        </div>
                      </div>
                      
                      <button
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 rounded"
                        onClick={() => {
                          if (bot.id === 'universal-bot') {
                            toast({
                              title: "Settings Saved",
                              description: "Universal bot settings have been updated.",
                              variant: "default",
                            });
                          }
                        }}
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1">Strategy Type</p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      bot.type === 'arbitrage' 
                        ? "bg-blue-900/20 text-blue-400" 
                        : bot.type === 'triangular'
                          ? "bg-purple-900/20 text-purple-400"
                          : bot.type === 'statistical'
                            ? "bg-cyan-900/20 text-cyan-400"
                            : "bg-slate-700 text-slate-300"
                    )}>
                      {bot.type === 'arbitrage' 
                        ? 'Cross-Exchange Arbitrage' 
                        : bot.type === 'triangular'
                          ? 'Triangular Arbitrage'
                          : bot.type === 'statistical'
                            ? 'Statistical Arbitrage'
                            : 'Custom Strategy'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1">Trading Assets</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {bot.exchanges.length > 2 ? (
                      <>
                        <span className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                          {bot.exchanges[0]}
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                          {bot.exchanges[1]}
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                          +{bot.exchanges.length - 2} more
                        </span>
                      </>
                    ) : (
                      bot.exchanges.map(exchange => (
                      <span key={exchange} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                        {exchange}
                      </span>
                      ))
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {bot.pairs.length > 3 ? (
                      <>
                        {bot.pairs.slice(0, 2).map(pair => (
                      <span key={pair} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                        {pair}
                      </span>
                    ))}
                        <span className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                          +{bot.pairs.length - 2} more
                        </span>
                      </>
                    ) : (
                      bot.pairs.map(pair => (
                        <span key={pair} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                          {pair}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Add settings overview */}
                <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="h-3 w-3" />
                    {bot.schedule?.enabled ? 
                      <span>Scheduled: {bot.schedule.interval}min</span> : 
                      <span>Manual execution</span>
                    }
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Stop Loss: {bot.riskManagement?.stopLossPercentage || 1.5}%</span>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300"
                    onClick={() => handleShowHistory(bot)}
                  >
                    <History className="h-3 w-3 mr-1" />
                    History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300"
                    onClick={() => handleShowAnalytics(bot)}
                  >
                    <ChartBar className="h-3 w-3 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bot Creation/Edit Modal */}
      {showBotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {editingBot ? 'Edit Trading Bot' : 'Create New Trading Bot'}
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowBotModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Tab Navigation - Add Networks tab */}
              <div className="flex border-b border-slate-700 mb-4 overflow-x-auto">
                <button
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'basic' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setActiveTab('basic')}
                >
                  Basic Settings
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'schedule' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setActiveTab('schedule')}
                >
                  Schedule
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'risk' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setActiveTab('risk')}
                >
                  Risk Management
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'networks' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setActiveTab('networks')}
                >
                  Networks
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'notifications' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  Notifications
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Basic Settings Tab */}
                {activeTab === 'basic' && (
                  <>
                    {/* Basic Bot Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Bot Name</label>
                        <input 
                          type="text"
                          value={newBot.name || ''}
                          onChange={(e) => setNewBot({...newBot, name: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="Enter bot name..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Bot Type</label>
                        <select 
                          value={newBot.type || 'arbitrage'}
                          onChange={(e) => setNewBot({...newBot, type: e.target.value as any})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="arbitrage">Cross-Exchange Arbitrage</option>
                          <option value="triangular">Triangular Arbitrage</option>
                          <option value="statistical">Statistical Arbitrage</option>
                          <option value="custom">Custom Strategy</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Risk Level */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Risk Level</label>
                      <div className="flex space-x-4">
                        {['low', 'medium', 'high'].map(risk => (
                          <div 
                            key={risk}
                            onClick={() => setNewBot({...newBot, riskLevel: risk as any})}
                            className={`flex-1 flex items-center justify-center border rounded-md py-2 cursor-pointer ${
                              newBot.riskLevel === risk 
                                ? risk === 'low' 
                                  ? 'bg-green-900/20 border-green-600 text-green-400' 
                                  : risk === 'medium'
                                    ? 'bg-yellow-900/20 border-yellow-600 text-yellow-400'
                                    : 'bg-red-900/20 border-red-600 text-red-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {risk.charAt(0).toUpperCase() + risk.slice(1)}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Exchanges */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-400">Exchanges</label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={selectAllExchanges}
                          className="h-7 text-xs"
                        >
                          Select All
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {availableExchanges.map(exchange => (
                          <div 
                            key={exchange}
                            onClick={() => handleToggleExchange(exchange)}
                            className={`border rounded-md p-2 cursor-pointer flex items-center justify-center text-sm ${
                              (newBot.exchanges || []).includes(exchange)
                                ? 'bg-blue-900/20 border-blue-600 text-blue-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {exchange}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Trading Pairs */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-400">Trading Pairs</label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={selectAllPairs}
                          className="h-7 text-xs"
                        >
                          Select All
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {availablePairs.map(pair => (
                          <div 
                            key={pair}
                            onClick={() => handleTogglePair(pair)}
                            className={`border rounded-md p-2 cursor-pointer flex items-center justify-center text-sm ${
                              (newBot.pairs || []).includes(pair)
                                ? 'bg-blue-900/20 border-blue-600 text-blue-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {pair}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Accuracy Settings */}
                    <div>
                      <h3 className="text-md font-medium text-white mb-2">Accuracy Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">
                            Maximum Slippage (%)
                          </label>
                          <input 
                            type="number"
                            min="0"
                            step="0.1"
                            value={newBot.accuracySettings?.slippage || 0.5}
                            onChange={(e) => {
                              const currentSettings = newBot.accuracySettings || {
                                slippage: 0.5,
                                minProfitThreshold: 0.2,
                                maxExecutionTime: 30,
                                gasLimit: 0.01
                              };
                              setNewBot({
                                ...newBot, 
                                accuracySettings: {
                                  ...currentSettings,
                                  slippage: parseFloat(e.target.value)
                                }
                              });
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">
                            Minimum Profit Threshold (%)
                          </label>
                          <input 
                            type="number"
                            min="0"
                            step="0.1"
                            value={newBot.accuracySettings?.minProfitThreshold || 0.2}
                            onChange={(e) => {
                              const currentSettings = newBot.accuracySettings || {
                                slippage: 0.5,
                                minProfitThreshold: 0.2,
                                maxExecutionTime: 30,
                                gasLimit: 0.01
                              };
                              setNewBot({
                                ...newBot, 
                                accuracySettings: {
                                  ...currentSettings,
                                  minProfitThreshold: parseFloat(e.target.value)
                                }
                              });
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">
                            Max Execution Time (seconds)
                          </label>
                          <input 
                            type="number"
                            min="1"
                            value={newBot.accuracySettings?.maxExecutionTime || 30}
                            onChange={(e) => {
                              const currentSettings = newBot.accuracySettings || {
                                slippage: 0.5,
                                minProfitThreshold: 0.2,
                                maxExecutionTime: 30,
                                gasLimit: 0.01
                              };
                              setNewBot({
                                ...newBot, 
                                accuracySettings: {
                                  ...currentSettings,
                                  maxExecutionTime: parseInt(e.target.value)
                                }
                              });
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">
                            Max Gas/Fee Limit (%)
                          </label>
                          <input 
                            type="number"
                            min="0"
                            step="0.005"
                            value={newBot.accuracySettings?.gasLimit || 0.01}
                            onChange={(e) => {
                              const currentSettings = newBot.accuracySettings || {
                                slippage: 0.5,
                                minProfitThreshold: 0.2,
                                maxExecutionTime: 30,
                                gasLimit: 0.01
                              };
                              setNewBot({
                                ...newBot, 
                                accuracySettings: {
                                  ...currentSettings,
                                  gasLimit: parseFloat(e.target.value)
                                }
                              });
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-400 mr-2" />
                        <h3 className="text-md font-medium text-white">Bot Schedule</h3>
                      </div>
                      <div className="flex items-center">
                        <label className="block text-sm font-medium text-slate-400 mr-2">Enable Scheduling</label>
                        <input 
                          type="checkbox"
                          checked={newBot.schedule?.enabled || false}
                          onChange={(e) => {
                            const currentSchedule = newBot.schedule || {
                              enabled: false,
                              daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                              interval: 5
                            };
                            setNewBot({
                              ...newBot,
                              schedule: {
                                ...currentSchedule,
                                enabled: e.target.checked
                              }
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Start Time (24h format)
                        </label>
                        <input 
                          type="time"
                          value={newBot.schedule?.startTime || ''}
                          onChange={(e) => {
                            const currentSchedule = newBot.schedule || {
                              enabled: false,
                              daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                              interval: 5
                            };
                            setNewBot({
                              ...newBot,
                              schedule: {
                                ...currentSchedule,
                                startTime: e.target.value
                              }
                            });
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          End Time (24h format)
                        </label>
                        <input 
                          type="time"
                          value={newBot.schedule?.endTime || ''}
                          onChange={(e) => {
                            const currentSchedule = newBot.schedule || {
                              enabled: false,
                              daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                              interval: 5
                            };
                            setNewBot({
                              ...newBot,
                              schedule: {
                                ...currentSchedule,
                                endTime: e.target.value
                              }
                            });
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Execution Interval (minutes)
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max="1440"
                        value={newBot.schedule?.interval || 5}
                        onChange={(e) => {
                          const currentSchedule = newBot.schedule || {
                            enabled: false,
                            daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                            interval: 5
                          };
                          setNewBot({
                            ...newBot,
                            schedule: {
                              ...currentSchedule,
                              interval: parseInt(e.target.value)
                            }
                          });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Bot will check for arbitrage opportunities every {newBot.schedule?.interval || 5} minutes when active.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Active Days</label>
                      <div className="grid grid-cols-7 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <div 
                            key={day}
                            onClick={() => {
                              const currentSchedule = newBot.schedule || {
                                enabled: false,
                                daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                                interval: 5
                              };
                              const currentDays = currentSchedule.daysOfWeek || [];
                              
                              setNewBot({
                                ...newBot,
                                schedule: {
                                  ...currentSchedule,
                                  daysOfWeek: currentDays.includes(day) 
                                    ? currentDays.filter(d => d !== day)
                                    : [...currentDays, day]
                                }
                              });
                            }}
                            className={`border rounded-md p-2 cursor-pointer flex items-center justify-center text-sm ${
                              (newBot.schedule?.daysOfWeek || []).includes(day)
                                ? 'bg-blue-900/20 border-blue-600 text-blue-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Management Tab */}
                {activeTab === 'risk' && (
                  <div className="space-y-4">
                    <div className="flex items-center border-b border-slate-700 pb-4">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                      <h3 className="text-md font-medium text-white">Advanced Risk Management</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Daily Loss Limit (USD)
                        </label>
                        <input 
                          type="number"
                          min="0"
                          step="10"
                          value={newBot.riskManagement?.dailyLossLimit || 100}
                          onChange={(e) => {
                            const currentSettings = newBot.riskManagement || {
                              dailyLossLimit: 100,
                              maxTradesPerDay: 50,
                              stopLossPercentage: 1.5,
                              takeProfitPercentage: 3.0,
                              cooldownAfterLoss: 15
                            };
                            setNewBot({
                              ...newBot,
                              riskManagement: {
                                ...currentSettings,
                                dailyLossLimit: parseFloat(e.target.value)
                              }
                            });
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Bot will stop trading if daily losses exceed this amount
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Max Trades Per Day
                        </label>
                        <input 
                          type="number"
                          min="1"
                          value={newBot.riskManagement?.maxTradesPerDay || 50}
                          onChange={(e) => {
                            const currentSettings = newBot.riskManagement || {
                              dailyLossLimit: 100,
                              maxTradesPerDay: 50,
                              stopLossPercentage: 1.5,
                              takeProfitPercentage: 3.0,
                              cooldownAfterLoss: 15
                            };
                            setNewBot({
                              ...newBot,
                              riskManagement: {
                                ...currentSettings,
                                maxTradesPerDay: parseInt(e.target.value)
                              }
                            });
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Stop Loss (%)
                        </label>
                        <input 
                          type="number"
                          min="0"
                          step="0.1"
                          value={newBot.riskManagement?.stopLossPercentage || 1.5}
                          onChange={(e) => {
                            const currentSettings = newBot.riskManagement || {
                              dailyLossLimit: 100,
                              maxTradesPerDay: 50,
                              stopLossPercentage: 1.5,
                              takeProfitPercentage: 3.0,
                              cooldownAfterLoss: 15
                            };
                            setNewBot({
                              ...newBot,
                              riskManagement: {
                                ...currentSettings,
                                stopLossPercentage: parseFloat(e.target.value)
                              }
                            });
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Take Profit (%)
                        </label>
                        <input 
                          type="number"
                          min="0"
                          step="0.1"
                          value={newBot.riskManagement?.takeProfitPercentage || 3.0}
                          onChange={(e) => {
                            const currentSettings = newBot.riskManagement || {
                              dailyLossLimit: 100,
                              maxTradesPerDay: 50,
                              stopLossPercentage: 1.5,
                              takeProfitPercentage: 3.0,
                              cooldownAfterLoss: 15
                            };
                            setNewBot({
                              ...newBot,
                              riskManagement: {
                                ...currentSettings,
                                takeProfitPercentage: parseFloat(e.target.value)
                              }
                            });
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Cooldown After Loss (minutes)
                      </label>
                      <input 
                        type="number"
                        min="0"
                        value={newBot.riskManagement?.cooldownAfterLoss || 15}
                        onChange={(e) => {
                          const currentSettings = newBot.riskManagement || {
                            dailyLossLimit: 100,
                            maxTradesPerDay: 50,
                            stopLossPercentage: 1.5,
                            takeProfitPercentage: 3.0,
                            cooldownAfterLoss: 15
                          };
                          setNewBot({
                            ...newBot,
                            riskManagement: {
                              ...currentSettings,
                              cooldownAfterLoss: parseInt(e.target.value)
                            }
                          });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Bot will pause for this duration after a losing trade
                      </p>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-4">
                    <div className="flex items-center border-b border-slate-700 pb-4">
                      <Bell className="h-5 w-5 text-blue-400 mr-2" />
                      <h3 className="text-md font-medium text-white">Notification Settings</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-400">Notify on Trade Execution</label>
                        <input 
                          type="checkbox"
                          checked={newBot.notifications?.onTrade || false}
                          onChange={(e) => {
                            const currentSettings = newBot.notifications || {
                              onTrade: true,
                              onError: true,
                              onProfit: false,
                              profitThreshold: 5.0,
                              emailNotifications: false
                            };
                            setNewBot({
                              ...newBot,
                              notifications: {
                                ...currentSettings,
                                onTrade: e.target.checked
                              }
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-400">Notify on Errors</label>
                        <input 
                          type="checkbox"
                          checked={newBot.notifications?.onError || false}
                          onChange={(e) => {
                            const currentSettings = newBot.notifications || {
                              onTrade: true,
                              onError: true,
                              onProfit: false,
                              profitThreshold: 5.0,
                              emailNotifications: false
                            };
                            setNewBot({
                              ...newBot,
                              notifications: {
                                ...currentSettings,
                                onError: e.target.checked
                              }
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-400">Notify on Profit Target Reached</label>
                        <input 
                          type="checkbox"
                          checked={newBot.notifications?.onProfit || false}
                          onChange={(e) => {
                            const currentSettings = newBot.notifications || {
                              onTrade: true,
                              onError: true,
                              onProfit: false,
                              profitThreshold: 5.0,
                              emailNotifications: false
                            };
                            setNewBot({
                              ...newBot,
                              notifications: {
                                ...currentSettings,
                                onProfit: e.target.checked
                              }
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Profit Notification Threshold (%)
                        </label>
                        <input 
                          type="number"
                          min="0"
                          step="0.5"
                          value={newBot.notifications?.profitThreshold || 5.0}
                          onChange={(e) => {
                            const currentSettings = newBot.notifications || {
                              onTrade: true,
                              onError: true,
                              onProfit: false,
                              profitThreshold: 5.0,
                              emailNotifications: false
                            };
                            setNewBot({
                              ...newBot,
                              notifications: {
                                ...currentSettings,
                                profitThreshold: parseFloat(e.target.value)
                              }
                            });
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Notify when profit exceeds this percentage
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-400">Email Notifications</label>
                        <input 
                          type="checkbox"
                          checked={newBot.notifications?.emailNotifications || false}
                          onChange={(e) => {
                            const currentSettings = newBot.notifications || {
                              onTrade: true,
                              onError: true,
                              onProfit: false,
                              profitThreshold: 5.0,
                              emailNotifications: false
                            };
                            setNewBot({
                              ...newBot,
                              notifications: {
                                ...currentSettings,
                                emailNotifications: e.target.checked
                              }
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Networks Tab */}
                {activeTab === 'networks' && (
                  <div className="space-y-4">
                    <div className="flex items-center border-b border-slate-700 pb-4">
                      <Globe className="h-5 w-5 text-blue-400 mr-2" />
                      <h3 className="text-md font-medium text-white">Network Preferences</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Preferred Networks (in order of priority)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableNetworks.map(network => (
                          <div 
                            key={network}
                            onClick={() => handleToggleNetwork(network)}
                            className={`border rounded-md p-2 cursor-pointer flex items-center justify-center text-sm ${
                              (newBot.networkPreferences?.preferredNetworks || []).includes(network)
                                ? 'bg-blue-900/20 border-blue-600 text-blue-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {network}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Networks will be used in the order selected. If a network fails, the bot will try the next one.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-400">Auto-select Best Network</label>
                        <input 
                          type="checkbox"
                          checked={newBot.networkPreferences?.autoSelectBestNetwork || false}
                          onChange={(e) => {
                            const currentSettings = newBot.networkPreferences || {
                              preferredNetworks: ['ETH', 'BSC', 'SOL'],
                              autoSelectBestNetwork: true,
                              allowCrossChainArbitrage: false,
                              maxGasPrice: 100,
                              networkFeeReserve: 20
                            };
                            setNewBot({
                              ...newBot,
                              networkPreferences: {
                                ...currentSettings,
                                autoSelectBestNetwork: e.target.checked
                              }
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-400">Allow Cross-Chain Arbitrage</label>
                        <input 
                          type="checkbox"
                          checked={newBot.networkPreferences?.allowCrossChainArbitrage || false}
                          onChange={(e) => {
                            const currentSettings = newBot.networkPreferences || {
                              preferredNetworks: ['ETH', 'BSC', 'SOL'],
                              autoSelectBestNetwork: true,
                              allowCrossChainArbitrage: false,
                              maxGasPrice: 100,
                              networkFeeReserve: 20
                            };
                            setNewBot({
                              ...newBot,
                              networkPreferences: {
                                ...currentSettings,
                                allowCrossChainArbitrage: e.target.checked
                              }
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">
                            Maximum Gas Price (GWEI)
                          </label>
                          <input 
                            type="number"
                            min="1"
                            max="500"
                            value={newBot.networkPreferences?.maxGasPrice || 100}
                            onChange={(e) => {
                              const currentSettings = newBot.networkPreferences || {
                                preferredNetworks: ['ETH', 'BSC', 'SOL'],
                                autoSelectBestNetwork: true,
                                allowCrossChainArbitrage: false,
                                maxGasPrice: 100,
                                networkFeeReserve: 20
                              };
                              setNewBot({
                                ...newBot,
                                networkPreferences: {
                                  ...currentSettings,
                                  maxGasPrice: parseInt(e.target.value)
                                }
                              });
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">
                            Network Fee Reserve (USD)
                          </label>
                          <input 
                            type="number"
                            min="1"
                            value={newBot.networkPreferences?.networkFeeReserve || 20}
                            onChange={(e) => {
                              const currentSettings = newBot.networkPreferences || {
                                preferredNetworks: ['ETH', 'BSC', 'SOL'],
                                autoSelectBestNetwork: true,
                                allowCrossChainArbitrage: false,
                                maxGasPrice: 100,
                                networkFeeReserve: 20
                              };
                              setNewBot({
                                ...newBot,
                                networkPreferences: {
                                  ...currentSettings,
                                  networkFeeReserve: parseInt(e.target.value)
                                }
                              });
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowBotModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveBot}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingBot ? 'Update Bot' : 'Create Bot'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* History Modal */}
      {showHistoryModal && selectedBotForHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Transaction History: {selectedBotForHistory.name}
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowHistoryModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <span className="text-sm text-slate-400">Total transactions: </span>
                  <span className="text-white font-medium">{botTrades.length}</span>
                </div>
                <Button variant="outline" size="sm" className="h-8" onClick={() => {
                  const freshHistory = generateMockTradeHistory(selectedBotForHistory.id);
                  setBotTrades(freshHistory);
                  toast({
                    title: "History Refreshed",
                    description: `Loaded ${freshHistory.length} transactions`
                  });
                }}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
              
              {botTrades.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left font-medium text-slate-400 py-2 px-3">Date & Time</th>
                        <th className="text-left font-medium text-slate-400 py-2 px-3">Pair</th>
                        <th className="text-left font-medium text-slate-400 py-2 px-3">Exchange Route</th>
                        <th className="text-left font-medium text-slate-400 py-2 px-3">Network</th>
                        <th className="text-right font-medium text-slate-400 py-2 px-3">Amount</th>
                        <th className="text-right font-medium text-slate-400 py-2 px-3">Gas Fee</th>
                        <th className="text-right font-medium text-slate-400 py-2 px-3">Profit</th>
                        <th className="text-center font-medium text-slate-400 py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {botTrades.map(trade => (
                        <tr key={trade.id} className="border-b border-slate-700/50 hover:bg-slate-800/40">
                          <td className="py-2 px-3 text-slate-300">
                            {trade.timestamp.toLocaleDateString()} {trade.timestamp.toLocaleTimeString()}
                          </td>
                          <td className="py-2 px-3 text-white font-medium">{trade.pair}</td>
                          <td className="py-2 px-3 text-slate-300">
                            {trade.buyExchange} → {trade.sellExchange}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              trade.network === 'ETH' ? 'bg-blue-900/20 text-blue-400' :
                              trade.network === 'BSC' ? 'bg-yellow-900/20 text-yellow-400' :
                              trade.network === 'SOL' ? 'bg-purple-900/20 text-purple-400' :
                              'bg-slate-700 text-slate-300'
                            }`}>
                              {trade.network}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-slate-300">${trade.amount.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right text-slate-400">${trade.gasFee.toFixed(2)}</td>
                          <td className={`py-2 px-3 text-right font-medium ${
                            trade.status === 'completed' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {trade.status === 'completed' ? `+$${trade.profit.toFixed(2)}` : '$0.00'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              trade.status === 'completed' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                            }`}>
                              {trade.status === 'completed' ? 'Completed' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-lg p-6 text-center">
                  <p className="text-slate-400">No transaction history found for this bot.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Analytics Modal */}
      {showAnalyticsModal && selectedBotForAnalytics && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Performance Analytics: {selectedBotForAnalytics.name}
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAnalyticsModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {botTrades.length > 0 ? (
                <>
                  {(() => {
                    const analytics = calculateAnalytics(botTrades);
                    if (!analytics) return null;
                    
                    return (
                      <div className="space-y-6">
                        {/* Overview stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                            <p className="text-slate-400 text-sm mb-1">Total Profit</p>
                            <p className="text-green-400 text-xl font-bold">${analytics.totalProfit.toFixed(2)}</p>
                          </div>
                          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                            <p className="text-slate-400 text-sm mb-1">Success Rate</p>
                            <p className="text-white text-xl font-bold">{analytics.successRate.toFixed(1)}%</p>
                          </div>
                          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                            <p className="text-slate-400 text-sm mb-1">Total Trades</p>
                            <p className="text-white text-xl font-bold">{analytics.totalTrades}</p>
                          </div>
                          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                            <p className="text-slate-400 text-sm mb-1">Avg. Profit/Trade</p>
                            <p className="text-green-400 text-xl font-bold">${analytics.avgProfit.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        {/* Trading efficiency */}
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                          <h3 className="text-white font-medium mb-3">Trading Efficiency</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-slate-400 text-sm mb-1">Gas Fees Spent</p>
                              <p className="text-red-400 text-lg font-medium">${analytics.totalGasFees.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm mb-1">Net Profit (After Gas)</p>
                              <p className="text-green-400 text-lg font-medium">
                                ${(analytics.totalProfit - analytics.totalGasFees).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm mb-1">Avg. Execution Time</p>
                              <p className="text-white text-lg font-medium">{analytics.avgExecutionTime}s</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Performance by asset pair */}
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                          <h3 className="text-white font-medium mb-3">Best Performing Pairs</h3>
                          <div className="space-y-2">
                            {analytics.bestPairs.map((item: any, index: number) => (
                              <div key={item.pair} className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <span className="w-6 text-slate-400">{index + 1}.</span>
                                  <span className="text-white">{item.pair}</span>
                                </div>
                                <span className="text-green-400">${(item.profit as number).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Network comparison */}
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                          <h3 className="text-white font-medium mb-3">Performance by Network</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {Object.entries(analytics.networkProfits).map(([network, profit]) => (
                              <div key={network} className="bg-slate-700/50 rounded p-2">
                                <div className={`flex items-center justify-between mb-1`}>
                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                    network === 'ETH' ? 'bg-blue-900/20 text-blue-400' :
                                    network === 'BSC' ? 'bg-yellow-900/20 text-yellow-400' :
                                    network === 'SOL' ? 'bg-purple-900/20 text-purple-400' :
                                    'bg-slate-700 text-slate-300'
                                  }`}>
                                    {network}
                                  </span>
                                  <span className="text-green-400">${(profit as number).toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${
                                      network === 'ETH' ? 'bg-blue-500' :
                                      network === 'BSC' ? 'bg-yellow-500' :
                                      network === 'SOL' ? 'bg-purple-500' :
                                      'bg-green-500'
                                    }`}
                                    style={{ 
                                      width: `${Math.min(100, ((profit as number) / analytics.totalProfit) * 100)}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Trade activity by hour */}
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                          <h3 className="text-white font-medium mb-3">Trade Activity by Hour</h3>
                          <div className="h-40 flex items-end">
                            {analytics.hourlyDistribution.map((count, hour) => {
                              const maxCount = Math.max(...analytics.hourlyDistribution);
                              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                              
                              return (
                                <div key={hour} className="flex-1 flex flex-col items-center">
                                  <div 
                                    className="w-full bg-blue-500/30 hover:bg-blue-500/50 transition-colors cursor-pointer"
                                    style={{ height: `${percentage}%` }}
                                    title={`${hour}:00 - ${count} trades`}
                                  ></div>
                                  <span className="text-xs text-slate-500 mt-1">
                                    {hour}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-xs text-slate-400">Hour of Day (24h format)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="bg-slate-800 rounded-lg p-6 text-center">
                  <p className="text-slate-400">No analytics data available for this bot.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bots;
