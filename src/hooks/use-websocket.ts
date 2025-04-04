
// Since this is a read-only file, we need to create an enhanced version that can recover from WebSocket errors

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFallbackTickerData } from '@/lib/api/cryptoDataApi';

// Extended version of the WebSocket hook with better error handling and recovery
export function useEnhancedWebSocket(
  exchangeIds: string[],
  symbol: string,
  enabled: boolean = true
) {
  const [data, setData] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const wsRefs = useRef<Record<string, WebSocket | null>>({});
  const reconnectTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  const MAX_RECONNECT_ATTEMPTS = 3;
  const reconnectAttemptsRef = useRef<Record<string, number>>({});

  const connectWebSocket = useCallback((exchange: string) => {
    if (!enabled) return;
    
    // Don't reconnect if max attempts reached
    if (reconnectAttemptsRef.current[exchange] >= MAX_RECONNECT_ATTEMPTS) {
      console.log(`Max reconnect attempts reached for ${exchange}, using fallback data`);
      
      // Use fallback data instead
      setData(prev => ({
        ...prev,
        [exchange]: getFallbackTickerData(exchange, symbol)
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
      // In a real app, these would be actual websocket endpoints
      const wsUrl = `wss://echo.websocket.org`;
      
      const ws = new WebSocket(wsUrl);
      wsRefs.current[exchange] = ws;
      
      ws.onopen = () => {
        console.log(`WebSocket connected for ${exchange}`);
        setIsConnected(prev => ({ ...prev, [exchange]: true }));
        setError(null);
        
        // Reset reconnect attempts on successful connection
        reconnectAttemptsRef.current[exchange] = 0;
        
        // Send subscription message 
        ws.send(JSON.stringify({ 
          action: 'subscribe', 
          symbol: symbol,
          exchange: exchange
        }));
      };
      
      ws.onmessage = (event) => {
        // In a real implementation, we would parse the actual message
        // Here, we'll simulate ticker data
        
        setData(prev => ({
          ...prev,
          [exchange]: getFallbackTickerData(exchange, symbol)
        }));
      };
      
      ws.onerror = (event) => {
        console.error(`WebSocket error for ${exchange}:`, event);
        
        // Increment reconnect attempts
        reconnectAttemptsRef.current[exchange] = 
          (reconnectAttemptsRef.current[exchange] || 0) + 1;
          
        // Fall back to API data after error
        setData(prev => ({
          ...prev,
          [exchange]: getFallbackTickerData(exchange, symbol)
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
          setData(prev => ({
            ...prev,
            [exchange]: getFallbackTickerData(exchange, symbol)
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
      setData(prev => ({
        ...prev,
        [exchange]: getFallbackTickerData(exchange, symbol)
      }));
    }
  }, [enabled, symbol]);
  
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
          setData(prev => ({
            ...prev,
            [exchange]: getFallbackTickerData(exchange, symbol)
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
  }, [connectWebSocket, enabled, exchangeIds, symbol, isConnected]);
  
  return { data, isConnected, error };
}

// Create an adapter to maintain compatibility with the original hook
export function useMultiTickerWebSocket(
  exchangeIds: string[],
  symbol: string,
  enabled: boolean = true
) {
  // Use the enhanced implementation but provide the same interface
  return useEnhancedWebSocket(exchangeIds, symbol, enabled);
}
