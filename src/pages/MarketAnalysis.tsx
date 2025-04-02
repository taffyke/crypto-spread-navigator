import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  RefreshCw, 
  Filter, 
  Zap, 
  Activity, 
  Grid3X3, 
  ChevronDown, 
  ChevronUp,
  Building,
  TrendingDown, 
  Percent,
  DollarSign,
  Search,
  X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  Legend,
  PieChart, 
  Pie, 
  Sector 
} from 'recharts';
import { generateMarketData } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Major exchanges for analysis
const exchanges = [
  'Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Gate.io', 'OKX', 'Bybit', 'Bitfinex', 'Huobi', 'FTX'
];

// Sample trading pairs
const tradingPairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 'DOT/USDT', 'USDC/USDT'];

const MarketAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('correlations');
  const [topCoins, setTopCoins] = useState<any[]>([]);
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [exchangeHeatmapData, setExchangeHeatmapData] = useState<any[]>([]);
  const [volatilityData, setVolatilityData] = useState<any[]>([]);
  const [exchangeVolumeData, setExchangeVolumeData] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    topCoins: true,
    correlation: true,
    volatility: true,
    heatmap: true,
    exchangeActivity: true
  });
  
  // Add filters for user customization
  const [filters, setFilters] = useState({
    pairSearch: '',
    exchangeFilters: exchanges,
    correlationType: 'all', // 'all', 'positive', 'negative'
    correlationStrength: 'all', // 'all', 'strong', 'moderate', 'weak'
    timeframe: '24h' // '24h', '7d', '30d'
  });

  // Function to toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Filters Updated",
      description: `Analysis view updated with new filters`,
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      pairSearch: '',
      exchangeFilters: exchanges,
      correlationType: 'all',
      correlationStrength: 'all',
      timeframe: '24h'
    });
    
    toast({
      title: "Filters Cleared",
      description: "All filters have been reset to default values",
    });
  };
  
  // Toggle exchange filter
  const toggleExchangeFilter = (exchange: string) => {
    setFilters(prev => {
      const newExchangeFilters = prev.exchangeFilters.includes(exchange)
        ? prev.exchangeFilters.filter(e => e !== exchange)
        : [...prev.exchangeFilters, exchange];
      
      return {
        ...prev,
        exchangeFilters: newExchangeFilters
      };
    });
  };

  // Fetch market data
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would be actual API calls to get market data
      const marketData = generateMarketData(20);
      setTopCoins(marketData.slice(0, 10));
      
      // Generate correlation data
      const correlations = generateCorrelationData(marketData.slice(0, 10));
      setCorrelationData(correlations);
      
      // Generate exchange heatmap data
      const exchangeHeatmap = generateExchangeHeatmapData();
      setExchangeHeatmapData(exchangeHeatmap);
      
      // Generate volatility data
      const volatility = generateVolatilityData(marketData.slice(0, 15));
      setVolatilityData(volatility);
      
      // Generate exchange volume data
      const exchangeVolume = generateExchangeVolumeData();
      setExchangeVolumeData(exchangeVolume);
      
      setLastUpdated(new Date());
      
      toast({
        title: "Data Updated",
        description: "Market analysis data has been refreshed",
      });
    } catch (error) {
      console.error("Error fetching market data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch market analysis data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate correlation data in tabular format
  const generateCorrelationData = (coins: any[]) => {
    const data: any[] = [];
    
    // Create pairs of assets with correlation values
    for(let i = 0; i < coins.length; i++) {
      for(let j = i+1; j < coins.length; j++) {
        // Realistic correlation: most crypto assets have positive correlation
        // Adding some randomness for variation
        const baseCorrelation = 0.7;
        const randomFactor = Math.random() * 0.5 - 0.25;
        let corrValue = Math.min(0.99, Math.max(-0.99, baseCorrelation + randomFactor));
        
        // Stablecoins often negatively correlated
        if (coins[i].symbol.includes('USD') || coins[j].symbol.includes('USD')) {
          corrValue = -corrValue;
        }
        
        data.push({
          pair: `${coins[i].symbol}/${coins[j].symbol}`,
          correlation: corrValue,
          asset1: coins[i].symbol,
          asset2: coins[j].symbol,
          price1: coins[i].price,
          price2: coins[j].price,
          change1: coins[i].change24h,
          change2: coins[j].change24h,
          strength: Math.abs(corrValue) > 0.7 ? 'Strong' : 
                   Math.abs(corrValue) > 0.3 ? 'Moderate' : 'Weak',
          type: corrValue > 0 ? 'Positive' : 'Negative'
        });
      }
    }
    
    // Sort by correlation strength
    return data.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  };

  // Generate heatmap data for correlations between exchanges
  const generateExchangeHeatmapData = () => {
    const data: any[] = [];
    
    // Generate matrix of correlations between exchanges
    for (let i = 0; i < exchanges.length; i++) {
      for (let j = 0; j < exchanges.length; j++) {
        // Calculate correlation value: 
        // -1 to 1, with exchanges likely to be somewhat similar
        let correlation = 1;
        
        if (i !== j) {
          // Base correlation between exchanges should be positive but vary
          // Major exchanges like Binance & Coinbase often have similar price action
          const base = 0.8; 
          // Add randomness based on exchange similarity
          const random = Math.random() * 0.4 - 0.2;
          correlation = Math.min(0.99, Math.max(-0.5, base + random));
          
          // Some exchanges might be more different based on region or regulation
          // Less correlation between different regions
          if ((exchanges[i].includes('Binance') && exchanges[j].includes('Coinbase')) || 
              (exchanges[i].includes('Coinbase') && exchanges[j].includes('Binance'))) {
            correlation *= 0.85; // Slight regulatory difference
          }
        }
        
        data.push({
          x: exchanges[i],
          y: exchanges[j],
          value: correlation
        });
      }
    }
    
    return data;
  };

  // Generate exchange volume data
  const generateExchangeVolumeData = () => {
    const data: any[] = [];
    
    exchanges.forEach(exchange => {
      const baseVolume = Math.random() * 5000 + 1000; // Base volume in millions
      const marketShare = Math.random() * 25 + 5; // Market share percentage
      
      data.push({
        name: exchange,
        volume: baseVolume,
        marketShare: marketShare,
        pairs: Math.floor(Math.random() * 500) + 300, // Number of trading pairs
        change24h: (Math.random() * 10) - 5, // 24h volume change
      });
    });
    
    return data.sort((a, b) => b.volume - a.volume);
  };

  // Generate volatility data
  const generateVolatilityData = (coins: any[]) => {
    return coins.map(coin => ({
      name: coin.symbol,
      volatility: Math.abs(coin.change24h) * (1 + Math.random() * 0.5),
      price: coin.price,
      marketCap: coin.marketCap,
      change: coin.change24h,
      volume: coin.volume24h
    })).sort((a, b) => b.volatility - a.volatility);
  };

  // Format large numbers
  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Format percentages
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Calculate color for heatmap cells
  const getHeatmapColor = (value: number) => {
    if (value >= 0.7) return '#22c55e'; // Strong positive: green
    if (value >= 0.3) return '#4ade80'; // Moderate positive: lighter green
    if (value >= 0) return '#86efac'; // Weak positive: lightest green
    if (value >= -0.3) return '#fca5a5'; // Weak negative: light red
    if (value >= -0.7) return '#f87171'; // Moderate negative: medium red
    return '#ef4444'; // Strong negative: dark red
  };

  // Filter correlation data based on user filters
  const getFilteredCorrelationData = () => {
    return correlationData.filter(item => {
      // Filter by search term
      if (filters.pairSearch && !item.pair.toLowerCase().includes(filters.pairSearch.toLowerCase())) {
        return false;
      }
      
      // Filter by correlation type
      if (filters.correlationType === 'positive' && item.correlation <= 0) {
        return false;
      }
      
      if (filters.correlationType === 'negative' && item.correlation >= 0) {
        return false;
      }
      
      // Filter by strength
      if (filters.correlationStrength === 'strong' && Math.abs(item.correlation) <= 0.7) {
        return false;
      }
      
      if (filters.correlationStrength === 'moderate' && 
          (Math.abs(item.correlation) <= 0.3 || Math.abs(item.correlation) > 0.7)) {
        return false;
      }
      
      if (filters.correlationStrength === 'weak' && Math.abs(item.correlation) > 0.3) {
        return false;
      }
      
      return true;
    });
  };
  
  // Filter exchange data based on selected exchanges
  const getFilteredExchangeData = () => {
    return exchangeHeatmapData.filter(item => 
      filters.exchangeFilters.includes(item.x) && filters.exchangeFilters.includes(item.y)
    );
  };
  
  // Get filtered exchange volume data
  const getFilteredExchangeVolumeData = () => {
    return exchangeVolumeData.filter(item => 
      filters.exchangeFilters.includes(item.name)
    );
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Market Analysis</h1>
        <p className="text-sm md:text-base text-slate-400">
          Correlation, volatility, and market metrics to identify trading opportunities
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-start gap-4 mb-4">
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <span className="text-xs text-slate-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400 mb-1">Timeframe</p>
                <div className="grid grid-cols-3 gap-1">
                  {['24h', '7d', '30d'].map(time => (
                    <Button 
                      key={time}
                      variant={filters.timeframe === time ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleFilterChange('timeframe', time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
                
                <Separator className="my-2" />
                
                <p className="text-xs font-medium text-slate-400 mb-1">Correlation Type</p>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    {value: 'all', label: 'All'},
                    {value: 'positive', label: 'Positive'},
                    {value: 'negative', label: 'Negative'}
                  ].map(type => (
                    <Button 
                      key={type.value}
                      variant={filters.correlationType === type.value ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleFilterChange('correlationType', type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
                
                <Separator className="my-2" />
                
                <p className="text-xs font-medium text-slate-400 mb-1">Strength</p>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    {value: 'all', label: 'All'},
                    {value: 'strong', label: 'Strong'},
                    {value: 'moderate', label: 'Medium'},
                    {value: 'weak', label: 'Weak'}
                  ].map(strength => (
                    <Button 
                      key={strength.value}
                      variant={filters.correlationStrength === strength.value ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7 col-span-1"
                      onClick={() => handleFilterChange('correlationStrength', strength.value)}
                    >
                      {strength.label}
                    </Button>
                  ))}
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="relative w-48">
            <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              placeholder="Search pairs..."
              className="pl-8 h-9 bg-slate-800 border-slate-700 text-sm"
              value={filters.pairSearch}
              onChange={(e) => handleFilterChange('pairSearch', e.target.value)}
            />
            {filters.pairSearch && (
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-white"
                onClick={() => handleFilterChange('pairSearch', '')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 mt-1">Exchanges:</span>
          {exchanges.map(exchange => (
            <Badge 
              key={exchange}
              variant={filters.exchangeFilters.includes(exchange) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleExchangeFilter(exchange)}
            >
              {exchange}
              {filters.exchangeFilters.includes(exchange) && 
                <X className="ml-1 h-3 w-3" />
              }
            </Badge>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="correlations" className="flex items-center gap-1 data-[state=active]:bg-blue-600">
            <Grid3X3 className="h-4 w-4" />
            <span>Correlations</span>
          </TabsTrigger>
          <TabsTrigger value="exchangeAnalysis" className="flex items-center gap-1 data-[state=active]:bg-blue-600">
            <Building className="h-4 w-4" />
            <span>Exchange Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="volatility" className="flex items-center gap-1 data-[state=active]:bg-blue-600">
            <Zap className="h-4 w-4" />
            <span>Volatility</span>
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Left panel - 3/4 width on large screens */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4 md:space-y-6">
            <TabsContent value="correlations" className="mt-0">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 md:p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium text-white">Asset Correlation Analysis</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700">
                      <tr>
                        <th className="px-4 py-2">Asset Pair</th>
                        <th className="px-4 py-2">Correlation</th>
                        <th className="px-4 py-2">Strength</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Trading Implication</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {getFilteredCorrelationData().slice(0, 15).map((item, index) => (
                        <tr key={index} className="hover:bg-slate-700">
                          <td className="px-4 py-3 font-medium text-white">{item.pair}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-16 h-2 rounded-full overflow-hidden bg-slate-600"
                              >
                                <div 
                                  className={`h-full ${item.correlation >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                                  style={{ width: `${Math.abs(item.correlation) * 100}%` }}
                                ></div>
                              </div>
                              <span>{item.correlation.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              item.strength === 'Strong' ? 'bg-blue-900/20 text-blue-400' :
                              item.strength === 'Moderate' ? 'bg-yellow-900/20 text-yellow-400' :
                              'bg-slate-600/20 text-slate-400'
                            }`}>
                              {item.strength}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              item.type === 'Positive' ? 'bg-green-900/20 text-green-400' :
                              'bg-red-900/20 text-red-400'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {item.correlation > 0.7 ? "Strong hedging opportunity" :
                             item.correlation < -0.7 ? "Excellent pair trading" :
                             item.correlation > 0 ? "Monitor for divergence" : "Potential arbitrage"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-slate-400 mt-3">
                  <p>
                    <span className="font-semibold">Correlation Interpretation:</span> Values range from -1 (perfect negative correlation) to +1 (perfect positive correlation).
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>
                      <span className="text-green-400 font-medium">Positive correlation</span>: Assets move in the same direction
                    </li>
                    <li>
                      <span className="text-red-400 font-medium">Negative correlation</span>: Assets move in opposite directions
                    </li>
                    <li>
                      <span className="text-blue-400 font-medium">Strong correlation</span>: Highly reliable relationship
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="exchangeAnalysis" className="mt-0">
              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Exchange Price Correlation Heatmap</CardTitle>
                    <CardDescription>
                      Visual representation of price correlation between different exchanges
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="h-[400px] w-full">
                      {getFilteredExchangeData().length > 0 && (
                        <div className="grid grid-cols-11 gap-1 h-full">
                          {/* Column headers */}
                          <div className="col-span-1"></div>
                          {filters.exchangeFilters.map((exchange, index) => (
                            <div key={`header-${index}`} className="text-xs text-slate-400 text-center font-medium rotate-90 flex items-end justify-center">
                              {exchange}
                            </div>
                          ))}
                          
                          {/* Generate grid of cells */}
                          {filters.exchangeFilters.map((rowExchange, rowIndex) => (
                            <React.Fragment key={`row-${rowIndex}`}>
                              {/* Row header */}
                              <div className="text-xs text-slate-400 font-medium flex items-center">
                                {rowExchange}
                              </div>
                              
                              {/* Row cells */}
                              {filters.exchangeFilters.map((colExchange, colIndex) => {
                                const cell = exchangeHeatmapData.find(d => d.x === colExchange && d.y === rowExchange);
                                return (
                                  <div 
                                    key={`cell-${rowIndex}-${colIndex}`}
                                    className="relative aspect-square w-full cursor-pointer group"
                                    style={{ backgroundColor: getHeatmapColor(cell?.value || 0) }}
                                    title={`${cell?.x} → ${cell?.y}: ${cell?.value.toFixed(3)}`}
                                  >
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">
                                        {cell?.value.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <p className="text-xs text-slate-400">
                      Green indicates high price similarity between exchanges, red indicates divergence. 
                      Higher divergence suggests greater arbitrage opportunity.
                    </p>
                  </CardFooter>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Exchange Trading Volume Analysis</CardTitle>
                    <CardDescription>
                      Compare trading volumes and market share between exchanges
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getFilteredExchangeVolumeData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            tick={{ fill: '#94a3b8' }}
                            height={60}
                          />
                          <YAxis 
                            yAxisId="left"
                            label={{ value: 'Trading Volume ($M)', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8' }}
                            tick={{ fill: '#94a3b8' }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            label={{ value: 'Market Share (%)', angle: 90, position: 'insideRight', offset: 0, fill: '#94a3b8' }}
                            tick={{ fill: '#94a3b8' }}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar 
                            yAxisId="left"
                            dataKey="volume" 
                            name="Trading Volume ($M)"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar 
                            yAxisId="right"
                            dataKey="marketShare" 
                            name="Market Share (%)"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="volatility" className="mt-0">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 md:p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium text-white">Volatility Analysis</h3>
                </div>
                
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={volatilityData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        tick={{ fill: '#94a3b8' }}
                        height={60}
                      />
                      <YAxis 
                        label={{ value: 'Volatility (%)', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8' }}
                        tick={{ fill: '#94a3b8' }}
                      />
                      <Tooltip />
                      <Bar 
                        dataKey="volatility" 
                        name="Volatility"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      >
                        {volatilityData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.volatility > 10 ? '#ef4444' : 
                                 entry.volatility > 5 ? '#f97316' : 
                                 entry.volatility > 2 ? '#facc15' : '#22c55e'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-xs text-slate-400 mt-2">
                  High volatility (red) indicates rapidly changing prices and potentially higher trading opportunities (and risks).
                </div>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default MarketAnalysis; 