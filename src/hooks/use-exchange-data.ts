
import { useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';
import { fetchMarketData } from '@/lib/api/cryptoDataApi';
import { useQuery, RefetchOptions, QueryObserverResult } from '@tanstack/react-query';

interface UseExchangeDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  staleTime?: number;
}

export function useExchangeData(
  exchangeName: string,
  symbols: string[] = [],
  options: UseExchangeDataOptions = {}
) {
  const [connectStatus, setConnectStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  // Define fetchData as a useCallback
  const fetchData = useCallback(async ({ signal }: { signal?: AbortSignal } = {}) => {
    try {
      setConnectStatus('connecting');
      const exchangeData = await fetchMarketData(exchangeName, symbols, signal);
      setConnectStatus('connected');
      return exchangeData;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error(`Error fetching ${exchangeName} data:`, err);
        setConnectStatus('disconnected');
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
    data,
    isLoading,
    isError,
    refresh,
    connectStatus
  };
}
