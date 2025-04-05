
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMultiTickerWebSocket } from '@/hooks/use-websocket';
import { 
  fetchExchangeTickerData, 
  fetchMultiExchangeTickerData,
  SUPPORTED_EXCHANGES,
  TickerData
} from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';

interface UseExchangeDataOptions {
  symbols: string[];
  exchanges?: string[];
  refreshInterval?: number;
  fallbackToApi?: boolean;
}

interface ExchangeTickerResponse {
  data: Record<string, Record<string, TickerData>>;
  isLoading: boolean;
  isError: boolean;
  connectStatus: Record<string, boolean>;
  refresh: () => void;
}

/**
 * Custom hook to get real-time crypto ticker data across multiple exchanges
 * Provides both WebSocket and API fallback data
 */
export function useExchangeData({
  symbols,
  exchanges = SUPPORTED_EXCHANGES,
  refreshInterval = 30000,
  fallbackToApi = true
}: UseExchangeDataOptions): ExchangeTickerResponse {
  const [reconnectAttempts, setReconnectAttempts] = useState<Record<string, number>>({});
  const maxReconnectAttempts = 5;
  const [lastReconnectTime, setLastReconnectTime] = useState<number>(0);
  const reconnectCooldown = 10000; // 10 seconds between manual reconnect attempts

  // Use WebSocket for real-time data
  const {
    data: wsData,
    isConnected,
    error: wsError,
    reconnect
  } = useMultiTickerWebSocket(
    exchanges,
    symbols.join(','),
    true
  );

  // Use API Query for fallback data
  const {
    data: apiData,
    isLoading: isApiLoading,
    refetch: refetchApiData
  } = useQuery({
    queryKey: ['multiExchangeTickerData', exchanges.join('-'), symbols.join('-')],
    queryFn: async () => {
      const results: Record<string, Record<string, TickerData>> = {};
      
      // Create a map of exchange -> symbol -> data
      for (const symbol of symbols) {
        try {
          const symbolData = await fetchMultiExchangeTickerData(symbol, exchanges);
          
          for (const [exchange, tickerData] of Object.entries(symbolData)) {
            if (!results[exchange]) {
              results[exchange] = {};
            }
            
            results[exchange][symbol] = tickerData;
          }
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
        }
      }
      
      return results;
    },
    enabled: fallbackToApi,
    refetchInterval: wsError ? refreshInterval : false, // Only auto-refresh API if WebSocket fails
    staleTime: refreshInterval / 2,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Safe reconnect function with cooldown protection
  const safeReconnect = useCallback(() => {
    const now = Date.now();
    if (now - lastReconnectTime > reconnectCooldown) {
      setLastReconnectTime(now);
      reconnect();
      console.log("Manually reconnecting to WebSockets");
      
      // Show a toast to indicate reconnection attempt
      toast({
        title: "Reconnecting WebSockets",
        description: "Attempting to establish stable connections to exchanges..."
      });
    } else {
      console.log("Reconnect attempt throttled (cooldown period)");
    }
  }, [reconnect, lastReconnectTime, reconnectCooldown]);
  
  // Process WebSocket errors and handle reconnections
  useEffect(() => {
    if (wsError) {
      console.error('WebSocket error in useExchangeData:', wsError);
      
      // Handle reconnection for specific failed exchanges
      Object.entries(isConnected || {}).forEach(([exchange, connected]) => {
        if (!connected) {
          const currentAttempts = reconnectAttempts[exchange] || 0;
          
          if (currentAttempts < maxReconnectAttempts) {
            const timer = setTimeout(() => {
              console.log(`Attempting to reconnect ${exchange} WebSocket (attempt ${currentAttempts + 1}/${maxReconnectAttempts})...`);
              
              setReconnectAttempts(prev => ({
                ...prev,
                [exchange]: (prev[exchange] || 0) + 1
              }));
              
              safeReconnect();
            }, 2000 + (currentAttempts * 1000)); // Increasing backoff
            
            return () => clearTimeout(timer);
          } else if (currentAttempts === maxReconnectAttempts) {
            console.log(`Max reconnect attempts reached for ${exchange}, using API fallback`);
            
            if (fallbackToApi) {
              refetchApiData();
            }
            
            // Reset after some time to allow future attempts
            const resetTimer = setTimeout(() => {
              setReconnectAttempts(prev => ({
                ...prev,
                [exchange]: 0
              }));
            }, 60000);
            
            return () => clearTimeout(resetTimer);
          }
        }
      });
    } else if (isConnected) {
      // Reset reconnect attempts for connected exchanges
      const resetAttempts: Record<string, number> = {};
      Object.entries(isConnected).forEach(([exchange, connected]) => {
        if (connected) {
          resetAttempts[exchange] = 0;
        }
      });
      
      if (Object.keys(resetAttempts).length > 0) {
        setReconnectAttempts(prev => ({
          ...prev,
          ...resetAttempts
        }));
      }
    }
  }, [wsError, isConnected, reconnectAttempts, maxReconnectAttempts, fallbackToApi, refetchApiData, safeReconnect]);

  // Determine which data source to use (WebSocket or API)
  const finalData = useMemo(() => {
    const mergedData: Record<string, Record<string, TickerData>> = {};
    
    // First add all API data if available
    if (apiData) {
      // Process API data
      for (const [exchange, exchangeData] of Object.entries(apiData)) {
        mergedData[exchange] = { ...exchangeData };
      }
    }
    
    // Then overlay with WebSocket data where available
    if (wsData) {
      for (const [exchange, exchangeData] of Object.entries(wsData)) {
        if (!mergedData[exchange]) {
          mergedData[exchange] = {};
        }
        
        // For each symbol in this exchange
        for (const [symbol, tickerData] of Object.entries(exchangeData)) {
          // Only use WebSocket data if it looks valid (has a price)
          if (tickerData && typeof tickerData === 'object' && 'price' in tickerData && 
             typeof tickerData.price === 'number' && 
             'symbol' in tickerData && 
             'volume' in tickerData &&
             'timestamp' in tickerData) {
            mergedData[exchange][symbol] = tickerData as TickerData;
          }
        }
      }
    }
    
    return mergedData;
  }, [wsData, apiData]);
  
  // Setup periodic connection check
  useEffect(() => {
    // Check connection status every minute
    const connectionCheckInterval = setInterval(() => {
      // Check if we have any connected exchanges
      const hasConnectedExchanges = isConnected && 
        Object.values(isConnected).some(connected => connected);
      
      if (!hasConnectedExchanges && fallbackToApi) {
        console.log("No connected exchanges detected, attempting to reconnect...");
        safeReconnect();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(connectionCheckInterval);
  }, [isConnected, fallbackToApi, safeReconnect]);
  
  // Refresh function
  const refresh = useCallback(() => {
    // Reset reconnect attempts
    setReconnectAttempts({});
    
    // Try to reconnect WebSocket
    safeReconnect();
    
    // Also refresh API data as backup
    if (fallbackToApi) {
      refetchApiData();
    }
    
    toast({
      title: "Refreshing Exchange Data",
      description: "Fetching latest market information."
    });
  }, [safeReconnect, refetchApiData, fallbackToApi]);

  return {
    data: finalData,
    isLoading: Object.keys(finalData).length === 0 && isApiLoading,
    isError: Boolean(wsError && (!apiData || Object.keys(apiData).length === 0)),
    connectStatus: isConnected || {},
    refresh
  };
}

/**
 * Get ticker data for a specific symbol across multiple exchanges
 */
export function useSymbolData(symbol: string, exchanges = SUPPORTED_EXCHANGES) {
  return useExchangeData({
    symbols: [symbol],
    exchanges
  });
}

/**
 * Get ticker data for multiple symbols from a specific exchange
 */
export function useExchangeTickers(exchange: string, symbols: string[]) {
  return useExchangeData({
    symbols,
    exchanges: [exchange]
  });
}
