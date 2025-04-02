import { notificationManager } from '@/lib/notifications/notificationSystem';
import { riskManager, Position } from '@/lib/risk/riskManager';
import { marketAnalysisManager, ExchangeSpread } from '@/lib/analytics/marketAnalysis';

// Types for trading bot
export type TradingBotStatus = 'idle' | 'running' | 'paused' | 'error';
export type TradingStrategyType = 
  | 'arbitrage' 
  | 'grid' 
  | 'dca'
  | 'mean_reversion' 
  | 'trend_following'
  | 'custom';

export type TradingInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';
export type OrderType = 'market' | 'limit' | 'stop_limit' | 'trailing_stop';

// Interface for trading strategy
export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  type: TradingStrategyType;
  parameters: Record<string, any>;
  assets: string[];
  exchanges: string[];
  timeframes: TradingInterval[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
  performance?: {
    totalTrades: number;
    winRate: number;
    profitLoss: number;
    profitLossPercentage: number;
    maxDrawdown: number;
    sharpeRatio?: number;
  };
  riskProfileId: string;
}

// Interface for a trading order
export interface TradingOrder {
  id: string;
  botId: string;
  strategyId: string;
  symbol: string;
  exchange: string;
  type: OrderType;
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'open' | 'filled' | 'partially_filled' | 'canceled' | 'rejected';
  createdAt: Date;
  executedAt?: Date;
  closedAt?: Date;
  fees?: number;
  averageFilledPrice?: number;
  filledQuantity?: number;
  reason?: string;
  parentOrderId?: string;
  childOrders?: string[];
  metadata?: Record<string, any>;
}

// Interface for a trading bot
export interface TradingBot {
  id: string;
  name: string;
  description: string;
  status: TradingBotStatus;
  strategies: string[]; // Array of strategy IDs
  exchanges: string[]; // Array of exchange IDs
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  stoppedAt?: Date;
  totalProfit: number;
  totalProfitPercentage: number;
  openPositions: string[]; // Array of position IDs
  closedPositions: string[]; // Array of position IDs
  settings: {
    maxConcurrentTrades: number;
    maxDrawdown: number;
    tradingCapital: number;
    enabledTimeframes: TradingInterval[];
    autoRestart: boolean;
    executionInterval: number; // in milliseconds
  };
  logs: TradingBotLog[];
}

// Interface for bot log
export interface TradingBotLog {
  id: string;
  botId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

// Interface for strategy execution result
export interface StrategyExecutionResult {
  success: boolean;
  message: string;
  signals: TradingSignal[];
  orders: TradingOrder[];
  errors?: string[];
  metadata?: Record<string, any>;
}

// Interface for trading signal
export interface TradingSignal {
  id: string;
  strategyId: string;
  symbol: string;
  exchange: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-100
  price: number;
  timestamp: Date;
  timeframe: TradingInterval;
  reason: string;
  indicators?: Record<string, any>;
  executed: boolean;
  resultingOrderId?: string;
}

// Class for managing trading bots
export class TradingBotManager {
  private bots: Map<string, TradingBot> = new Map();
  private strategies: Map<string, TradingStrategy> = new Map();
  private orders: Map<string, TradingOrder> = new Map();
  private signals: Map<string, TradingSignal> = new Map();
  private intervalIds: Map<string, number> = new Map();
  
  constructor() {
    // Initialize with some example strategies
    this.initializeDefaultStrategies();
  }
  
  /**
   * Initialize default strategies
   */
  private initializeDefaultStrategies(): void {
    const arbitrageStrategy: TradingStrategy = {
      id: crypto.randomUUID(),
      name: 'Basic Arbitrage Strategy',
      description: 'Exploits price differences between exchanges',
      type: 'arbitrage',
      parameters: {
        minProfitPercentage: 1.5,
        minVolume: 1000,
        maxAgeSeconds: 300,
        orderType: 'limit',
        positionSizePercentage: 2,
      },
      assets: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
      exchanges: ['binance', 'coinbase', 'kraken'],
      timeframes: ['1m', '5m'],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      performance: {
        totalTrades: 0,
        winRate: 0,
        profitLoss: 0,
        profitLossPercentage: 0,
        maxDrawdown: 0,
      },
      riskProfileId: '', // Will be set to default risk profile ID
    };
    
    // Get default risk profile ID
    arbitrageStrategy.riskProfileId = riskManager.getDefaultRiskProfile().id;
    
    this.strategies.set(arbitrageStrategy.id, arbitrageStrategy);
  }
  
  /**
   * Create a new trading bot
   */
  public createBot(
    name: string,
    description: string,
    strategyIds: string[],
    exchangeIds: string[],
    settings?: Partial<TradingBot['settings']>
  ): string {
    // Validate that all strategies exist
    for (const strategyId of strategyIds) {
      if (!this.strategies.has(strategyId)) {
        throw new Error(`Strategy with ID ${strategyId} not found`);
      }
    }
    
    const id = crypto.randomUUID();
    const now = new Date();
    
    const defaultSettings: TradingBot['settings'] = {
      maxConcurrentTrades: 3,
      maxDrawdown: 5, // 5% max drawdown
      tradingCapital: 10000, // $10,000 trading capital
      enabledTimeframes: ['1m', '5m', '15m', '1h'],
      autoRestart: true,
      executionInterval: 60000, // 1 minute execution interval
    };
    
    const bot: TradingBot = {
      id,
      name,
      description,
      status: 'idle',
      strategies: strategyIds,
      exchanges: exchangeIds,
      createdAt: now,
      updatedAt: now,
      totalProfit: 0,
      totalProfitPercentage: 0,
      openPositions: [],
      closedPositions: [],
      settings: { ...defaultSettings, ...settings },
      logs: [],
    };
    
    this.bots.set(id, bot);
    
    // Log creation
    this.logBotActivity(id, 'info', `Bot "${name}" created with ${strategyIds.length} strategies and ${exchangeIds.length} exchanges`);
    
    return id;
  }
  
  /**
   * Start a trading bot
   */
  public startBot(botId: string): boolean {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      throw new Error(`Bot with ID ${botId} not found`);
    }
    
    if (bot.status === 'running') {
      // Already running
    return true;
  }
  
    try {
      // Update bot status
      bot.status = 'running';
      bot.startedAt = new Date();
      bot.updatedAt = new Date();
      
      // Set up execution interval
      const intervalId = setInterval(() => {
        this.executeBotCycle(botId);
      }, bot.settings.executionInterval) as unknown as number;
      
      this.intervalIds.set(botId, intervalId);
      
      // Log start
      this.logBotActivity(botId, 'info', `Bot "${bot.name}" started`);
      
      // Send notification
      notificationManager.notify(
        'Trading Bot Started',
        `Bot "${bot.name}" has been started and is now actively trading.`,
        'trading_bot',
        'medium',
        'trading_bot'
      );
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Update bot status to error
      bot.status = 'error';
      bot.updatedAt = new Date();
      
      // Log error
      this.logBotActivity(botId, 'error', `Failed to start bot: ${errorMessage}`);
      
      return false;
    }
  }
  
  /**
   * Stop a trading bot
   */
  public stopBot(botId: string): boolean {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      throw new Error(`Bot with ID ${botId} not found`);
    }
    
    if (bot.status !== 'running') {
      // Not running
      return true;
    }
    
    try {
      // Clear the execution interval
      const intervalId = this.intervalIds.get(botId);
      if (intervalId) {
        clearInterval(intervalId);
        this.intervalIds.delete(botId);
      }
      
      // Update bot status
      bot.status = 'idle';
      bot.stoppedAt = new Date();
      bot.updatedAt = new Date();
      
      // Log stop
      this.logBotActivity(botId, 'info', `Bot "${bot.name}" stopped`);
      
      // Send notification
      notificationManager.notify(
        'Trading Bot Stopped',
        `Bot "${bot.name}" has been stopped and is no longer trading.`,
        'trading_bot',
        'medium',
        'trading_bot'
      );
      
      return true;
        } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log error
      this.logBotActivity(botId, 'error', `Failed to stop bot: ${errorMessage}`);
      
      return false;
    }
  }
  
  /**
   * Pause a trading bot
   */
  public pauseBot(botId: string): boolean {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      throw new Error(`Bot with ID ${botId} not found`);
    }
    
    if (bot.status !== 'running') {
      // Not running
      return true;
    }
    
    try {
      // Clear the execution interval
      const intervalId = this.intervalIds.get(botId);
      if (intervalId) {
        clearInterval(intervalId);
        this.intervalIds.delete(botId);
      }
      
      // Update bot status
      bot.status = 'paused';
      bot.updatedAt = new Date();
      
      // Log pause
      this.logBotActivity(botId, 'info', `Bot "${bot.name}" paused`);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log error
      this.logBotActivity(botId, 'error', `Failed to pause bot: ${errorMessage}`);
      
      return false;
    }
  }
  
  /**
   * Execute a single bot cycle
   */
  private async executeBotCycle(botId: string): Promise<void> {
    const bot = this.bots.get(botId);
    
    if (!bot || bot.status !== 'running') {
      return;
    }
    
    try {
      this.logBotActivity(botId, 'debug', `Starting execution cycle`);
      
      // Get profitable spreads from market analysis
      const spreads = marketAnalysisManager.getSpreads({
        minNetProfit: 1.0,
        activeOnly: true,
      });
      
      if (spreads.length > 0) {
        // Process arbitrage opportunities
        await this.processArbitrageOpportunities(botId, spreads);
      }
      
      this.logBotActivity(botId, 'debug', `Completed execution cycle`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log error
      this.logBotActivity(botId, 'error', `Error during execution cycle: ${errorMessage}`);
    }
  }
  
  /**
   * Process arbitrage opportunities
   */
  private async processArbitrageOpportunities(botId: string, spreads: ExchangeSpread[]): Promise<void> {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      return;
    }
    
    // Get arbitrage strategies
    const arbitrageStrategies = bot.strategies
      .map(id => this.strategies.get(id))
      .filter(strategy => strategy?.type === 'arbitrage' && strategy.enabled) as TradingStrategy[];
    
    if (arbitrageStrategies.length === 0) {
      return;
    }
    
    // For each strategy, check if any spreads meet the criteria
    for (const strategy of arbitrageStrategies) {
      const minProfitPercentage = strategy.parameters.minProfitPercentage || 1.5;
      const minVolume = strategy.parameters.minVolume || 1000;
      
      // Filter spreads that meet the strategy criteria
      const eligibleSpreads = spreads.filter(spread => 
        spread.netProfitPercentage >= minProfitPercentage &&
        spread.profitableVolume >= minVolume &&
        strategy.assets.includes(spread.symbol) &&
        strategy.exchanges.includes(spread.baseExchange) &&
        strategy.exchanges.includes(spread.targetExchange)
      );
      
      if (eligibleSpreads.length === 0) {
        continue;
      }
      
      // Log found opportunities
      this.logBotActivity(
        botId,
        'info',
        `Found ${eligibleSpreads.length} arbitrage opportunities for strategy "${strategy.name}"`,
        { spreads: eligibleSpreads.map(s => ({ 
          symbol: s.symbol, 
          baseExchange: s.baseExchange, 
          targetExchange: s.targetExchange,
          profit: s.netProfitPercentage
        }))}
      );
      
      // Create signals for these opportunities
      for (const spread of eligibleSpreads) {
        // Generate a unique ID for this signal
        const signalId = crypto.randomUUID();
        
        // Create the signal
        const signal: TradingSignal = {
          id: signalId,
          strategyId: strategy.id,
          symbol: spread.symbol,
          exchange: `${spread.baseExchange}-${spread.targetExchange}`, // Composite exchange ID
          action: 'buy', // For arbitrage, we're always "buying" the opportunity
          confidence: Math.min(spread.netProfitPercentage * 10, 95), // Higher profit = higher confidence
          price: spread.basePrice, // Base price is the lower of the two
          timestamp: new Date(),
          timeframe: '5m', // Default timeframe for arbitrage
          reason: `${spread.netProfitPercentage.toFixed(2)}% profit opportunity between ${spread.baseExchange} and ${spread.targetExchange}`,
          executed: false,
        };
        
        this.signals.set(signalId, signal);
        
        // For real implementation, we would create orders here
        // and track the position through the risk manager
        
        // Send a notification
        notificationManager.notify(
          'Arbitrage Opportunity',
          `Bot "${bot.name}" detected ${spread.netProfitPercentage.toFixed(2)}% arbitrage opportunity for ${spread.symbol} between ${spread.baseExchange} and ${spread.targetExchange}`,
          'arbitrage_opportunity',
          spread.netProfitPercentage > 3 ? 'high' : 'medium',
          'trading_bot'
        );
      }
    }
  }
  
  /**
   * Log bot activity
   */
  private logBotActivity(
    botId: string,
    level: TradingBotLog['level'],
    message: string,
    metadata?: Record<string, any>
  ): void {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      return;
    }
    
    const log: TradingBotLog = {
      id: crypto.randomUUID(),
      botId,
      timestamp: new Date(),
      level,
      message,
      metadata
    };
    
    // Add to bot logs, keeping only the last 1000 entries
    bot.logs.push(log);
    if (bot.logs.length > 1000) {
      bot.logs = bot.logs.slice(-1000);
    }
    
    // For critical errors, send a notification
    if (level === 'error') {
      notificationManager.notify(
        'Trading Bot Error',
        `Bot "${bot.name}" encountered an error: ${message}`,
        'trading_bot',
        'high',
        'trading_bot'
      );
    }
  }
  
  /**
   * Get bot logs
   */
  public getBotLogs(
    botId: string,
    filter?: {
      level?: TradingBotLog['level'];
      startTime?: Date;
      endTime?: Date;
      limit?: number;
    }
  ): TradingBotLog[] {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      throw new Error(`Bot with ID ${botId} not found`);
    }
    
    let logs = [...bot.logs];
    
    // Apply filters
    if (filter) {
      if (filter.level) {
        logs = logs.filter(log => log.level === filter.level);
      }
      
      if (filter.startTime) {
        logs = logs.filter(log => log.timestamp >= filter.startTime);
      }
      
      if (filter.endTime) {
        logs = logs.filter(log => log.timestamp <= filter.endTime);
      }
      
      // Sort by timestamp, newest first
      logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Apply limit if specified
      if (filter.limit && filter.limit > 0) {
        logs = logs.slice(0, filter.limit);
      }
    }
    
    return logs;
  }
  
  /**
   * Get trading bot by ID
   */
  public getBot(botId: string): TradingBot | undefined {
    return this.bots.get(botId);
  }
  
  /**
   * Get all trading bots
   */
  public getAllBots(): TradingBot[] {
    return Array.from(this.bots.values());
  }
  
  /**
   * Add or update a trading strategy
   */
  public addOrUpdateStrategy(strategy: TradingStrategy): string {
    if (!strategy.id) {
      strategy.id = crypto.randomUUID();
      strategy.createdAt = new Date();
    }
    
    strategy.updatedAt = new Date();
    this.strategies.set(strategy.id, strategy);
    
    return strategy.id;
  }
  
  /**
   * Get a trading strategy by ID
   */
  public getStrategy(strategyId: string): TradingStrategy | undefined {
    return this.strategies.get(strategyId);
  }
  
  /**
   * Get all trading strategies
   */
  public getAllStrategies(): TradingStrategy[] {
    return Array.from(this.strategies.values());
  }
  
  /**
   * Delete a trading strategy
   */
  public deleteStrategy(strategyId: string): boolean {
    // Check if any bots are using this strategy
    for (const bot of this.bots.values()) {
      if (bot.strategies.includes(strategyId)) {
        throw new Error(`Cannot delete strategy because it is used by bot "${bot.name}"`);
      }
    }
    
    return this.strategies.delete(strategyId);
  }
  
  /**
   * Update bot settings
   */
  public updateBotSettings(botId: string, settings: Partial<TradingBot['settings']>): boolean {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      throw new Error(`Bot with ID ${botId} not found`);
    }
    
    // Update settings
    bot.settings = { ...bot.settings, ...settings };
    bot.updatedAt = new Date();
    
    // If the bot is running and execution interval changed, restart the interval
    if (bot.status === 'running' && settings.executionInterval && this.intervalIds.has(botId)) {
      const intervalId = this.intervalIds.get(botId);
      if (intervalId) {
        clearInterval(intervalId);
        
        const newIntervalId = setInterval(() => {
          this.executeBotCycle(botId);
        }, bot.settings.executionInterval) as unknown as number;
        
        this.intervalIds.set(botId, newIntervalId);
      }
    }
    
    this.logBotActivity(botId, 'info', `Bot settings updated`);
    
    return true;
  }
}

// Export singleton instance
export const tradingBotManager = new TradingBotManager(); 