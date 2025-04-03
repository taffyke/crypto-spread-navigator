
import { useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';
import { fetchArbitrageOpportunities } from '@/lib/api/cryptoDataApi';

interface UseArbitrageDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useArbitrageData(
  arbitrageType: 'direct' | 'triangular' | 'futures',
  selectedExchanges: string[] = [],
  minSpread: number = 0.5,
  minVolume: number = 100000,
  autoRefresh: boolean = false,
  options: UseArbitrageDataOptions = {}
) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch real arbitrage opportunities from our API
      const arbitrageData = await fetchArbitrageOpportunities(
        arbitrageType,
        minSpread,
        minVolume
      );
      
      // Filter by selected exchanges if provided
      const filteredData = selectedExchanges.length > 0
        ? arbitrageData.filter((item: any) => {
            if (arbitrageType === 'direct') {
              return selectedExchanges.some(ex => 
                item.buyExchange.toLowerCase().includes(ex) || 
                item.sellExchange.toLowerCase().includes(ex)
              );
            } else if (arbitrageType === 'triangular') {
              return selectedExchanges.some(ex => 
                item.exchange.toLowerCase().includes(ex)
              );
            } else {
              return selectedExchanges.some(ex => 
                item.exchange.toLowerCase().includes(ex)
              );
            }
          })
        : arbitrageData;

      setData(filteredData);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error('Error fetching arbitrage data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch arbitrage data'));
      
      toast({
        title: 'Data Fetch Error',
        description: 'Unable to fetch arbitrage opportunities. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [arbitrageType, selectedExchanges, minSpread, minVolume]);
  
  useEffect(() => {
    fetchData();
    
    const refreshInterval = options.refreshInterval || 60000; // Default 1 minute
    
    // Setup auto refresh
    let intervalId: number;
    if (autoRefresh || options.autoRefresh) {
      intervalId = window.setInterval(() => {
        fetchData();
      }, refreshInterval);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchData, autoRefresh, options.autoRefresh, options.refreshInterval]);
  
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data,
    isLoading,
    error,
    refresh,
    lastUpdated
  };
}
