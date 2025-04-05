
import { toast } from '@/hooks/use-toast';

export interface WebSocketRetryConfig {
  maxRetries: number;
  initialBackoff: number;
  maxBackoff: number;
  jitter: boolean;
}

export const defaultRetryConfig: WebSocketRetryConfig = {
  maxRetries: 5,
  initialBackoff: 1000, // 1 second
  maxBackoff: 30000, // 30 seconds
  jitter: true,
};

export class WebSocketRetryManager {
  private static instance: WebSocketRetryManager;
  private retryCount: Map<string, number> = new Map();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private config: WebSocketRetryConfig;

  private constructor(config: WebSocketRetryConfig = defaultRetryConfig) {
    this.config = config;
  }

  public static getInstance(config?: WebSocketRetryConfig): WebSocketRetryManager {
    if (!WebSocketRetryManager.instance) {
      WebSocketRetryManager.instance = new WebSocketRetryManager(config);
    }
    return WebSocketRetryManager.instance;
  }

  /**
   * Get the current retry count for a connection
   */
  public getRetryCount(connectionKey: string): number {
    return this.retryCount.get(connectionKey) || 0;
  }

  /**
   * Reset the retry count for a connection
   */
  public resetRetryCount(connectionKey: string): void {
    this.retryCount.delete(connectionKey);
    this.clearRetryTimeout(connectionKey);
  }

  /**
   * Handle connection failure and determine if retry should happen
   */
  public handleConnectionFailure(
    connectionKey: string,
    reconnectCallback: () => void
  ): boolean {
    const currentRetries = this.retryCount.get(connectionKey) || 0;
    
    if (currentRetries >= this.config.maxRetries) {
      console.warn(`WebSocket connection to ${connectionKey} failed after ${currentRetries} retries.`);
      toast({
        title: "WebSocket Connection Failed",
        description: `Connection failed after multiple attempts. Using API fallback data.`,
        variant: "destructive",
      });
      return false;
    }
    
    const nextRetryCount = currentRetries + 1;
    this.retryCount.set(connectionKey, nextRetryCount);
    
    // Calculate backoff with exponential increase
    const backoff = Math.min(
      this.config.initialBackoff * Math.pow(2, currentRetries),
      this.config.maxBackoff
    );
    
    // Add jitter to prevent thundering herd
    const jitter = this.config.jitter ? Math.random() * 0.5 + 0.5 : 1;
    const delay = Math.floor(backoff * jitter);
    
    console.log(`WebSocket retry ${nextRetryCount}/${this.config.maxRetries} for ${connectionKey} in ${delay}ms`);
    
    // Clear any existing timeout
    this.clearRetryTimeout(connectionKey);
    
    // Set timeout for retry
    const timeoutId = setTimeout(() => {
      console.log(`Attempting to reconnect WebSocket: ${connectionKey}`);
      reconnectCallback();
    }, delay);
    
    this.retryTimeouts.set(connectionKey, timeoutId);
    
    return true;
  }

  /**
   * Clear a retry timeout if it exists
   */
  private clearRetryTimeout(connectionKey: string): void {
    const timeoutId = this.retryTimeouts.get(connectionKey);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.retryTimeouts.delete(connectionKey);
    }
  }

  /**
   * Update the retry configuration
   */
  public updateConfig(config: Partial<WebSocketRetryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get the current config
   */
  public getConfig(): WebSocketRetryConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const websocketRetryManager = WebSocketRetryManager.getInstance();
