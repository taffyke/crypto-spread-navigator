import { toast } from '@/hooks/use-toast';
import { notificationManager } from '@/lib/notifications/notificationSystem';

// Types
export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string; // Some exchanges like Coinbase require passphrase
}

export interface ExchangeConfig {
  id: string;
  name: string;
  url: string;
  logoUrl: string;
  supportsWebSocket: boolean;
  maker_fee: number;
  taker_fee: number;
  withdrawal_fee: Record<string, number>;
  supported_networks: Record<string, string[]>;
  api_rate_limit: number; // requests per minute
}

// Mock list of exchange configurations
export const EXCHANGE_CONFIGS: Record<string, ExchangeConfig> = {
  binance: {
    id: 'binance',
    name: 'Binance',
    url: 'https://api.binance.com',
    logoUrl: '/exchange-logos/binance.svg',
    supportsWebSocket: true,
    maker_fee: 0.1,
    taker_fee: 0.1,
    withdrawal_fee: {
      'BTC': 0.0005,
      'ETH': 0.005,
      'USDT': 1,
    },
    supported_networks: {
      'BTC': ['BTC'],
      'ETH': ['ETH', 'BSC', 'OPTIMISM', 'ARBITRUM'],
      'USDT': ['ETH', 'TRX', 'SOL', 'BSC', 'ARBITRUM', 'OPTIMISM'],
    },
    api_rate_limit: 1200,
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase',
    url: 'https://api.coinbase.com',
    logoUrl: '/exchange-logos/coinbase.svg',
    supportsWebSocket: true,
    maker_fee: 0.4,
    taker_fee: 0.6,
    withdrawal_fee: {
      'BTC': 0.0001,
      'ETH': 0.003,
      'USDT': 2,
    },
    supported_networks: {
      'BTC': ['BTC'],
      'ETH': ['ETH', 'ARBITRUM'],
      'USDT': ['ETH', 'TRX'],
    },
    api_rate_limit: 600,
  },
  // Add more exchanges here
};

// Cache implementation for API requests
class ApiCache {
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private ttl: number = 10 * 1000; // 10 seconds by default

  constructor(ttlMs?: number) {
    if (ttlMs) this.ttl = ttlMs;
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if cache is still valid
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear() {
    this.cache.clear();
  }

  setTTL(ttlMs: number) {
    this.ttl = ttlMs;
  }
}

// Create a default cache instance
export const apiCache = new ApiCache();

// Types for exchange API
export type ExchangeId = string;
export type Symbol = string;
export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderStatus = 'open' | 'closed' | 'canceled' | 'expired' | 'rejected';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK';
export type WebSocketTopic = 'ticker' | 'trades' | 'orderbook' | 'klines';

// Interface for ticker data
export interface Ticker {
  symbol: Symbol;
  exchange: ExchangeId;
  bid: number;
  ask: number;
  last: number;
  high: number;
  low: number;
  volume: number;
  timestamp: Date;
  change: number;
  changePercent: number;
}

// Interface for order book
export interface OrderBook {
  symbol: Symbol;
  exchange: ExchangeId;
  bids: [number, number][]; // [price, size]
  asks: [number, number][]; // [price, size]
  timestamp: Date;
}

// Interface for exchange order
export interface ExchangeOrder {
  id: string;
  exchangeOrderId: string;
  exchange: ExchangeId;
  symbol: Symbol;
  type: OrderType;
  side: OrderSide;
  price?: number;
  amount: number;
  filled: number;
  remaining: number;
  status: OrderStatus;
  timeInForce?: TimeInForce;
  createdAt: Date;
  updatedAt?: Date;
  cost?: number;
  fee?: {
    cost: number;
    currency: string;
    rate?: number;
  };
}

// Interface for exchange balance
export interface ExchangeBalance {
  currency: string;
  free: number;
  used: number;
  total: number;
}

// Interface for exchange info
export interface ExchangeInfo {
  id: ExchangeId;
  name: string;
  url: string;
  apiUrl: string;
  wsUrl?: string;
  fees: {
    maker: number;
    taker: number;
  };
  requiredCredentials: string[];
  symbols: Symbol[];
  timeframes: Record<string, string>;
  hasFetchTicker: boolean;
  hasFetchOrderBook: boolean;
  hasFetchBalance: boolean;
  hasFetchOrders: boolean;
  hasWebsocket: boolean;
}

// WebSocket connection manager
class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  
  constructor() {}
  
  /**
   * Create a WebSocket connection to an exchange
   */
  public connect(exchange: ExchangeId, topic: WebSocketTopic, symbol: Symbol): void {
    const key = this.getConnectionKey(exchange, topic, symbol);
    
    if (this.connections.has(key)) {
      return; // Already connected
    }
    
    // Get exchange websocket URL (this would come from a configuration)
    const wsUrl = this.getWebSocketUrl(exchange, topic, symbol);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(`WebSocket connected: ${key}`);
        this.connections.set(key, ws);
        
        // Subscribe to the topic
        const subscriptionMessage = this.getSubscriptionMessage(exchange, topic, symbol);
        if (subscriptionMessage) {
          ws.send(JSON.stringify(subscriptionMessage));
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handlers = this.messageHandlers.get(key) || [];
          
          for (const handler of handlers) {
            handler(data);
          }
        } catch (error) {
          console.error(`Error parsing WebSocket message:`, error);
        }
      };
      
      ws.onerror = (error) => {
        console.error(`WebSocket error for ${key}:`, error);
        notificationManager.notify(
          'WebSocket Error',
          `Connection error for ${exchange} ${topic} feed: ${error}`,
          'system',
          'medium',
          'system'
        );
      };
      
      ws.onclose = () => {
        console.log(`WebSocket closed: ${key}`);
        this.connections.delete(key);
      };
    } catch (error) {
      console.error(`Failed to establish WebSocket connection to ${exchange}:`, error);
      notificationManager.notify(
        'WebSocket Connection Failed',
        `Failed to connect to ${exchange} ${topic} feed`,
        'system',
        'medium',
        'system'
      );
    }
  }
  
  /**
   * Disconnect a WebSocket
   */
  public disconnect(exchange: ExchangeId, symbol: Symbol): void {
    // Find all connections for this exchange/symbol combination
    const connectionsToClose: string[] = [];
    
    for (const key of this.connections.keys()) {
      if (key.startsWith(`${exchange}:`) && key.endsWith(`:${symbol}`)) {
        connectionsToClose.push(key);
      }
    }
    
    // Close each connection
    for (const key of connectionsToClose) {
      const ws = this.connections.get(key);
      if (ws) {
        ws.close();
        this.connections.delete(key);
        this.messageHandlers.delete(key);
      }
    }
  }
  
  /**
   * Add a message handler for a WebSocket connection
   */
  public addMessageHandler(
    exchange: ExchangeId,
    topic: WebSocketTopic,
    symbol: Symbol,
    handler: (data: any) => void
  ): void {
    const key = this.getConnectionKey(exchange, topic, symbol);
    const handlers = this.messageHandlers.get(key) || [];
    handlers.push(handler);
    this.messageHandlers.set(key, handlers);
  }
  
  /**
   * Get a unique key for a WebSocket connection
   */
  private getConnectionKey(exchange: ExchangeId, topic: WebSocketTopic, symbol: Symbol): string {
    return `${exchange}:${topic}:${symbol}`;
  }
  
  /**
   * Get the WebSocket URL for an exchange
   */
  private getWebSocketUrl(exchange: ExchangeId, topic: WebSocketTopic, symbol: Symbol): string {
    // This would come from a configuration in a real implementation
    const baseUrls: Record<ExchangeId, string> = {
      binance: 'wss://stream.binance.com:9443/ws',
      coinbase: 'wss://ws-feed.pro.coinbase.com',
      kraken: 'wss://ws.kraken.com',
    };
    
    const baseUrl = baseUrls[exchange] || baseUrls.binance;
    
    // Format symbol for the specific exchange
    const formattedSymbol = this.formatSymbol(exchange, symbol);
    
    switch (exchange) {
      case 'binance':
        return `${baseUrl}/${formattedSymbol.toLowerCase()}@${topic}`;
      case 'coinbase':
        return baseUrl;
      case 'kraken':
        return baseUrl;
      default:
        return baseUrl;
    }
  }
  
  /**
   * Format a symbol for a specific exchange
   */
  private formatSymbol(exchange: ExchangeId, symbol: Symbol): string {
    const [base, quote] = symbol.split('/');
    
    switch (exchange) {
      case 'binance':
        return `${base}${quote}`;
      case 'coinbase':
        return `${base}-${quote}`;
      case 'kraken':
        return `${base}/${quote}`;
      default:
        return symbol;
    }
  }
  
  /**
   * Get the subscription message for an exchange
   */
  private getSubscriptionMessage(exchange: ExchangeId, topic: WebSocketTopic, symbol: Symbol): any {
    const formattedSymbol = this.formatSymbol(exchange, symbol);
    
    switch (exchange) {
      case 'binance':
        // Binance auto-subscribes based on the URL
        return null;
      case 'coinbase':
        return {
          type: 'subscribe',
          product_ids: [formattedSymbol],
          channels: [topic],
        };
      case 'kraken':
        return {
          name: 'subscribe',
          reqid: Date.now(),
          pair: [formattedSymbol],
          subscription: {
            name: topic,
          },
        };
      default:
        return null;
    }
  }
}

// Exchange API class
export class ExchangeApi {
  private exchange: ExchangeId;
  private apiKey?: string;
  private apiSecret?: string;
  private tickers: Map<Symbol, Ticker> = new Map();
  private orderBooks: Map<Symbol, OrderBook> = new Map();
  private orders: Map<string, ExchangeOrder> = new Map();
  private balances: Map<string, ExchangeBalance> = new Map();
  
  constructor(exchange: ExchangeId, apiKey?: string, apiSecret?: string) {
    this.exchange = exchange;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }
  
  /**
   * Initialize the API connection
   */
  public async initialize(): Promise<boolean> {
    try {
      // In a real implementation, this would:
      // 1. Validate API keys
      // 2. Fetch initial exchange information
      // 3. Set up recurring updates
      
      return true;
    } catch (error) {
      console.error(`Failed to initialize ${this.exchange} API:`, error);
      return false;
    }
  }
  
  /**
   * Subscribe to a ticker
   */
  public subscribeTicker(symbol: Symbol): void {
    wsManager.connect(this.exchange, 'ticker', symbol);
    
    wsManager.addMessageHandler(this.exchange, 'ticker', symbol, (data) => {
      const ticker = this.parseTicker(data, symbol);
      if (ticker) {
        this.tickers.set(symbol, ticker);
      }
    });
  }
  
  /**
   * Get ticker data
   */
  public getTicker(symbol: Symbol): Ticker | undefined {
    return this.tickers.get(symbol);
  }
  
  /**
   * Subscribe to an order book
   */
  public subscribeOrderBook(symbol: Symbol): void {
    wsManager.connect(this.exchange, 'orderbook', symbol);
    
    wsManager.addMessageHandler(this.exchange, 'orderbook', symbol, (data) => {
      const orderBook = this.parseOrderBook(data, symbol);
      if (orderBook) {
        this.orderBooks.set(symbol, orderBook);
      }
    });
  }
  
  /**
   * Get order book data
   */
  public getOrderBook(symbol: Symbol): OrderBook | undefined {
    return this.orderBooks.get(symbol);
  }
  
  /**
   * Place an order
   */
  public async placeOrder(
    symbol: Symbol,
    type: OrderType,
    side: OrderSide,
    amount: number,
    price?: number,
    params?: Record<string, any>
  ): Promise<ExchangeOrder> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('API credentials not configured');
    }
    
    // In a real implementation, this would call the exchange API
    // For this example, we'll simulate it
    
    const now = new Date();
    const id = crypto.randomUUID();
    
    const order: ExchangeOrder = {
      id,
      exchangeOrderId: `exchange-${id}`,
      exchange: this.exchange,
      symbol,
      type,
      side,
      price,
      amount,
      filled: 0,
      remaining: amount,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    
    this.orders.set(id, order);
    
    return order;
  }
  
  /**
   * Cancel an order
   */
  public async cancelOrder(orderId: string): Promise<boolean> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('API credentials not configured');
    }
    
    const order = this.orders.get(orderId);
    
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    // In a real implementation, this would call the exchange API
    // For this example, we'll simulate it
    
    order.status = 'canceled';
    order.updatedAt = new Date();
    
    this.orders.set(orderId, order);
    
    return true;
  }
  
  /**
   * Fetch account balances
   */
  public async fetchBalances(): Promise<Map<string, ExchangeBalance>> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('API credentials not configured');
    }
    
    // In a real implementation, this would call the exchange API
    // For this example, we'll simulate it
    
    // Simulate some balances
    this.balances.set('BTC', { currency: 'BTC', free: 0.1, used: 0, total: 0.1 });
    this.balances.set('ETH', { currency: 'ETH', free: 1.5, used: 0, total: 1.5 });
    this.balances.set('USDT', { currency: 'USDT', free: 10000, used: 0, total: 10000 });
    
    return this.balances;
  }
  
  /**
   * Get balance for a specific currency
   */
  public async getBalance(currency: string): Promise<ExchangeBalance | undefined> {
    if (this.balances.size === 0) {
      await this.fetchBalances();
    }
    
    return this.balances.get(currency);
  }
  
  /**
   * Parse ticker data from WebSocket
   */
  private parseTicker(data: any, symbol: Symbol): Ticker | null {
    try {
      // This would need to be adapted to each exchange's format
      // This is a simplified example
      
      switch (this.exchange) {
        case 'binance':
          if (data.e === '24hrTicker') {
            return {
              symbol,
              exchange: this.exchange,
              bid: parseFloat(data.b),
              ask: parseFloat(data.a),
              last: parseFloat(data.c),
              high: parseFloat(data.h),
              low: parseFloat(data.l),
              volume: parseFloat(data.v),
              timestamp: new Date(data.E),
              change: parseFloat(data.p),
              changePercent: parseFloat(data.P),
            };
          }
          break;
        
        case 'coinbase':
          if (data.type === 'ticker') {
            return {
              symbol,
              exchange: this.exchange,
              bid: parseFloat(data.best_bid),
              ask: parseFloat(data.best_ask),
              last: parseFloat(data.price),
              high: 0, // Not provided in ticker
              low: 0, // Not provided in ticker
              volume: parseFloat(data.volume_24h),
              timestamp: new Date(data.time),
              change: 0, // Not provided in ticker
              changePercent: 0, // Not provided in ticker
            };
          }
          break;
        
        // Add more exchanges as needed
      }
      
      return null;
    } catch (error) {
      console.error(`Error parsing ticker data for ${this.exchange}:`, error);
      return null;
    }
  }
  
  /**
   * Parse order book data from WebSocket
   */
  private parseOrderBook(data: any, symbol: Symbol): OrderBook | null {
    try {
      // This would need to be adapted to each exchange's format
      // This is a simplified example
      
      switch (this.exchange) {
        case 'binance':
          if (data.e === 'depthUpdate') {
            const orderBook = this.orderBooks.get(symbol) || {
              symbol,
              exchange: this.exchange,
              bids: [],
              asks: [],
              timestamp: new Date(),
            };
            
            // Update bids
            for (const bid of data.b) {
              this.updatePriceLevel(orderBook.bids, parseFloat(bid[0]), parseFloat(bid[1]));
            }
            
            // Update asks
            for (const ask of data.a) {
              this.updatePriceLevel(orderBook.asks, parseFloat(ask[0]), parseFloat(ask[1]));
            }
            
            orderBook.timestamp = new Date(data.E);
            
            return orderBook;
          }
          break;
        
        // Add more exchanges as needed
      }
      
      return null;
    } catch (error) {
      console.error(`Error parsing order book data for ${this.exchange}:`, error);
      return null;
    }
  }
  
  /**
   * Update a price level in the order book
   */
  private updatePriceLevel(levels: [number, number][], price: number, size: number): void {
    // Find the index of the price level
    const index = levels.findIndex(level => level[0] === price);
    
    if (size === 0) {
      // Remove the price level if size is 0
      if (index !== -1) {
        levels.splice(index, 1);
      }
    } else {
      // Update or add the price level
      if (index !== -1) {
        levels[index][1] = size;
      } else {
        levels.push([price, size]);
        
        // Sort bids descending, asks ascending
        levels.sort((a, b) => b[0] - a[0]);
      }
    }
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    // Disconnect WebSockets
    for (const symbol of this.tickers.keys()) {
      wsManager.disconnect(this.exchange, symbol);
    }
  }
}

// Factory function to create an exchange API
export function createExchangeApi(exchange: ExchangeId, apiKey?: string, apiSecret?: string): ExchangeApi {
  const api = new ExchangeApi(exchange, apiKey, apiSecret);
  api.initialize();
  return api;
}

// Export singleton WebSocket manager
export const wsManager = new WebSocketManager(); 