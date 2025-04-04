// Mock data for development and testing

// Exchanges
export const exchanges = [
  { id: 'binance', name: 'Binance' },
  { id: 'bitget', name: 'Bitget' },
  { id: 'bybit', name: 'Bybit' },
  { id: 'kucoin', name: 'KuCoin' },
  { id: 'gate_io', name: 'Gate.io' },
  { id: 'bitfinex', name: 'Bitfinex' },
  { id: 'gemini', name: 'Gemini' },
  { id: 'coinbase', name: 'Coinbase' },
  { id: 'kraken', name: 'Kraken' },
  { id: 'poloniex', name: 'Poloniex' },
  { id: 'okx', name: 'OKX' },
  { id: 'ascendex', name: 'AscendEX' },
  { id: 'bitrue', name: 'Bitrue' },
  { id: 'htx', name: 'HTX' },
  { id: 'mexc_global', name: 'MEXC Global' }
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

    // Added risk assessment and execution difficulty
    const executionDifficulty = Math.floor(Math.random() * 5) + 1; // 1-5 scale
    const riskFactor = Math.floor(Math.random() * 5) + 1; // 1-5 scale
    const liquidityScore = Math.floor(Math.random() * 100) + 1; // 1-100 scale
    
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
      executionDifficulty,
      riskFactor,
      liquidityScore,
      netProfitAfterFees: potentialProfit * (0.7 + Math.random() * 0.2), // 70-90% of gross profit
      estimatedExecutionTime: Math.floor(Math.random() * 180) + 20, // 20-200 seconds
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

// NEW DATA GENERATION FUNCTIONS FOR ENHANCED MARKET ANALYSIS

// Generate real-time arbitrage opportunities
export const generateRealTimeArbitrageOpportunities = (count: number) => {
  return generateArbitrageOpportunities(count).map(opp => {
    // Add additional metrics for real-time arbitrage dashboard
    return {
      ...opp,
      slippage: Math.random() * 0.5,  // 0% to 0.5% slippage
      executionScore: Math.floor(Math.random() * 100) + 1,  // 1-100 score
      successProbability: 70 + Math.random() * 30,  // 70-100% probability 
      totalFees: Math.random() * (opp.potentialProfit * 0.3),  // Fees up to 30% of potential profit
      breakEvenSpread: (Math.random() * 0.3) + 0.1,  // 0.1% to 0.4% 
      historicalSuccess: Math.floor(Math.random() * 100) + 1,  // 1-100% historical success rate
      recommendationStrength: Math.floor(Math.random() * 3) + 1, // 1-3 (1=weak, 2=moderate, 3=strong)
    };
  });
};

// Generate price deviation alerts
export const generatePriceDeviationAlerts = (count: number) => {
  const alerts = [];
  
  for (let i = 0; i < count; i++) {
    const pairIndex = Math.floor(Math.random() * pairs.length);
    const pair = pairs[pairIndex];
    
    // Select different exchanges
    let exchange1Index = Math.floor(Math.random() * exchanges.length);
    let exchange2Index;
    do {
      exchange2Index = Math.floor(Math.random() * exchanges.length);
    } while (exchange2Index === exchange1Index);
    
    const basePrice = getBasePrice(pair);
    const deviationPercent = (Math.random() * 8) + 2; // 2% to 10% deviation
    
    const price1 = basePrice;
    const price2 = basePrice * (1 + deviationPercent / 100);
    
    const historicalCorrelation = 0.7 + Math.random() * 0.25; // 0.7 to 0.95 correlation
    const deviationFromNorm = Math.floor(Math.random() * 5) + 1; // 1-5 standard deviations
    
    // How long the deviation has been occurring
    const deviationDuration = Math.floor(Math.random() * 120) + 1; // 1-120 minutes
    
    // Severity rating 1-10
    const severityScore = Math.floor(deviationFromNorm * 2);
    
    alerts.push({
      id: `dev-${i}`,
      pair,
      exchange1: exchanges[exchange1Index].name,
      exchange2: exchanges[exchange2Index].name,
      price1,
      price2,
      deviationPercent,
      historicalCorrelation,
      deviationFromNorm,
      deviationDuration,
      timestamp: new Date(),
      severityScore,
      anomalyType: Math.random() > 0.5 ? 'Divergence' : 'Convergence',
      potentialArbitrage: price2 - price1,
      alertTriggered: deviationFromNorm > 2
    });
  }
  
  return alerts.sort((a, b) => b.severityScore - a.severityScore);
};

// Generate historical spread data
export const generateHistoricalSpreadData = (pair: string, days: number = 30) => {
  const data = [];
  
  // Create two random exchanges
  const exchangeIndexes = [];
  while (exchangeIndexes.length < 2) {
    const idx = Math.floor(Math.random() * exchanges.length);
    if (!exchangeIndexes.includes(idx)) {
      exchangeIndexes.push(idx);
    }
  }
  
  const baseSpread = Math.random() * 0.5 + 0.1; // Base spread between 0.1% and 0.6%
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    // Generate daily spread fluctuations with some randomness
    // but maintain a somewhat consistent pattern
    const dailyFactor = 1 + (Math.sin(i / 3) * 0.3) + (Math.random() * 0.4 - 0.2);
    const spread = baseSpread * dailyFactor;
    
    // Calculate if this spread is an outlier (opportunity)
    const isOpportunity = spread > baseSpread * 1.5;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      spread: spread,
      exchange1: exchanges[exchangeIndexes[0]].name,
      exchange2: exchanges[exchangeIndexes[1]].name,
      isOpportunity,
      standardDeviation: isOpportunity ? Math.floor(Math.random() * 3) + 2 : Math.random() * 1.5
    });
  }
  
  return data;
};

// Generate liquidity analysis data
export const generateLiquidityData = (pairCount: number = 10) => {
  const liquidityData = [];
  
  for (let i = 0; i < pairCount; i++) {
    const pairIndex = Math.floor(Math.random() * Math.min(pairs.length, 10));
    const pair = pairs[pairIndex];
    
    const exchangeData = [];
    
    // Select 4-6 random exchanges
    const exchangeCount = Math.floor(Math.random() * 3) + 4; // 4-6 exchanges
    const selectedExchangeIndexes = [];
    
    while (selectedExchangeIndexes.length < exchangeCount) {
      const idx = Math.floor(Math.random() * exchanges.length);
      if (!selectedExchangeIndexes.includes(idx)) {
        selectedExchangeIndexes.push(idx);
      }
    }
    
    for (const idx of selectedExchangeIndexes) {
      const baseVolume = Math.random() * 50000000 + 1000000; // $1M to $51M
      
      // Order book depth (in USD)
      const depth = {
        '0.1%': baseVolume * (0.2 + Math.random() * 0.3), // 20-50% of volume at 0.1% slippage
        '0.5%': baseVolume * (0.5 + Math.random() * 0.3), // 50-80% of volume at 0.5% slippage
        '1.0%': baseVolume * (0.8 + Math.random() * 0.2), // 80-100% of volume at 1.0% slippage
      };
      
      exchangeData.push({
        exchange: exchanges[idx].name,
        volume24h: baseVolume,
        orderBookDepth: depth,
        slippageScore: Math.floor(Math.random() * 100) + 1, // 1-100
        liquidityScore: Math.floor(Math.random() * 100) + 1, // 1-100
        avgTradeSize: Math.floor(Math.random() * 50000) + 1000, // $1K-$51K
        largestTradeSize: Math.floor(Math.random() * 1000000) + 100000, // $100K-$1.1M
      });
    }
    
    liquidityData.push({
      pair,
      exchanges: exchangeData,
      totalLiquidity: exchangeData.reduce((sum, ex) => sum + ex.volume24h, 0),
      bestExecutionExchange: exchangeData.sort((a, b) => b.liquidityScore - a.liquidityScore)[0].exchange
    });
  }
  
  return liquidityData.sort((a, b) => b.totalLiquidity - a.totalLiquidity);
};

// Generate technical indicators data for pairs
export const generateTechnicalIndicatorsData = (pairCount: number = 10) => {
  const indicatorsData = [];
  
  for (let i = 0; i < pairCount; i++) {
    const pairIndex = Math.floor(Math.random() * pairs.length);
    const pair = pairs[pairIndex];
    
    // Generate random but realistic technical indicators
    const rsi = Math.floor(Math.random() * 100) + 1; // 1-100
    const macd = (Math.random() * 40) - 20; // -20 to 20
    const macdSignal = (Math.random() * 40) - 20; // -20 to 20
    const macdHistogram = macd - macdSignal;
    
    // Bollinger bands
    const sma20 = getBasePrice(pair);
    const stdDev = sma20 * (0.01 + Math.random() * 0.04); // 1-5% of price
    
    indicatorsData.push({
      pair,
      price: getBasePrice(pair),
      rsi,
      macd,
      macdSignal,
      macdHistogram,
      bollingerBands: {
        upper: sma20 + (stdDev * 2),
        middle: sma20,
        lower: sma20 - (stdDev * 2),
        width: (stdDev * 4) / sma20 * 100 // Percentage width
      },
      volume24h: Math.random() * 100000000 + 1000000, // $1M to $101M
      rsiSignal: rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral',
      macdTrend: macdHistogram > 0 ? 'Bullish' : 'Bearish',
      bollingerSignal: Math.random() > 0.5 ? 'Squeeze' : 'Expansion',
      trendStrength: Math.floor(Math.random() * 100) + 1, // 1-100
      marketInefficiencyScore: Math.floor(Math.random() * 100) + 1, // 1-100
    });
  }
  
  return indicatorsData;
};

// Generate fee impact data
export const generateFeeImpactData = () => {
  const feeData = [];
  
  for (const exchange of exchanges.slice(0, 10)) {  // Take first 10 exchanges
    const makerFee = 0.05 + Math.random() * 0.45; // 0.05% to 0.5%
    const takerFee = makerFee + (0.05 + Math.random() * 0.2); // Higher than maker fee
    const withdrawalFee = {
      BTC: 0.0001 + Math.random() * 0.0004, // 0.0001 to 0.0005 BTC
      ETH: 0.001 + Math.random() * 0.009, // 0.001 to 0.01 ETH
      USDT: 1 + Math.random() * 19, // 1 to 20 USDT
    };
    
    feeData.push({
      exchange: exchange.name,
      makerFee,
      takerFee,
      withdrawalFee,
      depositFee: Math.random() > 0.9 ? 0.1 + Math.random() * 0.4 : 0, // 90% chance of free deposits
      hasTieredFees: Math.random() > 0.5,
      volumeDiscounts: Math.random() > 0.3,
      yearlyFees: {
        '10k_monthly': Math.floor(makerFee * 1000) * 12, // Yearly fees for $10K monthly volume
        '50k_monthly': Math.floor(makerFee * 0.9 * 5000) * 12, // Yearly fees for $50K monthly volume
        '100k_monthly': Math.floor(makerFee * 0.8 * 10000) * 12, // Yearly fees for $100K monthly volume
      }
    });
  }
  
  return feeData;
};

// Generate market sentiment data
export const generateMarketSentimentData = () => {
  const sentimentData = [];
  
  for (let i = 0; i < 10; i++) {
    const pairIndex = Math.floor(Math.random() * pairs.length);
    const pair = pairs[pairIndex];
    
    sentimentData.push({
      pair,
      newsCount: Math.floor(Math.random() * 50) + 1, // 1-50 news articles
      newsScore: Math.floor(Math.random() * 100) + 1, // 1-100 sentiment score
      socialMentions: Math.floor(Math.random() * 1000) + 100, // 100-1100 social mentions
      socialSentiment: Math.floor(Math.random() * 100) + 1, // 1-100 sentiment score
      sentimentChange24h: (Math.random() * 20) - 10, // -10 to +10 sentiment change
      unusualActivity: Math.random() > 0.7, // 30% chance of unusual activity
      sentimentTrend: ['Improving', 'Declining', 'Stable'][Math.floor(Math.random() * 3)],
      sentimentImpact: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      priceCorrelation: (Math.random() * 2) - 1 // -1 to 1 correlation with price
    });
  }
  
  return sentimentData;
};

// Generate market inefficiency scores
export const generateMarketInefficiencyScores = () => {
  // Overall market inefficiency on a scale of 1-100
  const overallScore = Math.floor(Math.random() * 30) + 20; // 20-50 range
  
  // Exchange-specific inefficiency scores
  const exchangeScores = exchanges.slice(0, 12).map(exchange => ({
    exchange: exchange.name,
    inefficiencyScore: Math.floor(Math.random() * 50) + 10, // 10-60 range
    arbitrageOpportunityCount: Math.floor(Math.random() * 20) + 1, // 1-20 opportunities
    priceLagScore: Math.floor(Math.random() * 100) + 1, // 1-100 score
    liquidityEfficiencyScore: Math.floor(Math.random() * 100) + 1, // 1-100 score
    recommendedPairs: [
      pairs[Math.floor(Math.random() * pairs.length)],
      pairs[Math.floor(Math.random() * pairs.length)]
    ]
  }));
  
  // Pair-specific inefficiency scores
  const pairScores = pairs.slice(0, 10).map(pair => ({
    pair,
    inefficiencyScore: Math.floor(Math.random() * 60) + 10, // 10-70 range
    bestExchangePair: {
      buy: exchanges[Math.floor(Math.random() * exchanges.length)].name,
      sell: exchanges[Math.floor(Math.random() * exchanges.length)].name,
    },
    volatilityContribution: Math.floor(Math.random() * 100) + 1, // 1-100 score
    marketDepthRatio: 0.5 + Math.random() * 1.5, // 0.5-2.0 ratio
  }));
  
  return {
    timestamp: new Date(),
    overallScore,
    exchangeScores,
    pairScores,
    marketCondition: overallScore > 40 ? 'High Inefficiency' : 
                     overallScore > 25 ? 'Moderate Inefficiency' : 'Low Inefficiency',
    inefficiencyTrend: ['Increasing', 'Decreasing', 'Stable'][Math.floor(Math.random() * 3)]
  };
};
