
import { useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';
import { fetchExchangeTickerData, getFallbackTickerData, SUPPORTED_EXCHANGES } from '@/lib/api/cryptoDataApi';
import { useQuery, RefetchOptions, QueryObserverResult } from '@tanstack/react-query';

interface UseExchangeDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  staleTime?: number;
}

export function useExchangeData(
  exchangeName: string | string[] = '',
  symbols: string[] = [],
  options: UseExchangeDataOptions = {}
) {
  const [connectStatus, setConnectStatus] = useState<Record<string, boolean>>({});

  // Define fetchData as a useCallback
  const fetchData = useCallback(async ({ signal }: { signal?: AbortSignal } = {}) => {
    // Handle both string and string[] for exchangeName
    const exchanges = Array.isArray(exchangeName) ? exchangeName : 
                     exchangeName ? [exchangeName] : [];
    
    const results: Record<string, Record<string, any>> = {};
    
    try {
      // If no exchanges specified, return empty results
      if (exchanges.length === 0 && symbols.length === 0) {
        return results;
      }
      
      // Process each exchange and symbol
      const promises = exchanges.map(async (exchange) => {
        results[exchange] = {};
        
        // Process each symbol for this exchange
        for (const symbol of symbols) {
          try {
            setConnectStatus(prev => ({ ...prev, [exchange]: false }));
            
            // Fetch ticker data for this exchange and symbol
            const tickerData = await fetchExchangeTickerData(exchange, symbol);
            results[exchange][symbol] = tickerData;
            
            setConnectStatus(prev => ({ ...prev, [exchange]: true }));
          } catch (err) {
            console.error(`Error fetching ${symbol} from ${exchange}:`, err);
            
            // Use fallback data when API fails
            results[exchange][symbol] = getFallbackTickerData(exchange, symbol);
            setConnectStatus(prev => ({ ...prev, [exchange]: false }));
          }
        }
      });
      
      await Promise.allSettled(promises);
      return results;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error(`Error fetching exchange data:`, err);
      }
      throw err;
    }
  }, [exchangeName, symbols]);
  
  // Use React Query for automatic caching, retries, and background updates
  const queryResult = useQuery({
    queryKey: ['exchangeData', exchangeName, symbols],
    queryFn: fetchData,
    staleTime: options.staleTime || 10000, // Default 10 seconds
    refetchInterval: options.autoRefresh ? (options.refreshInterval || 15000) : false, // Default 15 seconds
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  // Extract values from the query result
  const { data, isLoading, isError } = queryResult;

  // Add the refresh function that was missing
  const refresh = (options?: RefetchOptions) => {
    return queryResult.refetch(options);
  };

  return {
    data: data || {},
    isLoading,
    isError,
    refresh,
    connectStatus
  };
}
