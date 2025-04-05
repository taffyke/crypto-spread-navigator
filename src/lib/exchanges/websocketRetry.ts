
import { toast } from '@/hooks/use-toast';

export interface WebSocketRetryConfig {
  maxRetries: number;
  initialBackoff: number;
  maxBackoff: number;
  jitter: boolean;
  connectionTimeout: number;
  pingInterval: number;
  reconnectCooldown: number;  // Added reconnect cooldown parameter
}

export const defaultRetryConfig: WebSocketRetryConfig = {
  maxRetries: 15,           // Increased from 5 to 15
  initialBackoff: 1000,
  maxBackoff: 30000,
  jitter: true,
  connectionTimeout: 15000,
  pingInterval: 15000,      // Reduced from 30s to 15s for more frequent health checks
  reconnectCooldown: 3000,  // New param to prevent connection flooding
};

export class WebSocketRetryManager {
  private static instance: WebSocketRetryManager;
  private retryCount: Map<string, number> = new Map();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private pingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private connectionTimers: Map<string, NodeJS.Timeout> = new Map();
  private lastReconnectTime: Map<string, number> = new Map(); // Track last reconnect attempt
  private config: WebSocketRetryConfig;
  private activeConnections: Map<string, WebSocket> = new Map();

  private constructor(config: WebSocketRetryConfig = defaultRetryConfig) {
    this.config = config;
  }

  public static getInstance(config?: WebSocketRetryConfig): WebSocketRetryManager {
    if (!WebSocketRetryManager.instance) {
      WebSocketRetryManager.instance = new WebSocketRetryManager(config);
    }
    return WebSocketRetryManager.instance;
  }

  public registerConnection(connectionKey: string, ws: WebSocket): void {
    this.activeConnections.set(connectionKey, ws);
    
    this.setConnectionTimeout(connectionKey);
    
    // Only set up ping interval when connection is open
    if (ws.readyState === WebSocket.OPEN) {
      this.setupPingInterval(connectionKey, ws);
    } else {
      // Set up event listener to establish ping when connection opens
      const openListener = () => {
        this.setupPingInterval(connectionKey, ws);
        ws.removeEventListener('open', openListener);
      };
      
      ws.addEventListener('open', openListener);
    }
  }
  
  private setConnectionTimeout(connectionKey: string): void {
    this.clearConnectionTimeout(connectionKey);
    
    const timer = setTimeout(() => {
      const ws = this.activeConnections.get(connectionKey);
      
      if (ws && ws.readyState === WebSocket.CONNECTING) {
        console.warn(`Connection to ${connectionKey} timed out after ${this.config.connectionTimeout}ms`);
        ws.close();
        this.activeConnections.delete(connectionKey);
        
        // Show toast for connection timeout
        toast({
          title: "Connection Timeout",
          description: `Connection to ${connectionKey.replace('ws_', '')} timed out. Attempting to reconnect...`,
          variant: "destructive",
        });
      }
    }, this.config.connectionTimeout);
    
    this.connectionTimers.set(connectionKey, timer);
  }
  
  private clearConnectionTimeout(connectionKey: string): void {
    const timer = this.connectionTimers.get(connectionKey);
    if (timer) {
      clearTimeout(timer);
      this.connectionTimers.delete(connectionKey);
    }
  }
  
  private setupPingInterval(connectionKey: string, ws: WebSocket): void {
    this.clearPingInterval(connectionKey);
    
    if (ws.readyState === WebSocket.OPEN) {
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
          } catch (error) {
            console.error(`Error sending ping to ${connectionKey}:`, error);
            this.clearPingInterval(connectionKey);
            
            if (ws.readyState === WebSocket.OPEN) {
              ws.close();
            }
          }
        } else {
          this.clearPingInterval(connectionKey);
        }
      }, this.config.pingInterval);
      
      this.pingIntervals.set(connectionKey, interval);
    }
  }
  
  private clearPingInterval(connectionKey: string): void {
    const interval = this.pingIntervals.get(connectionKey);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(connectionKey);
    }
  }

  public getRetryCount(connectionKey: string): number {
    return this.retryCount.get(connectionKey) || 0;
  }

  public resetRetryCount(connectionKey: string): void {
    this.retryCount.delete(connectionKey);
    this.clearRetryTimeout(connectionKey);
    this.clearPingInterval(connectionKey);
    this.clearConnectionTimeout(connectionKey);
    
    if (this.activeConnections.has(connectionKey)) {
      const ws = this.activeConnections.get(connectionKey);
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
      this.activeConnections.delete(connectionKey);
    }
  }

  public handleConnectionFailure(
    connectionKey: string,
    reconnectCallback: () => void
  ): boolean {
    const currentRetries = this.retryCount.get(connectionKey) || 0;
    const now = Date.now();
    const lastReconnect = this.lastReconnectTime.get(connectionKey) || 0;
    
    // Apply reconnect cooldown to prevent connection flooding
    if (now - lastReconnect < this.config.reconnectCooldown) {
      console.log(`Reconnect attempt for ${connectionKey} throttled (in cooldown period)`);
      
      // Schedule reconnect after cooldown expires
      const timeoutId = setTimeout(() => {
        this.handleConnectionFailure(connectionKey, reconnectCallback);
      }, this.config.reconnectCooldown);
      
      this.retryTimeouts.set(connectionKey, timeoutId);
      return true;
    }
    
    if (currentRetries >= this.config.maxRetries) {
      console.warn(`WebSocket connection to ${connectionKey} failed after ${currentRetries} retries.`);
      toast({
        title: "WebSocket Connection Failed",
        description: `Connection to ${connectionKey.replace('ws_', '')} failed after multiple attempts. Using API fallback data.`,
        variant: "destructive",
      });
      
      this.clearPingInterval(connectionKey);
      this.clearConnectionTimeout(connectionKey);
      
      return false;
    }
    
    const nextRetryCount = currentRetries + 1;
    this.retryCount.set(connectionKey, nextRetryCount);
    this.lastReconnectTime.set(connectionKey, now);
    
    // Use exponential backoff with jitter
    const backoff = Math.min(
      this.config.initialBackoff * Math.pow(1.5, currentRetries),
      this.config.maxBackoff
    );
    
    const jitter = this.config.jitter ? Math.random() * 0.5 + 0.5 : 1;
    const delay = Math.floor(backoff * jitter);
    
    console.log(`WebSocket retry ${nextRetryCount}/${this.config.maxRetries} for ${connectionKey} in ${delay}ms`);
    
    this.clearRetryTimeout(connectionKey);
    
    const timeoutId = setTimeout(() => {
      console.log(`Attempting to reconnect WebSocket: ${connectionKey}`);
      reconnectCallback();
    }, delay);
    
    this.retryTimeouts.set(connectionKey, timeoutId);
    
    return true;
  }

  private clearRetryTimeout(connectionKey: string): void {
    const timeoutId = this.retryTimeouts.get(connectionKey);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.retryTimeouts.delete(connectionKey);
    }
  }

  public updateConfig(config: Partial<WebSocketRetryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): WebSocketRetryConfig {
    return { ...this.config };
  }

  public cleanup(): void {
    this.activeConnections.forEach((ws, key) => {
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      } catch (e) {
        console.error(`Error closing connection ${key}:`, e);
      }
    });
    
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.pingIntervals.forEach(interval => clearInterval(interval));
    this.connectionTimers.forEach(timer => clearTimeout(timer));
    
    this.activeConnections.clear();
    this.retryTimeouts.clear();
    this.pingIntervals.clear();
    this.connectionTimers.clear();
    this.retryCount.clear();
    this.lastReconnectTime.clear();
  }
}

export const websocketRetryManager = WebSocketRetryManager.getInstance();
