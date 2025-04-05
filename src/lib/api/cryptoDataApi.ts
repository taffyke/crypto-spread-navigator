
import { EXCHANGE_CONFIGS } from '@/lib/exchanges/exchangeApi';
import { apiCache } from '@/lib/exchanges/exchangeApi';
import { notificationManager } from '@/lib/notifications/notificationSystem';
import type { Ticker } from '@/lib/exchanges/exchangeApi';
import type { ProfitDataPoint } from '@/components/dashboard/ProfitChart';

// List of all supported exchanges
export const SUPPORTED_EXCHANGES = Object.keys(EXCHANGE_CONFIGS);

// Interface for standardized ticker data
export interface TickerData {
  symbol: string;
  price: number;
  bidPrice?: number;
  askPrice?: number;
  volume: number;
  timestamp: number;
  exchange?: string;
  high24h?: number;
  low24h?: number;
  change24h?: number;
  changePercent24h?: number;
}

// Function to calculate profit data for the chart based on ticker information
export const calculateProfitData = (ticker: Ticker | null, days: number = 30): ProfitDataPoint[] => {
  const profitData: ProfitDataPoint[] = [];
  const today = new Date();
  let cumulativeProfit = 0;
  
  // Generate historical data going back 'days' number of days
  for (let i = days - 1; i >= 0; i--) {
    const currentDate = new Date();
    currentDate.setDate(today.getDate() - i);
    
    // Format date as "MMM D" (e.g., "Jan 15")
    const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Calculate a somewhat realistic profit based on the day and ticker data if available
    // Use changePercent from ticker if available, otherwise generate synthetic data
    let dailyProfit;
    
    if (ticker && i === 0 && typeof ticker.changePercent === 'number') {
      // For today, use actual changePercent from ticker
      dailyProfit = ticker.changePercent * 10;
    } else {
      // Generate synthetic profit based on position in the month and some randomness
      const baseValue = Math.sin((i / days) * Math.PI) * 100; // Sinusoidal pattern for realism
      const randomFactor = 0.7 + Math.random() * 0.6; // 0.7-1.3 random factor
      
      dailyProfit = baseValue * randomFactor;
      
      // Add some trend based on actual ticker data if available
      if (ticker && typeof ticker.changePercent === 'number') {
        const trendInfluence = ticker.changePercent > 0 ? 1.2 : 0.8;
        dailyProfit *= trendInfluence;
      }
      
      // Round to reasonable values
      dailyProfit = Math.round(dailyProfit * 100) / 100;
    }
    
    // Add to cumulative profit
    cumulativeProfit += dailyProfit;
    
    profitData.push({
      date: formattedDate,
      profit: dailyProfit,
      cumulativeProfit: cumulativeProfit
    });
  }
  
  return profitData;
};

// Generate fallback ticker data for simulation or when API fails
export const getFallbackTickerData = (
  exchange: string,
  symbol: string
): TickerData => {
  // Base price that's somewhat consistent for the same symbol
  let basePrice = 0;
  if (symbol.includes('BTC')) basePrice = 68000;
  else if (symbol.includes('ETH')) basePrice = 3300;
  else if (symbol.includes('SOL')) basePrice = 160;
  else if (symbol.includes('XRP')) basePrice = 0.52;
  else if (symbol.includes('ADA')) basePrice = 0.45;
  else basePrice = 100;
  
  // Add some randomness and exchange-specific variation
  const exchangeFactor = exchange.charCodeAt(0) / 100;
  const randomFactor = 0.98 + (Math.random() * 0.04); // ±2% random variation
  const price = basePrice * randomFactor * (1 + (exchangeFactor - 1) * 0.01);
  
  // Add a small spread
  const spread = price * 0.001; // 0.1% spread
  
  return {
    symbol,
    price,
    bidPrice: price - spread / 2,
    askPrice: price + spread / 2,
    volume: 1000000 + Math.random() * 9000000, // 1M to 10M volume
    timestamp: Date.now(),
    exchange,
    high24h: price * 1.02,
    low24h: price * 0.98,
    change24h: price * (Math.random() * 0.04 - 0.02), // -2% to +2% change
    changePercent24h: (Math.random() * 4) - 2 // -2% to +2% change percent
  };
};

// Fetch ticker data from multiple exchanges
export const fetchMultiExchangeTickerData = async (
  symbol: string,
  exchanges: string[] = SUPPORTED_EXCHANGES
): Promise<Record<string, TickerData>> => {
  const results: Record<string, TickerData> = {};
  const cacheKey = `multi_ticker_${symbol}_${exchanges.join('-')}`;
  
  // Check cache first
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // Create promises for all exchange requests
  const promises = exchanges.map(async (exchange) => {
    try {
      const data = await fetchExchangeTickerData(exchange, symbol);
      results[exchange] = data;
    } catch (error) {
      console.error(`Error fetching ${symbol} data from ${exchange}:`, error);
      // Use fallback data on error
      results[exchange] = getFallbackTickerData(exchange, symbol);
    }
  });
  
  // Wait for all requests to complete
  await Promise.allSettled(promises);
  
  // Cache the results
  apiCache.set(cacheKey, results);
  
  return results;
};

// Fetch ticker data from a single exchange
export const fetchExchangeTickerData = async (
  exchange: string,
  symbol: string
): Promise<TickerData> => {
  const cacheKey = `ticker_${exchange}_${symbol}`;
  
  // Check cache first
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // In a real implementation, this would make API calls to exchange endpoints
  // For now, return simulated data
  // This is where exchange-specific API code would go
  
  try {
    // Simulate API call latency
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Get simulated data
    const data = getFallbackTickerData(exchange, symbol);
    
    // Cache the result
    apiCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ticker data for ${symbol} from ${exchange}:`, error);
    throw error;
  }
};

// Fetch arbitrage opportunities
export const fetchArbitrageOpportunities = async (
  arbitrageType: 'direct' | 'triangular' | 'futures',
  minSpread: number = 0.5,
  minVolume: number = 100000,
  signal?: AbortSignal
): Promise<any[]> => {
  // Cache key based on parameters
  const cacheKey = `arbitrage_${arbitrageType}_${minSpread}_${minVolume}`;
  
  // Check cache first (short TTL for arbitrage opportunities)
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // For direct arbitrage, fetch multi-exchange data for common pairs
    if (arbitrageType === 'direct') {
      const commonPairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT'];
      const opportunities: any[] = [];
      
      // Create abort controller for timeouts
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 second timeout
      
      try {
        // Combine the signal from the caller with our timeout
        const combinedSignal = signal 
          ? { signal: new AbortController().signal } // This doesn't actually combine them, but it's a placeholder
          : { signal: controller.signal };
        
        // Fetch data for each pair
        for (const pair of commonPairs) {
          // Check if aborted
          if (signal?.aborted || controller.signal.aborted) {
            break;
          }
          
          const tickerData = await fetchMultiExchangeTickerData(pair, SUPPORTED_EXCHANGES);
          
          // Find arbitrage opportunities between exchanges
          const exchanges = Object.keys(tickerData);
          
          for (let i = 0; i < exchanges.length; i++) {
            for (let j = i + 1; j < exchanges.length; j++) {
              const buyExchange = exchanges[i];
              const sellExchange = exchanges[j];
              
              const buyPrice = tickerData[buyExchange].price;
              const sellPrice = tickerData[sellExchange].price;
              
              // Calculate spread from buy to sell
              const spread1 = ((sellPrice - buyPrice) / buyPrice) * 100;
              
              // Calculate spread from sell to buy (reverse direction)
              const spread2 = ((buyPrice - sellPrice) / sellPrice) * 100;
              
              // Find the better direction
              if (spread1 > minSpread) {
                const volume = Math.min(
                  tickerData[buyExchange].volume, 
                  tickerData[sellExchange].volume
                );
                
                if (volume >= minVolume) {
                  opportunities.push({
                    id: `${buyExchange}-${sellExchange}-${pair}-${Date.now()}`,
                    pair,
                    buyExchange,
                    sellExchange,
                    buyPrice,
                    sellPrice,
                    spreadPercentage: spread1,
                    timestamp: new Date(),
                    volume24h: volume,
                    riskLevel: spread1 > 2 ? 'low' : spread1 > 1 ? 'medium' : 'high',
                    recommendedNetworks: ['ETH', 'BSC'],
                    type: 'direct'
                  });
                }
              } else if (spread2 > minSpread) {
                const volume = Math.min(
                  tickerData[buyExchange].volume, 
                  tickerData[sellExchange].volume
                );
                
                if (volume >= minVolume) {
                  opportunities.push({
                    id: `${sellExchange}-${buyExchange}-${pair}-${Date.now()}`,
                    pair,
                    buyExchange: sellExchange,
                    sellExchange: buyExchange,
                    buyPrice: sellPrice,
                    sellPrice: buyPrice,
                    spreadPercentage: spread2,
                    timestamp: new Date(),
                    volume24h: volume,
                    riskLevel: spread2 > 2 ? 'low' : spread2 > 1 ? 'medium' : 'high',
                    recommendedNetworks: ['ETH', 'BSC'],
                    type: 'direct'
                  });
                }
              }
            }
          }
        }
      } finally {
        clearTimeout(timeout);
      }
      
      // Sort by spread percentage (highest first)
      opportunities.sort((a, b) => b.spreadPercentage - a.spreadPercentage);
      
      // Cache the result (short TTL)
      apiCache.set(cacheKey, opportunities);
      
      return opportunities;
    } else {
      // For triangular and futures arbitrage, return simulated data for now
      // In a real implementation, this would fetch real data and compute arbitrage
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      // Simulated data
      const opportunities = generateSimulatedArbitrageOpportunities(
        arbitrageType,
        20, // Generate 20 opportunities
        minSpread,
        minVolume
      );
      
      // Cache the result (short TTL)
      apiCache.set(cacheKey, opportunities);
      
      return opportunities;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Arbitrage opportunity fetch aborted');
      throw new Error('Fetch aborted');
    }
    
    console.error(`Error fetching ${arbitrageType} arbitrage opportunities:`, error);
    throw error;
  }
};

// Generate simulated arbitrage opportunities
function generateSimulatedArbitrageOpportunities(
  type: 'direct' | 'triangular' | 'futures',
  count: number,
  minSpread: number,
  minVolume: number
): any[] {
  const opportunities = [];
  const exchanges = SUPPORTED_EXCHANGES;
  
  for (let i = 0; i < count; i++) {
    const spreadPercentage = minSpread + Math.random() * 3; // minSpread to minSpread+3%
    
    if (type === 'direct') {
      // Direct arbitrage between two exchanges
      const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT'];
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      
      // Select random exchanges
      const buyExchangeIndex = Math.floor(Math.random() * exchanges.length);
      let sellExchangeIndex;
      do {
        sellExchangeIndex = Math.floor(Math.random() * exchanges.length);
      } while (sellExchangeIndex === buyExchangeIndex);
      
      const buyExchange = exchanges[buyExchangeIndex];
      const sellExchange = exchanges[sellExchangeIndex];
      
      // Generate prices
      const basePrice = getFallbackTickerData(buyExchange, pair).price;
      const buyPrice = basePrice;
      const sellPrice = basePrice * (1 + spreadPercentage / 100);
      
      opportunities.push({
        id: `${buyExchange}-${sellExchange}-${pair}-${Date.now()}`,
        pair,
        buyExchange,
        sellExchange,
        buyPrice,
        sellPrice,
        spreadPercentage,
        timestamp: new Date(),
        volume24h: minVolume + Math.random() * minVolume * 10,
        riskLevel: spreadPercentage > 2 ? 'low' : spreadPercentage > 1 ? 'medium' : 'high',
        recommendedNetworks: ['ETH', 'BSC'],
        type: 'direct'
      });
    } else if (type === 'triangular') {
      // Triangular arbitrage within a single exchange
      const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];
      const combinations = [
        { assets: 'BTC/ETH/USDT', steps: 3 },
        { assets: 'ETH/SOL/USDT', steps: 3 },
        { assets: 'BNB/BTC/USDT', steps: 3 }
      ];
      const combo = combinations[Math.floor(Math.random() * combinations.length)];
      
      // Generate a price
      const basePrice = 1000 / (i + 1);
      
      opportunities.push({
        id: `tri-${exchange}-${combo.assets}-${Date.now()}`,
        pair: combo.assets,
        exchange,
        buyExchange: exchange,
        sellExchange: exchange,
        buyPrice: basePrice,
        sellPrice: basePrice * (1 + spreadPercentage/100),
        spreadPercentage,
        timestamp: new Date(),
        volume24h: minVolume + Math.random() * minVolume * 5,
        riskLevel: spreadPercentage > 2 ? 'low' : spreadPercentage > 1 ? 'medium' : 'high',
        recommendedNetworks: ['ETH', 'BSC'],
        type: 'triangular',
        steps: combo.steps
      });
    } else if (type === 'futures') {
      // Futures arbitrage between spot and futures
      const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const futuresPair = `${pair.split('/')[0]}-PERP`;
      
      // Select random exchanges
      const spotExchangeIndex = Math.floor(Math.random() * exchanges.length);
      let futuresExchangeIndex;
      do {
        futuresExchangeIndex = Math.floor(Math.random() * exchanges.length);
      } while (futuresExchangeIndex === spotExchangeIndex);
      
      const spotExchange = exchanges[spotExchangeIndex];
      const futuresExchange = exchanges[futuresExchangeIndex];
      
      // Generate prices
      const basePrice = getFallbackTickerData(spotExchange, pair).price;
      const spotPrice = basePrice;
      const futuresPrice = basePrice * (1 + spreadPercentage / 100);
      
      opportunities.push({
        id: `fut-${spotExchange}-${futuresExchange}-${pair}-${Date.now()}`,
        pair: futuresPair,
        spotPair: pair,
        spotExchange,
        futuresExchange,
        buyExchange: spotExchange,
        sellExchange: futuresExchange,
        buyPrice: spotPrice,
        sellPrice: futuresPrice,
        spreadPercentage,
        timestamp: new Date(),
        volume24h: minVolume + Math.random() * minVolume * 8,
        riskLevel: 'high', // Futures always higher risk
        recommendedNetworks: ['ETH'],
        type: 'futures'
      });
    }
  }
  
  return opportunities.sort((a, b) => b.spreadPercentage - a.spreadPercentage);
}

// Interface for CryptoMarketData
export interface CryptoMarketData {
  symbol: string;
  price: number;
  change24h: number;
  logoUrl?: string;
}

// Fetch crypto market data
export const fetchCryptoMarketData = async (signal?: AbortSignal): Promise<CryptoMarketData[]> => {
  const cacheKey = 'crypto_market_data';
  
  // Check cache first
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // In a real implementation, this would make API calls
    // For now, simulate API call with some delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    // Define the coins we want to include
    const coinPairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT', 'ADA/USDT', 'DOGE/USDT', 'DOT/USDT'];
    
    // Generate simulated market data for each coin
    const marketData: CryptoMarketData[] = [];
    
    for (const pair of coinPairs) {
      const [symbol] = pair.split('/');
      const fallbackData = getFallbackTickerData('binance', pair);
      
      marketData.push({
        symbol,
        price: fallbackData.price,
        change24h: fallbackData.changePercent24h || 0,
        logoUrl: `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`
      });
    }
    
    // Cache the result
    apiCache.set(cacheKey, marketData, 60); // Cache for 60 seconds
    
    return marketData;
  } catch (error) {
    console.error('Error fetching crypto market data:', error);
    throw error;
  }
};

// Interface for ExchangeVolumeData
export interface ExchangeVolumeData {
  exchange: string;
  volume: number;
  timestamp: string;
  timeframe: 'day' | 'week' | 'month';
}

// Fetch exchange volume data
export const fetchExchangeVolumeData = async (
  exchanges: string[] = SUPPORTED_EXCHANGES,
  timeframe: 'day' | 'week' | 'month' = 'day',
  signal?: AbortSignal
): Promise<ExchangeVolumeData[]> => {
  const cacheKey = `exchange_volume_${timeframe}_${exchanges.join('-')}`;
  
  // Check cache first
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // In a real implementation, this would make API calls
    // For now, simulate API call with some delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 400));
    
    // Generate simulated volume data for each exchange
    const volumeData: ExchangeVolumeData[] = exchanges.map(exchange => {
      // Base volume depends on exchange "popularity"
      let baseVolume = 0;
      if (exchange.includes('binance')) baseVolume = 8000000000;
      else if (exchange.includes('coinbase')) baseVolume = 4000000000;
      else if (exchange.includes('kraken')) baseVolume = 2000000000;
      else baseVolume = 1000000000 + Math.random() * 1500000000;
      
      // Add some randomness
      const volume = baseVolume * (0.9 + Math.random() * 0.2);
      
      // Generate timestamp for today
      const timestamp = new Date().toISOString();
      
      return {
        exchange,
        volume,
        timestamp,
        timeframe
      };
    });
    
    // Sort by volume (highest first)
    volumeData.sort((a, b) => b.volume - a.volume);
    
    // Cache the result
    apiCache.set(cacheKey, volumeData, 300); // Cache for 5 minutes
    
    return volumeData;
  } catch (error) {
    console.error(`Error fetching exchange volume data:`, error);
    throw error;
  }
};

// Interface for NetworkFeeData
export interface NetworkFeeData {
  network: string;
  currentFee: number;
  changePercent: number;
  recommendedFee: number;
  fastFee: number;
  timestamp: string;
}

// Fetch network fee data
export const fetchNetworkFeeData = async (
  networks: string[] = ['ETH', 'BSC', 'SOL', 'TRX', 'ARBITRUM', 'OPTIMISM'],
  signal?: AbortSignal
): Promise<NetworkFeeData[]> => {
  const cacheKey = `network_fees_${networks.join('-')}`;
  
  // Check cache first
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // In a real implementation, this would make API calls
    // For now, simulate API call with some delay
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 300));
    
    // Generate simulated fee data for each network
    const feeData: NetworkFeeData[] = networks.map(network => {
      // Base fee depends on network
      let baseFee = 0;
      if (network === 'ETH') baseFee = 2.5;
      else if (network === 'BSC') baseFee = 0.25;
      else if (network === 'SOL') baseFee = 0.00025;
      else if (network === 'ARBITRUM') baseFee = 0.45;
      else if (network === 'OPTIMISM') baseFee = 0.35;
      else if (network === 'POLYGON') baseFee = 0.05;
      else if (network === 'AVALANCHE') baseFee = 0.15;
      else baseFee = 0.1;
      
      // Add some randomness
      const currentFee = baseFee * (0.8 + Math.random() * 0.4);
      
      // Generate change percentages
      const changePercent = (Math.random() * 20) - 10; // -10% to +10%
      
      return {
        network,
        currentFee,
        changePercent,
        recommendedFee: currentFee * 1.2,
        fastFee: currentFee * 1.5,
        timestamp: new Date().toISOString()
      };
    });
    
    // Sort by fee (highest first)
    feeData.sort((a, b) => b.currentFee - a.currentFee);
    
    // Cache the result
    apiCache.set(cacheKey, feeData, 120); // Cache for 2 minutes
    
    return feeData;
  } catch (error) {
    console.error(`Error fetching network fee data:`, error);
    throw error;
  }
};
