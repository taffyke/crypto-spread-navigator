import { ExchangeApi, createExchangeApi } from '@/lib/exchanges/exchangeApi';
import { notificationManager } from '@/lib/notifications/notificationSystem';

// Asset data type
export interface AssetData {
  symbol: string;
  name: string;
  price: number;
  volume24h: number;
  marketCap?: number;
  change24h: number;
  high24h?: number;
  low24h?: number;
  open24h?: number;
  close24h?: number;
}

// Correlation data
export interface CorrelationData {
  asset1: string;
  asset2: string;
  correlation: number; // -1 to 1
  periodDays: number;
}

// Volatility data
export interface VolatilityData {
  symbol: string;
  volatility: number; // percentage
  periodDays: number;
  averageTrue?: number;
  standardDeviation?: number;
}

// Historical price data point
export interface PriceDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Price prediction
export interface PricePrediction {
  symbol: string;
  currentPrice: number;
  prediction: {
    timeframe: string; // e.g., '1h', '1d', '1w'
    predictedPrice: number;
    predictedChange: number; // percentage
    confidence: number; // 0-100%
    upperBound: number;
    lowerBound: number;
  };
  factors: {
    name: string;
    impact: number; // -100 to 100
    explanation: string;
  }[];
}

// Moving average data
export interface MovingAverageData {
  symbol: string;
  period: number; // e.g., 7, 14, 30, 200
  type: 'simple' | 'exponential' | 'weighted';
  value: number;
  previousValue: number;
  change: number;
}

// Relative Strength Index data
export interface RSIData {
  symbol: string;
  period: number; // typically 14
  value: number;
  isOverbought: boolean; // typically RSI > 70
  isOversold: boolean; // typically RSI < 30
}

// Market sentiment from external sources
export interface MarketSentiment {
  symbol: string;
  overallSentiment: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  sentimentScore: number; // -100 to 100
  sources: {
    name: string;
    sentiment: number; // -100 to 100
    sampleSize?: number;
  }[];
  timestamp: Date;
}

// Market trend analysis
export interface MarketTrend {
  symbol: string;
  timeframe: string; // e.g., '1h', '1d', '1w', '1m'
  trend: 'strong_uptrend' | 'uptrend' | 'neutral' | 'downtrend' | 'strong_downtrend';
  strength: number; // 0-100%
  supportLevels: number[];
  resistanceLevels: number[];
  keyLevels: { price: number; significance: number; type: 'support' | 'resistance' }[];
}

// Types for market analysis
export type MarketOpportunityType = 'arbitrage' | 'triangle_arbitrage' | 'spread' | 'volume_spike' | 'price_spike' | 'liquidity_pool';
export type MarketDirection = 'bullish' | 'bearish' | 'neutral';
export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';

// Interface for market opportunity
export interface MarketOpportunity {
  id: string;
  type: MarketOpportunityType;
  description: string;
  exchanges: string[];
  symbols: string[];
  potentialProfit: {
    value: number;
    currency: string;
    percentage: number;
  };
  timestamp: Date;
  timeFrame: TimeFrame;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  isActive: boolean;
}

// Interface for custom market alerts
export interface MarketAlert {
  id: string;
  name: string;
  description: string;
  conditions: MarketAlertCondition[];
  enabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  cooldownMinutes: number;
  notificationPriority: 'low' | 'medium' | 'high' | 'critical';
}

// Interface for market alert conditions
export interface MarketAlertCondition {
  id: string;
  type: 'price' | 'volume' | 'spread' | 'volatility' | 'rsi' | 'moving_average' | 'custom';
  exchange?: string;
  symbol?: string;
  comparison: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number;
  timeFrame: TimeFrame;
  aggregation?: 'average' | 'median' | 'high' | 'low' | 'open' | 'close';
  customLogic?: string;
}

// Interface for market analysis
export interface MarketAnalysis {
  id: string;
  symbol: string;
  exchange: string;
  timeFrame: TimeFrame;
  direction: MarketDirection;
  indicators: {
    rsi?: number;
    macd?: {
      histogram: number;
      signal: number;
      value: number;
    };
    bollingerBands?: {
      upper: number;
      middle: number;
      lower: number;
    };
    movingAverages?: {
      sma20: number;
      sma50: number;
      sma200: number;
      ema12: number;
      ema26: number;
    };
  };
  priceData: {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  };
  volatility: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Interface for exchange spread
export interface ExchangeSpread {
  id: string;
  symbol: string;
  baseExchange: string;
  targetExchange: string;
  spreadPercentage: number;
  basePrice: number;
  targetPrice: number;
  timestamp: Date;
  volume24h: {
    base: number;
    target: number;
  };
  estimatedFees: {
    base: number;
    target: number;
    transfer: number;
    total: number;
  };
  netProfitPercentage: number;
  profitableVolume: number;
  isActive: boolean;
  lastUpdated: Date;
}

// Market Analysis Manager - handles advanced analytics
export class MarketAnalysisManager {
  private exchangeApis: Map<string, ExchangeApi> = new Map();
  private opportunities: Map<string, MarketOpportunity> = new Map();
  private alerts: Map<string, MarketAlert> = new Map();
  private analyses: Map<string, MarketAnalysis> = new Map();
  private spreads: Map<string, ExchangeSpread> = new Map();
  
  // Define thresholds for notifications
  private thresholds = {
    arbitrageMinProfitPercentage: 1.5,
    spreadMinPercentage: 1.0,
    volumeSpikePercentage: 50,
    priceSpikePercentage: 3,
  };
  
  // Initialize with a list of exchanges
  constructor(exchangeIds: string[] = ['binance', 'coinbase', 'kraken']) {
    // Initialize exchange APIs
    for (const exchangeId of exchangeIds) {
      try {
        const api = createExchangeApi(exchangeId);
        this.exchangeApis.set(exchangeId, api);
      } catch (error) {
        console.error(`Failed to initialize API for exchange ${exchangeId}:`, error);
      }
    }
    
    // Initialize with default alerts
    this.initializeDefaultAlerts();
  }
  
  // Get primary exchange API
  private getPrimaryExchangeApi(): ExchangeApi {
    // Get the first exchange API or create a new one for Binance
    if (this.exchangeApis.size === 0) {
      const api = createExchangeApi('binance');
      this.exchangeApis.set('binance', api);
      return api;
    }
    
    return this.exchangeApis.values().next().value;
  }
  
  // Calculate correlation between two assets
  async calculateCorrelation(
    symbol1: string, 
    symbol2: string, 
    periodDays: number = 30
  ): Promise<CorrelationData> {
    // In a real implementation, this would fetch historical price data
    // and calculate the Pearson correlation coefficient
    
    // For now, we'll return mock data for demo purposes
    const mockCorrelation = Math.random() * 2 - 1; // Random value between -1 and 1
    
    return {
      asset1: symbol1,
      asset2: symbol2,
      correlation: mockCorrelation,
      periodDays,
    };
  }
  
  // Calculate correlation matrix for multiple assets
  async calculateCorrelationMatrix(
    symbols: string[], 
    periodDays: number = 30
  ): Promise<{ symbols: string[], matrix: number[][] }> {
    const matrix: number[][] = [];
    
    // Fill the matrix with correlations
    for (let i = 0; i < symbols.length; i++) {
      const row: number[] = [];
      
      for (let j = 0; j < symbols.length; j++) {
        if (i === j) {
          // Perfect correlation with itself
          row.push(1);
        } else if (j < i) {
          // Reuse previously calculated correlation
          row.push(matrix[j][i]);
        } else {
          // Calculate new correlation
          const correlation = await this.calculateCorrelation(
            symbols[i], 
            symbols[j], 
            periodDays
          );
          
          row.push(correlation.correlation);
        }
      }
      
      matrix.push(row);
    }
    
    return {
      symbols,
      matrix
    };
  }
  
  // Calculate volatility for an asset
  async calculateVolatility(
    symbol: string, 
    periodDays: number = 30
  ): Promise<VolatilityData> {
    // In a real implementation, this would fetch historical price data
    // and calculate statistical volatility (standard deviation of returns)
    
    // For now, we'll return mock data for demo purposes
    // Volatility tends to vary by asset class, so we'll simulate that
    let baseVolatility = 0.02; // 2% base volatility
    
    // Higher volatility for certain assets
    if (symbol.includes('BTC') || symbol.includes('ETH')) {
      baseVolatility = 0.03; // 3% for major cryptos
    } else if (symbol.includes('DOGE') || symbol.includes('SHIB')) {
      baseVolatility = 0.08; // 8% for meme coins
    } else if (symbol.includes('SOL') || symbol.includes('AVAX')) {
      baseVolatility = 0.05; // 5% for high-growth L1s
    }
    
    // Add some randomness
    const volatility = baseVolatility + (Math.random() * 0.02) - 0.01; // ±1%
    
    return {
      symbol,
      volatility: volatility * 100, // Convert to percentage
      periodDays,
      standardDeviation: volatility,
    };
  }
  
  // Calculate volatility for multiple assets
  async calculateVolatilityRanking(
    symbols: string[], 
    periodDays: number = 30
  ): Promise<VolatilityData[]> {
    const volatilities: VolatilityData[] = [];
    
    // Calculate volatility for each symbol
    for (const symbol of symbols) {
      const volatility = await this.calculateVolatility(symbol, periodDays);
      volatilities.push(volatility);
    }
    
    // Sort by volatility in descending order
    return volatilities.sort((a, b) => b.volatility - a.volatility);
  }
  
  // Get historical price data
  async getHistoricalPrices(
    symbol: string,
    timeframe: string = '1d',
    limit: number = 30
  ): Promise<PriceDataPoint[]> {
    // In a real implementation, this would fetch historical price data from an exchange
    // For now, we'll generate mock data
    
    const data: PriceDataPoint[] = [];
    let lastClose = this.getMockBasePrice(symbol);
    
    for (let i = 0; i < limit; i++) {
      // Calculate timestamp for this data point (most recent first)
      const timestamp = Date.now() - (i * this.timeframeToMilliseconds(timeframe));
      
      // Generate random price movement (more volatile for shorter timeframes)
      const volatilityFactor = timeframe === '1h' ? 0.01 : timeframe === '1d' ? 0.02 : 0.04;
      const priceChange = (Math.random() * 2 - 1) * lastClose * volatilityFactor;
      
      const close = lastClose + priceChange;
      const open = lastClose;
      // High is the maximum of open, close, and some random value in between
      const randomHigh = Math.max(open, close) + (Math.random() * Math.abs(close - open) * 0.5);
      const high = Math.max(open, close, randomHigh);
      // Low is the minimum of open, close, and some random value in between
      const randomLow = Math.min(open, close) - (Math.random() * Math.abs(close - open) * 0.5);
      const low = Math.min(open, close, randomLow);
      
      // Volume tends to be higher with bigger price movements
      const baseVolume = lastClose * 1000; // Base volume proportional to price
      const volume = baseVolume * (1 + Math.abs(priceChange / lastClose) * 5); // Higher volume with bigger moves
      
      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });
      
      lastClose = close;
    }
    
    // Reverse to get chronological order (oldest first)
    return data.reverse();
  }
  
  // Calculate Simple Moving Average (SMA)
  async calculateSMA(
    symbol: string,
    period: number = 14,
    timeframe: string = '1d'
  ): Promise<MovingAverageData> {
    // Get historical price data
    const prices = await this.getHistoricalPrices(symbol, timeframe, period + 1);
    
    // Calculate current SMA
    const currentPrices = prices.slice(-period).map(p => p.close);
    const sma = currentPrices.reduce((sum, price) => sum + price, 0) / period;
    
    // Calculate previous SMA for change
    const previousPrices = prices.slice(0, period).map(p => p.close);
    const previousSma = previousPrices.reduce((sum, price) => sum + price, 0) / period;
    
    // Calculate change
    const change = ((sma - previousSma) / previousSma) * 100;
    
    return {
      symbol,
      period,
      type: 'simple',
      value: sma,
      previousValue: previousSma,
      change
    };
  }
  
  // Calculate Exponential Moving Average (EMA)
  async calculateEMA(
    symbol: string,
    period: number = 14,
    timeframe: string = '1d'
  ): Promise<MovingAverageData> {
    // Get historical price data
    const prices = await this.getHistoricalPrices(symbol, timeframe, period * 3); // Need more data for accurate EMA
    
    // Calculate multiplier
    const multiplier = 2 / (period + 1);
    
    // Calculate EMA
    let ema = prices[0].close; // Initial SMA
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i].close - ema) * multiplier + ema;
    }
    
    // Calculate previous EMA for comparison
    let previousEma = prices[0].close;
    
    for (let i = 1; i < prices.length - 1; i++) {
      previousEma = (prices[i].close - previousEma) * multiplier + previousEma;
    }
    
    // Calculate change
    const change = ((ema - previousEma) / previousEma) * 100;
    
    return {
      symbol,
      period,
      type: 'exponential',
      value: ema,
      previousValue: previousEma,
      change
    };
  }
  
  // Calculate Relative Strength Index (RSI)
  async calculateRSI(
    symbol: string,
    period: number = 14,
    timeframe: string = '1d'
  ): Promise<RSIData> {
    // Get historical price data (need period+1 to calculate changes)
    const prices = await this.getHistoricalPrices(symbol, timeframe, period + 1);
    
    // Calculate price changes
    const priceChanges: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      priceChanges.push(prices[i].close - prices[i - 1].close);
    }
    
    // Calculate gains and losses
    const gains = priceChanges.map(change => change > 0 ? change : 0);
    const losses = priceChanges.map(change => change < 0 ? Math.abs(change) : 0);
    
    // Calculate average gain and average loss
    const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;
    
    // Calculate RSI
    let rsi = 100;
    
    if (avgLoss > 0) {
      const rs = avgGain / avgLoss;
      rsi = 100 - (100 / (1 + rs));
    } else if (avgGain === 0) {
      rsi = 50; // No change
    }
    
    return {
      symbol,
      period,
      value: rsi,
      isOverbought: rsi > 70,
      isOversold: rsi < 30
    };
  }
  
  // Generate market sentiment analysis
  async getMarketSentiment(symbol: string): Promise<MarketSentiment> {
    // In a real implementation, this would analyze social media, news, and other sources
    // For now, we'll return mock data
    
    // Generate a base sentiment score (-100 to 100)
    const baseSentiment = Math.round((Math.random() * 160) - 80);
    
    // Determine overall sentiment category
    let overallSentiment: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
    
    if (baseSentiment < -60) {
      overallSentiment = 'very_negative';
    } else if (baseSentiment < -20) {
      overallSentiment = 'negative';
    } else if (baseSentiment < 20) {
      overallSentiment = 'neutral';
    } else if (baseSentiment < 60) {
      overallSentiment = 'positive';
    } else {
      overallSentiment = 'very_positive';
    }
    
    // Generate mock sources with slightly varying sentiment
    const sources = [
      {
        name: 'Twitter/X',
        sentiment: baseSentiment + (Math.random() * 30) - 15,
        sampleSize: Math.floor(Math.random() * 5000) + 1000
      },
      {
        name: 'Reddit',
        sentiment: baseSentiment + (Math.random() * 30) - 15,
        sampleSize: Math.floor(Math.random() * 3000) + 500
      },
      {
        name: 'News Articles',
        sentiment: baseSentiment + (Math.random() * 30) - 15,
        sampleSize: Math.floor(Math.random() * 100) + 10
      },
      {
        name: 'Crypto Influencers',
        sentiment: baseSentiment + (Math.random() * 40) - 20,
        sampleSize: Math.floor(Math.random() * 50) + 5
      }
    ];
    
    return {
      symbol,
      overallSentiment,
      sentimentScore: baseSentiment,
      sources,
      timestamp: new Date()
    };
  }
  
  // Generate market trend analysis
  async getMarketTrend(symbol: string, timeframe: string = '1d'): Promise<MarketTrend> {
    // Get historical prices
    const prices = await this.getHistoricalPrices(symbol, timeframe, 30);
    
    // Determine trend based on price action
    const closes = prices.map(p => p.close);
    const firstPrice = closes[0];
    const lastPrice = closes[closes.length - 1];
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    // Determine trend direction and strength
    let trend: 'strong_uptrend' | 'uptrend' | 'neutral' | 'downtrend' | 'strong_downtrend';
    let strength: number;
    
    if (priceChange > 15) {
      trend = 'strong_uptrend';
      strength = 80 + (Math.random() * 20);
    } else if (priceChange > 5) {
      trend = 'uptrend';
      strength = 60 + (Math.random() * 20);
    } else if (priceChange > -5) {
      trend = 'neutral';
      strength = 40 + (Math.random() * 20);
    } else if (priceChange > -15) {
      trend = 'downtrend';
      strength = 60 + (Math.random() * 20);
    } else {
      trend = 'strong_downtrend';
      strength = 80 + (Math.random() * 20);
    }
    
    // Find support and resistance levels
    const supportLevels: number[] = [];
    const resistanceLevels: number[] = [];
    
    // Simple algorithm to find local minimums and maximums
    for (let i = 1; i < prices.length - 1; i++) {
      // Local minimum (support)
      if (prices[i].low < prices[i-1].low && prices[i].low < prices[i+1].low) {
        supportLevels.push(prices[i].low);
      }
      
      // Local maximum (resistance)
      if (prices[i].high > prices[i-1].high && prices[i].high > prices[i+1].high) {
        resistanceLevels.push(prices[i].high);
      }
    }
    
    // Generate key levels with significance rating
    const keyLevels = [
      ...supportLevels.map(price => ({
        price,
        significance: 50 + (Math.random() * 50), // 50-100
        type: 'support' as const
      })),
      ...resistanceLevels.map(price => ({
        price,
        significance: 50 + (Math.random() * 50), // 50-100
        type: 'resistance' as const
      }))
    ];
    
    // Sort by significance
    keyLevels.sort((a, b) => b.significance - a.significance);
    
    return {
      symbol,
      timeframe,
      trend,
      strength,
      supportLevels,
      resistanceLevels,
      keyLevels: keyLevels.slice(0, 5) // Top 5 most significant levels
    };
  }
  
  // Generate price predictions using various algorithms
  async generatePricePrediction(symbol: string): Promise<PricePrediction> {
    // In a real implementation, this would use ML models, technical analysis, etc.
    // For now, we'll return mock data
    
    const exchangeApi = this.getPrimaryExchangeApi();
    const ticker = await exchangeApi.getTicker(symbol);
    
    // Check if ticker exists and use the "last" property instead of "price"
    // The Ticker interface has "last" not "price" based on the error
    const currentPrice = ticker ? ticker.last : this.getMockBasePrice(symbol);
    
    // Generate a mock prediction (±20% from current price)
    const randomChange = (Math.random() * 0.4) - 0.2; // -20% to +20%
    const predictedChange = randomChange * 100;
    const predictedPrice = currentPrice * (1 + randomChange);
    
    // Generate confidence based on volatility (lower confidence for high volatility)
    const volatility = await this.calculateVolatility(symbol);
    const confidence = Math.max(10, 100 - volatility.volatility);
    
    // Generate upper and lower bounds
    const uncertainty = (100 - confidence) / 100;
    const upperBound = predictedPrice * (1 + uncertainty * 0.5);
    const lowerBound = predictedPrice * (1 - uncertainty * 0.5);
    
    // Generate sentiment data
    const sentiment = await this.getMarketSentiment(symbol);
    
    // Generate factors influencing the prediction
    const factors = [
      {
        name: 'Technical Analysis',
        impact: 20 + (Math.random() * 60), // 20-80
        explanation: 'Based on moving averages, RSI, and trend analysis'
      },
      {
        name: 'Market Sentiment',
        impact: sentiment.sentimentScore / 2, // -50 to 50
        explanation: `Overall ${sentiment.overallSentiment} sentiment detected from social media and news`
      },
      {
        name: 'Market Volatility',
        impact: -volatility.volatility, // Negative impact from high volatility
        explanation: `${symbol} has ${volatility.volatility.toFixed(1)}% volatility over the last 30 days`
      },
      {
        name: 'Trading Volume',
        impact: 10 * (Math.random() > 0.5 ? 1 : -1), // ±10
        explanation: `${symbol} trading volume is ${Math.random() > 0.5 ? 'above' : 'below'} average`
      }
    ];
    
    return {
      symbol,
      currentPrice,
      prediction: {
        timeframe: '1d',
        predictedPrice,
        predictedChange,
        confidence,
        upperBound,
        lowerBound
      },
      factors
    };
  }
  
  // Helper method to convert timeframe string to milliseconds
  private timeframeToMilliseconds(timeframe: string): number {
    const unit = timeframe.charAt(timeframe.length - 1);
    const value = parseInt(timeframe.substring(0, timeframe.length - 1));
    
    switch (unit) {
      case 'm': return value * 60 * 1000; // minutes
      case 'h': return value * 60 * 60 * 1000; // hours
      case 'd': return value * 24 * 60 * 60 * 1000; // days
      case 'w': return value * 7 * 24 * 60 * 60 * 1000; // weeks
      case 'M': return value * 30 * 24 * 60 * 60 * 1000; // months (approx)
      default: return value * 24 * 60 * 60 * 1000; // default to days
    }
  }
  
  // Helper method to get mock base price
  private getMockBasePrice(symbol: string): number {
    // Extract the base currency and quote currency from the symbol
    // Format is typically like "BTC/USDT"
    const [base, quote] = symbol.split('/');
    
    const baseMap: Record<string, number> = {
      'BTC': 68000,
      'ETH': 3300,
      'XRP': 0.52,
      'SOL': 160,
      'ADA': 0.45,
      'DOGE': 0.15,
      'SHIB': 0.00002,
      'LINK': 15,
      'AVAX': 35,
      'DOT': 7,
      'MATIC': 0.8,
      'UNI': 10,
      'XLM': 0.11,
      'ATOM': 9,
      'LTC': 80
    };
    
    return baseMap[base] || 100; // Default to 100 if not found
  }
  
  /**
   * Initialize default market alerts
   */
  private initializeDefaultAlerts(): void {
    const defaultAlerts: MarketAlert[] = [
      {
        id: crypto.randomUUID(),
        name: 'Significant Arbitrage Opportunity',
        description: 'Alert when arbitrage opportunities exceed 2% potential profit',
        conditions: [
          {
            id: crypto.randomUUID(),
            type: 'spread',
            comparison: '>',
            value: 2.0,
            timeFrame: '1m',
          },
        ],
        enabled: true,
        createdAt: new Date(),
        cooldownMinutes: 15,
        notificationPriority: 'high',
      },
      {
        id: crypto.randomUUID(),
        name: 'Significant Price Movement',
        description: 'Alert when price changes more than 5% in 15 minutes',
        conditions: [
          {
            id: crypto.randomUUID(),
            type: 'price',
            comparison: '>',
            value: 5.0,
            timeFrame: '15m',
          },
        ],
        enabled: true,
        createdAt: new Date(),
        cooldownMinutes: 30,
        notificationPriority: 'medium',
      },
    ];
    
    for (const alert of defaultAlerts) {
      this.alerts.set(alert.id, alert);
    }
  }
  
  /**
   * Add or update a market opportunity
   */
  public addOrUpdateOpportunity(opportunity: MarketOpportunity): void {
    this.opportunities.set(opportunity.id, opportunity);
    
    // Check if we should notify based on thresholds
    if (this.shouldNotifyOpportunity(opportunity)) {
      this.notifyAboutOpportunity(opportunity);
    }
  }
  
  /**
   * Determine if an opportunity should trigger a notification
   */
  private shouldNotifyOpportunity(opportunity: MarketOpportunity): boolean {
    switch (opportunity.type) {
      case 'arbitrage':
      case 'triangle_arbitrage':
        return opportunity.potentialProfit.percentage >= this.thresholds.arbitrageMinProfitPercentage;
      case 'spread':
        return opportunity.potentialProfit.percentage >= this.thresholds.spreadMinPercentage;
      case 'volume_spike':
        return opportunity.potentialProfit.percentage >= this.thresholds.volumeSpikePercentage;
      case 'price_spike':
        return opportunity.potentialProfit.percentage >= this.thresholds.priceSpikePercentage;
      default:
        return false;
    }
  }
  
  /**
   * Send a notification about an opportunity
   */
  private notifyAboutOpportunity(opportunity: MarketOpportunity): void {
    const title = `${this.formatOpportunityType(opportunity.type)} Opportunity Detected`;
    const message = `${opportunity.description}. Potential profit: ${opportunity.potentialProfit.percentage.toFixed(2)}% (${opportunity.potentialProfit.value.toFixed(2)} ${opportunity.potentialProfit.currency})`;
    
    notificationManager.notify(
      title,
      message,
      'arbitrage_opportunity',
      opportunity.potentialProfit.percentage > 5 ? 'high' : 'medium',
      'market_analysis'
    );
  }
  
  /**
   * Format opportunity type for display
   */
  private formatOpportunityType(type: MarketOpportunityType): string {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Get all market opportunities, with optional filtering
   */
  public getOpportunities(filter?: {
    type?: MarketOpportunityType;
    minProfitPercentage?: number;
    exchanges?: string[];
    symbols?: string[];
    activeOnly?: boolean;
  }): MarketOpportunity[] {
    let opportunities = Array.from(this.opportunities.values());
    
    // Apply filters if provided
    if (filter) {
      if (filter.type) {
        opportunities = opportunities.filter(opp => opp.type === filter.type);
      }
      
      if (filter.minProfitPercentage !== undefined) {
        opportunities = opportunities.filter(opp => opp.potentialProfit.percentage >= filter.minProfitPercentage);
      }
      
      if (filter.exchanges && filter.exchanges.length > 0) {
        opportunities = opportunities.filter(opp => 
          filter.exchanges.some(exchange => opp.exchanges.includes(exchange))
        );
      }
      
      if (filter.symbols && filter.symbols.length > 0) {
        opportunities = opportunities.filter(opp => 
          filter.symbols.some(symbol => opp.symbols.includes(symbol))
        );
      }
      
      if (filter.activeOnly) {
        opportunities = opportunities.filter(opp => opp.isActive);
      }
    }
    
    // Sort by potential profit percentage descending
    return opportunities.sort((a, b) => b.potentialProfit.percentage - a.potentialProfit.percentage);
  }
  
  /**
   * Add or update a market alert
   */
  public addOrUpdateAlert(alert: MarketAlert): void {
    this.alerts.set(alert.id, alert);
  }
  
  /**
   * Delete a market alert
   */
  public deleteAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }
  
  /**
   * Get all market alerts, with optional filtering
   */
  public getAlerts(filter?: {
    enabled?: boolean;
    type?: string;
  }): MarketAlert[] {
    let alerts = Array.from(this.alerts.values());
    
    // Apply filters if provided
    if (filter) {
      if (filter.enabled !== undefined) {
        alerts = alerts.filter(alert => alert.enabled === filter.enabled);
      }
      
      if (filter.type) {
        alerts = alerts.filter(alert => 
          alert.conditions.some(condition => condition.type === filter.type)
        );
      }
    }
    
    return alerts;
  }
  
  /**
   * Update market analysis for a specific symbol and exchange
   */
  public updateAnalysis(analysis: MarketAnalysis): void {
    const key = `${analysis.exchange}:${analysis.symbol}:${analysis.timeFrame}`;
    this.analyses.set(key, analysis);
  }
  
  /**
   * Get market analysis for a specific symbol and exchange
   */
  public getAnalysis(exchange: string, symbol: string, timeFrame: TimeFrame): MarketAnalysis | undefined {
    const key = `${exchange}:${symbol}:${timeFrame}`;
    return this.analyses.get(key);
  }
  
  /**
   * Get all market analyses
   */
  public getAllAnalyses(): MarketAnalysis[] {
    return Array.from(this.analyses.values());
  }
  
  /**
   * Add or update a spread between exchanges
   */
  public updateSpread(spread: ExchangeSpread): void {
    const key = `${spread.baseExchange}:${spread.targetExchange}:${spread.symbol}`;
    const existingSpread = this.spreads.get(key);
    
    // Check if this is a new profitable spread or significantly changed
    if (!existingSpread || this.isSignificantSpreadChange(existingSpread, spread)) {
      // Notify about the spread if it's profitable
      if (spread.netProfitPercentage > this.thresholds.spreadMinPercentage) {
        this.notifyAboutSpread(spread);
      }
    }
    
    this.spreads.set(key, spread);
  }
  
  /**
   * Determine if a spread has changed significantly from the previous value
   */
  private isSignificantSpreadChange(oldSpread: ExchangeSpread, newSpread: ExchangeSpread): boolean {
    const profitabilityChanged = 
      (oldSpread.netProfitPercentage <= 0 && newSpread.netProfitPercentage > 0) ||
      (oldSpread.netProfitPercentage > 0 && newSpread.netProfitPercentage <= 0);
      
    const spreadChangedSignificantly = 
      Math.abs(newSpread.spreadPercentage - oldSpread.spreadPercentage) > 0.5;
      
    return profitabilityChanged || spreadChangedSignificantly;
  }
  
  /**
   * Send a notification about a spread opportunity
   */
  private notifyAboutSpread(spread: ExchangeSpread): void {
    const title = 'Profitable Spread Detected';
    const message = `${spread.symbol}: ${spread.spreadPercentage.toFixed(2)}% spread between ${spread.baseExchange} and ${spread.targetExchange}. Net profit after fees: ${spread.netProfitPercentage.toFixed(2)}%`;
    
    notificationManager.notify(
      title,
      message,
      'arbitrage_opportunity',
      spread.netProfitPercentage > 3 ? 'high' : 'medium',
      'market_analysis'
    );
  }
  
  /**
   * Get all spreads, with optional filtering
   */
  public getSpreads(filter?: {
    minNetProfit?: number;
    symbol?: string;
    exchange?: string;
    activeOnly?: boolean;
  }): ExchangeSpread[] {
    let spreads = Array.from(this.spreads.values());
    
    // Apply filters if provided
    if (filter) {
      if (filter.minNetProfit !== undefined) {
        spreads = spreads.filter(spread => spread.netProfitPercentage >= filter.minNetProfit);
      }
      
      if (filter.symbol) {
        spreads = spreads.filter(spread => spread.symbol === filter.symbol);
      }
      
      if (filter.exchange) {
        spreads = spreads.filter(spread => 
          spread.baseExchange === filter.exchange || spread.targetExchange === filter.exchange
        );
      }
      
      if (filter.activeOnly) {
        spreads = spreads.filter(spread => spread.isActive);
      }
    }
    
    // Sort by net profit percentage descending
    return spreads.sort((a, b) => b.netProfitPercentage - a.netProfitPercentage);
  }
  
  /**
   * Update the notification thresholds
   */
  public updateThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
  
  /**
   * Get the current thresholds
   */
  public getThresholds(): typeof this.thresholds {
    return { ...this.thresholds };
  }
}

// Export singleton instance
export const marketAnalysisManager = new MarketAnalysisManager();
