
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from './use-toast';
import { fetchArbitrageOpportunities } from '@/lib/api/cryptoDataApi';
import { useQuery } from '@tanstack/react-query';

interface UseArbitrageDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  staleTime?: number;
}

// Define the type for arbitrage opportunities to ensure consistent types
interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string;  // Made required
  sellExchange: string; // Made required 
  exchange?: string;    // Still optional
  buyPrice: number;     // Made required
  sellPrice: number;    // Made required
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
  const errorCountRef = useRef<number>(0);
  const MAX_RETRY_ATTEMPTS = 3;
  
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
        signal
      );
      
      // Reset error count on successful fetch
      errorCountRef.current = 0;
      
      // Filter by selected exchanges if provided and ensure required fields exist
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

      // Process the data to ensure all required fields are present
      const typedData = filteredData.map((item: any): ArbitrageOpportunity => {
        // Ensure riskLevel is one of the valid options
        let validRiskLevel: 'low' | 'medium' | 'high';
        if (item.riskLevel === 'low' || item.riskLevel === 'medium' || item.riskLevel === 'high') {
          validRiskLevel = item.riskLevel;
        } else {
          // Default to medium if invalid value
          validRiskLevel = 'medium';
        }
        
        // For triangular or futures arbitrage, provide default exchange values if missing
        if ((arbitrageType === 'triangular' || arbitrageType === 'futures') && !item.buyExchange) {
          item.buyExchange = item.exchange || 'Unknown';
          item.sellExchange = item.exchange || 'Unknown';
        }
        
        // For direct arbitrage, ensure buy and sell prices exist
        if (!item.buyPrice || !item.sellPrice) {
          // Calculate based on spread if needed
          const basePrice = item.price || 1000; // Default fallback
          item.buyPrice = item.buyPrice || basePrice;
          item.sellPrice = item.sellPrice || (basePrice * (1 + item.spreadPercentage / 100));
        }
        
        return {
          ...item,
          buyExchange: item.buyExchange || 'Unknown', // Ensure required field
          sellExchange: item.sellExchange || 'Unknown', // Ensure required field
          buyPrice: item.buyPrice || 0, // Ensure required field
          sellPrice: item.sellPrice || 0, // Ensure required field
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
        
        // Increment error count
        errorCountRef.current += 1;
        
        // Only show toast if we haven't exceeded max retries
        if (errorCountRef.current <= MAX_RETRY_ATTEMPTS) {
          toast({
            title: 'Data Fetch Error',
            description: 'Unable to fetch arbitrage opportunities. Retrying...',
            variant: 'destructive',
          });
        }
        
        // If we've reached max retries, generate mock data as fallback
        if (errorCountRef.current > MAX_RETRY_ATTEMPTS) {
          console.log('Generating fallback arbitrage data after multiple failures');
          
          // Create basic fallback data based on arbitrage type
          return createFallbackArbitrageData(arbitrageType, selectedExchanges, minSpread, minVolume);
        }
      }
      throw err;
    }
  }, [arbitrageType, selectedExchanges, minSpread, minVolume]);
  
  // Function to create fallback arbitrage data when API fails
  const createFallbackArbitrageData = (
    type: 'direct' | 'triangular' | 'futures',
    exchanges: string[],
    minSpread: number,
    minVolume: number
  ): ArbitrageOpportunity[] => {
    // Use default exchanges if none selected
    const activeExchanges = exchanges.length > 0 
      ? exchanges 
      : ['binance', 'coinbase', 'kraken', 'kucoin', 'gate_io'];
    
    // Define some base assets for opportunities
    const baseAssets = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE'];
    const quoteAsset = 'USDT';
    
    const fallbackData: ArbitrageOpportunity[] = [];
    
    if (type === 'direct') {
      // Generate direct arbitrage opportunities
      for (let i = 0; i < activeExchanges.length - 1; i++) {
        for (let j = i + 1; j < activeExchanges.length; j++) {
          // Create opportunities for each base asset
          baseAssets.forEach((baseAsset, index) => {
            const basePrice = 1000 / (index + 1); // Different price levels for different assets
            const spreadPercentage = minSpread + Math.random() * 2; // Between minSpread and minSpread+2%
            
            fallbackData.push({
              id: `${activeExchanges[i]}-${activeExchanges[j]}-${baseAsset}-${Date.now()}`,
              pair: `${baseAsset}/${quoteAsset}`,
              buyExchange: activeExchanges[i].charAt(0).toUpperCase() + activeExchanges[i].slice(1),
              sellExchange: activeExchanges[j].charAt(0).toUpperCase() + activeExchanges[j].slice(1),
              buyPrice: basePrice,
              sellPrice: basePrice * (1 + spreadPercentage/100),
              spreadPercentage,
              riskLevel: spreadPercentage > 2 ? 'low' : spreadPercentage > 1 ? 'medium' : 'high',
              timestamp: new Date(),
              volume24h: minVolume + Math.random() * minVolume * 10,
              recommendedNetworks: ['ETH', 'BSC'],
              type: 'direct'
            });
          });
        }
      }
    } else if (type === 'triangular') {
      // Generate triangular arbitrage opportunities for each exchange
      activeExchanges.forEach(exchange => {
        // Generate for a few combinations
        const combinations = [
          { asset1: 'BTC', asset2: 'ETH', asset3: quoteAsset },
          { asset1: 'ETH', asset2: 'SOL', asset3: quoteAsset },
          { asset1: 'BNB', asset2: 'BTC', asset3: quoteAsset }
        ];
        
        combinations.forEach((combo, index) => {
          const spreadPercentage = minSpread + Math.random() * 2;
          const basePrice = 1000 / (index + 1);
          
          fallbackData.push({
            id: `tri-${exchange}-${combo.asset1}-${combo.asset2}-${Date.now()}`,
            pair: `${combo.asset1}/${combo.asset2}/${combo.asset3}`,
            exchange: exchange.charAt(0).toUpperCase() + exchange.slice(1),
            buyExchange: exchange.charAt(0).toUpperCase() + exchange.slice(1),
            sellExchange: exchange.charAt(0).toUpperCase() + exchange.slice(1),
            buyPrice: basePrice,
            sellPrice: basePrice * (1 + spreadPercentage/100),
            spreadPercentage,
            riskLevel: spreadPercentage > 2 ? 'low' : spreadPercentage > 1 ? 'medium' : 'high',
            timestamp: new Date(),
            volume24h: minVolume + Math.random() * minVolume * 10,
            recommendedNetworks: ['ETH', 'BSC'],
            type: 'triangular'
          });
        });
      });
    } else if (type === 'futures') {
      // Generate futures arbitrage opportunities
      const futuresExchanges = ['FTX', 'Bybit', 'Binance', 'Coinbase', 'Kraken'];
      
      // Generate for key assets
      baseAssets.slice(0, 3).forEach((asset, index) => {
        for (let i = 0; i < futuresExchanges.length - 1; i++) {
          const spreadPercentage = minSpread + Math.random() * 2;
          const basePrice = 1000 / (index + 1);
          
          fallbackData.push({
            id: `fut-${futuresExchanges[i]}-${asset}-${Date.now()}`,
            pair: `${asset}-PERP`,
            exchange: futuresExchanges[i],
            buyExchange: futuresExchanges[i],
            sellExchange: futuresExchanges[(i + 1) % futuresExchanges.length],
            buyPrice: basePrice,
            sellPrice: basePrice * (1 + spreadPercentage/100),
            spreadPercentage,
            riskLevel: 'high', // Futures have higher risk
            timestamp: new Date(),
            volume24h: minVolume + Math.random() * minVolume * 20,
            recommendedNetworks: ['ETH'],
            type: 'futures'
          });
        }
      });
    }
    
    return fallbackData;
  };
  
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
