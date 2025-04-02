import { useState, useEffect, useCallback } from 'react';
import { generateArbitrageOpportunities } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

export interface ArbitrageData {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spreadPercentage: number;
  potentialProfit: number;
  timestamp: Date;
  volume24h: number;
  depositStatus?: string;
  withdrawalStatus?: string;
  type: 'direct' | 'triangular' | 'futures';
  executionSpeed?: string;
  fees?: {
    buyExchange: number;
    sellExchange: number;
    network: number;
    total: number;
  };
  netProfitPercentage?: number;
  triangularPath?: string[];
  liquidityDepth?: {
    buy: number;
    sell: number;
  };
}

interface ExchangePrice {
  exchange: string;
  price: number;
  volume24h: number;
  depositStatus: string;
  withdrawalStatus: string;
}

// Cache layer to prevent excessive API calls
const cache = {
  data: new Map<string, { data: any, timestamp: number }>(),
  // Cache expires after 10 seconds
  ttl: 10 * 1000,
  
  get: (key: string) => {
    const item = cache.data.get(key);
    if (!item) return null;
    
    // Check if cache is still valid
    if (Date.now() - item.timestamp > cache.ttl) {
      cache.data.delete(key);
      return null;
    }
    
    return item.data;
  },
  
  set: (key: string, data: any) => {
    cache.data.set(key, { data, timestamp: Date.now() });
  }
};

// This would be replaced with real API calls in a production environment
const fetchArbitrageData = async (
  type: 'direct' | 'triangular' | 'futures', 
  exchanges: string[],
  minSpread: number,
  minVolume: number
): Promise<ArbitrageData[]> => {
  // Check cache first
  const cacheKey = `${type}-${exchanges.join(',')}-${minSpread}-${minVolume}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    let opportunities: ArbitrageData[] = [];
    
    // In production, this would be replaced with actual API calls
    // For now, using more realistic simulation of API calls
    if (type === 'direct') {
      opportunities = await fetchDirectArbitrageOpportunities(exchanges, minSpread, minVolume);
    } else if (type === 'triangular') {
      opportunities = await fetchTriangularArbitrageOpportunities(exchanges, minSpread, minVolume);
    } else if (type === 'futures') {
      opportunities = await fetchFuturesArbitrageOpportunities(exchanges, minSpread, minVolume);
    }

    // Cache the results
    cache.set(cacheKey, opportunities);
    return opportunities;
  } catch (error) {
    console.error(`Error fetching ${type} arbitrage data:`, error);
    throw error;
  }
};

// Function to fetch direct arbitrage opportunities (cross-exchange)
const fetchDirectArbitrageOpportunities = async (
  exchanges: string[],
  minSpread: number,
  minVolume: number
): Promise<ArbitrageData[]> => {
  // Simulate API delay - would be replaced with actual API calls to exchanges
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Common trading pairs with high liquidity
  const pairs = [
    'BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT',
    'DOGE/USDT', 'SHIB/USDT', 'LINK/USDT', 'AVAX/USDT', 'DOT/USDT',
    'MATIC/USDT', 'BNB/USDT', 'LTC/USDT', 'UNI/USDT', 'XLM/USDT'
  ];
  
  const opportunities: ArbitrageData[] = [];
  
  // For each pair, compare prices across exchanges
  for (const pair of pairs) {
    // This would be actual API calls to get real-time prices from exchanges
    // Simulating exchange price differences
    const exchangePrices: ExchangePrice[] = exchanges.map(exchange => {
      const basePrice = getBasePrice(pair);
      // Add variance to create price differences between exchanges (0.05% to 2%)
      const variance = (Math.random() * 1.95 + 0.05) / 100;
      // Randomly decide if price is higher or lower
      const direction = Math.random() > 0.5 ? 1 : -1;
      const price = basePrice * (1 + variance * direction);
      
      return {
        exchange,
        price,
        volume24h: Math.random() * 10000000 + 100000, // $100K to $10M
        depositStatus: Math.random() > 0.2 ? "OK" : "Slow",
        withdrawalStatus: Math.random() > 0.2 ? "OK" : "Delayed"
      };
    });
    
    // Find the lowest buy price and highest sell price
    exchangePrices.sort((a, b) => a.price - b.price);
    
    for (let buyIndex = 0; buyIndex < exchangePrices.length - 1; buyIndex++) {
      const buyExchange = exchangePrices[buyIndex];
      
      for (let sellIndex = buyIndex + 1; sellIndex < exchangePrices.length; sellIndex++) {
        const sellExchange = exchangePrices[sellIndex];
        
        const spreadPercentage = ((sellExchange.price - buyExchange.price) / buyExchange.price) * 100;
        
        // Only include if spread meets minimum requirement
        if (spreadPercentage >= minSpread && 
            Math.min(buyExchange.volume24h, sellExchange.volume24h) >= minVolume) {
          
          // Calculate potential profit for $1000 trade
          const tradeAmount = 1000;
          const buyExchangeFee = 0.1; // 0.1%
          const sellExchangeFee = 0.1; // 0.1%
          const networkFee = 0.05; // 0.05%
          const totalFee = buyExchangeFee + sellExchangeFee + networkFee;
          
          const potentialProfit = tradeAmount * (spreadPercentage / 100);
          const netProfit = potentialProfit - (tradeAmount * (totalFee / 100));
          const netProfitPercentage = spreadPercentage - totalFee;
          
          if (netProfitPercentage > 0) {
            opportunities.push({
              id: `${pair.replace('/', '')}-${buyExchange.exchange}-${sellExchange.exchange}`,
              pair,
              buyExchange: buyExchange.exchange,
              sellExchange: sellExchange.exchange,
              buyPrice: buyExchange.price,
              sellPrice: sellExchange.price,
              spreadPercentage,
              potentialProfit,
              timestamp: new Date(),
              volume24h: Math.min(buyExchange.volume24h, sellExchange.volume24h),
              depositStatus: buyExchange.depositStatus,
              withdrawalStatus: sellExchange.withdrawalStatus,
              type: 'direct',
              executionSpeed: '1-5 minutes',
              fees: {
                buyExchange: buyExchangeFee,
                sellExchange: sellExchangeFee,
                network: networkFee,
                total: totalFee
              },
              netProfitPercentage,
              liquidityDepth: {
                buy: buyExchange.volume24h / 48, // Approximate hourly volume
                sell: sellExchange.volume24h / 48
              }
            });
          }
        }
      }
    }
  }
  
  // Sort by net profit percentage
  return opportunities.sort((a, b) => (b.netProfitPercentage || 0) - (a.netProfitPercentage || 0));
};

// Function to fetch triangular arbitrage opportunities (within same exchange)
const fetchTriangularArbitrageOpportunities = async (
  exchanges: string[],
  minSpread: number,
  minVolume: number
): Promise<ArbitrageData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const opportunities: ArbitrageData[] = [];
  
  // Common triangular paths with base currency, intermediary and quote
  const triangularPaths = [
    { base: 'BTC', mid: 'ETH', quote: 'USDT' },
    { base: 'ETH', mid: 'BTC', quote: 'USDT' },
    { base: 'BTC', mid: 'SOL', quote: 'USDT' },
    { base: 'SOL', mid: 'BTC', quote: 'USDT' },
    { base: 'BTC', mid: 'BNB', quote: 'USDT' },
    { base: 'ETH', mid: 'SOL', quote: 'USDT' },
    { base: 'BTC', mid: 'ADA', quote: 'USDT' },
    { base: 'BTC', mid: 'XRP', quote: 'USDT' },
    { base: 'ETH', mid: 'LINK', quote: 'USDT' },
    { base: 'BTC', mid: 'DOGE', quote: 'USDT' }
  ];
  
  for (const exchange of exchanges) {
    for (const path of triangularPaths) {
      // Simulate price differences that would create arbitrage opportunities
      // In production, these would be actual API calls to get prices
      
      // Base to mid price (e.g. BTC/ETH price)
      const baseToMidPrice = getBasePrice(`${path.base}/${path.mid}`);
      
      // Mid to quote price (e.g. ETH/USDT price)
      const midToQuotePrice = getBasePrice(`${path.mid}/${path.quote}`);
      
      // Direct base to quote price (e.g. BTC/USDT price)
      const baseToQuotePrice = getBasePrice(`${path.base}/${path.quote}`);
      
      // Calculate triangular arbitrage opportunity
      // Convert base to mid, then mid to quote
      const equivalentBaseToQuotePrice = baseToMidPrice * midToQuotePrice;
      
      // Calculate spread percentage
      // Compare direct conversion vs. triangular conversion
      const isDirectHigher = Math.random() > 0.5;
      
      // Add a small variance to create opportunities
      const variance = (Math.random() * 3 + 0.2) / 100; // 0.2% to 3.2%
      
      const directPrice = isDirectHigher 
        ? equivalentBaseToQuotePrice * (1 + variance)
        : equivalentBaseToQuotePrice * (1 - variance);
      
      const spreadPercentage = isDirectHigher 
        ? ((directPrice - equivalentBaseToQuotePrice) / equivalentBaseToQuotePrice) * 100
        : ((equivalentBaseToQuotePrice - directPrice) / directPrice) * 100;
      
      if (spreadPercentage >= minSpread) {
        // Calculate volume - in a real app this would come from the exchange
        const volume24h = Math.random() * 5000000 + 100000; // $100K to $5M
        
        if (volume24h >= minVolume) {
          // Calculate fees - in triangular arbitrage there are typically 3 trades
          const exchangeFee = 0.1; // 0.1% per trade
          const totalFee = exchangeFee * 3; // 3 trades
          const netProfitPercentage = spreadPercentage - totalFee;
          
          if (netProfitPercentage > 0) {
            const pair = `${path.base}/${path.mid}/${path.quote}`;
            
            // For $1000 trade
            const tradeAmount = 1000;
            const potentialProfit = tradeAmount * (spreadPercentage / 100);
            
            opportunities.push({
              id: `${pair.replace(/\//g, '')}-${exchange}`,
              pair,
              buyExchange: exchange,
              sellExchange: exchange, // Same exchange for triangular
              buyPrice: isDirectHigher ? equivalentBaseToQuotePrice : directPrice,
              sellPrice: isDirectHigher ? directPrice : equivalentBaseToQuotePrice,
              spreadPercentage,
              potentialProfit,
              timestamp: new Date(),
              volume24h,
              depositStatus: "OK", // Only one exchange involved
              withdrawalStatus: "OK", // Only one exchange involved
              type: 'triangular',
              executionSpeed: '10-30 seconds',
              fees: {
                buyExchange: exchangeFee,
                sellExchange: exchangeFee * 2, // Two more trades
                network: 0, // No network transfer needed
                total: totalFee
              },
              netProfitPercentage,
              triangularPath: [
                `${path.base}/${path.mid}`,
                `${path.mid}/${path.quote}`,
                `${path.base}/${path.quote}`
              ],
              liquidityDepth: {
                buy: volume24h / 48, // Approximate hourly volume
                sell: volume24h / 48
              }
            });
          }
        }
      }
    }
  }
  
  // Sort by net profit percentage
  return opportunities.sort((a, b) => (b.netProfitPercentage || 0) - (a.netProfitPercentage || 0));
};

// Function to fetch futures arbitrage opportunities
const fetchFuturesArbitrageOpportunities = async (
  exchanges: string[],
  minSpread: number,
  minVolume: number
): Promise<ArbitrageData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const opportunities: ArbitrageData[] = [];
  
  // Common trading pairs with both spot and futures markets
  const pairs = [
    'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT',
    'ADA/USDT', 'DOGE/USDT', 'DOT/USDT', 'LINK/USDT', 'AVAX/USDT'
  ];
  
  // Exchanges that offer both spot and futures trading
  const futuresExchanges = ['binance', 'bybit', 'okx', 'gate_io', 'kucoin', 'htx', 'kraken']
    .filter(ex => exchanges.includes(ex));
  
  if (futuresExchanges.length === 0) return [];
  
  for (const exchange of futuresExchanges) {
    for (const pair of pairs) {
      // Get spot price - in production this would be an API call
      const spotPrice = getBasePrice(pair);
      
      // Generate futures price with premium or discount
      // Futures can trade at premium/discount based on market sentiment
      const futureBias = Math.random() > 0.3 ? 1 : -1; // More likely premium than discount
      const futuresPremium = (Math.random() * 2 + 0.1) / 100 * futureBias; // 0.1% to 2.1%
      const futuresPrice = spotPrice * (1 + futuresPremium);
      
      // Calculate the spread percentage
      const spreadPercentage = Math.abs((futuresPrice - spotPrice) / spotPrice * 100);
      
      if (spreadPercentage >= minSpread) {
        // Calculate volume - in a real app this would come from the exchange API
        const volume24h = Math.random() * 8000000 + 500000; // $500K to $8.5M
        
        if (volume24h >= minVolume) {
          // Calculate fees
          const spotFee = 0.1; // 0.1%
          const futuresFee = 0.05; // 0.05% (typically lower for futures)
          const totalFee = spotFee + futuresFee;
          const netProfitPercentage = spreadPercentage - totalFee;
          
          if (netProfitPercentage > 0) {
            // For $1000 trade
            const tradeAmount = 1000;
            const potentialProfit = tradeAmount * (spreadPercentage / 100);
            
            opportunities.push({
              id: `${pair.replace('/', '')}-${exchange}-futures`,
              pair: `${pair} (Spot/Futures)`,
              buyExchange: futuresPremium > 0 ? `${exchange} Spot` : `${exchange} Futures`,
              sellExchange: futuresPremium > 0 ? `${exchange} Futures` : `${exchange} Spot`,
              buyPrice: futuresPremium > 0 ? spotPrice : futuresPrice,
              sellPrice: futuresPremium > 0 ? futuresPrice : spotPrice,
              spreadPercentage,
              potentialProfit,
              timestamp: new Date(),
              volume24h,
              depositStatus: "OK", // Same exchange
              withdrawalStatus: "OK", // Same exchange
              type: 'futures',
              executionSpeed: '1-15 seconds',
              fees: {
                buyExchange: spotFee,
                sellExchange: futuresFee,
                network: 0, // No network transfer
                total: totalFee
              },
              netProfitPercentage,
              liquidityDepth: {
                buy: volume24h / 48, // Approximate hourly volume
                sell: volume24h / 48
              }
            });
          }
        }
      }
    }
  }
  
  // Sort by net profit percentage
  return opportunities.sort((a, b) => (b.netProfitPercentage || 0) - (a.netProfitPercentage || 0));
};

// Helper to get a realistic base price for each pair (will be replaced with API calls)
const getBasePrice = (pair: string) => {
  const baseMap: Record<string, number> = {
    'BTC/USDT': 68000 + Math.random() * 2000 - 1000,
    'ETH/USDT': 3300 + Math.random() * 200 - 100,
    'XRP/USDT': 0.52 + Math.random() * 0.05 - 0.025,
    'SOL/USDT': 160 + Math.random() * 10 - 5,
    'ADA/USDT': 0.45 + Math.random() * 0.05 - 0.025,
    'DOGE/USDT': 0.15 + Math.random() * 0.02 - 0.01,
    'SHIB/USDT': 0.00002 + Math.random() * 0.000005 - 0.0000025,
    'LINK/USDT': 15 + Math.random() * 2 - 1,
    'AVAX/USDT': 35 + Math.random() * 4 - 2,
    'DOT/USDT': 7 + Math.random() * 1 - 0.5,
    'MATIC/USDT': 0.8 + Math.random() * 0.1 - 0.05,
    'UNI/USDT': 10 + Math.random() * 1.5 - 0.75,
    'XLM/USDT': 0.11 + Math.random() * 0.02 - 0.01,
    'ATOM/USDT': 9 + Math.random() * 1 - 0.5,
    'LTC/USDT': 80 + Math.random() * 8 - 4,
    'BNB/USDT': 580 + Math.random() * 30 - 15,
    // Add cross-rates for triangular arbitrage
    'BTC/ETH': 21 + Math.random() * 2 - 1,
    'BTC/SOL': 420 + Math.random() * 40 - 20,
    'BTC/BNB': 118 + Math.random() * 10 - 5,
    'BTC/ADA': 150000 + Math.random() * 15000 - 7500,
    'BTC/XRP': 131000 + Math.random() * 13000 - 6500,
    'BTC/DOGE': 450000 + Math.random() * 45000 - 22500,
    'ETH/SOL': 20 + Math.random() * 2 - 1,
    'ETH/LINK': 220 + Math.random() * 20 - 10,
  };
  
  return baseMap[pair] || 100 + Math.random() * 100;
};

export const useArbitrageData = (
  type: 'direct' | 'triangular' | 'futures',
  exchanges: string[] = [],
  minSpread: number = 0.5,
  minVolume: number = 10000,
  autoRefresh: boolean = true
) => {
  const [data, setData] = useState<ArbitrageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchArbitrageData(type, exchanges, minSpread, minVolume);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: "Error",
        description: "Failed to fetch arbitrage opportunities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [type, exchanges, minSpread, minVolume]);

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData();
      }, 15000); // Refresh every 15 seconds for more real-time data
      
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    lastUpdated
  };
};

// Hook for triangular arbitrage paths
export const useTriangularPaths = (baseCurrency: string = 'BTC') => {
  const [paths, setPaths] = useState<string[]>([]);
  
  useEffect(() => {
    // Common triangular paths that might provide arbitrage opportunities
    const commonPaths = [
      `${baseCurrency}/ETH/USDT`,
      `${baseCurrency}/BNB/USDT`,
      `${baseCurrency}/SOL/USDT`,
      `${baseCurrency}/XRP/USDT`,
      `${baseCurrency}/ADA/USDT`,
      `${baseCurrency}/DOGE/USDT`,
      `${baseCurrency}/LINK/USDT`,
      `${baseCurrency}/DOT/USDT`,
      `${baseCurrency}/AVAX/USDT`,
      `${baseCurrency}/MATIC/USDT`,
    ];
    
    setPaths(commonPaths);
  }, [baseCurrency]);
  
  return paths;
};
