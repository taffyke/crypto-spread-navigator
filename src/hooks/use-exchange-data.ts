
import { useState, useCallback, useEffect } from 'react';
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
        const symbolData = await fetchMultiExchangeTickerData(symbol, exchanges);
        
        for (const [exchange, tickerData] of Object.entries(symbolData)) {
          if (!results[exchange]) {
            results[exchange] = {};
          }
          
          results[exchange][symbol] = tickerData;
        }
      }
      
      return results;
    },
    enabled: fallbackToApi,
    refetchInterval: wsError ? refreshInterval : false, // Only auto-refresh API if WebSocket fails
    staleTime: refreshInterval / 2
  });

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
              
              reconnect();
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
  }, [wsError, isConnected, reconnectAttempts, maxReconnectAttempts, fallbackToApi, refetchApiData, reconnect]);

  // Determine which data source to use (WebSocket or API)
  const exchangeData = wsData && Object.keys(wsData).length > 0 ? wsData : apiData;
  
  // Refresh function
  const refresh = useCallback(() => {
    // Reset reconnect attempts
    setReconnectAttempts({});
    
    // Try to reconnect WebSocket
    reconnect();
    
    // Also refresh API data as backup
    if (fallbackToApi) {
      refetchApiData();
    }
    
    toast({
      title: "Refreshing Exchange Data",
      description: "Fetching latest market information."
    });
  }, [reconnect, refetchApiData, fallbackToApi]);

  return {
    data: exchangeData || {},
    isLoading: !exchangeData && isApiLoading,
    isError: Boolean(wsError && (!exchangeData || Object.keys(exchangeData).length === 0)),
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
