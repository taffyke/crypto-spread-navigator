export async function fetchArbitrageOpportunities(
  type: 'direct' | 'triangular' | 'futures',
  minSpread: number = 0.5,
  minVolume: number = 100000,
  signal?: AbortSignal
) {
  try {
    const endpoint = `https://api.example.com/arbitrage/${type}?minSpread=${minSpread}&minVolume=${minVolume}`;
    
    // Simulate real data response for development
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    // Generate appropriate mock data based on the requested type
    let mockData = [];
    
    if (type === 'direct') {
      mockData = [
        {
          id: '1',
          pair: 'BTC/USDT',
          buyExchange: 'Binance',
          sellExchange: 'Coinbase',
          buyPrice: 29000,
          sellPrice: 29500,
          spreadPercentage: 1.72,
          riskLevel: 'low',
          timestamp: new Date(),
          volume24h: 5000000,
          recommendedNetworks: ['BSC', 'ETH'],
          type: 'direct'
        },
        {
          id: '2',
          pair: 'ETH/USDT',
          buyExchange: 'Kraken',
          sellExchange: 'Coinbase',
          buyPrice: 1800,
          sellPrice: 1850,
          spreadPercentage: 2.78,
          riskLevel: 'medium',
          timestamp: new Date(),
          volume24h: 3000000,
          recommendedNetworks: ['ETH', 'Polygon'],
          type: 'direct'
        },
        {
          id: '3',
          pair: 'SOL/USDT',
          buyExchange: 'Kucoin',
          sellExchange: 'Binance',
          buyPrice: 22.50,
          sellPrice: 23.00,
          spreadPercentage: 2.22,
          riskLevel: 'low',
          timestamp: new Date(),
          volume24h: 1500000,
          recommendedNetworks: ['SOL'],
          type: 'direct'
        },
        {
          id: '4',
          pair: 'LTC/USDT',
          buyExchange: 'Binance',
          sellExchange: 'Kraken',
          buyPrice: 65.00,
          sellPrice: 66.50,
          spreadPercentage: 2.31,
          riskLevel: 'medium',
          timestamp: new Date(),
          volume24h: 750000,
          recommendedNetworks: ['LTC'],
          type: 'direct'
        },
        {
          id: '5',
          pair: 'XRP/USDT',
          buyExchange: 'Coinbase',
          sellExchange: 'Kucoin',
          buyPrice: 0.50,
          sellPrice: 0.51,
          spreadPercentage: 2.00,
          riskLevel: 'low',
          timestamp: new Date(),
          volume24h: 2000000,
          recommendedNetworks: ['XRP'],
          type: 'direct'
        },
        {
          id: '6',
          pair: 'BNB/USDT',
          buyExchange: 'Kraken',
          sellExchange: 'Binance',
          buyPrice: 210.00,
          sellPrice: 215.00,
          spreadPercentage: 2.38,
          riskLevel: 'medium',
          timestamp: new Date(),
          volume24h: 1000000,
          recommendedNetworks: ['BSC'],
          type: 'direct'
        },
        {
          id: '7',
          pair: 'ADA/USDT',
          buyExchange: 'Kucoin',
          sellExchange: 'Coinbase',
          buyPrice: 0.30,
          sellPrice: 0.31,
          spreadPercentage: 3.33,
          riskLevel: 'low',
          timestamp: new Date(),
          volume24h: 1200000,
          recommendedNetworks: ['ADA'],
          type: 'direct'
        },
        {
          id: '8',
          pair: 'DOGE/USDT',
          buyExchange: 'Binance',
          sellExchange: 'Kraken',
          buyPrice: 0.07,
          sellPrice: 0.072,
          spreadPercentage: 2.86,
          riskLevel: 'medium',
          timestamp: new Date(),
          volume24h: 1800000,
          recommendedNetworks: ['DOGE'],
          type: 'direct'
        },
        {
          id: '9',
          pair: 'TRX/USDT',
          buyExchange: 'Coinbase',
          sellExchange: 'Kucoin',
          buyPrice: 0.08,
          sellPrice: 0.082,
          spreadPercentage: 2.50,
          riskLevel: 'low',
          timestamp: new Date(),
          volume24h: 1600000,
          recommendedNetworks: ['TRX'],
          type: 'direct'
        },
        {
          id: '10',
          pair: 'DOT/USDT',
          buyExchange: 'Kraken',
          sellExchange: 'Binance',
          buyPrice: 5.20,
          sellPrice: 5.35,
          spreadPercentage: 2.88,
          riskLevel: 'medium',
          timestamp: new Date(),
          volume24h: 900000,
          recommendedNetworks: ['DOT'],
          type: 'direct'
        },
      ];
    } else if (type === 'triangular') {
      mockData = [
        {
          id: 't1',
          pair: 'BTC/ETH/USDT',
          exchange: 'Binance',
          buyExchange: 'Binance',
          sellExchange: 'Binance',
          buyPrice: 29000,
          sellPrice: 29500,
          spreadPercentage: 2.15,
          riskLevel: 'medium',
          timestamp: new Date(),
          volume24h: 4200000,
          recommendedNetworks: ['ETH'],
          type: 'triangular'
        },
        {
          id: 't2',
          pair: 'ETH/SOL/USDT',
          exchange: 'Coinbase',
          buyExchange: 'Coinbase',
          sellExchange: 'Coinbase',
          buyPrice: 1800,
          sellPrice: 1840,
          spreadPercentage: 1.89,
          riskLevel: 'low',
          timestamp: new Date(),
          volume24h: 3100000,
          recommendedNetworks: ['SOL', 'ETH'],
          type: 'triangular'
        },
        {
          id: 't3',
          pair: 'BNB/BTC/USDT',
          exchange: 'Binance',
          buyExchange: 'Binance',
          sellExchange: 'Binance',
          buyPrice: 215,
          sellPrice: 220,
          spreadPercentage: 2.33,
          riskLevel: 'medium',
          timestamp: new Date(),
          volume24h: 2800000,
          recommendedNetworks: ['BSC'],
          type: 'triangular'
        }
      ];
    } else if (type === 'futures') {
      mockData = [
        {
          id: 'f1',
          pair: 'BTC-PERP',
          exchange: 'FTX',
          buyExchange: 'FTX',
          sellExchange: 'Binance',
          buyPrice: 29100,
          sellPrice: 29700,
          spreadPercentage: 2.06,
          riskLevel: 'high',
          timestamp: new Date(),
          volume24h: 6500000,
          recommendedNetworks: ['ETH'],
          type: 'futures'
        },
        {
          id: 'f2',
          pair: 'ETH-PERP',
          exchange: 'Bybit',
          buyExchange: 'Bybit',
          sellExchange: 'FTX',
          buyPrice: 1795,
          sellPrice: 1835,
          spreadPercentage: 2.23,
          riskLevel: 'medium',
          timestamp: new Date(),
          volume24h: 4100000,
          recommendedNetworks: ['ETH'],
          type: 'futures'
        }
      ];
    }

    const filteredData = mockData.filter(item => item.spreadPercentage >= minSpread);

    return filteredData;
  } catch (error) {
    console.error('Error fetching arbitrage opportunities:', error);
    throw error;
  }
}

export async function fetchNetworkFeeData(signal?: AbortSignal) {
  try {
    // Simulate fetching network fee data from an API
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const mockData = [
      { token: 'BTC', network: 'Bitcoin', fee: 2.50, congestion: 'high' },
      { token: 'BTC', network: 'Lightning', fee: 0.05, congestion: 'low' },
      { token: 'ETH', network: 'Ethereum', fee: 1.20, congestion: 'medium' },
      { token: 'ETH', network: 'Polygon', fee: 0.01, congestion: 'low' },
      { token: 'USDT', network: 'Ethereum', fee: 1.50, congestion: 'medium' },
      { token: 'USDT', network: 'Tron', fee: 0.20, congestion: 'low' },
      { token: 'SOL', network: 'Solana', fee: 0.001, congestion: 'low' },
      { token: 'LTC', network: 'Litecoin', fee: 0.10, congestion: 'low' },
      { token: 'XRP', network: 'Ripple', fee: 0.02, congestion: 'low' },
      { token: 'BNB', network: 'BSC', fee: 0.30, congestion: 'low' },
    ];
    
    return mockData;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Network fee data fetch aborted');
      return [];
    }
    console.error('Error fetching network fee data:', error);
    throw error;
  }
}

export async function fetchCryptoMarketData(signal?: AbortSignal) {
  try {
    // Simulate fetching crypto market data from an API
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const mockData = [
      { symbol: 'BTC', price: 29500, change24h: 1.2 },
      { symbol: 'ETH', price: 1850, change24h: -0.5 },
      { symbol: 'SOL', price: 23.00, change24h: 2.5 },
      { symbol: 'LTC', price: 66.50, change24h: 0.8 },
      { symbol: 'XRP', price: 0.51, change24h: 1.5 },
      { symbol: 'BNB', price: 215.00, change24h: -1.0 },
      { symbol: 'ADA', price: 0.31, change24h: 0.3 },
      { symbol: 'DOGE', price: 0.072, change24h: 3.0 },
      { symbol: 'TRX', price: 0.082, change24h: 0.2 },
      { symbol: 'DOT', price: 5.35, change24h: -0.7 },
    ];
    
    return mockData;
  } catch (error) {
    console.error('Error fetching crypto market data:', error);
    throw error;
  }
}

export async function fetchExchangeVolumeData(signal?: AbortSignal) {
  try {
    // Simulate fetching exchange volume data from an API
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const mockData = [
      { exchange: 'Binance', volume24h: 1500000000 },
      { exchange: 'Coinbase', volume24h: 1200000000 },
      { exchange: 'Kraken', volume24h: 900000000 },
      { exchange: 'Kucoin', volume24h: 700000000 },
      { exchange: 'Gate.io', volume24h: 500000000 },
    ];
    
    return mockData;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Exchange volume data fetch aborted');
      return [];
    }
    console.error('Error fetching exchange volume data:', error);
    throw error;
  }
}

/**
 * Calculate profit data based on ticker information
 * This function generates simulated profit data for the chart display
 */
export function calculateProfitData(tickerData: any, days: number = 30): { date: string; profit: number; cumulativeProfit: number }[] {
  const result = [];
  const currentDate = new Date();
  let cumulativeProfit = 0;
  
  // Generate profit data for the specified number of days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    // Format the date as Month Day (e.g., "Jan 15")
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Generate a semi-random profit value influenced by ticker data if available
    let profitValue;
    if (tickerData && typeof tickerData === 'object' && 'changePercent' in tickerData) {
      // Use ticker change percent to influence profit, with some randomness
      const changePercent = Number(tickerData.changePercent) || 0;
      profitValue = (Math.random() * 100 + changePercent * 20) * (Math.random() > 0.3 ? 1 : -1);
    } else {
      // Fallback to completely random values if no ticker data
      profitValue = (Math.random() * 200 - 80) * (i === 0 ? 1.5 : 1); // Make the last day more dramatic
    }
    
    // Round to 2 decimal places
    profitValue = Math.round(profitValue * 100) / 100;
    
    // Update cumulative profit
    cumulativeProfit += profitValue;
    
    result.push({
      date: formattedDate,
      profit: profitValue,
      cumulativeProfit: Math.round(cumulativeProfit * 100) / 100
    });
  }
  
  return result;
}

/**
 * Fallback function to handle WebSocket errors and provide mockup data
 * This will ensure UI components don't break when WebSocket connections fail
 */
export function getFallbackTickerData(exchange: string, symbol: string = 'BTC/USDT'): any {
  // Create mock data based on the exchange and symbol
  const basePrice = {
    'BTC/USDT': 29500,
    'ETH/USDT': 1850,
    'SOL/USDT': 23.00,
    'LTC/USDT': 66.50,
    'XRP/USDT': 0.51,
    'BNB/USDT': 215.00, 
    'ADA/USDT': 0.31,
    'DOGE/USDT': 0.072
  }[symbol] || 100;
  
  // Vary the price slightly based on the exchange to create realistic arbitrage opportunities
  const exchangeMultipliers: {[key: string]: number} = {
    binance: 1.000,
    coinbase: 1.004,
    kraken: 0.997,
    kucoin: 1.002,
    gate_io: 0.995
  };
  
  const multiplier = exchangeMultipliers[exchange.toLowerCase()] || 1;
  
  // Random variance between -0.5% and +0.5%
  const randomVariance = 1 + (Math.random() * 0.01 - 0.005);
  
  return {
    symbol: symbol,
    price: basePrice * multiplier * randomVariance,
    bid: basePrice * multiplier * randomVariance * 0.999,
    ask: basePrice * multiplier * randomVariance * 1.001,
    volume: 1000000 + Math.random() * 5000000,
    timestamp: Date.now(),
    exchange: exchange,
    changePercent: (Math.random() * 6 - 3), // Between -3% and +3%
    change: basePrice * (Math.random() * 0.06 - 0.03),
    volume24h: 10000000 + Math.random() * 50000000
  };
}
