
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

// Extended version of the WebSocket hook with better error handling and recovery
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
  
  // Function to parse exchange-specific ticker data
  const parseTickerData = useCallback((exchange: string, data: any, symbol: string) => {
    try {
      let result: TickerData | null = null;
      const formattedSymbol = symbol.replace('/', '').toLowerCase();
      
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

  const fetchAPITickerFallback = useCallback(async (exchange: string, symbol: string) => {
    try {
      return await fetchExchangeTickerData(exchange, symbol);
    } catch (error) {
      console.error(`API fallback failed for ${exchange} ${symbol}:`, error);
      throw error;
    }
  }, []);

  const connectWebSocket = useCallback((exchange: string) => {
    if (!enabled) return;
    
    // Don't reconnect if websocket already exists
    if (wsRefs.current[exchange] && wsRefs.current[exchange]?.readyState === WebSocket.OPEN) {
      return;
    }
    
    // Close existing connection if any
    if (wsRefs.current[exchange]) {
      wsRefs.current[exchange]?.close();
      wsRefs.current[exchange] = null;
    }
    
    try {
      // Get the exchange-specific WebSocket URL
      const wsUrl = EXCHANGE_WS_ENDPOINTS[exchange] || 'wss://echo.websocket.org';
      
      const ws = new WebSocket(wsUrl);
      wsRefs.current[exchange] = ws;
      
      ws.onopen = () => {
        console.log(`WebSocket connected for ${exchange}`);
        setIsConnected(prev => ({ ...prev, [exchange]: true }));
        setError(null);
        
        // Reset retry logic on successful connection
        wsRetryManager.current.resetRetryCount(`ws_${exchange}`);
        
        // Send subscription message for each symbol
        symbols.forEach(symbol => {
          const subscriptionMessage = getSubscriptionMessage(exchange, symbol);
          ws.send(subscriptionMessage);
        });
      };
      
      ws.onmessage = (event) => {
        try {
          // Parse the message data
          const messageData = JSON.parse(event.data);
          
          const exchangeData: Record<string, any> = {};
          
          for (const symbol of symbols) {
            // Use exchange-specific parser if available
            const parsedData = parseTickerData(exchange, messageData, symbol);
            
            if (parsedData) {
              exchangeData[symbol] = parsedData;
            } else {
              // If we can't parse the data, try to fetch it from the API
              fetchAPITickerFallback(exchange, symbol).then(apiData => {
                setData(prev => ({
                  ...prev,
                  [exchange]: {
                    ...prev[exchange],
                    [symbol]: apiData
                  }
                }));
              }).catch(err => {
                console.error(`Failed to get fallback data for ${exchange} ${symbol}:`, err);
              });
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
      };
      
      ws.onclose = () => {
        console.log(`WebSocket closed for ${exchange}`);
        setIsConnected(prev => ({ ...prev, [exchange]: false }));
        
        // Try to reconnect using the retry manager
        wsRetryManager.current.handleConnectionFailure(`ws_${exchange}`, () => {
          connectWebSocket(exchange);
        });
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
  }, [enabled, symbols, getSubscriptionMessage, parseTickerData, fetchAPITickerFallback]);
  
  // Add a reconnect function to manually trigger reconnection
  const reconnect = useCallback(() => {
    // Reset all connections
    exchangeIds.forEach(exchange => {
      wsRetryManager.current.resetRetryCount(`ws_${exchange}`);
      
      // Clear any existing reconnect timers
      if (reconnectTimersRef.current[exchange]) {
        clearTimeout(reconnectTimersRef.current[exchange]);
        reconnectTimersRef.current[exchange] = undefined;
      }
      
      // Close existing connection if any
      if (wsRefs.current[exchange]) {
        wsRefs.current[exchange]?.close();
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
    
    // Connect to all exchanges
    exchangeIds.forEach(exchange => {
      connectWebSocket(exchange);
    });
    
    return () => {
      // Clean up WebSocket connections
      Object.entries(wsRefs.current).forEach(([_, ws]) => {
        if (ws) ws.close();
      });
      
      // Clear reconnect timers
      Object.values(reconnectTimersRef.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
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
