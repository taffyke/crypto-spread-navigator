import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Filter, RefreshCw, Download, CornerDownRight, Triangle, Clock } from 'lucide-react';
import ExchangeSelector from '@/components/dashboard/ExchangeSelector';
import ArbitrageTable from '@/components/scanner/ArbitrageTable';
import { ArbitrageOpportunity as ArbitrageTableOpportunity } from '@/components/scanner/ArbitrageTable';
import NetworkRecommendations from '@/components/scanner/NetworkRecommendations';
import ArbitrageRiskCalculator from '@/components/scanner/ArbitrageRiskCalculator';
import { exchanges } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useArbitrageData } from '@/hooks/use-arbitrage-data';
import { toast } from '@/hooks/use-toast';
import { useMultiTickerWebSocket } from '@/hooks/use-websocket';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

// Define the type for arbitrage opportunities to match ArbitrageTable's expected type
interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string; // Made required
  sellExchange: string; // Made required
  buyPrice: number; // Made required
  sellPrice: number; // Made required
  spreadPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: Date;
  volume24h: number;
  recommendedNetworks: string[];
  type: string;
}

interface ExchangeTickerData {
  symbol: string;
  price: number;
  bidPrice?: number;
  askPrice?: number;
  volume: number;
  timestamp: number;
}

const Scanner = () => {
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(['binance', 'bitget', 'bybit', 'kucoin', 'gate_io', 'bitfinex', 'gemini', 'coinbase', 'kraken', 'poloniex', 'okx', 'ascendex', 'bitrue', 'htx', 'mexc_global']);
  const [minSpread, setMinSpread] = useState<number>(1.0);
  const [minVolume, setMinVolume] = useState<number>(100000);
  const [arbitrageType, setArbitrageType] = useState<'direct' | 'triangular' | 'futures'>('direct');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [includeFeesChecked, setIncludeFeesChecked] = useState(true);
  const [checkLiquidityChecked, setCheckLiquidityChecked] = useState(true);
  const [checkDepositsChecked, setCheckDepositsChecked] = useState(true);
  const [showCompletedChecked, setShowCompletedChecked] = useState(false);
  const [activePairs, setActivePairs] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT']);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [sameExchangeChecked, setSameExchangeChecked] = useState(false);
  
  // Use Web Socket for real-time data from exchanges
  const {
    data: wsTickerData,
    isConnected,
    error: wsError
  } = useMultiTickerWebSocket(
    selectedExchanges,
    activePairs.join(','), // Use all active pairs instead of just the first one
    selectedExchanges.length > 0 && activePairs.length > 0 // Only enable if exchanges and pairs are selected
  );
  
  const { 
    data: simulatedOpportunities, 
    isLoading, 
    refresh,
    lastUpdated
  } = useArbitrageData(
    arbitrageType,
    selectedExchanges,
    minSpread,
    minVolume,
    true, // Auto-refresh
    { refreshInterval: 30000 } // Refresh every 30 seconds for simulated data
  );

  // Generate real opportunities from WebSocket data
  const realTimeOpportunities = useMemo(() => {
    if (!wsTickerData || Object.keys(wsTickerData).length === 0) {
      return [];
    }

    const opportunities: ArbitrageTableOpportunity[] = [];
    const exchangeNames = Object.keys(wsTickerData);
    
    if (arbitrageType === 'direct') {
    // For each pair of exchanges, check for arbitrage opportunities
    for (let i = 0; i < exchangeNames.length; i++) {
        const buyExchange = exchangeNames[i];
        const buyData = wsTickerData[buyExchange];
        
        if (!buyData || !buyData.price) continue;
        
        for (let j = 0; j < exchangeNames.length; j++) {
          if (i === j) continue; // Skip same exchange
          
          const sellExchange = exchangeNames[j];
          const sellData = wsTickerData[sellExchange];
          
          if (!sellData || !sellData.price) continue;
          
          // Calculate spread
          const buyPrice = buyData.price;
          const sellPrice = sellData.price;
          const spreadPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;
          
          // Only include positive spreads that meet minimum
          if (spreadPercentage >= minSpread) {
            const riskLevel: 'low' | 'medium' | 'high' = 
              spreadPercentage >= 3 ? 'low' : 
              spreadPercentage >= 1.5 ? 'medium' : 'high';
            
            opportunities.push({
              id: `${buyExchange}-${sellExchange}-${Date.now()}`,
              pair: buyData.symbol || 'BTC/USDT',
              buyExchange: buyExchange.charAt(0).toUpperCase() + buyExchange.slice(1),
              sellExchange: sellExchange.charAt(0).toUpperCase() + sellExchange.slice(1),
              buyPrice,
              sellPrice,
              spreadPercentage,
              riskLevel,
              timestamp: new Date(),
              volume24h: buyData.volume || 100000,
              recommendedNetworks: ['ETH', 'BSC'],
              type: 'direct'
            });
          }
        }
      }
    } else if (arbitrageType === 'triangular') {
      // Simulated triangular arbitrage from websocket data
      // This would require tracking multiple pairs in a real app
      exchangeNames.forEach(exchange => {
        const exchangeData = wsTickerData[exchange];
        if (!exchangeData || !exchangeData.price) return;
        
        // Create synthetic triangular opportunities
        const basePrice = exchangeData.price;
        const triangularPairs = [
          { assets: 'BTC/ETH/USDT', spreadMod: 1.02 },
          { assets: 'ETH/SOL/USDT', spreadMod: 0.98 },
          { assets: 'BNB/BTC/USDT', spreadMod: 1.05 }
        ];
        
        triangularPairs.forEach(({ assets, spreadMod }) => {
          const spreadPercentage = minSpread + (Math.random() * 2 * spreadMod);
          
          if (spreadPercentage >= minSpread) {
            const riskLevel: 'low' | 'medium' | 'high' = 
              spreadPercentage >= 3 ? 'low' : 
              spreadPercentage >= 1.5 ? 'medium' : 'high';
            
            opportunities.push({
              id: `tri-${exchange}-${assets}-${Date.now()}`,
              pair: assets,
              buyExchange: exchange.charAt(0).toUpperCase() + exchange.slice(1),
              sellExchange: exchange.charAt(0).toUpperCase() + exchange.slice(1),
              buyPrice: basePrice,
              sellPrice: basePrice * (1 + spreadPercentage/100),
              spreadPercentage,
              riskLevel,
              timestamp: new Date(),
              volume24h: exchangeData.volume || 100000,
              recommendedNetworks: ['ETH', 'BSC'],
              type: 'triangular'
            });
          }
        });
      });
    } else if (arbitrageType === 'futures') {
      // Simulated futures arbitrage from websocket data
      const spotExchanges = exchangeNames.slice(0, Math.floor(exchangeNames.length / 2));
      const futuresExchanges = exchangeNames.slice(Math.floor(exchangeNames.length / 2));
      
      // If we don't have enough exchanges for both spot and futures, use the same exchanges for both
      if (futuresExchanges.length === 0) {
        futuresExchanges.push(...spotExchanges);
      }
      
      spotExchanges.forEach(spotExchange => {
        const spotData = wsTickerData[spotExchange];
        if (!spotData || !spotData.price) return;
        
        futuresExchanges.forEach(futuresExchange => {
          if (spotExchange === futuresExchange) return; // Skip same exchange
          
          const futuresData = wsTickerData[futuresExchange];
          if (!futuresData || !futuresData.price) return;
          
          // Apply a simulated premium/discount to create futures opportunities
          const spotPrice = spotData.price;
          const futuresPrice = spotData.price * (1 + (Math.random() * 0.05 - 0.025)); // +/- 2.5% from spot
          const spreadPercentage = Math.abs((futuresPrice - spotPrice) / spotPrice) * 100;
          
          if (spreadPercentage >= minSpread) {
            // For futures, always use higher risk since it involves leverage
            const riskLevel: 'low' | 'medium' | 'high' = 'high';
            
            // Determine buy/sell direction based on prices
            const [buyExchange, sellExchange, buyPrice, sellPrice] = 
              spotPrice < futuresPrice
                ? [spotExchange, futuresExchange, spotPrice, futuresPrice]
                : [futuresExchange, spotExchange, futuresPrice, spotPrice];
            
            opportunities.push({
              id: `fut-${buyExchange}-${sellExchange}-${Date.now()}`,
              pair: `${spotData.symbol?.split('/')[0]}-PERP` || 'BTC-PERP',
              buyExchange: buyExchange.charAt(0).toUpperCase() + buyExchange.slice(1),
              sellExchange: sellExchange.charAt(0).toUpperCase() + sellExchange.slice(1),
              buyPrice,
              sellPrice,
              spreadPercentage,
              riskLevel,
              timestamp: new Date(),
              volume24h: spotData.volume || 100000,
              recommendedNetworks: ['ETH'],
              type: 'futures'
            });
          }
        });
      });
    }
    
    // Sort opportunities by spread percentage (highest first)
    return opportunities.sort((a, b) => b.spreadPercentage - a.spreadPercentage);
  }, [wsTickerData, minSpread, arbitrageType, activePairs]);

  // Combine real-time and simulated data
  const opportunities = useMemo(() => {
    // If we have real-time data, prioritize it
    if (realTimeOpportunities.length > 0) {
      console.log('Using real-time WebSocket data:', realTimeOpportunities.length, 'opportunities');
      return realTimeOpportunities;
    }
    
    // Fall back to simulated data
    console.log('Using simulated data:', simulatedOpportunities.length, 'opportunities');
    return simulatedOpportunities;
  }, [realTimeOpportunities, simulatedOpportunities]);

  // Log websocket status
  useEffect(() => {
    if (wsError) {
      console.error('WebSocket error:', wsError);
      toast({
        title: "WebSocket Error",
        description: "Failed to connect to exchange WebSockets. Using simulated data instead.",
        variant: "destructive"
      });
    } else if (isConnected) {
      console.log('WebSocket connected to exchanges:', Object.keys(isConnected).filter(ex => isConnected[ex]).join(', '));
      toast({
        title: "WebSocket Connected",
        description: `Connected to ${Object.keys(isConnected).filter(ex => isConnected[ex]).length} exchanges for real-time data.`,
      });
    }
  }, [isConnected, wsError]);

  const handleExport = () => {
    // Create a CSV string from the data
    const headers = ["Pair", "Buy Exchange", "Sell Exchange", "Buy Price", "Sell Price", "Spread %", "Risk Level", "Volume 24h", "Timestamp"];
    
    const csvContent = opportunities.map(opp => [
      opp.pair,
      opp.buyExchange,
      opp.sellExchange,
      opp.buyPrice.toString(),
      opp.sellPrice.toString(),
      opp.spreadPercentage.toFixed(2) + "%",
      opp.riskLevel,
      opp.volume24h.toString(),
      new Date(opp.timestamp).toLocaleString()
    ]);
    
    // Add headers at the beginning
    csvContent.unshift(headers);
    
    // Convert to CSV format
    const csvString = csvContent.map(row => row.join(",")).join("\n");
    
    // Create a download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set file name with appropriate extension
    link.setAttribute('href', url);
    link.setAttribute('download', `${arbitrageType}-arbitrage-opportunities-${new Date().toISOString().split('T')[0]}.csv`);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast({
      title: "Export Successful",
      description: `Exported ${opportunities.length} ${arbitrageType} arbitrage opportunities to Excel format`,
    });
  };

  const handleApplyFilters = () => {
    refresh();
    setIsFiltersOpen(false);
    
    toast({
      title: "Filters Applied",
      description: `Applied filters with ${minSpread.toFixed(1)}% minimum spread and $${(minVolume/1000).toFixed(0)}K minimum volume`,
    });
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Arbitrage Scanner</h1>
        <p className="text-sm md:text-base text-slate-400">
          Find and analyze cross-exchange arbitrage opportunities in real-time
        </p>
      </div>
      
      {/* Futuristic Summary Dashboard at the top */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <h3 className="text-sm md:text-base font-medium text-white">Arbitrage Scanner Dashboard</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Last Updated:</span>
              <span className="text-white font-mono">{new Date(lastUpdated).toLocaleTimeString()}</span>
              <div className={`h-5 w-5 rounded-full flex items-center justify-center bg-slate-700 
                ${isLoading ? 'animate-spin text-blue-400' : 'text-green-400'}`}>
                {isLoading ? <RefreshCw className="h-3 w-3" /> : '✓'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-700/50">
          <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs text-slate-400">Total Opportunities</h4>
              <span className="text-xs px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded">Live</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{opportunities.length}</p>
            <p className="text-xs text-slate-500 mt-1">Across {selectedExchanges.length} exchanges</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs text-slate-400">Average Spread</h4>
              <span className={`text-xs px-1.5 py-0.5 rounded
                ${opportunities.length > 0 && 
                  (opportunities.reduce((acc, opp) => acc + opp.spreadPercentage, 0) / opportunities.length) > 2 
                  ? 'bg-green-900/30 text-green-400' 
                  : 'bg-yellow-900/30 text-yellow-400'}`}>
                {opportunities.length > 0 && 
                  (opportunities.reduce((acc, opp) => acc + opp.spreadPercentage, 0) / opportunities.length) > 2 
                  ? 'Profitable' 
                  : 'Moderate'}
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {(opportunities.reduce((acc, opp) => acc + opp.spreadPercentage, 0) / 
                  (opportunities.length || 1)).toFixed(2)}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Min spread filter: {minSpread.toFixed(1)}%</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs text-slate-400">Highest Spread</h4>
              <span className="text-xs px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded">Best Value</span>
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
              <h4 className="text-xs text-slate-400">Arbitrage Mode</h4>
              <span className={`text-xs px-1.5 py-0.5 rounded
                ${arbitrageType === 'direct' ? 'bg-blue-900/30 text-blue-400' : 
                arbitrageType === 'triangular' ? 'bg-purple-900/30 text-purple-400' : 
                'bg-amber-900/30 text-amber-400'}`}>
                {arbitrageType.charAt(0).toUpperCase() + arbitrageType.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={() => setArbitrageType('direct')}
                className={`px-2 py-1 rounded text-xs ${arbitrageType === 'direct' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Direct
              </button>
              <button 
                onClick={() => setArbitrageType('triangular')}
                className={`px-2 py-1 rounded text-xs ${arbitrageType === 'triangular' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Triangular
              </button>
              <button 
                onClick={() => setArbitrageType('futures')}
                className={`px-2 py-1 rounded text-xs ${arbitrageType === 'futures' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Futures
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 mb-3">
        {/* Best Exchange Pairs */}
        <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm text-white font-medium">Top Exchange Pairs</h4>
            <span className="text-xs px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded">Insight</span>
          </div>
          
          <div className="space-y-2">
            {opportunities.slice(0, 3).map((opp, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{i+1}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white">{opp.buyExchange} → {opp.sellExchange}</span>
                    <span className="text-xs text-slate-400">{opp.pair}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium ${
                  opp.spreadPercentage >= 3 ? 'text-green-500' : 
                  opp.spreadPercentage >= 1.5 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {opp.spreadPercentage.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Network Recommendations */}
        <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm text-white font-medium">Best Networks</h4>
            <span className="text-xs px-1.5 py-0.5 bg-purple-900/30 text-purple-400 rounded">Analytics</span>
          </div>
          
          <div className="space-y-2 mb-2">
            {/* Get networks from opportunities and count occurrences */}
            {(() => {
              // Count network occurrences
              const networkCounts: Record<string, number> = {};
              opportunities.forEach(opp => {
                if (opp.recommendedNetworks) {
                  opp.recommendedNetworks.forEach(network => {
                    networkCounts[network] = (networkCounts[network] || 0) + 1;
                  });
                }
              });
              
              // Convert to array and sort
              return Object.entries(networkCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([network, count], i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-900/30 text-purple-400 text-xs">
                        {i+1}
                      </div>
                      <span className="text-xs font-medium text-white">{network}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-16 bg-slate-700 h-1.5 rounded-full overflow-hidden mr-2">
                        <div 
                          className="bg-purple-500 h-full" 
                          style={{ width: `${Math.min(100, (count / opportunities.length) * 300)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400">{count}</span>
                    </div>
                  </div>
                ));
            })()}
          </div>
          <button
            onClick={() => document.getElementById('networksSection')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            View All Networks
          </button>
        </div>
        
        {/* Bot Performance */}
        <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm text-white font-medium">Bot Performance</h4>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-green-400">2 Active</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Executed Trades</span>
              <div className="flex items-center">
                <span className="text-xs font-medium text-white mr-1">12</span>
                <button 
                  className="text-xs text-blue-400 hover:text-blue-300"
                  onClick={() => {
                    toast({
                      title: "Trade History",
                      description: "Viewing your complete trade history...",
                      variant: "default"
                    });
                  }}
                >
                  View
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Success Rate</span>
              <div className="w-24 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Execution Time</span>
              <span className="text-xs font-medium text-white">
                <span className="text-green-400">0.8s</span> avg.
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Profit</span>
              <span className="text-xs font-medium text-green-500">$127.45 (24h)</span>
            </div>
          </div>
          
          <button
            className="w-full mt-3 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            onClick={() => {
              toast({
                title: "Bot Dashboard",
                description: "Redirecting to the bot dashboard...",
                variant: "default"
              });
            }}
          >
            View Detailed Analytics
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 md:p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-medium text-white">
                  {arbitrageType === 'direct' ? 'Direct' : 
                  arbitrageType === 'triangular' ? 'Triangular' : 'Futures'} Opportunities
                </h2>
                {!isLoading && (
                  <span className="text-xs text-slate-400">
                    Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  className="bg-slate-700 hover:bg-slate-600 px-3 md:px-4 py-1.5 md:py-2 rounded text-white text-xs md:text-sm flex items-center gap-2 transition-colors relative group"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                  <Filter className="h-3 md:h-4 w-3 md:w-4" />
                  {isFiltersOpen ? "Hide Filters" : "Show Filters"}
                  
                  {/* Floating popover-style quick filters with shortcuts */}
                  <div className="absolute left-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-md shadow-lg p-4 hidden group-hover:block z-10">
                    <div className="text-xs text-slate-400 mb-2 font-semibold">Quick Filters</div>
                    
                    <div className="mb-4">
                      <label className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Minimum Spread</span>
                        <span className="text-white">{minSpread.toFixed(1)}%</span>
                      </label>
                      <input 
                        type="range" 
                        min="0.1" 
                        max="5" 
                        step="0.1" 
                        value={minSpread}
                        onChange={(e) => setMinSpread(parseFloat(e.target.value))}
                        className="w-full accent-blue-500 mb-2"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Min Volume (24h)</span>
                        <span className="text-white">${(minVolume/1000).toFixed(0)}K</span>
                      </label>
                      <input 
                        type="range" 
                        min="10000" 
                        max="1000000" 
                        step="10000" 
                        value={minVolume}
                        onChange={(e) => setMinVolume(parseFloat(e.target.value))}
                        className="w-full accent-blue-500 mb-2"
                      />
                    </div>
                    
                    {/* New shortcut buttons section */}
                    <div className="mb-4 pt-2 border-t border-slate-700">
                      <div className="text-xs text-slate-400 mb-2 font-semibold">Quick Access</div>
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-center text-white transition-colors flex flex-col items-center gap-1"
                          onClick={() => document.getElementById('networksSection')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 6l6 6l-6 6" />
                          </svg>
                          Networks
                        </button>
                        <button 
                          className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-center text-white transition-colors flex flex-col items-center gap-1"
                          onClick={() => document.getElementById('calculatorSection')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 7h16M4 12h16M4 17h16" />
                          </svg>
                          Calculator
                        </button>
                        <button 
                          className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-center text-white transition-colors flex flex-col items-center gap-1"
                          onClick={() => document.getElementById('exchangeSection')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M3 12h18M3 18h18" />
                          </svg>
                          Exchanges
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-700">
                      <button 
                        className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white transition-colors"
                        onClick={handleApplyFilters}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </button>
                <button 
                  className="bg-slate-700 hover:bg-slate-600 px-3 md:px-4 py-1.5 md:py-2 rounded text-white text-xs md:text-sm flex items-center gap-2 transition-colors"
                  onClick={handleExport}
                >
                  <Download className="h-3 md:h-4 w-3 md:w-4" />
                  Export to Excel
                </button>
              </div>
            </div>
            
            <ArbitrageTable 
              opportunities={opportunities as ArbitrageTableOpportunity[]} 
              isLoading={isLoading}
              onRefresh={refresh}
              arbitrageType={arbitrageType}
            />
          </div>
        </div>
          
        <div className="lg:col-span-1 space-y-4">
          {/* Add Risk Calculator */}
          <div id="calculatorSection">
            <ArbitrageRiskCalculator 
              arbitrageType={arbitrageType} 
              sameExchangeChecked={sameExchangeChecked}
            />
          </div>
          
          <div id="networksSection">
            <NetworkRecommendations />
          </div>
          
          <div id="exchangeSection" className={`bg-slate-800 border ${isFiltersOpen ? 'border-blue-500' : 'border-slate-700'} rounded-lg p-3 md:p-4`}>
            <h3 className="text-sm md:text-base text-white font-medium mb-3 md:mb-4">Exchange Selection</h3>
            <ExchangeSelector 
              exchanges={exchanges}
              selectedExchanges={selectedExchanges}
              onSelectionChange={setSelectedExchanges}
            />
            
            <div className="mt-4 md:mt-6">
              <h3 className="text-sm md:text-base text-white font-medium mb-3 md:mb-4">Filters</h3>
              
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="flex justify-between text-xs md:text-sm mb-2">
                    <span className="text-slate-400">Minimum Spread</span>
                    <span className="text-white">{minSpread.toFixed(1)}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="5" 
                    step="0.1" 
                    value={minSpread}
                    onChange={(e) => setMinSpread(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                
                <div>
                  <label className="flex justify-between text-xs md:text-sm mb-2">
                    <span className="text-slate-400">Minimum Volume (24h)</span>
                    <span className="text-white">${(minVolume/1000).toFixed(0)}K</span>
                  </label>
                  <input 
                    type="range" 
                    min="10000" 
                    max="1000000" 
                    step="10000" 
                    value={minVolume}
                    onChange={(e) => setMinVolume(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">
              <h3 className="text-sm md:text-base text-white font-medium mb-2">Additional Options</h3>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="includeFees" 
                  checked={includeFeesChecked}
                  onChange={(e) => setIncludeFeesChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 accent-blue-500"
                />
                <label htmlFor="includeFees" className="text-xs md:text-sm text-slate-300">
                  Include exchange fees
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="checkLiquidity" 
                  checked={checkLiquidityChecked}
                  onChange={(e) => setCheckLiquidityChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 accent-blue-500"
                />
                <label htmlFor="checkLiquidity" className="text-xs md:text-sm text-slate-300">
                  Check liquidity depth
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="checkDeposits" 
                  checked={checkDepositsChecked}
                  onChange={(e) => setCheckDepositsChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 accent-blue-500"
                />
                <label htmlFor="checkDeposits" className="text-xs md:text-sm text-slate-300">
                  Check deposit/withdrawal status
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="showCompleted" 
                  checked={showCompletedChecked}
                  onChange={(e) => setShowCompletedChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 accent-blue-500"
                />
                <label htmlFor="showCompleted" className="text-xs md:text-sm text-slate-300">
                  Show completed arbitrages
                </label>
              </div>

              {arbitrageType === 'triangular' && (
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="sameExchange" 
                    checked={sameExchangeChecked}
                    onChange={(e) => setSameExchangeChecked(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 accent-blue-500"
                  />
                  <label htmlFor="sameExchange" className="text-xs md:text-sm text-slate-300">
                    Same exchange triangular
                  </label>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-6">
              <button 
                className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-xs md:text-sm text-white transition-colors"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
