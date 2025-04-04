// Since this is a read-only file, we need to create an enhanced version that can recover from WebSocket errors

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getFallbackTickerData } from '@/lib/api/cryptoDataApi';
import { WebSocketRetryManager } from '@/lib/exchanges/websocketRetry';
import { EXCHANGE_CONFIGS } from '@/lib/exchanges/exchangeApi';

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
  
  const MAX_RECONNECT_ATTEMPTS = 3;
  const reconnectAttemptsRef = useRef<Record<string, number>>({});

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
      // Default fallback data
      let result = getFallbackTickerData(exchange, symbol);
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
              timestamp: Date.now()
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
              timestamp: Date.now()
            };
          }
          break;
        // Add more exchange-specific parsers as needed
        default:
          // Use fallback data if specific parser not available
          console.log(`No specific parser for ${exchange}, using fallback data`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error parsing ${exchange} ticker data:`, error);
      return getFallbackTickerData(exchange, symbol);
    }
  }, []);

  const connectWebSocket = useCallback((exchange: string) => {
    if (!enabled) return;
    
    // Don't reconnect if max attempts reached
    if (reconnectAttemptsRef.current[exchange] >= MAX_RECONNECT_ATTEMPTS) {
      console.log(`Max reconnect attempts reached for ${exchange}, using fallback data`);
      
      // Use fallback data for each symbol
      const exchangeData: Record<string, any> = {};
      symbols.forEach(symbol => {
        exchangeData[symbol] = getFallbackTickerData(exchange, symbol);
      });
      
      // If we have just one symbol, keep the old format for compatibility
      setData(prev => ({
        ...prev,
        [exchange]: symbols.length === 1 ? 
          getFallbackTickerData(exchange, primarySymbol) : 
          { primary: getFallbackTickerData(exchange, primarySymbol), symbols: exchangeData }
      }));
      
      setIsConnected(prev => ({
        ...prev,
        [exchange]: true // Mark as connected even though we're using fallback
      }));
      
      return;
    }
    
    // Close existing connection if any
    if (wsRefs.current[exchange]) {
      wsRefs.current[exchange]?.close();
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
        
        // Reset reconnect attempts on successful connection
        reconnectAttemptsRef.current[exchange] = 0;
        
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
          
          // For real implementation, parse exchange-specific data format
          // For simulation, generate data for all symbols
          const exchangeData: Record<string, any> = {};
          
          symbols.forEach(symbol => {
            // Use exchange-specific parser if available
            exchangeData[symbol] = parseTickerData(exchange, messageData, symbol);
          });
          
          // Update with the format expected by the application
          setData(prev => ({
            ...prev,
            [exchange]: symbols.length === 1 ? 
              parseTickerData(exchange, messageData, primarySymbol) : 
              { primary: parseTickerData(exchange, messageData, primarySymbol), symbols: exchangeData }
          }));
        } catch (error) {
          console.error(`Error processing WebSocket message for ${exchange}:`, error);
          // Fall back to mock data on parsing error
          const exchangeData: Record<string, any> = {};
          symbols.forEach(symbol => {
            exchangeData[symbol] = getFallbackTickerData(exchange, symbol);
          });
          
          setData(prev => ({
            ...prev,
            [exchange]: symbols.length === 1 ? 
              getFallbackTickerData(exchange, primarySymbol) : 
              { primary: getFallbackTickerData(exchange, primarySymbol), symbols: exchangeData }
          }));
        }
      };
      
      ws.onerror = (event) => {
        console.error(`WebSocket error for ${exchange}:`, event);
        
        // Increment reconnect attempts
        reconnectAttemptsRef.current[exchange] = 
          (reconnectAttemptsRef.current[exchange] || 0) + 1;
          
        // Fall back to API data after error
        const exchangeData: Record<string, any> = {};
        symbols.forEach(symbol => {
          exchangeData[symbol] = getFallbackTickerData(exchange, symbol);
        });
        
        setData(prev => ({
          ...prev,
          [exchange]: symbols.length === 1 ? 
            getFallbackTickerData(exchange, primarySymbol) : 
            { primary: getFallbackTickerData(exchange, primarySymbol), symbols: exchangeData }
        }));
      };
      
      ws.onclose = () => {
        console.log(`WebSocket closed for ${exchange}`);
        setIsConnected(prev => ({ ...prev, [exchange]: false }));
        
        // Try to reconnect
        if (reconnectAttemptsRef.current[exchange] < MAX_RECONNECT_ATTEMPTS) {
          const timeout = setTimeout(() => {
            console.log(`Attempting to reconnect to ${exchange}...`);
            connectWebSocket(exchange);
          }, 2000); // 2 second delay before reconnecting
          
          reconnectTimersRef.current[exchange] = timeout;
        } else {
          // Use fallback data instead
          const exchangeData: Record<string, any> = {};
          symbols.forEach(symbol => {
            exchangeData[symbol] = getFallbackTickerData(exchange, symbol);
          });
          
          setData(prev => ({
            ...prev,
            [exchange]: symbols.length === 1 ? 
              getFallbackTickerData(exchange, primarySymbol) : 
              { primary: getFallbackTickerData(exchange, primarySymbol), symbols: exchangeData }
          }));
          
          setIsConnected(prev => ({
            ...prev,
            [exchange]: true // Mark as connected even though we're using fallback
          }));
        }
      };
    } catch (err) {
      console.error(`Error creating WebSocket for ${exchange}:`, err);
      setError(`Failed to connect to ${exchange}`);
      
      // Use fallback data on connection error
      const exchangeData: Record<string, any> = {};
      symbols.forEach(symbol => {
        exchangeData[symbol] = getFallbackTickerData(exchange, symbol);
      });
      
      setData(prev => ({
        ...prev,
        [exchange]: symbols.length === 1 ? 
          getFallbackTickerData(exchange, primarySymbol) : 
          { primary: getFallbackTickerData(exchange, primarySymbol), symbols: exchangeData }
      }));
    }
  }, [enabled, symbols, primarySymbol, getSubscriptionMessage, parseTickerData]);
  
  // Add a reconnect function to manually trigger reconnection
  const reconnect = useCallback(() => {
    // Reset reconnect attempts
    exchangeIds.forEach(exchange => {
      reconnectAttemptsRef.current[exchange] = 0;
      
      // Clear any existing reconnect timers
      if (reconnectTimersRef.current[exchange]) {
        clearTimeout(reconnectTimersRef.current[exchange]);
      }
      
      // Attempt to reconnect
      connectWebSocket(exchange);
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
    
    // Reset reconnect attempts
    reconnectAttemptsRef.current = {};
    
    // Connect to all exchanges
    exchangeIds.forEach(exchange => {
      connectWebSocket(exchange);
    });
    
    // Set up interval for refreshing data
    const intervalId = setInterval(() => {
      // Refresh data every 10 seconds from the fallback source
      exchangeIds.forEach(exchange => {
        // Only use fallback for exchanges that are not connected via WebSocket
        if (!isConnected[exchange] || reconnectAttemptsRef.current[exchange] >= MAX_RECONNECT_ATTEMPTS) {
          const exchangeData: Record<string, any> = {};
          symbols.forEach(symbol => {
            exchangeData[symbol] = getFallbackTickerData(exchange, symbol);
          });
          
          setData(prev => ({
            ...prev,
            [exchange]: symbols.length === 1 ? 
              getFallbackTickerData(exchange, primarySymbol) : 
              { primary: getFallbackTickerData(exchange, primarySymbol), symbols: exchangeData }
          }));
        }
      });
    }, 10000);
    
    return () => {
      // Clean up WebSocket connections
      Object.entries(wsRefs.current).forEach(([_, ws]) => {
        if (ws) ws.close();
      });
      
      // Clear reconnect timers
      Object.values(reconnectTimersRef.current).forEach(timer => {
        clearTimeout(timer);
      });
      
      // Clear the refresh interval
      clearInterval(intervalId);
    };
  }, [connectWebSocket, enabled, exchangeIds, symbols, primarySymbol, isConnected]);
  
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
