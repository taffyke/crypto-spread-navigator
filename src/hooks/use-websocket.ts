
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TickerData } from '@/lib/api/cryptoDataApi';
import { WebSocketRetryManager } from '@/lib/exchanges/websocketRetry';
import { EXCHANGE_CONFIGS } from '@/lib/exchanges/exchangeApi';
import { fetchExchangeTickerData } from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';

// Mapping of exchange IDs to their WebSocket endpoints for ticker data
const EXCHANGE_WS_ENDPOINTS: Record<string, string> = {
  binance: 'wss://stream.binance.com:9443/ws',
  bitget: 'wss://ws.bitget.com/spot/v1/stream',
  bybit: 'wss://stream.bybit.com/v5/public/spot',
  kucoin: 'wss://push1.kucoin.com/endpoint',  // Requires token from REST API
  gate_io: 'wss://api.gateio.ws/ws/v4/',
  bitfinex: 'wss://api-pub.bitfinex.com/ws/2',
  gemini: 'wss://api.gemini.com/v1/marketdata',
  coinbase: 'wss://ws-feed.exchange.coinbase.com',
  kraken: 'wss://ws.kraken.com',
  poloniex: 'wss://ws.poloniex.com/ws',
  okx: 'wss://ws.okx.com:8443/ws/v5/public',
  ascendex: 'wss://ascendex.com/1/api/pro/v1/stream',
  bitrue: 'wss://ws.bitrue.com/kline-api/ws',
  htx: 'wss://api.huobi.pro/ws',  // HTX was formerly Huobi
  mexc_global: 'wss://wbs.mexc.com/ws',
};

// Enhanced version of the WebSocket hook with better error handling and recovery
export function useEnhancedWebSocket(
  exchangeIds: string[],
  symbolsInput: string,
  enabled: boolean = true
) {
  const [data, setData] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const wsRefs = useRef<Record<string, WebSocket | null>>({});
  const reconnectTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const pingTimestampsRef = useRef<Record<string, number>>({});
  const pongReceivedRef = useRef<Record<string, boolean>>({});
  
  // Parse symbols input - could be a single symbol or comma-separated list
  const symbols = useMemo(() => {
    return symbolsInput.split(',').map(s => s.trim()).filter(Boolean);
  }, [symbolsInput]);
  
  // Default to BTC/USDT if no symbols provided
  const primarySymbol = symbols.length > 0 ? symbols[0] : 'BTC/USDT';
  
  // Use WebSocketRetryManager for better retry logic
  const wsRetryManager = useRef(WebSocketRetryManager.getInstance());
  
  // Function to get exchange-specific subscription message
  const getSubscriptionMessage = useCallback((exchange: string, symbol: string) => {
    const formattedSymbol = symbol.replace('/', '').toLowerCase(); // Format: btcusdt
    
    switch (exchange) {
      case 'binance':
        return JSON.stringify({
          method: 'SUBSCRIBE',
          params: [`${formattedSymbol}@ticker`],
          id: Date.now()
        });
      case 'bitget':
        return JSON.stringify({
          op: 'subscribe',
          args: [{
            instType: 'sp',
            channel: 'ticker',
            instId: formattedSymbol.toUpperCase()
          }]
        });
      case 'bybit':
        return JSON.stringify({
          op: 'subscribe',
          args: [`tickers.${formattedSymbol.toUpperCase()}`]
        });
      case 'kucoin':
        // KuCoin requires a token from REST API first, this is simplified
        return JSON.stringify({
          id: Date.now(),
          type: 'subscribe',
          topic: `/market/ticker:${formattedSymbol.toUpperCase()}`,
          privateChannel: false,
          response: true
        });
      case 'gate_io':
        return JSON.stringify({
          time: Math.floor(Date.now() / 1000),
          channel: 'spot.tickers',
          event: 'subscribe',
          payload: [formattedSymbol.toUpperCase()]
        });
      case 'bitfinex':
        // Bitfinex uses a different format - send array for ticker subscription
        return JSON.stringify({
          event: 'subscribe',
          channel: 'ticker',
          symbol: `t${formattedSymbol.toUpperCase()}`
        });
      case 'coinbase':
        return JSON.stringify({
          type: 'subscribe',
          product_ids: [formattedSymbol.replace('/', '-').toUpperCase()],
          channels: ['ticker']
        });
      case 'kraken':
        return JSON.stringify({
          name: 'subscribe',
          reqid: Date.now(),
          pair: [symbol.replace('/', '/').toUpperCase()],
          subscription: { name: 'ticker' }
        });
      // Add more exchange-specific subscription formats as needed
      default:
        // Generic subscription format as fallback
        return JSON.stringify({
          method: 'subscribe',
          params: [formattedSymbol, 'ticker'],
          id: Date.now()
        });
    }
  }, []);
  
  // Helper function to send a heartbeat/ping to the server
  const sendPing = useCallback((exchange: string, ws: WebSocket) => {
    try {
      if (ws.readyState !== WebSocket.OPEN) return;
      
      const timestamp = Date.now();
      pingTimestampsRef.current[exchange] = timestamp;
      pongReceivedRef.current[exchange] = false;
      
      // Exchange-specific ping formats
      switch (exchange) {
        case 'binance':
          ws.send(JSON.stringify({ method: 'ping' }));
          break;
        case 'bitget':
          ws.send(JSON.stringify({ op: 'ping' }));
          break;
        case 'bybit':
          ws.send(JSON.stringify({ op: 'ping' }));
          break;
        case 'kucoin':
          ws.send(JSON.stringify({ id: timestamp, type: 'ping' }));
          break;
        case 'kraken':
          ws.send(JSON.stringify({ name: 'ping', reqid: timestamp }));
          break;
        default:
          // Generic ping for other exchanges
          ws.send(JSON.stringify({ op: 'ping', timestamp }));
          break;
      }
      
      // Set a timeout to check if we received a pong
      setTimeout(() => {
        if (!pongReceivedRef.current[exchange] && 
            wsRefs.current[exchange]?.readyState === WebSocket.OPEN) {
          console.warn(`No pong received from ${exchange} within timeout. Reconnecting...`);
          reconnectWebSocket(exchange);
        }
      }, 5000); // 5 second timeout for pong response
    } catch (error) {
      console.error(`Error sending ping to ${exchange}:`, error);
    }
  }, []);
  
  // Function to parse exchange-specific ticker data
  const parseTickerData = useCallback((exchange: string, data: any, symbol: string) => {
    try {
      let result: TickerData | null = null;
      const formattedSymbol = symbol.replace('/', '').toLowerCase();
      
      // Check if this is a pong response
      if (isExchangePongResponse(exchange, data)) {
        pongReceivedRef.current[exchange] = true;
        return null; // Don't process pong messages as ticker data
      }
      
      switch (exchange) {
        case 'binance':
          if (data.data && data.stream && data.stream.includes('@ticker')) {
            const tickerData = data.data;
            result = {
              symbol: symbol,
              price: parseFloat(tickerData.c),
              bidPrice: parseFloat(tickerData.b),
              askPrice: parseFloat(tickerData.a),
              volume: parseFloat(tickerData.v),
              timestamp: Date.now(),
              exchange,
              high24h: parseFloat(tickerData.h),
              low24h: parseFloat(tickerData.l),
              change24h: parseFloat(tickerData.p),
              changePercent24h: parseFloat(tickerData.P)
            };
          }
          break;
        case 'bitget':
          if (data.data && data.arg && data.arg.channel === 'ticker') {
            const tickerData = data.data;
            result = {
              symbol: symbol,
              price: parseFloat(tickerData.last),
              bidPrice: parseFloat(tickerData.bestBid),
              askPrice: parseFloat(tickerData.bestAsk),
              volume: parseFloat(tickerData.volume24h),
              timestamp: Date.now(),
              exchange,
              high24h: parseFloat(tickerData.high24h),
              low24h: parseFloat(tickerData.low24h),
              change24h: parseFloat(tickerData.priceChangeAmount),
              changePercent24h: parseFloat(tickerData.priceChangePercent)
            };
          }
          break;
        // Add more exchange-specific parsers as needed
      }
      
      return result;
    } catch (error) {
      console.error(`Error parsing ${exchange} ticker data:`, error);
      return null;
    }
  }, []);

  // Helper function to check if a response is a pong
  const isExchangePongResponse = useCallback((exchange: string, data: any): boolean => {
    try {
      if (typeof data !== 'object') return false;
      
      // Exchange-specific pong detection
      switch (exchange) {
        case 'binance':
          return data.result === 'pong' || data.id === 'pong';
        case 'bitget':
          return data.op === 'pong';
        case 'bybit':
          return data.op === 'pong' || data.ret_msg === 'pong';
        case 'kucoin':
          return data.type === 'pong';
        case 'kraken':
          return data.name === 'pong';
        default:
          // Generic pong detection
          return data.pong !== undefined || 
                 data.op === 'pong' || 
                 data.type === 'pong' || 
                 data.event === 'pong';
      }
    } catch {
      return false;
    }
  }, []);

  const fetchAPITickerFallback = useCallback(async (exchange: string, symbol: string) => {
    try {
      return await fetchExchangeTickerData(exchange, symbol);
    } catch (error) {
      console.error(`API fallback failed for ${exchange} ${symbol}:`, error);
      throw error;
    }
  }, []);

  // Function to reconnect a specific WebSocket
  const reconnectWebSocket = useCallback((exchange: string) => {
    if (!enabled) return;
    
    // Close existing connection if it exists
    if (wsRefs.current[exchange]) {
      try {
        wsRefs.current[exchange]?.close();
      } catch (e) {
        console.error(`Error closing WebSocket for ${exchange}:`, e);
      }
      wsRefs.current[exchange] = null;
    }
    
    // Use the retry manager to handle the reconnection
    wsRetryManager.current.handleConnectionFailure(`ws_${exchange}`, () => {
      connectWebSocket(exchange);
    });
  }, [enabled]);

  const connectWebSocket = useCallback((exchange: string) => {
    if (!enabled) return;
    
    // Don't reconnect if websocket already exists and is open
    if (wsRefs.current[exchange] && wsRefs.current[exchange]?.readyState === WebSocket.OPEN) {
      return;
    }
    
    // Close existing connection if any
    if (wsRefs.current[exchange]) {
      try {
        wsRefs.current[exchange]?.close();
      } catch (e) {
        console.error(`Error closing existing WebSocket for ${exchange}:`, e);
      }
      wsRefs.current[exchange] = null;
    }
    
    try {
      // Get the exchange-specific WebSocket URL
      const wsUrl = EXCHANGE_WS_ENDPOINTS[exchange] || 'wss://echo.websocket.org';
      
      console.log(`Connecting to ${exchange} WebSocket at ${wsUrl}...`);
      
      // Create new WebSocket with improved error handling
      const ws = new WebSocket(wsUrl);
      wsRefs.current[exchange] = ws;
      
      // Register with the retry manager
      wsRetryManager.current.registerConnection(`ws_${exchange}`, ws);
      
      // Use a timeout to detect connection failure
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.error(`Connection to ${exchange} timed out`);
          reconnectWebSocket(exchange);
        }
      }, 15000); // 15 second connection timeout
      
      ws.onopen = () => {
        console.log(`WebSocket connected for ${exchange}`);
        clearTimeout(connectionTimeout);
        
        setIsConnected(prev => ({ ...prev, [exchange]: true }));
        setError(null);
        
        // Reset retry logic on successful connection
        wsRetryManager.current.resetRetryCount(`ws_${exchange}`);
        
        // Send subscription message for each symbol with a small delay to avoid overwhelming the server
        symbols.forEach((symbol, index) => {
          setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              const subscriptionMessage = getSubscriptionMessage(exchange, symbol);
              ws.send(subscriptionMessage);
              console.log(`Subscribed to ${symbol} on ${exchange}`);
            }
          }, index * 100); // 100ms delay between subscription messages
        });
        
        // Set up regular heartbeat/ping for this connection
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            sendPing(exchange, ws);
          } else {
            clearInterval(pingInterval);
          }
        }, 30000); // Send ping every 30 seconds
        
        // Store the interval for cleanup
        reconnectTimersRef.current[`ping_${exchange}`] = pingInterval;
      };
      
      ws.onmessage = (event) => {
        try {
          // Parse the message data
          const messageData = JSON.parse(event.data);
          
          // Check if this is a pong response
          if (isExchangePongResponse(exchange, messageData)) {
            pongReceivedRef.current[exchange] = true;
            return; // Don't process pong messages further
          }
          
          const exchangeData: Record<string, any> = {};
          
          for (const symbol of symbols) {
            // Use exchange-specific parser if available
            const parsedData = parseTickerData(exchange, messageData, symbol);
            
            if (parsedData) {
              exchangeData[symbol] = parsedData;
            } else {
              // If we can't parse the data, we'll try to fetch it from the API later
              // But we don't need to do it on every message
            }
          }
          
          // If we parsed at least one symbol's data, update the state
          if (Object.keys(exchangeData).length > 0) {
            setData(prev => ({
              ...prev,
              [exchange]: {
                ...prev[exchange],
                ...exchangeData
              }
            }));
          }
        } catch (error) {
          console.error(`Error processing WebSocket message for ${exchange}:`, error);
        }
      };
      
      ws.onerror = (event) => {
        console.error(`WebSocket error for ${exchange}:`, event);
        clearTimeout(connectionTimeout);
        
        // Update connection status
        setIsConnected(prev => ({ ...prev, [exchange]: false }));
        
        // Try to fall back to REST API for all symbols
        symbols.forEach(symbol => {
          fetchAPITickerFallback(exchange, symbol).then(apiData => {
            setData(prev => ({
              ...prev,
              [exchange]: {
                ...prev[exchange],
                [symbol]: apiData
              }
            }));
          }).catch(() => {
            // If REST API fails too, we're out of options
            setError(`Failed to connect to ${exchange}`);
          });
        });
        
        // Use the retry manager to handle reconnection
        reconnectWebSocket(exchange);
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket closed for ${exchange} with code ${event.code} and reason: ${event.reason}`);
        clearTimeout(connectionTimeout);
        
        // Update connection status
        setIsConnected(prev => ({ ...prev, [exchange]: false }));
        
        // Use the retry manager to handle reconnection
        if (!event.wasClean) {
          reconnectWebSocket(exchange);
        }
      };
    } catch (err) {
      console.error(`Error creating WebSocket for ${exchange}:`, err);
      setError(`Failed to connect to ${exchange}`);
      
      // Try to fall back to REST API
      symbols.forEach(symbol => {
        fetchAPITickerFallback(exchange, symbol).then(apiData => {
          setData(prev => ({
            ...prev,
            [exchange]: {
              ...prev[exchange],
              [symbol]: apiData
            }
          }));
        }).catch(() => {});
      });
    }
  }, [enabled, symbols, getSubscriptionMessage, parseTickerData, fetchAPITickerFallback, sendPing, isExchangePongResponse, reconnectWebSocket]);
  
  // Add a reconnect function to manually trigger reconnection
  const reconnect = useCallback(() => {
    // Reset all connections
    exchangeIds.forEach(exchange => {
      wsRetryManager.current.resetRetryCount(`ws_${exchange}`);
      
      // Clear any existing reconnect timers
      Object.keys(reconnectTimersRef.current).forEach(key => {
        if (key.startsWith(`ping_${exchange}`) || key === exchange) {
          clearTimeout(reconnectTimersRef.current[key]);
          clearInterval(reconnectTimersRef.current[key]);
          delete reconnectTimersRef.current[key];
        }
      });
      
      // Close existing connection if any
      if (wsRefs.current[exchange]) {
        try {
          wsRefs.current[exchange]?.close();
        } catch (e) {
          console.error(`Error closing connection for ${exchange}:`, e);
        }
        wsRefs.current[exchange] = null;
      }
      
      // Attempt to reconnect
      connectWebSocket(exchange);
    });
    
    toast({
      title: "Reconnecting",
      description: "Attempting to reconnect to exchange WebSockets",
    });
  }, [connectWebSocket, exchangeIds]);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Initialize connection status
    const initialConnected: Record<string, boolean> = {};
    exchangeIds.forEach(id => {
      initialConnected[id] = false;
    });
    setIsConnected(initialConnected);
    
    // Connect to all exchanges with a small delay between each
    exchangeIds.forEach((exchange, index) => {
      setTimeout(() => {
        connectWebSocket(exchange);
      }, index * 300); // 300ms delay between connection attempts to avoid overwhelming the network
    });
    
    return () => {
      // Clean up WebSocket connections
      Object.entries(wsRefs.current).forEach(([exchange, ws]) => {
        if (ws) {
          try {
            ws.close();
          } catch (e) {
            console.error(`Error closing connection for ${exchange}:`, e);
          }
        }
      });
      
      // Clear all timers and intervals
      Object.values(reconnectTimersRef.current).forEach(timer => {
        clearTimeout(timer);
        clearInterval(timer);
      });
      
      // Clean up all connections in the retry manager
      wsRetryManager.current.cleanup();
    };
  }, [connectWebSocket, enabled, exchangeIds]);
  
  return { data, isConnected, error, reconnect };
}

// Create a multi-ticker WebSocket hook for use across the app
export function useMultiTickerWebSocket(
  exchangeIds: string[],
  symbols: string,
  enabled: boolean = true
) {
  return useEnhancedWebSocket(exchangeIds, symbols, enabled);
}
