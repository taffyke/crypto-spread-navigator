// Mock data for development and testing

// Exchanges
export const exchanges = [
  { id: 'binance', name: 'Binance' },
  { id: 'binance_us', name: 'Binance US' },
  { id: 'coinbase', name: 'Coinbase' },
  { id: 'mexc_global', name: 'MEXC Global' },
  { id: 'gate_io', name: 'Gate.io' },
  { id: 'kucoin', name: 'KuCoin' },
  { id: 'bitfinex', name: 'Bitfinex' },
  { id: 'bitrue', name: 'Bitrue' },
  { id: 'biget', name: 'Biget' },
  { id: 'hitbtc', name: 'HitBTC' },
  { id: 'kraken', name: 'Kraken' },
  { id: 'bybit', name: 'Bybit' },
  { id: 'htx', name: 'HTX' },
  { id: 'gemini', name: 'Gemini' },
  { id: 'ascendex', name: 'AscendEX' },
  { id: 'poloniex', name: 'Poloniex' },
  { id: 'delta_exchange', name: 'Delta Exchange' },
  { id: 'lbank', name: 'LBank' },
  { id: 'deribit', name: 'Deribit' },
  { id: 'upbit', name: 'Upbit' },
  { id: 'bitmex', name: 'BitMEX' },
  { id: 'digifinex', name: 'DigiFinex' },
  { id: 'crypto_com', name: 'Crypto.com' },
  { id: 'bithumb', name: 'Bithumb' },
  { id: 'bitstamp', name: 'Bitstamp' },
  { id: 'okx', name: 'OKX' },
  { id: 'phemex', name: 'Phemex' },
  { id: 'coinex', name: 'CoinEx' },
  { id: 'whitebit', name: 'WhiteBit' },
  { id: 'bitmart', name: 'BitMart' },
  { id: 'bigone', name: 'BigONE' },
  { id: 'bitbay', name: 'BitBay' }
];

// Mock cryptocurrency pairs
const pairs = [
  'BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT',
  'DOGE/USDT', 'SHIB/USDT', 'LINK/USDT', 'AVAX/USDT', 'DOT/USDT',
  'MATIC/USDT', 'UNI/USDT', 'XLM/USDT', 'ATOM/USDT', 'LTC/USDT',
  'BCH/USDT', 'ALGO/USDT', 'XMR/USDT', 'ETC/USDT', 'FIL/USDT',
  'VET/USDT', 'ICP/USDT', 'SAND/USDT', 'MANA/USDT', 'AXS/USDT',
  'EGLD/USDT', 'THETA/USDT', 'EOS/USDT', 'AAVE/USDT', 'MKR/USDT'
];

// Generate random arbitrage opportunities
export const generateArbitrageOpportunities = (count: number) => {
  const opportunities = [];
  
  for (let i = 0; i < count; i++) {
    const pairIndex = Math.floor(Math.random() * pairs.length);
    const pair = pairs[pairIndex];
    
    // Select different exchanges for buy and sell
    let buyExchangeIndex = Math.floor(Math.random() * exchanges.length);
    let sellExchangeIndex;
    do {
      sellExchangeIndex = Math.floor(Math.random() * exchanges.length);
    } while (sellExchangeIndex === buyExchangeIndex);
    
    const basePrice = getBasePrice(pair);
    const spreadPercentage = Math.random() * 5 + 0.1; // 0.1% to 5.1%
    
    const buyPrice = basePrice;
    const sellPrice = buyPrice * (1 + spreadPercentage / 100);
    
    // Calculate a realistic potential profit
    const tradeAmount = 1000; // Assuming $1000 trade
    const potentialProfit = tradeAmount * (spreadPercentage / 100);
    
    // Random volume
    const volume24h = Math.random() * 10000000 + 100000; // $100K to $10M
    
    // Random timestamp within the last day
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - Math.random() * 24);
    
    opportunities.push({
      id: `arb-${i}`,
      pair,
      buyExchange: exchanges[buyExchangeIndex].name,
      sellExchange: exchanges[sellExchangeIndex].name,
      buyPrice,
      sellPrice,
      spreadPercentage,
      potentialProfit,
      timestamp,
      volume24h,
      depositStatus: Math.random() > 0.3 ? "OK" : "Slow",
      withdrawalStatus: Math.random() > 0.3 ? "OK" : "Delayed",
    });
  }
  
  // Sort by spread percentage in descending order
  return opportunities.sort((a, b) => b.spreadPercentage - a.spreadPercentage);
};

// Helper to get a realistic base price for each pair
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
    'BCH/USDT': 370 + Math.random() * 30 - 15,
    'ALGO/USDT': 0.16 + Math.random() * 0.02 - 0.01,
    'XMR/USDT': 171 + Math.random() * 15 - 7.5,
    'ETC/USDT': 25 + Math.random() * 3 - 1.5,
    'FIL/USDT': 4.9 + Math.random() * 0.5 - 0.25,
    'VET/USDT': 0.027 + Math.random() * 0.003 - 0.0015,
    'ICP/USDT': 13 + Math.random() * 1.5 - 0.75,
    'SAND/USDT': 0.5 + Math.random() * 0.05 - 0.025,
    'MANA/USDT': 0.45 + Math.random() * 0.04 - 0.02,
    'AXS/USDT': 7.5 + Math.random() * 0.8 - 0.4,
    'EGLD/USDT': 37 + Math.random() * 4 - 2,
    'THETA/USDT': 1.4 + Math.random() * 0.2 - 0.1,
    'EOS/USDT': 0.72 + Math.random() * 0.08 - 0.04,
    'AAVE/USDT': 88 + Math.random() * 10 - 5,
    'MKR/USDT': 1350 + Math.random() * 150 - 75,
  };
  
  return baseMap[pair] || 100 + Math.random() * 100;
};

// Generate profit chart data
export const generateProfitChartData = (days: number = 30) => {
  const data = [];
  let cumulativeProfit = 0;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    // Random daily profit between -50 and 300
    const profit = Math.random() * 350 - 50;
    cumulativeProfit += profit;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit,
      cumulativeProfit: Math.max(0, cumulativeProfit), // Ensure we don't go below 0
    });
  }
  
  return data;
};

// Generate crypto market data
export const generateMarketData = (count: number) => {
  const cryptoNames = [
    { name: 'Bitcoin', symbol: 'BTC' },
    { name: 'Ethereum', symbol: 'ETH' },
    { name: 'Tether', symbol: 'USDT' },
    { name: 'BNB', symbol: 'BNB' },
    { name: 'XRP', symbol: 'XRP' },
    { name: 'Solana', symbol: 'SOL' },
    { name: 'USD Coin', symbol: 'USDC' },
    { name: 'Cardano', symbol: 'ADA' },
    { name: 'Dogecoin', symbol: 'DOGE' },
    { name: 'Polygon', symbol: 'MATIC' },
    { name: 'Polkadot', symbol: 'DOT' },
    { name: 'Litecoin', symbol: 'LTC' },
    { name: 'Chainlink', symbol: 'LINK' },
    { name: 'Avalanche', symbol: 'AVAX' }
  ];

  const marketCaps = [
    1200000000000, 500000000000, 100000000000, 80000000000, 50000000000,
    40000000000, 30000000000, 25000000000, 20000000000, 15000000000,
    12000000000, 10000000000, 8000000000, 6000000000
  ];

  const prices = [
    62000, 3200, 1, 450, 0.6, 150, 1, 0.5, 0.12, 0.8, 15, 80, 18, 35
  ];

  return cryptoNames.slice(0, count).map((crypto, index) => {
    const change24h = (Math.random() * 10) * (Math.random() > 0.5 ? 1 : -1);
    const price = prices[index] * (1 + (Math.random() * 0.05 - 0.025));
    const marketCap = marketCaps[index] * (1 + (Math.random() * 0.05 - 0.025));
    const volume24h = marketCap * (0.05 + Math.random() * 0.15);

    return {
      name: crypto.name,
      symbol: crypto.symbol,
      price,
      change24h,
      volume24h,
      marketCap
    };
  });
};

// Generate exchange volume data
export const generateExchangeVolumeData = () => {
  const exchanges = [
    'Binance',
    'Coinbase',
    'Kraken',
    'KuCoin',
    'Bitfinex',
    'Bybit',
    'OKX',
    'Huobi',
    'Gate.io',
    'Bitstamp'
  ];

  // Base volumes (in millions USD)
  const baseVolumes = [
    28000, 12000, 8000, 6000, 4000,
    3500, 2800, 2200, 1800, 1600
  ];

  return exchanges.map((name, index) => {
    // Add some randomness to volume
    const volume = baseVolumes[index] * (1 + (Math.random() * 0.2 - 0.1)) * 1000000;
    
    return {
      name,
      volume
    };
  });
};

// Generate network fee data
export const generateNetworkFeeData = () => {
  const networks = {
    BTC: [
      { network: 'Bitcoin', transactionTime: '10-60 minutes' },
      { network: 'Lightning Network', transactionTime: '< 1 minute' }
    ],
    ETH: [
      { network: 'Ethereum', transactionTime: '15 seconds - 5 minutes' },
      { network: 'Arbitrum', transactionTime: '< 1 minute' },
      { network: 'Optimism', transactionTime: '< 1 minute' },
      { network: 'Polygon', transactionTime: '< 30 seconds' }
    ],
    USDT: [
      { network: 'Ethereum (ERC20)', transactionTime: '15 seconds - 5 minutes' },
      { network: 'Tron (TRC20)', transactionTime: '< 1 minute' },
      { network: 'Solana', transactionTime: '< 15 seconds' },
      { network: 'BNB Chain (BEP20)', transactionTime: '< 15 seconds' }
    ],
    USDC: [
      { network: 'Ethereum (ERC20)', transactionTime: '15 seconds - 5 minutes' },
      { network: 'Solana', transactionTime: '< 15 seconds' },
      { network: 'Arbitrum', transactionTime: '< 1 minute' },
      { network: 'BNB Chain (BEP20)', transactionTime: '< 15 seconds' }
    ],
    BNB: [
      { network: 'BNB Chain (BEP2)', transactionTime: '< 15 seconds' },
      { network: 'BNB Chain (BEP20)', transactionTime: '< 15 seconds' }
    ]
  };

  const result = [];

  Object.entries(networks).forEach(([token, tokenNetworks]) => {
    tokenNetworks.forEach(networkInfo => {
      const baseFee = getBaseFee(token, networkInfo.network);
      const congestionLevel = getCongestionLevel();
      const congestionMultiplier = getCongestionMultiplier(congestionLevel);
      
      result.push({
        token,
        network: networkInfo.network,
        fee: baseFee * congestionMultiplier,
        transactionTime: networkInfo.transactionTime,
        congestion: congestionLevel
      });
    });
  });

  return result;
};

function getBaseFee(token: string, network: string): number {
  // Base fee in USD
  const baseFees: {[key: string]: {[key: string]: number}} = {
    BTC: {
      'Bitcoin': 2.5,
      'Lightning Network': 0.01
    },
    ETH: {
      'Ethereum': 5,
      'Arbitrum': 0.25,
      'Optimism': 0.15,
      'Polygon': 0.01
    },
    USDT: {
      'Ethereum (ERC20)': 5,
      'Tron (TRC20)': 1,
      'Solana': 0.02,
      'BNB Chain (BEP20)': 0.1
    },
    USDC: {
      'Ethereum (ERC20)': 5,
      'Solana': 0.02,
      'Arbitrum': 0.25,
      'BNB Chain (BEP20)': 0.1
    },
    BNB: {
      'BNB Chain (BEP2)': 0.05,
      'BNB Chain (BEP20)': 0.1
    }
  };

  return baseFees[token]?.[network] || 1;
}

function getCongestionLevel(): 'low' | 'medium' | 'high' {
  const random = Math.random();
  if (random < 0.5) return 'low';
  if (random < 0.8) return 'medium';
  return 'high';
}

function getCongestionMultiplier(congestion: string): number {
  switch(congestion) {
    case 'low': return 0.8 + (Math.random() * 0.4); // 0.8 - 1.2
    case 'medium': return 1.2 + (Math.random() * 0.6); // 1.2 - 1.8
    case 'high': return 1.8 + (Math.random() * 1.2); // 1.8 - 3.0
    default: return 1;
  }
}
