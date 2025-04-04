import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, LineChart, BarChart3, History, Bot, ArrowRight, Clock, Activity, RefreshCw, AlertCircle, Settings, Bell, Zap } from 'lucide-react';
import ArbitrageOpportunity from '@/components/dashboard/ArbitrageOpportunity';
import StatCard from '@/components/dashboard/StatCard';
import SmallStatCard from '@/components/dashboard/SmallStatCard';
import ProfitChart from '@/components/dashboard/ProfitChart';
import ExchangeSelector from '@/components/dashboard/ExchangeSelector';
import MarketOverview from '@/components/dashboard/MarketOverview';
import ExchangeVolume from '@/components/dashboard/ExchangeVolume';
import { Button } from '@/components/ui/button';
import { exchanges } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { fetchArbitrageOpportunities } from '@/lib/api/cryptoDataApi';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(['binance', 'coinbase', 'kucoin']);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [arbitrageType, setArbitrageType] = useState<'direct' | 'triangular' | 'futures'>('direct');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch real arbitrage opportunities
    const getArbitrageOpportunities = async () => {
      setIsLoading(true);
      try {
        const data = await fetchArbitrageOpportunities(arbitrageType, 0.5, 10000);
        setOpportunities(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Failed to fetch arbitrage opportunities:", err);
        toast({
          title: "Data Loading Error",
          description: "Unable to load arbitrage opportunities. Please refresh and try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getArbitrageOpportunities();
    
    // Set up regular data refresh
    const interval = setInterval(() => {
      getArbitrageOpportunities();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [arbitrageType]);
  
  // Filter top 3 opportunities for the dashboard cards
  const topOpportunities = opportunities.slice(0, 3);

  const handleTypeChange = (type: 'direct' | 'triangular' | 'futures') => {
    setArbitrageType(type);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
      toast({
        title: "Dashboard Refreshed",
        description: "Latest data has been loaded successfully.",
      });
    }, 800);
  };

  const navigateToScanner = () => {
    navigate('/scanner');
  };

  const navigateToBots = () => {
    navigate('/bots');
  };

  const handleBotExecution = (opportunity: any) => {
    // Check if all required APIs are configured
    const checkApiKeys = () => {
      // In production, this would check actual API key storage
      // For now, we'll simulate API key validation
      const configuredExchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin'];
      
      const buyExchangeConfigured = configuredExchanges.includes(opportunity.buyExchange);
      const sellExchangeConfigured = configuredExchanges.includes(opportunity.sellExchange);
      
      if (!buyExchangeConfigured || !sellExchangeConfigured) {
        const missingExchanges = [];
        if (!buyExchangeConfigured) missingExchanges.push(opportunity.buyExchange);
        if (!sellExchangeConfigured) missingExchanges.push(opportunity.sellExchange);
        
        toast({
          title: "API Keys Required",
          description: `Missing API keys for: ${missingExchanges.join(', ')}. Please add them in the Profile section.`,
          variant: "destructive",
        });
        
        // Navigate to profile after a short delay
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
        
        return false;
      }
      
      return true;
    };
    
    // Show initial toast notification
    toast({
      title: "Universal Bot Activated",
      description: `Checking requirements for ${opportunity.pair} arbitrage between ${opportunity.buyExchange} and ${opportunity.sellExchange}`,
      variant: "default"
    });
    
    // Simulate API key check
    setTimeout(() => {
      if (!checkApiKeys()) return;
      
      toast({
        title: "Trade Requirements Verified",
        description: `API keys and balances confirmed. Directing to Universal Bot for execution.`,
        variant: "default"
      });
      
      // Navigate to bots page with universal bot pre-selected
      setTimeout(() => {
        // In a real implementation, this would include a mechanism to pass the opportunity
        // details to the universal bot on the Bots page
        navigate('/bots?universal=true&opportunityId=' + opportunity.id);
      }, 1000);
    }, 1000);
  };
  
  return (
    <div className="p-6">
      {/* Dashboard Header with Quick Stats */}
      <div className="mb-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <h1 className="text-xl font-bold text-white">Arbitrage Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Last Updated:</span>
              <span className="text-white font-mono">{lastUpdated.toLocaleTimeString()}</span>
              <button 
                onClick={handleManualRefresh}
                className="h-5 w-5 rounded-full flex items-center justify-center bg-slate-700 text-blue-400 hover:bg-slate-600 transition-colors"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-slate-700/50">
          <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs text-slate-400">Available Opportunities</h4>
              <span className="text-xs px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded">Live</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{opportunities.length}</p>
            <p className="text-xs text-slate-500 mt-1">+{Math.floor(Math.random() * 10)}% from yesterday</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs text-slate-400">Best Spread Available</h4>
              <span className="text-xs px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded">Profitable</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-500 tracking-tight">
              {opportunities.length > 0 
                ? Math.max(...opportunities.map(opp => opp.spreadPercentage)).toFixed(2) 
                : 0}%
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">Investment:</span>
              <div className="relative flex-1">
                <span className="absolute text-xs text-slate-400 left-2 top-1/2 transform -translate-y-1/2">$</span>
                <input 
                  type="number" 
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-700 border border-slate-600 rounded py-0.5 pl-6 pr-2 text-xs text-white"
                />
              </div>
            </div>
            <p className="text-xs text-green-400 mt-1">
              Potential profit: $
              {opportunities.length > 0 
                ? ((Math.max(...opportunities.map(opp => opp.spreadPercentage)) / 100) * investmentAmount).toFixed(2)
                : '0.00'}
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs text-slate-400">Today's Profit</h4>
              <span className="text-xs px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded">Realized</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">$1,245.32</p>
            <div className="flex items-center text-xs text-green-400 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+8.5% from yesterday</span>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs text-slate-400">Arbitrage Mode</h4>
              <Badge variant="outline" className="text-xs h-5 bg-slate-800 hover:bg-slate-700">Switch</Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={() => handleTypeChange('direct')}
                className={`px-2 py-1 rounded text-xs ${arbitrageType === 'direct' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Direct
              </button>
              <button 
                onClick={() => handleTypeChange('triangular')}
                className={`px-2 py-1 rounded text-xs ${arbitrageType === 'triangular' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Triangular
              </button>
              <button 
                onClick={() => handleTypeChange('futures')}
                className={`px-2 py-1 rounded text-xs ${arbitrageType === 'futures' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Futures
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-3 text-center bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700">
          <button
            onClick={navigateToScanner}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            View all opportunities in the Scanner
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {/* Main Content Area - Reorganized for better balance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column - Opportunities */}
        <div className="lg:col-span-4 space-y-5">
          {/* Top Arbitrage Opportunities */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Top Opportunities
              </h2>
              <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-500/30">
                {arbitrageType.charAt(0).toUpperCase() + arbitrageType.slice(1)}
              </Badge>
            </div>
            
            <div className="divide-y divide-slate-700/50">
              {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <div 
                    key={index} 
                    className="p-4 animate-pulse"
                  >
                    <div className="h-6 bg-slate-700 rounded mb-4 w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-full"></div>
                      <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                    </div>
                  </div>
                ))
              ) : topOpportunities.length > 0 ? (
                topOpportunities.map((opportunity, idx) => (
                  <div key={opportunity.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className="text-slate-400 text-sm mr-2">{idx + 1}.</span>
                        <h3 className="font-medium text-white">{opportunity.pair}</h3>
                      </div>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                        opportunity.spreadPercentage >= 3 ? 'text-green-500' : 
                        opportunity.spreadPercentage >= 1.5 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {opportunity.spreadPercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>Buy at:</span>
                        <span className="text-white">{opportunity.buyExchange} (${opportunity.buyPrice.toFixed(2)})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sell at:</span>
                        <span className="text-white">{opportunity.sellExchange} (${opportunity.sellPrice.toFixed(2)})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Profit on ${investmentAmount}:</span>
                        <span className="text-green-500">${((opportunity.spreadPercentage / 100) * investmentAmount).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between gap-2">
                      <button 
                        className="text-xs py-1 px-2 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center justify-center gap-1 flex-1"
                        onClick={() => handleBotExecution(opportunity)}
                      >
                        <Bot className="h-3 w-3" />
                        Auto Execute
                      </button>
                      <button className="text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center justify-center gap-1 flex-1"
                        onClick={() => navigate('/scanner')}>
                        <ArrowRight className="h-3 w-3" />
                        Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-400">No arbitrage opportunities found. Please try again later.</p>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-slate-700 bg-slate-800">
              <button 
                onClick={navigateToScanner}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors flex items-center justify-center gap-1"
              >
                View All Opportunities
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Market Insights Section - Moved here for better layout balance */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                Market Insights
              </h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-blue-400">Volatility Alert</span>
                  <span className="text-xs text-slate-400">12m ago</span>
                </div>
                <p className="text-xs text-slate-300">BTC volatility has increased by 18% in the last hour, creating new arbitrage opportunities.</p>
              </div>
              
              <div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-green-400">Price Divergence</span>
                  <span className="text-xs text-slate-400">34m ago</span>
                </div>
                <p className="text-xs text-slate-300">ETH prices are diverging across Binance and Coinbase, with a 2.3% spread opportunity.</p>
              </div>
              
              <div className="p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-amber-400">Network Congestion</span>
                  <span className="text-xs text-slate-400">1h ago</span>
                </div>
                <p className="text-xs text-slate-300">Ethereum network is experiencing high congestion. Consider using BSC for transfers.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Middle Column - Market & Performance */}
        <div className="lg:col-span-4 space-y-5">
          <MarketOverview />
          
          {/* Execution Stats */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-medium text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Performance
              </h2>
              <Badge variant="outline" className="text-xs h-5 bg-slate-800 hover:bg-slate-700 cursor-pointer">
                7D
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard 
                title="Execution Success Rate"
                value="94%"
                change="2.5%"
                isPositive={true} 
              />
              <StatCard 
                title="Avg. Execution Time"
                value="1.2s"
                change="0.3s"
                isPositive={true} 
              />
              <StatCard 
                title="Completed Trades"
                value="128"
                change="12"
                isPositive={true} 
              />
              <StatCard 
                title="Failed Trades"
                value="8"
                change="3"
                isPositive={false}
              />
            </div>
            
            <div className="mt-4 border-t border-slate-700 pt-4">
              <h3 className="text-white text-sm font-medium mb-3">Recent Activity</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-slate-400">
                    <span className="text-white font-medium">BTC/USDT</span> trade completed (2.1% profit)
                  </span>
                  <span className="text-slate-500 ml-auto">12m ago</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-slate-400">
                    <span className="text-white font-medium">ETH/USDT</span> trade completed (1.8% profit)
                  </span>
                  <span className="text-slate-500 ml-auto">34m ago</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-slate-400">
                    <span className="text-white font-medium">SOL/USDT</span> trade failed (timeout)
                  </span>
                  <span className="text-slate-500 ml-auto">1h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Profit & Bot Management */}
        <div className="lg:col-span-4 space-y-5">
          {/* Profit Chart Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-white font-medium text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-400" />
                Profit Overview
              </h2>
            </div>
            <ProfitChart title="" />
            <div className="p-4 border-t border-slate-700 bg-slate-800/60">
              <div className="grid grid-cols-2 gap-3">
                <SmallStatCard 
                  title="Total Profit (7d)" 
                  value="$3,482.15" 
                  icon={LineChart}
                  trend="up"
                  trendValue="12%"
                />
                <SmallStatCard 
                  title="Total Trades" 
                  value="1,253" 
                  icon={History}
                  trend="up"
                  trendValue="8%"
                />
              </div>
            </div>
          </div>
          
          {/* Active Bots Section - Enhanced with more management options */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400" /> 
                Active Bots
              </h3>
              <Badge variant="outline" className="bg-slate-800 hover:bg-slate-700 cursor-pointer">
                3/5 Active
              </Badge>
            </div>
            <div className="divide-y divide-slate-700/50">
              <div className="p-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0 mt-1"></div>
                    <div>
                      <div className="text-sm font-medium text-white">Cross-Exchange Bot</div>
                      <div className="text-xs text-slate-400">Trading BTC/USDT, ETH/USDT</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-green-500 font-medium">$583.21 today</div>
                    <div className="flex gap-1 mt-1">
                      <button className="p-1 bg-slate-700 hover:bg-slate-600 rounded" title="Bot Settings">
                        <Settings className="h-3 w-3 text-slate-400" />
                      </button>
                      <button className="p-1 bg-slate-700 hover:bg-slate-600 rounded" title="Notifications">
                        <Bell className="h-3 w-3 text-slate-400" />
                      </button>
                      <button className="p-1 bg-green-800 hover:bg-green-700 rounded" title="Running">
                        <Zap className="h-3 w-3 text-green-400" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Daily Limit: 75%</span>
                  <span>$583.21 / $800</span>
                </div>
              </div>
              
              <div className="p-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0 mt-1"></div>
                    <div>
                      <div className="text-sm font-medium text-white">Triangular Bot</div>
                      <div className="text-xs text-slate-400">On Binance: BTC/ETH/USDT</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-green-500 font-medium">$302.87 today</div>
                    <div className="flex gap-1 mt-1">
                      <button className="p-1 bg-slate-700 hover:bg-slate-600 rounded" title="Bot Settings">
                        <Settings className="h-3 w-3 text-slate-400" />
                      </button>
                      <button className="p-1 bg-slate-700 hover:bg-slate-600 rounded" title="Notifications">
                        <Bell className="h-3 w-3 text-slate-400" />
                      </button>
                      <button className="p-1 bg-green-800 hover:bg-green-700 rounded" title="Running">
                        <Zap className="h-3 w-3 text-green-400" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Daily Limit: 60%</span>
                  <span>$302.87 / $500</span>
                </div>
              </div>
              
              <div className="p-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0 mt-1"></div>
                    <div>
                      <div className="text-sm font-medium text-white">Futures Bot</div>
                      <div className="text-xs text-slate-400">Trading BTC/USDT on Binance</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-green-500 font-medium">$359.24 today</div>
                    <div className="flex gap-1 mt-1">
                      <button className="p-1 bg-slate-700 hover:bg-slate-600 rounded" title="Bot Settings">
                        <Settings className="h-3 w-3 text-slate-400" />
                      </button>
                      <button className="p-1 bg-slate-700 hover:bg-slate-600 rounded" title="Notifications">
                        <Bell className="h-3 w-3 text-slate-400" />
                      </button>
                      <button className="p-1 bg-green-800 hover:bg-green-700 rounded" title="Running">
                        <Zap className="h-3 w-3 text-green-400" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Daily Limit: 45%</span>
                  <span>$359.24 / $800</span>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-700 bg-slate-800">
              <button 
                onClick={navigateToBots}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors flex items-center justify-center gap-1"
              >
                Manage All Bots
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Exchange Volume Section - Full Width with Better Styling */}
      <div className="mt-5">
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Exchange Volume Distribution
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs h-5 bg-slate-800 hover:bg-slate-700 cursor-pointer">
                  24H
                </Badge>
                <button 
                  onClick={handleManualRefresh}
                  className="h-6 w-6 rounded-full flex items-center justify-center bg-slate-700 text-blue-400 hover:bg-slate-600 transition-colors"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          <ExchangeVolume />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
