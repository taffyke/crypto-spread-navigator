import React, { useState } from 'react';
import { Bot, Play, Pause, Settings, Plus, ChevronDown, AlertTriangle, Trash2, BarChart3, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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
}

const mockBots: TradingBot[] = [
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

const Bots = () => {
  const [activeBots, setActiveBots] = useState<TradingBot[]>(mockBots);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBotModal, setShowBotModal] = useState(false);
  const [editingBot, setEditingBot] = useState<TradingBot | null>(null);
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
    }
  });

  const handleBotAction = (botId: string, action: 'start' | 'pause' | 'stop' | 'delete' | 'edit') => {
    if (action === 'start') {
      setActiveBots(prevBots => 
        prevBots.map(bot => 
          bot.id === botId ? { ...bot, status: 'active' } : bot
        )
      );
      toast({
        title: "Bot Started",
        description: "Your trading bot is now running",
        variant: "default",
      });
    } else if (action === 'pause') {
      setActiveBots(prevBots => 
        prevBots.map(bot => 
          bot.id === botId ? { ...bot, status: 'paused' } : bot
        )
      );
      toast({
        title: "Bot Paused",
        description: "Your trading bot has been paused",
        variant: "default",
      });
    } else if (action === 'delete') {
      setActiveBots(prevBots => prevBots.filter(bot => bot.id !== botId));
      toast({
        title: "Bot Deleted",
        description: "Your trading bot has been deleted",
        variant: "destructive",
      });
    } else if (action === 'edit') {
      const botToEdit = activeBots.find(bot => bot.id === botId);
      if (botToEdit) {
        setEditingBot(botToEdit);
        setNewBot(botToEdit);
        setShowBotModal(true);
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
      }
    });
    setEditingBot(null);
    setShowBotModal(true);
    setShowTemplates(false);
  };

  const handleSaveBot = () => {
    if (!newBot.name || !newBot.type || newBot.exchanges?.length === 0 || newBot.pairs?.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingBot) {
      // Update existing bot
      setActiveBots(prevBots => 
        prevBots.map(bot => 
          bot.id === editingBot.id ? { ...bot, ...newBot } : bot
        )
      );
      toast({
        title: "Bot Updated",
        description: `${newBot.name} has been updated successfully`,
        variant: "default",
      });
    } else {
      // Create new bot
      const bot: TradingBot = {
        id: `bot-${Date.now()}`,
        name: newBot.name || '',
        type: newBot.type as any || 'arbitrage',
        status: 'paused',
        profitToday: 0,
        profitTotal: 0,
        exchanges: newBot.exchanges || [],
        pairs: newBot.pairs || [],
        riskLevel: newBot.riskLevel as any || 'medium',
        createdAt: new Date(),
        tradesTaken: 0,
        successRate: 0,
        lastActivity: null,
        accuracySettings: newBot.accuracySettings || {
          slippage: 0.5,
          minProfitThreshold: 0.2,
          maxExecutionTime: 30,
          gasLimit: 0.01
        }
      };
      
      setActiveBots(prevBots => [...prevBots, bot]);
      toast({
        title: "Bot Created",
        description: `${bot.name} has been created successfully`,
        variant: "default",
      });
    }
    
    setShowBotModal(false);
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
      }
    });
    setEditingBot(null);
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
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Bot
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
              className={cn(
                "bg-slate-800 border rounded-lg overflow-hidden",
                bot.status === 'active' 
                  ? "border-green-600/50" 
                  : bot.status === 'paused'
                    ? "border-yellow-600/50"
                    : "border-slate-700"
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
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleBotAction(bot.id, 'edit')}
                    className="h-8 w-8"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                  </Button>
                  
                  {bot.status === 'active' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleBotAction(bot.id, 'pause')}
                      className="h-8 w-8"
                    >
                      <Pause className="h-4 w-4 text-slate-400" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleBotAction(bot.id, 'start')}
                      className="h-8 w-8"
                    >
                      <Play className="h-4 w-4 text-slate-400" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleBotAction(bot.id, 'delete')}
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
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
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Trades Taken</p>
                    <p className="text-sm font-medium text-white">
                      {bot.tradesTaken.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Success Rate</p>
                    <p className={cn(
                      "text-sm font-medium",
                      bot.successRate > 90 
                        ? "text-green-400" 
                        : bot.successRate > 75
                          ? "text-yellow-400"
                          : "text-red-400"
                    )}>
                      {bot.successRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-1">Last Activity</p>
                  <p className="text-sm font-medium text-white">
                    {formatRelativeTime(bot.lastActivity)}
                  </p>
                </div>
                
                <div className="mb-4">
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
                    
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      bot.riskLevel === 'low' 
                        ? "bg-green-900/20 text-green-400" 
                        : bot.riskLevel === 'medium'
                          ? "bg-yellow-900/20 text-yellow-400"
                          : "bg-red-900/20 text-red-400"
                    )}>
                      {bot.riskLevel.charAt(0).toUpperCase() + bot.riskLevel.slice(1)} Risk
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1">Exchanges & Pairs</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {bot.exchanges.map(exchange => (
                      <span key={exchange} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                        {exchange}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {bot.pairs.map(pair => (
                      <span key={pair} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                        {pair}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-slate-400 mt-3">
                  <div className="flex justify-between">
                    <span>Max Slippage: {bot.accuracySettings.slippage}%</span>
                    <span>Min Profit: {bot.accuracySettings.minProfitThreshold}%</span>
                  </div>
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
              <div className="flex justify-between items-center mb-6">
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
            
              <div className="space-y-4">
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
                        onClick={() => {
                          const exchanges = newBot.exchanges || [];
                          setNewBot({
                            ...newBot, 
                            exchanges: exchanges.includes(exchange) 
                              ? exchanges.filter(e => e !== exchange) 
                              : [...exchanges, exchange]
                          });
                        }}
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
                        onClick={() => {
                          const pairs = newBot.pairs || [];
                          setNewBot({
                            ...newBot, 
                            pairs: pairs.includes(pair) 
                              ? pairs.filter(p => p !== pair) 
                              : [...pairs, pair]
                          });
                        }}
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
    </div>
  );
};

export default Bots;
