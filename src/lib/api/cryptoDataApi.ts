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
      
      // Instead of using fallback data, attempt to retry once
      try {
        console.log(`Retrying ${exchange} ticker data fetch for ${symbol}...`);
        const data = await fetchExchangeTickerData(exchange, symbol, true);
        results[exchange] = data;
      } catch (retryError) {
        console.error(`Retry failed for ${exchange}:`, retryError);
        // We don't add this exchange to results if we can't get real data
        notificationManager.notify(
          'Exchange Data Error',
          `Could not fetch ${symbol} data from ${exchange}`,
          'trading',
          'medium',
          'trading'
        );
      }
    }
  });
  
  // Wait for all requests to complete
  await Promise.allSettled(promises);
  
  if (Object.keys(results).length === 0) {
    throw new Error(`Failed to fetch ticker data for ${symbol} from any exchange`);
  }
  
  // Cache the results
  apiCache.set(cacheKey, results);
  
  return results;
};

// Fetch ticker data from a single exchange
export const fetchExchangeTickerData = async (
  exchange: string,
  symbol: string,
  isRetry: boolean = false
): Promise<TickerData> => {
  const cacheKey = `ticker_${exchange}_${symbol}`;
  
  // Check cache first
  const cachedData = apiCache.get(cacheKey);
  if (cachedData && !isRetry) {
    return cachedData;
  }
  
  // This is where exchange-specific API calls would go in a real production app
  // For this demo, we'll implement a better approach that uses actual exchange APIs
  // where possible and degrades gracefully
  
  try {
    // Get the exchange config
    const exchangeConfig = EXCHANGE_CONFIGS[exchange];
    if (!exchangeConfig) {
      throw new Error(`Exchange ${exchange} not supported`);
    }
    
    // Replace with actual API integration - examples for some major exchanges:
    let tickerData: TickerData;
    
    if (exchange === 'binance') {
      // For Binance, use public API
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.replace('/', '')}`);
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      tickerData = {
        symbol,
        price: parseFloat(data.lastPrice),
        bidPrice: parseFloat(data.bidPrice),
        askPrice: parseFloat(data.askPrice),
        volume: parseFloat(data.volume),
        timestamp: data.closeTime,
        exchange,
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        change24h: parseFloat(data.priceChange),
        changePercent24h: parseFloat(data.priceChangePercent)
      };
    }
    else if (exchange === 'coinbase') {
      // For Coinbase, use public API
      const formattedSymbol = symbol.replace('/', '-');
      const response = await fetch(`https://api.exchange.coinbase.com/products/${formattedSymbol}/ticker`);
      
      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Also get 24h stats
      const statsResponse = await fetch(`https://api.exchange.coinbase.com/products/${formattedSymbol}/stats`);
      const stats = await statsResponse.json();
      
      tickerData = {
        symbol,
        price: parseFloat(data.price),
        bidPrice: parseFloat(data.bid),
        askPrice: parseFloat(data.ask),
        volume: parseFloat(stats.volume),
        timestamp: new Date(data.time).getTime(),
        exchange,
        high24h: parseFloat(stats.high),
        low24h: parseFloat(stats.low),
        change24h: parseFloat(stats.last) - parseFloat(stats.open),
        changePercent24h: ((parseFloat(stats.last) - parseFloat(stats.open)) / parseFloat(stats.open)) * 100
      };
    }
    else if (exchange === 'kraken') {
      // For Kraken, use public API
      const formattedSymbol = symbol.replace('/', '');
      const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${formattedSymbol}`);
      
      if (!response.ok) {
        throw new Error(`Kraken API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error && data.error.length > 0) {
        throw new Error(`Kraken API error: ${data.error[0]}`);
      }
      
      const tickerInfo = data.result[Object.keys(data.result)[0]];
      
      tickerData = {
        symbol,
        price: parseFloat(tickerInfo.c[0]),
        bidPrice: parseFloat(tickerInfo.b[0]),
        askPrice: parseFloat(tickerInfo.a[0]),
        volume: parseFloat(tickerInfo.v[1]),
        timestamp: Date.now(),
        exchange,
        high24h: parseFloat(tickerInfo.h[1]),
        low24h: parseFloat(tickerInfo.l[1]),
        // Kraken doesn't provide these directly
        change24h: 0,
        changePercent24h: 0
      };
    }
    else {
      // For other exchanges, use a proxy or aggregator service 
      // that provides a unified interface across multiple exchanges
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.split('/')[0].toLowerCase()}&vs_currencies=${symbol.split('/')[1].toLowerCase()}&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const baseCurrency = symbol.split('/')[0].toLowerCase();
      const quoteCurrency = symbol.split('/')[1].toLowerCase();
      
      if (!data[baseCurrency]) {
        throw new Error(`No data available for ${symbol}`);
      }
      
      tickerData = {
        symbol,
        price: data[baseCurrency][quoteCurrency] || 0,
        volume: data[baseCurrency][`${quoteCurrency}_24h_vol`] || 0,
        timestamp: data[baseCurrency].last_updated_at * 1000 || Date.now(),
        exchange,
        changePercent24h: data[baseCurrency][`${quoteCurrency}_24h_change`] || 0
      };
    }
    
    // Cache the result
    apiCache.set(cacheKey, tickerData);
    
    return tickerData;
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
    // For direct arbitrage, fetch real multi-exchange data
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
        
        // Fetch real data for each pair
        for (const pair of commonPairs) {
          // Check if aborted
          if (signal?.aborted || controller.signal.aborted) {
            break;
          }
          
          // Get real ticker data from all exchanges
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
                  tickerData[buyExchange].volume || 0, 
                  tickerData[sellExchange].volume || 0
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
                  tickerData[buyExchange].volume || 0, 
                  tickerData[sellExchange].volume || 0
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
    } else if (arbitrageType === 'triangular') {
      // For triangular arbitrage, we need to implement a real price calculation
      // This requires fetching prices for multiple trading pairs and calculating triangular paths
      // This is complex and would require significant API calls - we'd implement real data fetching here

      notificationManager.notify(
        'Triangular Arbitrage',
        'Triangular arbitrage calculation requires special API access. Implementing real calculation would require additional setup.',
        'trading',
        'medium',
        'trading'
      );

      // Return empty for now
      return [];
    } else if (arbitrageType === 'futures') {
      // For futures arbitrage, we need to fetch both spot and futures prices
      // This would require special API access for futures markets
      
      notificationManager.notify(
        'Futures Arbitrage',
        'Futures arbitrage calculation requires futures market API access. Implementing real calculation would require additional setup.',
        'trading',
        'medium',
        'trading'
      );
      
      // Return empty for now
      return [];
    }
    
    return [];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Arbitrage opportunity fetch aborted');
      throw new Error('Fetch aborted');
    }
    
    console.error(`Error fetching ${arbitrageType} arbitrage opportunities:`, error);
    throw error;
  }
};

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
    // Define the coins we want to include
    const coinPairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT', 'ADA/USDT', 'DOGE/USDT', 'DOT/USDT'];
    
    // Use CoinGecko API to get market data for multiple coins in one request
    const coinIds = coinPairs.map(pair => pair.split('/')[0].toLowerCase()).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
      { signal }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Generate market data for each coin
    const marketData: CryptoMarketData[] = [];
    
    for (const coin of data) {
      marketData.push({
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h || 0,
        logoUrl: coin.image
      });
    }
    
    // Cache the result for 60 seconds
    apiCache.set(cacheKey, marketData);
    
    return marketData;
  } catch (error) {
    console.error('Error fetching crypto market data:', error);
    
    // As a fallback, try to get data from our exchange APIs
    try {
      const coinPairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT', 'ADA/USDT', 'DOGE/USDT', 'DOT/USDT'];
      const marketData: CryptoMarketData[] = [];
      
      for (const pair of coinPairs) {
        const [symbol] = pair.split('/');
        try {
          // Try to get data from a reliable exchange like Binance
          const tickerData = await fetchExchangeTickerData('binance', pair);
          
          marketData.push({
            symbol,
            price: tickerData.price,
            change24h: tickerData.changePercent24h || 0,
            logoUrl: `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`
          });
        } catch (exchangeError) {
          console.error(`Failed to fetch data for ${symbol} from exchange API:`, exchangeError);
        }
      }
      
      // If we got at least some data, cache and return it
      if (marketData.length > 0) {
        apiCache.set(cacheKey, marketData);
        return marketData;
      }
    } catch (fallbackError) {
      console.error('Fallback fetch also failed:', fallbackError);
    }
    
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
    // Use CoinGecko API to get exchange volume data
    const response = await fetch(
      `https://api.coingecko.com/api/v3/exchanges`,
      { signal }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter for our supported exchanges and map to our format
    const volumeData: ExchangeVolumeData[] = [];
    
    // Map our exchange IDs to CoinGecko IDs - this would be more complete in real code
    const exchangeMap: Record<string, string> = {
      'binance': 'binance',
      'bitget': 'bitget',
      'bybit': 'bybit_spot',
      'kucoin': 'kucoin',
      'gate_io': 'gate',
      'bitfinex': 'bitfinex',
      'gemini': 'gemini',
      'coinbase': 'gdax',
      'kraken': 'kraken',
      'poloniex': 'poloniex',
      'okx': 'okex',
      'htx': 'huobi',
      'mexc_global': 'mxc',
    };
    
    for (const exchange of exchanges) {
      const coinGeckoId = exchangeMap[exchange];
      if (coinGeckoId) {
        const exchangeInfo = data.find((e: any) => e.id === coinGeckoId);
        if (exchangeInfo) {
          volumeData.push({
            exchange,
            volume: exchangeInfo.trade_volume_24h_btc || 0,
            timestamp: new Date().toISOString(),
            timeframe
          });
        }
      }
    }
    
    // Sort by volume (highest first)
    volumeData.sort((a, b) => b.volume - a.volume);
    
    // Cache the result for 5 minutes
    apiCache.set(cacheKey, volumeData);
    
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
    // Parallel fetch fee data for each network
    const feeData: NetworkFeeData[] = [];
    
    await Promise.all(networks.map(async (network) => {
      try {
        let networkFee;
        
        // Fetch real fee data based on network
        if (network === 'ETH') {
          // Ethereum gas prices from EtherScan API
          const response = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
          const data = await response.json();
          
          if (data.status === '1') {
            const currentGwei = parseFloat(data.result.ProposeGasPrice);
            const fastGwei = parseFloat(data.result.FastGasPrice);
            
            networkFee = {
              network,
              currentFee: currentGwei / 10, // Convert to meaningful USD value
              recommendedFee: currentGwei / 10 * 1.1,
              fastFee: fastGwei / 10,
              changePercent: 0, // Not provided by this API
              timestamp: new Date().toISOString()
            };
          }
        }
        else if (network === 'BSC') {
          // BSC gas tracker
          const response = await fetch('https://bscscan.com/api?module=gastracker&action=gasoracle');
          const data = await response.json();
          
          if (data.status === '1') {
            const currentGwei = parseFloat(data.result.ProposeGasPrice);
            
            networkFee = {
              network,
              currentFee: currentGwei / 1000, // BSC fees are much lower
              recommendedFee: currentGwei / 1000 * 1.1,
              fastFee: currentGwei / 1000 * 1.5,
              changePercent: 0,
              timestamp: new Date().toISOString()
            };
          }
        }
        else if (network === 'SOL') {
          // Solana's cost per signature is fixed
          networkFee = {
            network,
            currentFee: 0.000005,
            recommendedFee: 0.000005,
            fastFee: 0.000005,
            changePercent: 0,
            timestamp: new Date().toISOString()
          };
        }
        else if (network === 'ARBITRUM' || network === 'OPTIMISM') {
          // Use L2 fees API
          const l2Network = network.toLowerCase();
          const response = await fetch(`https://l2fees.info/api/v0/fees/${l2Network}`);
          const data = await response.json();
          
          networkFee = {
            network,
            currentFee: data.standard || 0.5,
            recommendedFee: data.standard * 1.1 || 0.55,
            fastFee: data.instant || 0.6,
            changePercent: 0,
            timestamp: new Date().toISOString()
          };
        }
        else {
          // For other networks use a reasonable default based on typical values
          // In production, each would have its own API endpoint
          networkFee = {
            network,
            currentFee: 0.1,
            recommendedFee: 0.11,
            fastFee: 0.15,
            changePercent: 0,
            timestamp: new Date().toISOString()
          };
        }
        
        if (networkFee) {
          feeData.push(networkFee);
        }
      } catch (networkError) {
        console.error(`Failed to fetch fee data for ${network}:`, networkError);
      }
    }));
    
    // Sort by fee (highest first)
    feeData.sort((a, b) => b.currentFee - a.currentFee);
    
    // Cache the result for 2 minutes
    apiCache.set(cacheKey, feeData);
    
    return feeData;
  } catch (error) {
    console.error(`Error fetching network fee data:`, error);
    throw error;
  }
};
