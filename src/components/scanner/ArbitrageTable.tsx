import React, { useState, useEffect } from 'react';
import { ArrowUpDown, ExternalLink, ChevronDown, ChevronUp, RefreshCw, BarChart2, AlertTriangle, TrendingUp, Bot, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

export interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spreadPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: Date;
  volume24h: number;
  recommendedNetworks?: string[];
  type?: 'direct' | 'triangular' | 'futures';
}

interface ArbitrageTableProps {
  opportunities: ArbitrageOpportunity[];
  className?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  arbitrageType: 'direct' | 'triangular' | 'futures';
}

type SortKey = 'pair' | 'spreadPercentage' | 'riskLevel' | 'buyPrice' | 'sellPrice' | 'volume24h';
type SortDirection = 'asc' | 'desc';

const ArbitrageTable = ({ 
  opportunities, 
  className, 
  isLoading = false, 
  onRefresh,
  arbitrageType 
}: ArbitrageTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('spreadPercentage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Format currency amounts
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 0.01 ? 6 : 2
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Toggle row expansion (for mobile view)
  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Handle sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // New function to direct users to the exchange
  const handleExchangeNavigation = (exchange: string, pair: string) => {
    // Map exchange names to their trading URLs
    const exchangeUrls: Record<string, string> = {
      'binance': 'https://www.binance.com/en/trade/',
      'coinbase': 'https://exchange.coinbase.com/trade/',
      'kucoin': 'https://www.kucoin.com/trade/',
      'kraken': 'https://trade.kraken.com/charts/KRAKEN:',
      'bybit': 'https://www.bybit.com/en-US/trade/spot/',
      'bitfinex': 'https://trading.bitfinex.com/t/',
      'huobi': 'https://www.huobi.com/en-us/exchange/',
      'gate_io': 'https://www.gate.io/trade/',
      'okx': 'https://www.okx.com/trade-spot/'
    };
    
    // Format the pair according to each exchange's requirements
    const formattedPair = pair.replace('/', '-');
    
    // Form the correct URL based on the exchange
    let url = exchangeUrls[exchange.toLowerCase()] || `https://www.google.com/search?q=${exchange}+${pair}+trading`;
    
    // Add the formatted pair to the URL if we have a direct mapping
    if (exchangeUrls[exchange.toLowerCase()]) {
      url += formattedPair;
    }
    
    // Open in a new tab
    window.open(url, '_blank');
  };

  // Function renamed to reflect its purpose
  const handleViewCharts = (opportunity: ArbitrageOpportunity) => {
    navigate(`/charts/${opportunity.pair.split('/')[0]}/${opportunity.pair.split('/')[1]}?exchange=${opportunity.buyExchange}`);
  };

  // Execute trade action
  const handleExecuteTrade = (opportunity: ArbitrageOpportunity) => {
    handleExchangeNavigation(opportunity.buyExchange, opportunity.pair);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (onRefresh) {
      setRefreshing(true);
      onRefresh();
      
      // Reset refreshing state after a short delay
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }
  };

  // Add a method to handle bot execution
  const handleBotExecution = (opportunity: ArbitrageOpportunity) => {
    // Get the user settings (in a real app, this would come from a global state or context)
    // For this demo, we'll use some default values
    const userSettings = {
      capital: 100, // Default $100 USD
      minSpread: 1.5, // Minimum 1.5% spread to execute
      apiVerification: 'strict' as 'strict' | 'moderate' | 'lenient',
      autoStart: false,
      preferredNetworks: ['ETH', 'BSC', 'SOL']
    };
    
    // Get the cheapest network if available, or use preferred networks from settings
    const cheapestNetwork = opportunity.recommendedNetworks && opportunity.recommendedNetworks.length > 0 
      ? opportunity.recommendedNetworks[0] 
      : userSettings.preferredNetworks[0];
    
    // Check if opportunity meets minimum spread requirement
    if (opportunity.spreadPercentage < userSettings.minSpread) {
      toast({
        title: "Spread Too Low",
        description: `This opportunity's spread (${opportunity.spreadPercentage.toFixed(2)}%) is below your minimum threshold of ${userSettings.minSpread}%.`,
        variant: "destructive",
      });
      return;
    }
    
    // First check if both exchanges have API keys configured
    const checkApiKeys = () => {
      // This would be an actual API call in production
      // For now we're simulating API key checks
      const buyExchangeApiConfigured = checkExchangeApiConfigured(opportunity.buyExchange);
      const sellExchangeApiConfigured = checkExchangeApiConfigured(opportunity.sellExchange);
      
      // If using lenient verification, only check buy exchange
      if (userSettings.apiVerification === 'lenient' && buyExchangeApiConfigured) {
        return true;
      }
      
      // If using moderate verification, warn but allow if at least one exchange is configured
      if (userSettings.apiVerification === 'moderate' && (buyExchangeApiConfigured || sellExchangeApiConfigured)) {
        if (!buyExchangeApiConfigured || !sellExchangeApiConfigured) {
          const missingExchanges = [];
          if (!buyExchangeApiConfigured) missingExchanges.push(opportunity.buyExchange);
          if (!sellExchangeApiConfigured) missingExchanges.push(opportunity.sellExchange);
          
          toast({
            title: "Warning: Missing API Keys",
            description: `Missing API keys for: ${missingExchanges.join(', ')}. Continuing in moderate verification mode.`,
            variant: "default",
          });
        }
        return true;
      }
      
      // Strict verification requires both exchanges
      if (!buyExchangeApiConfigured || !sellExchangeApiConfigured) {
        const missingExchanges = [];
        if (!buyExchangeApiConfigured) missingExchanges.push(opportunity.buyExchange);
        if (!sellExchangeApiConfigured) missingExchanges.push(opportunity.sellExchange);
        
        toast({
          title: "API Keys Required",
          description: `Missing API keys for: ${missingExchanges.join(', ')}. Please add them in the Profile section.`,
          variant: "destructive",
        });
        
        return false;
      }
      
      return true;
    };
    
    // Check if exchange has enough balance for the trade
    const checkBalance = () => {
      // This would be an actual balance check in production
      // For now we're simulating balance checks
      const baseCurrency = opportunity.pair.split('/')[0];
      const quoteCurrency = opportunity.pair.split('/')[1];
      
      // Use the capital amount from settings
      const investmentAmount = userSettings.capital;
      
      // Calculate how much base currency we need based on current price
      const requiredBaseAmount = investmentAmount / opportunity.buyPrice;
      
      // Check if we have enough balance (simulated)
      const hasEnoughBalance = checkExchangeBalance(opportunity.buyExchange, quoteCurrency, investmentAmount);
      
      if (!hasEnoughBalance) {
        toast({
          title: "Insufficient Balance",
          description: `Not enough ${quoteCurrency} on ${opportunity.buyExchange} for this trade. Please deposit funds.`,
          variant: "destructive",
        });
        
        return false;
      }
      
      return true;
    };
    
    // If autoStart is enabled, skip confirmations
    if (userSettings.autoStart) {
      // Show notification that execution is starting automatically
      toast({
        title: "Auto-Execution Started",
        description: `Automatically executing ${opportunity.pair} arbitrage without confirmation.`,
        variant: "default",
      });
      
      // Skip to execution after quick API check
      setTimeout(() => {
        if (!checkApiKeys()) return;
        if (!checkBalance()) return;
        
        // Execute immediately
        toast({
          title: "Bot Execution Started",
          description: `Executing ${opportunity.pair} arbitrage using ${cheapestNetwork} network`,
          variant: "default",
        });
        
        // Simulate the execution process
        setTimeout(() => {
          toast({
            title: "Arbitrage Complete",
            description: `Successfully executed ${opportunity.pair} arbitrage with ${opportunity.spreadPercentage.toFixed(2)}% profit on $${userSettings.capital} investment`,
            variant: "default",
          });
        }, 2000);
      }, 500);
      
      return;
    }
    
    // Standard execution flow with confirmations
    toast({
      title: "Checking Requirements",
      description: `Verifying API keys and balance for ${opportunity.pair} arbitrage...`,
      variant: "default",
    });
    
    // Simulate API and balance checks (would be async in production)
    setTimeout(() => {
      if (!checkApiKeys()) return;
      
      toast({
        title: "API Keys Verified",
        description: `Exchange connections validated for ${opportunity.buyExchange} and ${opportunity.sellExchange}`,
        variant: "default",
      });
      
      setTimeout(() => {
        if (!checkBalance()) return;
        
        toast({
          title: "Balance Verified",
          description: `Sufficient funds available on ${opportunity.buyExchange}`,
          variant: "default",
        });
        
        // If all checks pass, start execution
        setTimeout(() => {
          toast({
            title: "Bot Execution Started",
            description: `Executing ${opportunity.pair} arbitrage with $${userSettings.capital} using ${cheapestNetwork} network`,
            variant: "default",
          });
          
          // Simulate the execution process
          setTimeout(() => {
            const profit = (opportunity.spreadPercentage / 100) * userSettings.capital;
            toast({
              title: "Arbitrage Complete",
              description: `Successfully executed ${opportunity.pair} arbitrage with profit of $${profit.toFixed(2)} (${opportunity.spreadPercentage.toFixed(2)}%)`,
              variant: "default",
            });
          }, 2000);
        }, 500);
      }, 600);
    }, 500);
  };
  
  // Simulated function to check if exchange API is configured
  const checkExchangeApiConfigured = (exchange: string): boolean => {
    // In production, this would check the actual stored API keys
    // For demo, we'll simulate these exchanges have API keys
    const configuredExchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin'];
    return configuredExchanges.includes(exchange);
  };
  
  // Simulated function to check if exchange has enough balance
  const checkExchangeBalance = (exchange: string, currency: string, amount: number): boolean => {
    // In production, this would check the actual balances
    // For demo purposes, we'll simulate that most exchanges have enough balance
    // but occasionally show an insufficient balance message
    return Math.random() > 0.2; // 80% chance of having enough balance
  };

  // Sort opportunities
  const sortedOpportunities = [...opportunities].sort((a, b) => {
    if (sortKey === 'riskLevel') {
      const riskOrder = { 'low': 1, 'medium': 2, 'high': 3 };
      const aValue = riskOrder[a.riskLevel as keyof typeof riskOrder];
      const bValue = riskOrder[b.riskLevel as keyof typeof riskOrder];
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });

  // Column component for sortable headers
  const SortableColumn = ({ label, sortableKey }: { label: string; sortableKey: SortKey }) => (
    <th
      className="px-2 md:px-4 py-2 text-left cursor-pointer hover:bg-slate-700 transition-colors"
      onClick={() => handleSort(sortableKey)}
    >
      <div className="flex items-center space-x-1">
        <span className="text-xs md:text-sm">{label}</span>
        {sortKey === sortableKey && (
          <ArrowUpDown className="h-3 md:h-4 w-3 md:w-4 text-slate-400" />
        )}
      </div>
    </th>
  );

  // Mobile view with expandable rows
  if (isMobile) {
    return (
      <div className={cn("overflow-x-auto relative", className)}>
        {(isLoading || refreshing) && (
          <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-10">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}
        
        <div className="flex justify-end mb-2">
          <button 
            className={cn(
              "text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors",
              refreshing ? "bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
            )}
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={cn("h-3 w-3", refreshing ? "animate-spin" : "")} />
            Refresh
          </button>
        </div>
        
        <div className="flex items-center my-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase
            ${arbitrageType === 'direct' ? 'bg-blue-900/60 text-blue-400' : 
            arbitrageType === 'triangular' ? 'bg-purple-900/60 text-purple-400' : 
            'bg-amber-900/60 text-amber-400'}`}
          >
            {arbitrageType}
          </span>
        </div>
        
        <table className="w-full text-xs text-white">
          <thead className="bg-slate-800 border-b border-slate-700">
            <tr>
              <th className="w-8 px-2 py-2">#</th>
              <SortableColumn label="Pair" sortableKey="pair" />
              <SortableColumn label="Spread" sortableKey="spreadPercentage" />
              <SortableColumn label="Risk" sortableKey="riskLevel" />
              <th className="w-8 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {sortedOpportunities.length > 0 ? (
              sortedOpportunities.map((opportunity, index) => {
                const isExpanded = expandedRows.has(opportunity.id);
                
                return (
                  <React.Fragment key={opportunity.id}>
                    <tr 
                      className="hover:bg-slate-800 transition-colors cursor-pointer"
                      onClick={() => toggleRowExpansion(opportunity.id)}
                    >
                      <td className="px-2 py-3 text-slate-400">{index + 1}</td>
                      <td className="px-2 py-3 font-medium">
                          <div className="flex items-center">
                            <img 
                              src={`https://assets.coincap.io/assets/icons/${opportunity.pair.split('/')[0].toLowerCase()}@2x.png`}
                              alt={opportunity.pair.split('/')[0]}
                              className="w-4 h-4 mr-1"
                              onError={(e) => {
                                // Try another source if first one fails
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // Prevent infinite loop
                                target.src = `/crypto-icons/${opportunity.pair.split('/')[0].toLowerCase()}.svg`;
                                target.onerror = () => {
                                  target.onerror = null;
                                  target.src = '/crypto-icons/generic.svg';
                                };
                              }}
                            />
                            <button 
                              className="text-white hover:text-blue-400 transition-colors font-medium flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExchangeNavigation(opportunity.buyExchange, opportunity.pair);
                              }}
                            >
                              {opportunity.pair}
                            </button>
                          </div>
                      </td>
                      <td className={cn(
                        "px-2 py-3 font-medium",
                        opportunity.spreadPercentage >= 3 ? "text-green-500" : 
                        opportunity.spreadPercentage >= 1 ? "text-yellow-500" : "text-slate-400"
                      )}>
                        {formatPercentage(opportunity.spreadPercentage)}
                      </td>
                      <td className={cn(
                        "px-2 py-3 font-medium",
                        opportunity.riskLevel === 'low' ? "text-green-500" : 
                        opportunity.riskLevel === 'medium' ? "text-yellow-500" : "text-red-500"
                      )}>
                        {opportunity.riskLevel.charAt(0).toUpperCase()}
                      </td>
                      <td className="px-2 py-3 text-center">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-slate-900">
                        <td colSpan={5} className="px-2 py-3">
                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div>
                              <span className="text-slate-400 block">Buy at:</span>
                              <div className="flex items-center text-slate-300">
                                <button 
                                  className="text-slate-300 hover:text-blue-400 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExchangeNavigation(opportunity.buyExchange, opportunity.pair);
                                  }}
                                >
                                  {opportunity.buyExchange}
                                </button>
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Sell at:</span>
                              <div className="flex items-center text-slate-300">
                                <button 
                                  className="text-slate-300 hover:text-blue-400 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExchangeNavigation(opportunity.sellExchange, opportunity.pair);
                                  }}
                                >
                                  {opportunity.sellExchange}
                                </button>
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Buy Price:</span>
                              <span className="font-medium">{formatCurrency(opportunity.buyPrice)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Sell Price:</span>
                              <span className="font-medium">{formatCurrency(opportunity.sellPrice)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">24h Volume:</span>
                              <span className="font-medium">{formatCurrency(opportunity.volume24h)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Recommended Networks:</span>
                              <span className="font-medium">{opportunity.recommendedNetworks?.join(', ') || 'Loading...'}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <button 
                              className="p-2 bg-purple-600 hover:bg-purple-500 rounded text-xs flex items-center justify-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBotExecution(opportunity);
                              }}
                            >
                              <Bot className="h-3 w-3" />
                              Execute with Bot
                            </button>
                            <button 
                              className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-xs flex items-center justify-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExchangeNavigation(opportunity.buyExchange, opportunity.pair);
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Buy on {opportunity.buyExchange}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : !isLoading ? (
              <tr>
                <td colSpan={5} className="px-2 py-8 text-center text-slate-400">
                  No arbitrage opportunities found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    );
  }

  // Desktop view with full table
  return (
    <div className={cn("overflow-x-auto relative", className)}>
      {(isLoading || refreshing) && (
        <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-10">
          <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      )}
      
      <div className="flex justify-end mb-2">
        <button 
          className={cn(
            "text-sm flex items-center gap-1 px-3 py-1.5 rounded transition-colors",
            refreshing ? "bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
          )}
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", refreshing ? "animate-spin" : "")} />
          Refresh
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
            ${arbitrageType === 'direct' ? 'bg-blue-900/60 text-blue-400' : 
            arbitrageType === 'triangular' ? 'bg-purple-900/60 text-purple-400' : 
            'bg-amber-900/60 text-amber-400'}`}
          >
            {arbitrageType} Arbitrage Mode
          </span>
          <span className="ml-3 text-xs text-slate-400">
            {arbitrageType === 'direct' ? 'Buy low on one exchange, sell high on another' : 
            arbitrageType === 'triangular' ? 'Trade across three different assets to profit from price differences' : 
            'Leverage price differences between spot and futures markets'}
          </span>
        </div>
      </div>
      
      <table className="w-full text-sm text-white">
        <thead className="bg-slate-800 border-b border-slate-700">
          <tr>
            <th className="w-12 px-4 py-2 text-left">#</th>
            <SortableColumn label="Pair" sortableKey="pair" />
            <th className="px-4 py-2 text-left">Buy at</th>
            <th className="px-4 py-2 text-left">Sell at</th>
            <SortableColumn label="Buy Price" sortableKey="buyPrice" />
            <SortableColumn label="Sell Price" sortableKey="sellPrice" />
            <SortableColumn label="Spread" sortableKey="spreadPercentage" />
            <SortableColumn label="Risk Level" sortableKey="riskLevel" />
            <SortableColumn label="24h Volume" sortableKey="volume24h" />
            <th className="px-4 py-2 text-left">Recommended Networks</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {sortedOpportunities.length > 0 ? (
            sortedOpportunities.map((opportunity, index) => (
              <tr 
                key={opportunity.id}
                className="hover:bg-slate-800 transition-colors"
              >
                <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                <td className="px-4 py-3 font-medium">
                  <button 
                    className="text-white hover:text-blue-400 transition-colors font-medium flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExchangeNavigation(opportunity.buyExchange, opportunity.pair);
                    }}
                  >
                    <div className="flex items-center">
                      <img 
                        src={`https://assets.coincap.io/assets/icons/${opportunity.pair.split('/')[0].toLowerCase()}@2x.png`}
                        alt={opportunity.pair.split('/')[0]}
                        className="w-5 h-5 mr-1"
                        onError={(e) => {
                          // Try another source if first one fails
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite loop
                          target.src = `/crypto-icons/${opportunity.pair.split('/')[0].toLowerCase()}.svg`;
                          target.onerror = () => {
                            target.onerror = null;
                            target.src = '/crypto-icons/generic.svg';
                          };
                        }}
                      />
                      {opportunity.pair}
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button 
                    className="text-slate-300 hover:text-blue-400 transition-colors font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExchangeNavigation(opportunity.buyExchange, opportunity.pair);
                    }}
                  >
                    {opportunity.buyExchange}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button 
                    className="text-slate-300 hover:text-blue-400 transition-colors font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExchangeNavigation(opportunity.sellExchange, opportunity.pair);
                    }}
                  >
                    {opportunity.sellExchange}
                  </button>
                </td>
                <td className="px-4 py-3">{formatCurrency(opportunity.buyPrice)}</td>
                <td className="px-4 py-3">{formatCurrency(opportunity.sellPrice)}</td>
                <td className={cn(
                  "px-4 py-3 font-medium",
                  opportunity.spreadPercentage >= 3 ? "text-green-500" : 
                  opportunity.spreadPercentage >= 1 ? "text-yellow-500" : "text-slate-400"
                )}>
                  {formatPercentage(opportunity.spreadPercentage)}
                </td>
                <td className={cn(
                  "px-4 py-3 font-medium",
                  opportunity.riskLevel === 'low' ? "text-green-500" : 
                  opportunity.riskLevel === 'medium' ? "text-yellow-500" : "text-red-500"
                )}>
                  {opportunity.riskLevel.charAt(0).toUpperCase() + opportunity.riskLevel.slice(1)}
                </td>
                <td className="px-4 py-3">{formatCurrency(opportunity.volume24h)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {opportunity.recommendedNetworks ? opportunity.recommendedNetworks.map((network, i) => (
                      <span key={i} className="px-2 py-1 rounded text-xs bg-blue-900/30 text-blue-400">
                        {network}
                      </span>
                    )) : <span className="text-slate-400">Loading...</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      className="px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded inline-flex items-center justify-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBotExecution(opportunity);
                      }}
                      title="Execute Arbitrage with Bot"
                    >
                      <Bot className="h-3 w-3" />
                      <span className="text-xs">Bot</span>
                    </button>
                    <button 
                      className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded inline-flex items-center justify-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExchangeNavigation(opportunity.buyExchange, opportunity.pair);
                      }}
                      title="Go to Buy Exchange"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="text-xs">Buy</span>
                    </button>
                    <button 
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded inline-flex items-center justify-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExchangeNavigation(opportunity.sellExchange, opportunity.pair);
                      }}
                      title="Go to Sell Exchange"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="text-xs">Sell</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : !isLoading ? (
            <tr>
              <td colSpan={11} className="px-4 py-10 text-center text-slate-400">
                No arbitrage opportunities found
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default ArbitrageTable;
