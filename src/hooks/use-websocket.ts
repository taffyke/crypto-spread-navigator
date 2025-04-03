import { useState, useEffect, useCallback, useRef } from 'react';
import { wsManager } from '@/lib/exchanges/exchangeApi';

// Hook for subscribing to real-time WebSocket data from exchanges
export function useWebSocketData<T>(
  exchangeId: string, 
  topic: string,
  symbol: string,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const removeHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const connectToWebSocket = async () => {
      if (!enabled) return;
      
      try {
        // Connect to WebSocket with the topic and symbol
        wsManager.connect(exchangeId, topic as any, symbol);
        
        if (isMounted) {
          setIsConnected(true);
          setError(null);
          
          // Add message handler
          wsManager.addMessageHandler(
            exchangeId,
            topic as any,
            symbol,
            (newData: any) => {
              if (isMounted) {
                setData(newData as T);
              }
            }
          );
          
          // This is a stub since the actual implementation doesn't return a function
          removeHandlerRef.current = () => {
            // In a real implementation, this would remove the specific handler
          };
        }
      } catch (err) {
        if (isMounted) {
          setIsConnected(false);
          setError(err instanceof Error ? err : new Error('Failed to connect to WebSocket'));
        }
      }
    };
    
    connectToWebSocket();
    
    return () => {
      isMounted = false;
      
      // Clean up by removing the handler
      if (removeHandlerRef.current) {
        removeHandlerRef.current();
        removeHandlerRef.current = null;
      }
      
      // Disconnect from WebSocket
      wsManager.disconnect(exchangeId, symbol);
    };
  }, [exchangeId, topic, symbol, enabled]);
  
  const reconnect = useCallback(async () => {
    // Clean up existing connection
    if (removeHandlerRef.current) {
      removeHandlerRef.current();
      removeHandlerRef.current = null;
    }
    
    wsManager.disconnect(exchangeId, symbol);
    setIsConnected(false);
    
    try {
      // Reconnect
      wsManager.connect(exchangeId, topic as any, symbol);
      setIsConnected(true);
      setError(null);
      
      // Add message handler
      wsManager.addMessageHandler(
        exchangeId,
        topic as any,
        symbol,
        (newData: any) => {
          setData(newData as T);
        }
      );
      
      // This is a stub since the actual implementation doesn't return a function
      removeHandlerRef.current = () => {
        // In a real implementation, this would remove the specific handler
      };
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err : new Error('Failed to reconnect to WebSocket'));
    }
  }, [exchangeId, topic, symbol]);
  
  return {
    data,
    isConnected,
    error,
    reconnect
  };
}

// Hook for subscribing to ticker data
export function useTickerWebSocket(
  exchangeId: string,
  symbol: string,
  enabled: boolean = true
) {
  return useWebSocketData(exchangeId, 'ticker', symbol, enabled);
}

// Hook for subscribing to orderbook data
export function useOrderBookWebSocket(
  exchangeId: string,
  symbol: string,
  enabled: boolean = true
) {
  return useWebSocketData(exchangeId, 'orderbook', symbol, enabled);
}

// Hook for subscribing to multiple ticker WebSockets at once
export function useMultiTickerWebSocket(
  exchangeIds: string[],
  symbol: string,
  enabled: boolean = true
) {
  const [data, setData] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, Error | null>>({});
  const removeHandlersRef = useRef<Record<string, () => void>>({});
  
  useEffect(() => {
    let isMounted = true;
    
    const connectToWebSockets = async () => {
      if (!enabled) return;
      
      // Connect to all WebSockets
      for (const exchangeId of exchangeIds) {
        try {
          // Connect to WebSocket
          wsManager.connect(exchangeId, 'ticker', symbol);
          
          if (isMounted) {
            setIsConnected(prev => ({
              ...prev,
              [exchangeId]: true
            }));
            
            setError(prev => ({
              ...prev,
              [exchangeId]: null
            }));
            
            // Add message handler
            wsManager.addMessageHandler(
              exchangeId,
              'ticker',
              symbol,
              (newData: any) => {
                if (isMounted) {
                  setData(prev => ({
                    ...prev,
                    [exchangeId]: newData
                  }));
                }
              }
            );
            
            // This is a stub since the actual implementation doesn't return a function
            removeHandlersRef.current[exchangeId] = () => {
              // In a real implementation, this would remove the specific handler
            };
          }
        } catch (err) {
          if (isMounted) {
            setIsConnected(prev => ({
              ...prev,
              [exchangeId]: false
            }));
            
            setError(prev => ({
              ...prev,
              [exchangeId]: err instanceof Error ? err : new Error(`Failed to connect to ${exchangeId}`)
            }));
          }
        }
      }
    };
    
    connectToWebSockets();
    
    return () => {
      isMounted = false;
      
      // Clean up all connections
      for (const exchangeId of exchangeIds) {
        // Remove handler
        if (removeHandlersRef.current[exchangeId]) {
          removeHandlersRef.current[exchangeId]();
          delete removeHandlersRef.current[exchangeId];
        }
        
        // Disconnect
        wsManager.disconnect(exchangeId, symbol);
      }
    };
  }, [exchangeIds, symbol, enabled]);
  
  const reconnect = useCallback(async (exchangeId?: string) => {
    const exchangesToReconnect = exchangeId ? [exchangeId] : exchangeIds;
    
    for (const id of exchangesToReconnect) {
      // Clean up existing connection
      if (removeHandlersRef.current[id]) {
        removeHandlersRef.current[id]();
        delete removeHandlersRef.current[id];
      }
      
      wsManager.disconnect(id, symbol);
      
      setIsConnected(prev => ({
        ...prev,
        [id]: false
      }));
      
      try {
        // Reconnect
        wsManager.connect(id, 'ticker', symbol);
        
        setIsConnected(prev => ({
          ...prev,
          [id]: true
        }));
        
        setError(prev => ({
          ...prev,
          [id]: null
        }));
        
        // Add message handler
        wsManager.addMessageHandler(
          id,
          'ticker',
          symbol,
          (newData: any) => {
            setData(prev => ({
              ...prev,
              [id]: newData
            }));
          }
        );
        
        // This is a stub since the actual implementation doesn't return a function
        removeHandlersRef.current[id] = () => {
          // In a real implementation, this would remove the specific handler
        };
      } catch (err) {
        setIsConnected(prev => ({
          ...prev,
          [id]: false
        }));
        
        setError(prev => ({
          ...prev,
          [id]: err instanceof Error ? err : new Error(`Failed to reconnect to ${id}`)
        }));
      }
    }
  }, [exchangeIds, symbol]);
  
  return {
    data,
    isConnected,
    error,
    reconnect
  };
}
