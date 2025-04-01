
import React, { useState } from 'react';
import { Bot, Play, Pause, Settings, Plus, ChevronDown, AlertTriangle, Trash2, BarChart3 } from 'lucide-react';
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
    createdAt: new Date('2023-10-15')
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
    createdAt: new Date('2023-11-22')
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
    createdAt: new Date('2024-01-05')
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

const Bots = () => {
  const [activeBots, setActiveBots] = useState<TradingBot[]>(mockBots);
  const [showTemplates, setShowTemplates] = useState(false);

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
      toast({
        title: "Edit Bot",
        description: "Bot editor will be available soon",
        variant: "default",
      });
    }
  };

  const handleCreateBot = (templateType: string) => {
    toast({
      title: "Create New Bot",
      description: `New ${templateType} bot creator will be available soon`,
      variant: "default",
    });
    setShowTemplates(false);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Trading Bots</h1>
        <p className="text-slate-400">
          Manage your automated arbitrage trading strategies
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast({ title: "Refresh", description: "Bot status refreshed" })}>
            Refresh Status
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "All Bots", description: "This would stop all bots" })}>
            Stop All
          </Button>
        </div>
        
        <div className="relative">
          <Button 
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Bot
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
          
          {showTemplates && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 overflow-hidden">
              <div className="p-3 border-b border-slate-700">
                <h3 className="font-medium text-white">Bot Templates</h3>
                <p className="text-xs text-slate-400">Select a template to start with</p>
              </div>
              
              <div className="divide-y divide-slate-700">
                {botTemplates.map((template, index) => (
                  <div 
                    key={index}
                    className="p-3 hover:bg-slate-700 cursor-pointer transition-colors"
                    onClick={() => handleCreateBot(template.type)}
                  >
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium text-white">{template.name}</h4>
                      <span className="text-xs bg-slate-600 px-2 py-0.5 rounded text-slate-300">
                        {template.complexity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">{template.description}</p>
                    <div className="text-xs text-slate-400">Expected profit: {template.expectedProfit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {activeBots.map(bot => (
          <div 
            key={bot.id}
            className={cn(
              "bg-slate-800 border rounded-lg p-4 transition-colors",
              bot.status === 'active' 
                ? "border-green-500" 
                : "border-slate-700"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-white">{bot.name}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <span>{bot.type.charAt(0).toUpperCase() + bot.type.slice(1)}</span>
                  <span>•</span>
                  <span>{bot.exchanges.join(', ')}</span>
                </div>
              </div>
              
              <div className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                bot.status === 'active' ? "bg-green-500/20 text-green-400" :
                bot.status === 'paused' ? "bg-yellow-500/20 text-yellow-400" :
                "bg-slate-500/20 text-slate-400"
              )}>
                {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-slate-400 mb-1">Today's Profit</div>
                <div className={cn(
                  "font-bold",
                  bot.profitToday > 0 ? "text-green-500" : 
                  bot.profitToday < 0 ? "text-red-500" : "text-slate-400"
                )}>
                  {bot.profitToday > 0 ? '+' : ''}{bot.profitToday.toFixed(2)} USD
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-slate-400 mb-1">Total Profit</div>
                <div className={cn(
                  "font-bold",
                  bot.profitTotal > 0 ? "text-green-500" : 
                  bot.profitTotal < 0 ? "text-red-500" : "text-slate-400"
                )}>
                  {bot.profitTotal > 0 ? '+' : ''}{bot.profitTotal.toFixed(2)} USD
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700 rounded-md p-2 mb-4">
              <div className="text-xs text-slate-400 mb-1">Trading Pairs</div>
              <div className="flex flex-wrap gap-1">
                {bot.pairs.map((pair, idx) => (
                  <span 
                    key={idx}
                    className="text-xs bg-slate-600 px-2 py-0.5 rounded text-white"
                  >
                    {pair}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <AlertTriangle className={cn(
                  "h-3 w-3",
                  bot.riskLevel === 'high' ? "text-red-500" :
                  bot.riskLevel === 'medium' ? "text-yellow-500" :
                  "text-green-500"
                )} />
                <span className="text-xs text-slate-400">
                  {bot.riskLevel.charAt(0).toUpperCase() + bot.riskLevel.slice(1)} Risk
                </span>
              </div>
              
              <div className="text-xs text-slate-400">
                Created {bot.createdAt.toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex justify-between gap-2">
              {bot.status === 'active' ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => handleBotAction(bot.id, 'pause')}
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => handleBotAction(bot.id, 'start')}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => handleBotAction(bot.id, 'edit')}
              >
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => handleBotAction(bot.id, 'delete')}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => toast({ title: "Analytics", description: "Bot performance analytics coming soon" })}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Stats
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-2">Pro Tips</h3>
        <p className="text-sm text-slate-300 mb-3">
          Improve your arbitrage trading success with these strategies:
        </p>
        <ul className="text-sm text-slate-300 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>Combine cross-exchange and triangular strategies for maximum opportunities</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>Start with stablecoin pairs for lower volatility and risk</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>Consider exchange withdrawal times when calculating potential profits</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>Always account for network fees and exchange transaction fees</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Bots;
