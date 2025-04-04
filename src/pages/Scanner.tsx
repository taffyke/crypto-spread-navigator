
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
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(['binance', 'coinbase', 'kucoin', 'kraken', 'gate_io']);
  const [minSpread, setMinSpread] = useState<number>(1.0);
  const [minVolume, setMinVolume] = useState<number>(100000);
  const [arbitrageType, setArbitrageType] = useState<'direct' | 'triangular' | 'futures'>('direct');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [includeFeesChecked, setIncludeFeesChecked] = useState(true);
  const [checkLiquidityChecked, setCheckLiquidityChecked] = useState(true);
  const [checkDepositsChecked, setCheckDepositsChecked] = useState(true);
  const [showCompletedChecked, setShowCompletedChecked] = useState(false);
  const [activePairs, setActivePairs] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT']);
  
  // Use Web Socket for real-time data from exchanges
  const {
    data: wsTickerData,
    isConnected,
    error: wsError
  } = useMultiTickerWebSocket(
    selectedExchanges,
    activePairs[0], // Start with first pair
    selectedExchanges.length > 0 // Only enable if exchanges are selected
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
    
    // For each pair of exchanges, check for arbitrage opportunities
    for (let i = 0; i < exchangeNames.length; i++) {
      for (let j = i + 1; j < exchangeNames.length; j++) {
        const exchange1 = exchangeNames[i];
        const exchange2 = exchangeNames[j];
        
        // Skip if either exchange data is missing
        if (!wsTickerData[exchange1] || !wsTickerData[exchange2]) continue;
        
        const data1 = wsTickerData[exchange1] as ExchangeTickerData;
        const data2 = wsTickerData[exchange2] as ExchangeTickerData;
        
        // Calculate price difference percentage
        if (data1.price && data2.price) {
          const priceDiff = Math.abs(data1.price - data2.price);
          const spreadPercentage = (priceDiff / Math.min(data1.price, data2.price)) * 100;
          
          // Only add if spread is greater than minimum
          if (spreadPercentage >= minSpread) {
            // Determine buy and sell sides
            let buyExchange, sellExchange, buyPrice, sellPrice;
            if (data1.price < data2.price) {
              buyExchange = exchange1;
              sellExchange = exchange2;
              buyPrice = data1.price;
              sellPrice = data2.price;
            } else {
              buyExchange = exchange2;
              sellExchange = exchange1;
              buyPrice = data2.price;
              sellPrice = data1.price;
            }
            
            const opportunity: ArbitrageTableOpportunity = {
              id: `${buyExchange}-${sellExchange}-${data1.symbol || activePairs[0]}-${Date.now()}`,
              pair: data1.symbol || activePairs[0],
              buyExchange,
              sellExchange,
              buyPrice,
              sellPrice,
              spreadPercentage,
              riskLevel: spreadPercentage > 3 ? 'low' : spreadPercentage > 1.5 ? 'medium' : 'high',
              timestamp: new Date(),
              volume24h: (data1.volume || 0) + (data2.volume || 0),
              recommendedNetworks: ['ETH', 'BSC'],
              type: arbitrageType
            };
            
            opportunities.push(opportunity);
          }
        }
      }
    }
    
    return opportunities;
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(opportunities));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${arbitrageType}-arbitrage-opportunities-${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Export Successful",
      description: `Exported ${opportunities.length} ${arbitrageType} arbitrage opportunities`,
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
      
      <Tabs defaultValue="direct" onValueChange={(value) => setArbitrageType(value as 'direct' | 'triangular' | 'futures')}>
        <TabsList className="mb-4 bg-slate-800 border border-slate-700">
          <TabsTrigger value="direct" className="flex items-center gap-1 data-[state=active]:bg-blue-600">
            <CornerDownRight className="h-4 w-4" />
            <span>Direct</span>
          </TabsTrigger>
          <TabsTrigger value="triangular" className="flex items-center gap-1 data-[state=active]:bg-blue-600">
            <Triangle className="h-4 w-4" />
            <span>Triangular</span>
          </TabsTrigger>
          <TabsTrigger value="futures" className="flex items-center gap-1 data-[state=active]:bg-blue-600">
            <Clock className="h-4 w-4" />
            <span>Futures</span>
          </TabsTrigger>
        </TabsList>

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
                    className="bg-blue-600 hover:bg-blue-500 px-3 md:px-4 py-1.5 md:py-2 rounded text-white text-xs md:text-sm flex items-center gap-2 transition-colors"
                    onClick={() => refresh()}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-3 md:h-4 w-3 md:w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button 
                    className="bg-slate-700 hover:bg-slate-600 px-3 md:px-4 py-1.5 md:py-2 rounded text-white text-xs md:text-sm flex items-center gap-2 transition-colors"
                    onClick={handleExport}
                  >
                    <Download className="h-3 md:h-4 w-3 md:w-4" />
                    Export
                  </button>
                  <button 
                    className="bg-slate-700 hover:bg-slate-600 px-3 md:px-4 py-1.5 md:py-2 rounded text-white text-xs md:text-sm flex items-center gap-2 transition-colors"
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  >
                    <Filter className="h-3 md:h-4 w-3 md:w-4" />
                    Filters
                  </button>
                </div>
              </div>
              
              <TabsContent value="direct" className="mt-0">
                <ArbitrageTable 
                  opportunities={opportunities as ArbitrageTableOpportunity[]} 
                  isLoading={isLoading}
                  onRefresh={refresh}
                  arbitrageType="direct"
                />
              </TabsContent>
              
              <TabsContent value="triangular" className="mt-0">
                <ArbitrageTable 
                  opportunities={opportunities as ArbitrageTableOpportunity[]}
                  isLoading={isLoading}
                  onRefresh={refresh}
                  arbitrageType="triangular"
                />
              </TabsContent>
              
              <TabsContent value="futures" className="mt-0">
                <ArbitrageTable 
                  opportunities={opportunities as ArbitrageTableOpportunity[]} 
                  isLoading={isLoading}
                  onRefresh={refresh}
                  arbitrageType="futures"
                />
              </TabsContent>
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-4">
            {/* Add Risk Calculator */}
            <ArbitrageRiskCalculator />
            
            <NetworkRecommendations />
            
            <div className={`bg-slate-800 border ${isFiltersOpen ? 'border-blue-500' : 'border-slate-700'} rounded-lg p-3 md:p-4`}>
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
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 md:p-4">
              <h3 className="text-sm md:text-base text-white font-medium mb-3 md:mb-4">Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-slate-400">Total Opportunities</span>
                  <span className="text-white">{opportunities.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-slate-400">Average Spread</span>
                  <span className="text-white">
                    {(opportunities.reduce((acc, opp) => acc + opp.spreadPercentage, 0) / 
                      (opportunities.length || 1)).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-slate-400">Highest Spread</span>
                  <span className="text-green-500 font-medium">
                    {opportunities.length > 0 
                      ? Math.max(...opportunities.map(opp => opp.spreadPercentage)).toFixed(2) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-slate-400">Exchanges Monitored</span>
                  <span className="text-white">{selectedExchanges.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-slate-400">Last Updated</span>
                  <span className="text-white">{new Date(lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Scanner;
