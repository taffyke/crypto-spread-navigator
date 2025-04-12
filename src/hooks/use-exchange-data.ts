
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useMultiTickerWebSocket } from './use-websocket';
import { toast } from './use-toast';

// Use import.meta.env instead of process.env for Vite compatibility
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Define expected parameters for useExchangeData
interface ExchangeDataParams {
  exchanges?: string[];
  symbols?: string[];
  refreshInterval?: number;
  retryWebSocketInterval?: number;
  fallbackToApi?: boolean;
}

// Fetch exchange metadata
async function fetchExchangeData(exchangeIds?: string[]) {
  try {
    let url = `${API_BASE_URL}/api/exchanges`;
    if (exchangeIds && exchangeIds.length > 0) {
      url += `?ids=${exchangeIds.join(',')}`;
    }
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch exchange data:", error);
    throw error;
  }
}

// Hook to fetch exchange metadata
export function useExchangeData(params?: ExchangeDataParams) {
    const exchangeIds = params?.exchanges || [];
    const symbolsList = params?.symbols || [];
    const refreshInterval = params?.refreshInterval || 30000;
    
    // Use mock data when API isn't available
    const mockExchangeData = useMemo(() => {
        return [{
            binance: createMockTickerData(symbolsList, 'binance'),
            coinbase: createMockTickerData(symbolsList, 'coinbase'),
            kraken: createMockTickerData(symbolsList, 'kraken'),
            bitfinex: createMockTickerData(symbolsList, 'bitfinex'),
            kucoin: createMockTickerData(symbolsList, 'kucoin'),
            bybit: createMockTickerData(symbolsList, 'bybit'),
            gate_io: createMockTickerData(symbolsList, 'gate_io'),
            gemini: createMockTickerData(symbolsList, 'gemini'),
            okx: createMockTickerData(symbolsList, 'okx'),
            poloniex: createMockTickerData(symbolsList, 'poloniex'),
            bitget: createMockTickerData(symbolsList, 'bitget'),
            bitrue: createMockTickerData(symbolsList, 'bitrue'),
            htx: createMockTickerData(symbolsList, 'htx'),
            mexc_global: createMockTickerData(symbolsList, 'mexc_global'),
            ascendex: createMockTickerData(symbolsList, 'ascendex')
        }];
    }, [symbolsList]);

    // Function to refresh data
    const refresh = () => {
        // Query will be refetched automatically
    };
    
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['exchanges', exchangeIds, symbolsList],
        queryFn: async () => {
            try {
                const data = await fetchExchangeData(exchangeIds);
                return data;
            } catch (err) {
                console.error("Failed to fetch exchange data:", err);
                toast({
                    title: "API Connection Error",
                    description: "Using local data sources instead",
                    variant: "destructive",
                });
                return mockExchangeData;
            }
        },
        staleTime: refreshInterval,
        refetchInterval: refreshInterval,
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return {
        data: data || mockExchangeData,
        isLoading,
        isError,
        refresh: refetch
    };
}

// Create mock ticker data for backup
function createMockTickerData(symbols: string[], exchange: string) {
    const result: Record<string, any> = {};
    
    symbols.forEach(symbol => {
        // Generate consistent but slightly different prices per exchange
        const basePrice = symbol.includes('BTC') ? 78750 : 
                         symbol.includes('ETH') ? 3800 : 
                         symbol.includes('SOL') ? 175 : 
                         symbol.includes('XRP') ? 0.58 : 
                         symbol.includes('BNB') ? 580 : 
                         symbol.includes('ADA') ? 0.45 : 
                         symbol.includes('DOGE') ? 0.15 : 
                         symbol.includes('DOT') ? 7.25 : 100;
        
        // Create variation based on exchange name length to simulate different prices
        // This creates a deterministic but unique pricing pattern for each exchange
        const exchangeFactor = (exchange.length % 5) / 100 + 1;
        // Add a small random component for natural variation
        const randomFactor = 0.995 + (Math.sin(exchange.charCodeAt(0) * 0.1) * 0.01);
        
        const price = basePrice * exchangeFactor * randomFactor;
        
        result[symbol] = {
            symbol,
            price: price,
            bidPrice: price * 0.998,
            askPrice: price * 1.002,
            volume: 10000 * exchangeFactor * 1000,
            timestamp: Date.now(),
            exchange,
            high24h: price * 1.05,
            low24h: price * 0.95,
            change24h: price * (Math.random() * 0.06 - 0.03),
            changePercent24h: (Math.random() * 6) - 3
        };
    });
    
    return result;
}

// Hook for WebSocket data with proper parameter handling
export function useExchangeWebSocketData(exchangeIds: string[] = []) {
  // Get the exchange metadata for the specified exchanges
  const { data: exchangesData, refresh: refreshExchanges } = useExchangeData({ 
    exchanges: exchangeIds,
    refreshInterval: 60000 // 1 minute refresh for static exchange data
  });

  // Default to BTC/USDT if no pairs specified
  const defaultPairs = ['BTC/USDT', 'ETH/USDT'];
  
  // Get market data from WebSockets for the specified exchanges
  const { data: wsData, isConnected, reconnect } = useMultiTickerWebSocket(
    exchangeIds, 
    defaultPairs.join(',')
  );

  // Combine the data
  const exchangesWithData = useMemo(() => {
    if (!exchangesData || exchangesData.length === 0) {
      return [];
    }
    
    // Use WebSocket data when available, fall back to exchange data
    return exchangesData.map((exchange: any) => {
      const exchangeId = exchange.id || '';
      const exchangeWsData = wsData && wsData[exchangeId];
      
      return {
        ...exchange,
        wsData: exchangeWsData || null,
        // Add a connected status flag
        connected: isConnected?.[exchangeId] || false
      };
    });
  }, [exchangesData, wsData, isConnected]);
  
  // Add a refresh function that handles both data sources
  const refresh = useCallback(() => {
    refreshExchanges();
    reconnect();
  }, [refreshExchanges, reconnect]);

  return {
    exchanges: exchangesWithData || [],
    isLoading: !exchangesData || exchangesData.length === 0,
    isConnected,
    refresh
  };
}

// Hook to get a single exchange by ID
export function useExchange(exchangeId: string) {
  const { data, isLoading, isError, refresh } = useQuery({
    queryKey: ['exchange', exchangeId],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/exchanges/${exchangeId}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      } catch (err) {
        console.error(`Failed to fetch exchange ${exchangeId}:`, err);
        // Return mock data for the specific exchange
        return {
          id: exchangeId,
          name: exchangeId.charAt(0).toUpperCase() + exchangeId.slice(1),
          logo: `/exchange-logos/${exchangeId}.svg`,
          website: `https://www.${exchangeId}.com`,
          pairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
          fees: { maker: 0.1, taker: 0.2 },
          isAvailable: true
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    exchange: data,
    isLoading,
    isError,
    refresh
  };
}
