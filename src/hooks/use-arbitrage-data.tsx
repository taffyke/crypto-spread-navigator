
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from './use-toast';
import { fetchArbitrageOpportunities } from '@/lib/api/cryptoDataApi';
import { useQuery } from '@tanstack/react-query';

interface UseArbitrageDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  staleTime?: number;
}

// Define the type for arbitrage opportunities
interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange?: string;
  sellExchange?: string;
  exchange?: string;
  buyPrice?: number;
  sellPrice?: number;
  spreadPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: Date;
  volume24h: number;
  recommendedNetworks: string[];
  type: string;
}

export function useArbitrageData(
  arbitrageType: 'direct' | 'triangular' | 'futures',
  selectedExchanges: string[] = [],
  minSpread: number = 0.5,
  minVolume: number = 100000,
  autoRefresh: boolean = false,
  options: UseArbitrageDataOptions = {}
) {
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const lastFetchRef = useRef<number>(Date.now());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const fetchData = useCallback(async ({ signal }: { signal?: AbortSignal } = {}) => {
    // Cancel any previous requests to avoid race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Combine the signal from React Query with our own abort controller
    const combinedSignal = signal 
      ? { signal: abortControllerRef.current.signal } 
      : { signal: abortControllerRef.current.signal };
    
    try {
      // Fetch real arbitrage opportunities from our API with the abort signal
      const arbitrageData = await fetchArbitrageOpportunities(
        arbitrageType,
        minSpread,
        minVolume,
        combinedSignal.signal
      );
      
      // Filter by selected exchanges if provided and ensure riskLevel is properly typed
      const filteredData = selectedExchanges.length > 0
        ? arbitrageData.filter((item: any) => {
            if (arbitrageType === 'direct') {
              return selectedExchanges.some(ex => 
                item.buyExchange.toLowerCase().includes(ex.toLowerCase()) || 
                item.sellExchange.toLowerCase().includes(ex.toLowerCase())
              );
            } else if (arbitrageType === 'triangular') {
              return selectedExchanges.some(ex => 
                item.exchange.toLowerCase().includes(ex.toLowerCase())
              );
            } else {
              return selectedExchanges.some(ex => 
                item.exchange.toLowerCase().includes(ex.toLowerCase())
              );
            }
          })
        : arbitrageData;

      // Ensure riskLevel is one of the allowed values
      const typedData = filteredData.map((item: any): ArbitrageOpportunity => {
        // Ensure riskLevel is one of the valid options
        let validRiskLevel: 'low' | 'medium' | 'high';
        if (item.riskLevel === 'low' || item.riskLevel === 'medium' || item.riskLevel === 'high') {
          validRiskLevel = item.riskLevel;
        } else {
          // Default to medium if invalid value
          validRiskLevel = 'medium';
        }
        
        return {
          ...item,
          riskLevel: validRiskLevel
        };
      });

      lastFetchRef.current = Date.now();
      setLastUpdated(Date.now());
      return typedData;
    } catch (err) {
      // Only log and show error if it's not an abort error
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching arbitrage data:', err);
        
        toast({
          title: 'Data Fetch Error',
          description: 'Unable to fetch arbitrage opportunities. Please try again.',
          variant: 'destructive',
        });
      }
      throw err;
    }
  }, [arbitrageType, selectedExchanges, minSpread, minVolume]);
  
  // Use React Query for automatic caching, retries, and background updates
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['arbitrageData', arbitrageType, selectedExchanges, minSpread, minVolume],
    queryFn: fetchData,
    staleTime: options.staleTime || 10000, // Default 10 seconds
    refetchInterval: autoRefresh || options.autoRefresh ? (options.refreshInterval || 15000) : false, // Default 15 seconds
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });
  
  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return {
    data: data || [],
    isLoading,
    error,
    refresh: refetch,
    lastUpdated
  };
}
