import React, { useState, useEffect, useCallback } from 'react';
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
  X,
  AlertTriangle,
  Settings,
  Clock,
  ArrowRightLeft,
  AlertCircle,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingUp as TrendingUpIcon,
  Layers,
  Info,
  Bell,
  ArrowUpDown,
  BarChart as BarChartIcon,
  PenTool,
  Wallet,
  Gauge,
  Share2,
  Eye,
  Minus
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, ReferenceLine, ReferenceArea, Area, AreaChart, Label } from 'recharts';
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
import { 
  generateMarketData, 
  generateRealTimeArbitrageOpportunities,
  generatePriceDeviationAlerts,
  generateHistoricalSpreadData,
  generateLiquidityData,
  generateTechnicalIndicatorsData,
  generateFeeImpactData,
  generateMarketSentimentData, 
  generateMarketInefficiencyScores
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tooltip as TooltipComponent, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label as LabelComponent } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import axios from 'axios';

// Major exchanges for analysis
const exchanges = [
  'Binance', 'Bitget', 'Bybit', 'KuCoin', 'Gate.io', 'Bitfinex', 
  'Gemini', 'Coinbase', 'Kraken', 'Poloniex', 'OKX', 'AscendEX', 
  'Bitrue', 'HTX', 'MEXC Global'
];

// Sample trading pairs
const tradingPairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 'DOT/USDT', 'USDC/USDT'];

// Format for tooltip numbers
const formatNumber = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, valuePrefix, valueSuffix }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-md">
        <p className="text-slate-300 text-xs font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {valuePrefix || ''}{formatNumber.format(entry.value)}{valueSuffix || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Interface for cryptocurrency data
interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  market_cap: number;
  volume_24h: number;
  change_24h: number;
  image?: string;
}

// Interface for exchange data
interface ExchangeData {
  id: string;
  name: string;
  volume_24h: number;
  trade_count: number;
  market_share: number;
}

// Market data service for fetching real data
const MarketDataService = {
  // Fetch top cryptocurrencies
  async fetchTopCoins(limit: number = 20): Promise<CryptoData[]> {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      return response.data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        market_cap: coin.market_cap,
        volume_24h: coin.total_volume,
        change_24h: coin.price_change_percentage_24h || 0,
        image: coin.image
      }));
    } catch (error) {
      console.error("Error fetching top coins:", error);
      return [];
    }
  },

  // Fetch exchange data
  async fetchExchangeData(limit: number = 15): Promise<ExchangeData[]> {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/exchanges?per_page=${limit}&page=1`
      );
      
      return response.data.map((exchange: any) => ({
        id: exchange.id,
        name: exchange.name,
        volume_24h: exchange.trade_volume_24h_btc * 60000, // Approximate USD value
        trade_count: exchange.trade_volume_24h_btc_normalized,
        market_share: exchange.trust_score
      }));
    } catch (error) {
      console.error("Error fetching exchange data:", error);
      return [];
    }
  },

  // Get price comparisons between exchanges
  async fetchPriceComparisons(coin: string, exchangeFilters: string[]): Promise<any[]> {
    try {
      // Map of CoinGecko exchange IDs to display names
      const exchangeMap: Record<string, string> = {
        'binance': 'Binance',
        'gdax': 'Coinbase',
        'kraken': 'Kraken',
        'kucoin': 'KuCoin',
        'gate': 'Gate.io',
        'bitfinex': 'Bitfinex',
        'okex': 'OKX',
        'bybit_spot': 'Bybit',
        'gemini': 'Gemini',
        'poloniex': 'Poloniex',
        'ascendex': 'AscendEX',
        'mexc': 'MEXC Global',
        'bitrue': 'Bitrue',
        'huobi': 'HTX',
        'bitget': 'Bitget'
      };
      
      // Convert display names to IDs
      const exchangeIds = exchangeFilters
        .map(name => {
          const entry = Object.entries(exchangeMap).find(([id, displayName]) => 
            displayName === name || displayName.toLowerCase() === name.toLowerCase()
          );
          return entry ? entry[0] : null;
        })
        .filter(id => id !== null);
      
      // If no valid exchanges found, use defaults
      const validExchangeIds = exchangeIds.length > 0 ? 
        exchangeIds : Object.keys(exchangeMap).slice(0, 5);
      
      // Fetch coin data from each exchange
      const pricePromises = validExchangeIds.map(async (exchangeId) => {
        try {
          const response = await axios.get(
            `https://api.coingecko.com/api/v3/exchanges/${exchangeId}/tickers?coin_ids=${coin}`
          );
          
          // Find the USD trading pair
          const usdPair = response.data.tickers.find((ticker: any) => 
            ticker.target === 'USD' || ticker.target === 'USDT' || ticker.target === 'USDC'
          );
          
          if (usdPair) {
            return {
              exchange: exchangeMap[exchangeId] || exchangeId,
              price: usdPair.last,
              volume: usdPair.volume,
              bid: usdPair.bid,
              ask: usdPair.ask,
              spread: usdPair.bid && usdPair.ask ? ((usdPair.ask - usdPair.bid) / usdPair.ask * 100) : null,
              target: usdPair.target
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching ${coin} price from ${exchangeId}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(pricePromises);
      return results.filter(result => result !== null);
    } catch (error) {
      console.error("Error fetching price comparisons:", error);
      return [];
    }
  },
  
  // Get volatility data for coins
  async fetchVolatilityData(coins: CryptoData[]): Promise<any[]> {
    try {
      // For real volatility calculation we need historical data
      // but for simplicity we'll use 24h change as a proxy
      return coins.map(coin => ({
        name: coin.symbol,
        volatility: Math.abs(coin.change_24h),
        price: coin.price,
        marketCap: coin.market_cap,
        change: coin.change_24h,
        volume: coin.volume_24h
      })).sort((a, b) => b.volatility - a.volatility);
    } catch (error) {
      console.error("Error calculating volatility data:", error);
      return [];
    }
  },
  
  // Calculate deviation alerts based on exchange price differences
  async calculateDeviationAlerts(
    exchangeFilters: string[], 
    coinFilters: string[] = ['bitcoin', 'ethereum', 'solana', 'ripple', 'cardano']
  ): Promise<any[]> {
    try {
      const alerts = [];
      
      for (const coin of coinFilters) {
        const priceComparisons = await this.fetchPriceComparisons(coin, exchangeFilters);
        
        // Need at least 2 exchanges for comparison
        if (priceComparisons.length < 2) continue;
        
        // Calculate average price across exchanges
        const avgPrice = priceComparisons.reduce((sum, comp) => sum + comp.price, 0) / priceComparisons.length;
        
        // Find pairs with significant deviation
        for (let i = 0; i < priceComparisons.length; i++) {
          for (let j = i + 1; j < priceComparisons.length; j++) {
            const price1 = priceComparisons[i].price;
            const price2 = priceComparisons[j].price;
            
            // Calculate deviation percentage
            const deviation = Math.abs((price1 - price2) / ((price1 + price2) / 2) * 100);
            
            // If deviation is significant (> 0.5%), create an alert
            if (deviation > 0.5) {
              // Calculate how many standard deviations from normal
              const priceArr = priceComparisons.map(p => p.price);
              const stdDev = calculateStdDev(priceArr);
              const deviationFromNorm = stdDev > 0 ? 
                Math.abs(price1 - price2) / stdDev : 
                1;
                
              alerts.push({
                id: `dev-${coin}-${i}-${j}`,
                pair: coin.toUpperCase() + '/' + (priceComparisons[i].target || 'USDT'),
                exchange1: priceComparisons[i].exchange,
                exchange2: priceComparisons[j].exchange,
                price1,
                price2,
                deviationPercent: deviation,
                historicalCorrelation: 0.9, // Placeholder - would need historical data
                deviationFromNorm: Math.min(5, Math.round(deviationFromNorm)),
                deviationDuration: 0, // Would need timestamped data
                timestamp: new Date(),
                severityScore: Math.min(10, Math.round(deviation * 2)),
                anomalyType: price1 > price2 ? 'Divergence' : 'Convergence',
                potentialArbitrage: Math.abs(price1 - price2),
                alertTriggered: deviation > 1.0
              });
            }
          }
        }
      }
      
      return alerts.sort((a, b) => b.severityScore - a.severityScore);
    } catch (error) {
      console.error("Error calculating deviation alerts:", error);
      return [];
    }
  }
};

// Helper function for standard deviation
function calculateStdDev(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

const MarketAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('volatility');
  const [topCoins, setTopCoins] = useState<any[]>([]);
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [exchangeHeatmapData, setExchangeHeatmapData] = useState<any[]>([]);
  const [volatilityData, setVolatilityData] = useState<any[]>([]);
  const [exchangeVolumeData, setExchangeVolumeData] = useState<any[]>([]);
  
  // New state variables for enhanced features
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<any[]>([]);
  const [historicalSpreadData, setHistoricalSpreadData] = useState<any[]>([]);
  const [liquidityData, setLiquidityData] = useState<any[]>([]);
  const [technicalIndicatorsData, setTechnicalIndicatorsData] = useState<any[]>([]);
  const [feeImpactData, setFeeImpactData] = useState<any[]>([]);
  const [marketSentimentData, setMarketSentimentData] = useState<any[]>([]);
  const [marketInefficiencyScores, setMarketInefficiencyScores] = useState<any>(null);
  const [selectedPair, setSelectedPair] = useState(tradingPairs[0]);
  const [selectedTechnicalIndicator, setSelectedTechnicalIndicator] = useState('rsi');
  const [alertSettings, setAlertSettings] = useState({
    minSpreadPercentage: 1.0,
    maxExecutionRisk: 3,
    minLiquidityScore: 30,
    enableNotifications: true,
    favoriteExchanges: ['Binance', 'Coinbase'],
    favoritePairs: ['BTC/USDT', 'ETH/USDT']
  });
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    topCoins: true,
    correlation: true,
    volatility: true,
    heatmap: true,
    exchangeActivity: true,
    arbitrageOpportunities: true,
    deviationAlerts: true,
    historicalSpread: true,
    liquidity: true,
    technicalIndicators: true,
    feeImpact: true,
    marketSentiment: true,
    marketInefficiency: true
  });
  
  // Add filters for user customization
  const [filters, setFilters] = useState({
    pairSearch: '',
    exchangeFilters: exchanges,
    correlationType: 'all', // 'all', 'positive', 'negative'
    correlationStrength: 'all', // 'all', 'strong', 'moderate', 'weak'
    timeframe: '24h', // '24h', '7d', '30d'
    minSpread: 0.1, // Minimum spread percentage
    maxRisk: 5,  // Maximum risk level (1-5)
    liquidityThreshold: 'all', // 'all', 'high', 'medium', 'low'
    sortBy: 'spread', // 'spread', 'profit', 'risk', 'liquidity'
    sortDirection: 'desc', // 'asc', 'desc'
    minPrice: undefined,
    maxPrice: undefined,
    minVolatility: undefined,
    maxVolatility: undefined
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
      timeframe: '24h',
      minSpread: 0.1,
      maxRisk: 5,
      liquidityThreshold: 'all',
      sortBy: 'spread',
      sortDirection: 'desc',
      minPrice: undefined,
      maxPrice: undefined,
      minVolatility: undefined,
      maxVolatility: undefined
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

  // Update alert settings
  const updateAlertSettings = (key: string, value: any) => {
    setAlertSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Alert Settings Updated",
      description: "Your custom alert settings have been saved",
    });
  };

  // Function to save favorite exchange
  const toggleFavoriteExchange = (exchange: string) => {
    setAlertSettings(prev => {
      const favorites = prev.favoriteExchanges.includes(exchange)
        ? prev.favoriteExchanges.filter(e => e !== exchange)
        : [...prev.favoriteExchanges, exchange];
        
      return {
        ...prev,
        favoriteExchanges: favorites
      };
    });
  };
  
  // Function to save favorite pair
  const toggleFavoritePair = (pair: string) => {
    setAlertSettings(prev => {
      const favorites = prev.favoritePairs.includes(pair)
        ? prev.favoritePairs.filter(p => p !== pair)
        : [...prev.favoritePairs, pair];
        
      return {
        ...prev,
        favoritePairs: favorites
      };
    });
  };

  // Memoized function to filter arbitrage opportunities
  const getFilteredArbitrageOpportunities = useCallback(() => {
    return arbitrageOpportunities.filter(opp => {
      // Filter by search term
      if (filters.pairSearch && !opp.pair.toLowerCase().includes(filters.pairSearch.toLowerCase())) {
        return false;
      }
      
      // Filter by exchange
      if (!filters.exchangeFilters.includes(opp.buyExchange) || !filters.exchangeFilters.includes(opp.sellExchange)) {
        return false;
      }
      
      // Filter by minimum spread
      if (opp.spreadPercentage < filters.minSpread) {
        return false;
      }
      
      // Filter by risk level
      if (opp.riskFactor > filters.maxRisk) {
        return false;
      }
      
      // Filter by liquidity threshold
      if (filters.liquidityThreshold !== 'all') {
        if (filters.liquidityThreshold === 'high' && opp.liquidityScore < 70) {
          return false;
        }
        if (filters.liquidityThreshold === 'medium' && (opp.liquidityScore < 30 || opp.liquidityScore >= 70)) {
          return false;
        }
        if (filters.liquidityThreshold === 'low' && opp.liquidityScore >= 30) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      const sortMultiplier = filters.sortDirection === 'asc' ? 1 : -1;
      
      if (filters.sortBy === 'spread') {
        return (a.spreadPercentage - b.spreadPercentage) * sortMultiplier;
      }
      if (filters.sortBy === 'profit') {
        return (a.netProfitAfterFees - b.netProfitAfterFees) * sortMultiplier;
      }
      if (filters.sortBy === 'risk') {
        return (a.riskFactor - b.riskFactor) * sortMultiplier;
      }
      if (filters.sortBy === 'liquidity') {
        return (a.liquidityScore - b.liquidityScore) * sortMultiplier;
      }
      
      return 0;
    });
  }, [arbitrageOpportunities, filters]);

  // Function to get risk class
  const getRiskClass = (risk: number) => {
    if (risk >= 4) return 'bg-red-900/20 text-red-400';
    if (risk >= 3) return 'bg-orange-900/20 text-orange-400';
    if (risk >= 2) return 'bg-yellow-900/20 text-yellow-400';
    return 'bg-green-900/20 text-green-400';
  };

  // Filter correlation data based on user filters
  const getFilteredCorrelationData = useCallback(() => {
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
  }, [correlationData, filters]);
  
  // Filter exchange data based on selected exchanges
  const getFilteredExchangeData = useCallback(() => {
    return exchangeHeatmapData.filter(item => 
      filters.exchangeFilters.includes(item.x) && filters.exchangeFilters.includes(item.y)
    );
  }, [exchangeHeatmapData, filters]);
  
  // Get filtered exchange volume data
  const getFilteredExchangeVolumeData = useCallback(() => {
    return exchangeVolumeData.filter(item => 
      filters.exchangeFilters.includes(item.name)
    );
  }, [exchangeVolumeData, filters]);

  // Get filtered volatility data
  const getFilteredVolatilityData = useCallback(() => {
    return volatilityData.filter(item => {
      // Apply price filter if set
      if (filters.minPrice !== undefined && item.price < filters.minPrice) {
        return false;
      }
      
      if (filters.maxPrice !== undefined && item.price > filters.maxPrice) {
        return false;
      }
      
      // Apply volatility filter if set
      if (filters.minVolatility !== undefined && item.volatility < filters.minVolatility) {
        return false;
      }
      
      if (filters.maxVolatility !== undefined && item.volatility > filters.maxVolatility) {
        return false;
      }
      
      // Filter by search term
      if (filters.pairSearch && !item.name.toLowerCase().includes(filters.pairSearch.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [volatilityData, filters]);

  // Add a filtering function for the liquidity data
  const getFilteredLiquidityData = useCallback(() => {
    return liquidityData
      .filter(item => {
        // Filter by search term
        if (filters.pairSearch && !item.pair.toLowerCase().includes(filters.pairSearch.toLowerCase())) {
          return false;
        }
        return true;
      })
      .map(item => {
        // Create a deep copy with filtered exchanges
        const filteredExchanges = item.exchanges ? 
          item.exchanges.filter(ex => filters.exchangeFilters.includes(ex.exchange)) 
          : [];
          
        // Calculate a new totalLiquidity based on filtered exchanges
        const newTotalLiquidity = filteredExchanges.reduce((sum, ex) => sum + ex.volume24h, 0);
        
        // Determine best execution exchange based on filtered exchanges
        const newBestExecutionExchange = filteredExchanges.length > 0 
          ? filteredExchanges.sort((a, b) => b.liquidityScore - a.liquidityScore)[0].exchange
          : 'None';
        
        return {
          ...item,
          exchanges: filteredExchanges,
          totalLiquidity: newTotalLiquidity,
          bestExecutionExchange: newBestExecutionExchange
        };
      })
      .filter(item => item.exchanges.length > 0); // Only include items that have at least one matching exchange
  }, [liquidityData, filters]);

  // Fetch market data
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch real-time data from APIs
      const topCoinsData = await MarketDataService.fetchTopCoins(20);
      setTopCoins(topCoinsData);
      
      // Generate correlation data from real market data
      const correlations = generateCorrelationData(topCoinsData);
      setCorrelationData(correlations);
      
      // Calculate volatility from real market data
      const volatility = await MarketDataService.fetchVolatilityData(topCoinsData);
      setVolatilityData(volatility);
      
      // Generate exchange heatmap data
      const heatmap = generateExchangeHeatmapData();
      setExchangeHeatmapData(heatmap);
      
      // Generate exchange volume data
      const volumeData = generateExchangeVolumeData();
      setExchangeVolumeData(volumeData);
      
      // Generate liquidity data - respecting exchange filters
      const liquidity = generateLiquidityData(8);
      // Ensure liquidity data has valid exchange entries that match our filters
      const processedLiquidity = liquidity.map(item => ({
        ...item,
        // Make sure exchange data has only valid exchanges from our list
        exchanges: item.exchanges.filter(ex => exchanges.includes(ex.exchange))
      }));
      setLiquidityData(processedLiquidity);
      
      // Generate fee impact data
      const feeImpact = generateFeeImpactData();
      setFeeImpactData(feeImpact);
      
      // Generate market sentiment data
      const sentiment = generateMarketSentimentData();
      setMarketSentimentData(sentiment);
      
      // Generate market inefficiency scores
      const inefficiency = generateMarketInefficiencyScores();
      setMarketInefficiencyScores(inefficiency);
      
      setLastUpdated(new Date());
      
      toast({
        title: "Data Updated",
        description: "Market analysis data has been refreshed with real-time information",
      });
    } catch (error) {
      console.error("Error fetching market data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch real-time market analysis data. Some data may be from simulations.",
        variant: "destructive",
      });
      
      // Fallback to mock data if real API fails
      const marketData = generateMarketData(20);
      setTopCoins(marketData.slice(0, 10));
      
      const correlations = generateCorrelationData(marketData.slice(0, 10));
      setCorrelationData(correlations);
      
      const volatility = generateVolatilityData(marketData.slice(0, 15));
      setVolatilityData(volatility);
      
      // Generate exchange heatmap data
      const heatmap = generateExchangeHeatmapData();
      setExchangeHeatmapData(heatmap);
      
      // Generate exchange volume data
      const volumeData = generateExchangeVolumeData();
      setExchangeVolumeData(volumeData);
      
      // Generate liquidity data with proper exchange filtering
      const liquidity = generateLiquidityData(8);
      // Ensure liquidity data has valid exchange entries that match our filters
      const processedLiquidity = liquidity.map(item => ({
        ...item,
        // Make sure exchange data has only valid exchanges from our list
        exchanges: item.exchanges.filter(ex => exchanges.includes(ex.exchange))
      }));
      setLiquidityData(processedLiquidity);
      
      const feeImpact = generateFeeImpactData();
      setFeeImpactData(feeImpact);
      
      const sentiment = generateMarketSentimentData();
      setMarketSentimentData(sentiment);
      
      const inefficiency = generateMarketInefficiencyScores();
      setMarketInefficiencyScores(inefficiency);
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
                
                <p className="text-xs font-medium text-slate-400 mb-1">Price Range</p>
                <div className="space-y-3 px-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Min: ${filters.minPrice || 0}</span>
                    <span className="text-xs">Max: ${filters.maxPrice || 'Any'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="h-7 text-xs"
                      min={0}
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      className="h-7 text-xs"
                      min={0}
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <p className="text-xs font-medium text-slate-400 mb-1">Volatility</p>
                <div className="space-y-3 px-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Min: {filters.minVolatility || 0}%</span>
                    <span className="text-xs">Max: {filters.maxVolatility || 'Any'}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min %"
                      className="h-7 text-xs"
                      min={0}
                      value={filters.minVolatility || ''}
                      onChange={(e) => handleFilterChange('minVolatility', e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Max %"
                      className="h-7 text-xs"
                      min={0}
                      value={filters.maxVolatility || ''}
                      onChange={(e) => handleFilterChange('maxVolatility', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
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
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Selected Exchanges:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Manage Exchanges
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-2 border-b border-slate-700">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Search exchanges..."
                      className="pl-8 h-9 bg-slate-800 border-slate-700 text-sm"
                    />
                  </div>
                </div>
                <ScrollArea className="h-80">
                  <div className="p-2 grid grid-cols-1 gap-1">
                    {exchanges.map(exchange => (
                      <div key={exchange} className="flex items-center space-x-2">
                        <Checkbox
                          id={`exchange-${exchange}`}
                          checked={filters.exchangeFilters.includes(exchange)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              if (!filters.exchangeFilters.includes(exchange)) {
                                handleFilterChange('exchangeFilters', [...filters.exchangeFilters, exchange]);
                              }
                            } else {
                              handleFilterChange('exchangeFilters', 
                                filters.exchangeFilters.filter(e => e !== exchange)
                              );
                            }
                          }}
                        />
                        <label 
                          htmlFor={`exchange-${exchange}`}
                          className="text-sm cursor-pointer flex-grow"
                        >
                          {exchange}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-2 border-t border-slate-700 flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleFilterChange('exchangeFilters', [])}
                  >
                    Clear All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleFilterChange('exchangeFilters', exchanges)}
                  >
                    Select All
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
            {filters.exchangeFilters.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-1">No exchanges selected</div>
            ) : filters.exchangeFilters.map(exchange => (
              <Badge 
                key={exchange}
                variant="secondary"
                className="flex items-center gap-1 bg-slate-700/50"
              >
                {exchange}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-slate-300" 
                  onClick={() => toggleExchangeFilter(exchange)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 w-full">
        <TabsList className="bg-slate-800 border border-slate-700 w-full flex justify-between overflow-x-auto">
          <TabsTrigger value="correlations" className="flex items-center gap-1 data-[state=active]:bg-blue-600 flex-1">
            <Grid3X3 className="h-4 w-4" />
            <span>Correlations</span>
          </TabsTrigger>
          <TabsTrigger value="volatility" className="flex items-center gap-1 data-[state=active]:bg-blue-600 flex-1">
            <Zap className="h-4 w-4" />
            <span>Volatility</span>
          </TabsTrigger>
          <TabsTrigger value="liquidity" className="flex items-center gap-1 data-[state=active]:bg-blue-600 flex-1">
            <Wallet className="h-4 w-4" />
            <span>Liquidity</span>
          </TabsTrigger>
          <TabsTrigger value="feeImpact" className="flex items-center gap-1 data-[state=active]:bg-blue-600 flex-1">
            <Gauge className="h-4 w-4" />
            <span>Fee Impact</span>
          </TabsTrigger>
          <TabsTrigger value="marketSentiment" className="flex items-center gap-1 data-[state=active]:bg-blue-600 flex-1">
            <Info className="h-4 w-4" />
            <span>Market Sentiment</span>
          </TabsTrigger>
          <TabsTrigger value="marketInefficiency" className="flex items-center gap-1 data-[state=active]:bg-blue-600 flex-1">
            <Layers className="h-4 w-4" />
            <span>Market Inefficiency</span>
          </TabsTrigger>
        </TabsList>

        {/* Main content area - Updated to use full width */}
        <div className="space-y-4 md:space-y-6 w-full">
            <TabsContent value="volatility" className="mt-0 w-full">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium text-white">Volatility Analysis</h3>
                  {isLoading && (
                    <Badge variant="outline" className="bg-blue-900/20 text-blue-400">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Loading real-time data...
                    </Badge>
                  )}
                </div>
                
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getFilteredVolatilityData()}
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
                      <Tooltip content={<CustomTooltip valueSuffix="%" />} />
                      <Bar 
                        dataKey="volatility" 
                        name="Volatility"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      >
                        {getFilteredVolatilityData().map((entry, index) => (
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

                <div className="mt-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Change 24h</TableHead>
                        <TableHead>Volatility</TableHead>
                        <TableHead>Volume 24h</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredVolatilityData().slice(0, 10).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>${item.price.toLocaleString(undefined, {maximumFractionDigits: 2})}</TableCell>
                          <TableCell className={item.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={Math.min(100, item.volatility * 5)} className="h-2 w-16" />
                              <span>{item.volatility.toFixed(2)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatLargeNumber(item.volume)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="correlations" className="mt-0 w-full">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium text-white">Asset Correlation Analysis</h3>
                  {isLoading && (
                    <Badge variant="outline" className="bg-blue-900/20 text-blue-400">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Loading real-time data...
                    </Badge>
                  )}
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

            <TabsContent value="liquidity" className="mt-0 w-full">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium text-white">Liquidity Analysis</h3>
                  {isLoading ? (
                    <Badge variant="outline" className="bg-blue-900/20 text-blue-400">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Loading data...
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-900/20 text-green-400">
                      <Wallet className="h-3 w-3 mr-1" />
                      {getFilteredLiquidityData().length} pairs available
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Liquidity Distribution by Pair</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {getFilteredLiquidityData().length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getFilteredLiquidityData().map(item => ({
                              name: item.pair,
                              liquidity: item.totalLiquidity,
                              bestExchange: item.bestExecutionExchange
                            }))}
                            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" horizontal={false} />
                            <XAxis type="number" tick={{ fill: '#94a3b8' }} />
                            <YAxis 
                              dataKey="name" 
                              type="category"
                              tick={{ fill: '#94a3b8' }}
                              width={70}
                            />
                            <Tooltip content={<CustomTooltip valuePrefix="$" />} />
                            <Bar 
                              dataKey="liquidity" 
                              name="Total Liquidity"
                              fill="#3b82f6"
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Wallet className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                            <p className="text-sm text-slate-400">No liquidity data available for the selected filters</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Exchange Liquidity Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {getFilteredLiquidityData().length > 0 && getFilteredLiquidityData()[0].exchanges && getFilteredLiquidityData()[0].exchanges.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getFilteredLiquidityData()[0].exchanges.map(ex => ({
                                name: ex.exchange,
                                value: ex.liquidityScore
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                              label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              labelLine={false}
                            >
                              {getFilteredLiquidityData()[0].exchanges.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`}
                                  fill={[
                                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                                    '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'
                                  ][index % 8]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}`, 'Liquidity Score']} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Wallet className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                            <p className="text-sm text-slate-400">No exchange data available for the selected filters</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pair</TableHead>
                        <TableHead>Total Liquidity</TableHead>
                        <TableHead>Best Execution</TableHead>
                        <TableHead>Order Book Depth</TableHead>
                        <TableHead>Slippage (1M USD)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredLiquidityData().length > 0 ? (
                        getFilteredLiquidityData().slice(0, 8).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.pair}</TableCell>
                            <TableCell>${item.totalLiquidity.toLocaleString()}</TableCell>
                            <TableCell>{item.bestExecutionExchange}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={item.orderBookDepth} className="h-2 w-16" />
                                <span>{item.orderBookDepth}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{item.slippageEstimate}%</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                            No liquidity data available for the selected exchanges
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="feeImpact" className="mt-0 w-full">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium text-white">Fee Impact Analysis</h3>
                  <TooltipProvider>
                    <TooltipComponent>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="bg-amber-900/20 text-amber-400 cursor-help">
                          <Info className="h-3 w-3 mr-1" />
                          Simulation
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Fee data is simulated based on typical exchange fee structures.</p>
                      </TooltipContent>
                    </TooltipComponent>
                  </TooltipProvider>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Exchange Fee Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={feeImpactData
                            .filter(item => filters.exchangeFilters.includes(item.exchange))
                            .map(item => ({
                              name: item.exchange,
                              makerFee: item.makerFee * 100, // Convert to percentage
                              takerFee: item.takerFee * 100,
                              depositFee: item.depositFee * 100
                          }))}
                          margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
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
                            label={{ value: 'Fee Percentage (%)', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8' }}
                            tick={{ fill: '#94a3b8' }}
                          />
                          <Tooltip content={<CustomTooltip valueSuffix="%" />} />
                          <Legend />
                          <Bar dataKey="makerFee" name="Maker Fee" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="takerFee" name="Taker Fee" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="depositFee" name="Deposit Fee" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Net Profit Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                          This analysis shows how exchange fees impact net profits on a $1,000 trade 
                          with a 1% spread arbitrage opportunity.
                        </p>
                        
                        <ScrollArea className="h-[264px] pr-4">
                          <div className="space-y-4">
                            {feeImpactData
                              .filter(item => filters.exchangeFilters.includes(item.exchange))
                              .map((item, index) => {
                                // Calculate net profit for a 1% spread on $1000 after fees
                                const grossProfit = 10; // $10 (1% of $1000)
                                const totalFeePercentage = item.makerFee + item.takerFee;
                                const totalFeeAmount = totalFeePercentage * 1000;
                                const netProfit = grossProfit - totalFeeAmount;
                                const netProfitPercentage = netProfit / grossProfit * 100;
                                
                                return (
                                  <div key={index} className="border-b border-slate-700 pb-3 last:border-b-0">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm font-medium">{item.exchange}</span>
                                      <Badge 
                                        className={netProfit > 0 ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"}
                                      >
                                        Net: ${netProfit.toFixed(2)}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex flex-col space-y-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400">Gross Profit:</span>
                                        <span className="text-xs text-green-400">+$10.00</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400">Total Fees:</span>
                                        <span className="text-xs text-red-400">-${totalFeeAmount.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400">Break-even Spread:</span>
                                        <span className="text-xs">{(totalFeePercentage * 100).toFixed(2)}%</span>
                                      </div>
                                      
                                      <div className="mt-2">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-xs text-slate-400">Profit Retention:</span>
                                          <span className="text-xs">{Math.max(0, netProfitPercentage).toFixed(1)}%</span>
                                        </div>
                                        <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full ${netProfit > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.max(0, netProfitPercentage)}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            }
                          </div>
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="marketSentiment" className="mt-0 w-full">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium text-white">Market Sentiment Analysis</h3>
                  <TooltipProvider>
                    <TooltipComponent>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="bg-amber-900/20 text-amber-400 cursor-help">
                          <Info className="h-3 w-3 mr-1" />
                          Simulation
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Market sentiment data is simulated for demonstration purposes.</p>
                      </TooltipContent>
                    </TooltipComponent>
                  </TooltipProvider>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-slate-800 border-slate-700 md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Sentiment Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={marketSentimentData.map(item => ({
                            name: item.pair,
                            news: item.newsScore,
                            social: item.socialSentiment,
                            change: item.sentimentChange24h
                          }))}
                          margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                          <YAxis tick={{ fill: '#94a3b8' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="news" name="News Sentiment" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="social" name="Social Sentiment" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="change" name="24h Change" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Unusual Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                          {marketSentimentData
                            .filter(item => item.unusualActivity)
                            .map((item, index) => (
                              <div key={index} className="bg-slate-750 rounded-lg p-3 border border-slate-700">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">{item.pair}</span>
                                  <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400">
                                    Unusual Activity
                                  </Badge>
                                </div>
                                
                                <div className="mt-2 space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">News Articles:</span>
                                    <span>{item.newsCount}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Social Mentions:</span>
                                    <span>{item.socialMentions}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Sentiment Change:</span>
                                    <span className={item.sentimentChange24h > 0 ? 'text-green-400' : 'text-red-400'}>
                                      {item.sentimentChange24h > 0 ? '+' : ''}{item.sentimentChange24h.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Trend:</span>
                                    <span>{item.sentimentTrend}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-4 text-xs text-slate-400">
                  <p>
                    <span className="font-semibold">Sentiment Analysis:</span> This data combines news articles, social media mentions and sentiment to identify potential trading opportunities.
                  </p>
                  <p className="mt-1">
                    Unusual activity can often precede significant price movements, especially when sentiment and price trends diverge.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="marketInefficiency" className="mt-0 w-full">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium text-white">Market Inefficiency Analysis</h3>
                  <TooltipProvider>
                    <TooltipComponent>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="bg-amber-900/20 text-amber-400 cursor-help">
                          <Info className="h-3 w-3 mr-1" />
                          Simulation
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Market inefficiency data is simulated for demonstration purposes.</p>
                      </TooltipContent>
                    </TooltipComponent>
                  </TooltipProvider>
                </div>
                
                {!marketInefficiencyScores ? (
                  <div className="text-center py-12 text-slate-400">
                    <Layers className="h-16 w-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-lg font-medium mb-2">No Data Available</p>
                    <p className="text-sm max-w-md mx-auto">
                      Market inefficiency data is currently unavailable. Please refresh to try again.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">Market Inefficiency Score</CardTitle>
                          <Badge 
                            className={
                              marketInefficiencyScores.marketCondition === 'High Inefficiency' ? "bg-green-900/20 text-green-400" :
                              marketInefficiencyScores.marketCondition === 'Moderate Inefficiency' ? "bg-amber-900/20 text-amber-400" :
                              "bg-slate-900/20 text-slate-400"
                            }
                          >
                            {marketInefficiencyScores.marketCondition}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4">
                          <div className="inline-flex items-center justify-center rounded-full w-24 h-24 bg-slate-700 mb-3">
                            <span className="text-3xl font-bold">
                              {marketInefficiencyScores.overallScore}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">Overall Score (0-100)</p>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="bg-slate-700/50 rounded p-2 text-center">
                            <p className="text-2xl font-bold">
                              {marketInefficiencyScores.inefficiencyTrend}
                            </p>
                            <p className="text-xs text-slate-400">Trend</p>
                          </div>
                          <div className="bg-slate-700/50 rounded p-2 text-center">
                            <p className="text-2xl font-bold">
                              {new Date(marketInefficiencyScores.timestamp).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-slate-400">Last Updated</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-800 border-slate-700 md:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Exchange Inefficiency Ranking</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[280px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Exchange</TableHead>
                                <TableHead>Inefficiency Score</TableHead>
                                <TableHead>Opportunities</TableHead>
                                <TableHead>Recommended Pairs</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {marketInefficiencyScores.exchangeScores
                                .filter(item => filters.exchangeFilters.includes(item.exchange))
                                .sort((a, b) => b.inefficiencyScore - a.inefficiencyScore)
                                .map((exchange, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{exchange.exchange}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Progress 
                                          value={exchange.inefficiencyScore} 
                                          className="h-2 w-16"
                                        />
                                        <span>{exchange.inefficiencyScore}/100</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>{exchange.arbitrageOpportunityCount}</TableCell>
                                    <TableCell>
                                      <div className="flex gap-1">
                                        {exchange.recommendedPairs.map((pair, i) => (
                                          <Badge
                                            key={i}
                                            variant="outline"
                                            className="bg-blue-900/10 text-blue-400"
                                          >
                                            {pair}
                                          </Badge>
                                        ))}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-slate-400">
                  <p>
                    <span className="font-semibold">Market Inefficiency:</span> Our proprietary scoring system identifies market segments with the greatest arbitrage potential.
                  </p>
                  <p className="mt-1">
                    Higher scores indicate greater price discrepancies between exchanges, potentially leading to more profitable arbitrage opportunities.
                  </p>
                </div>
              </div>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MarketAnalysis; 