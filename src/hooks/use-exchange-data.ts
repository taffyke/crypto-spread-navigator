
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useMultiTickerWebSocket } from './use-websocket';

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
  let url = `${API_BASE_URL}/api/exchanges`;
  if (exchangeIds && exchangeIds.length > 0) {
    url += `?ids=${exchangeIds.join(',')}`;
  }
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
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
            kraken: createMockTickerData(symbolsList, 'kraken')
        }];
    }, [symbolsList]);
    
    const { data, isLoading, isError } = useQuery({
        queryKey: ['exchanges', exchangeIds, symbolsList],
        queryFn: async () => {
            try {
                const data = await fetchExchangeData(exchangeIds);
                return data;
            } catch (err) {
                console.error("Failed to fetch exchange data:", err);
                return mockExchangeData;
            }
        },
        staleTime: refreshInterval,
    });

    // Return mock data while waiting for real data
    return data || mockExchangeData;
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
        
        // Slight variation based on exchange name length to simulate different prices
        const exchangeFactor = exchange.length / 10;
        
        result[symbol] = {
            symbol,
            price: basePrice * (1 + (exchangeFactor - 0.5) / 50),
            bidPrice: basePrice * (1 + (exchangeFactor - 0.6) / 50),
            askPrice: basePrice * (1 + (exchangeFactor - 0.4) / 50),
            volume: 10000 * exchangeFactor,
            timestamp: Date.now(),
            exchange,
            high24h: basePrice * 1.05,
            low24h: basePrice * 0.95,
            change24h: (Math.random() * 6) - 3,
            changePercent24h: (Math.random() * 2) - 1
        };
    });
    
    return result;
}

// Hook for WebSocket data with proper parameter handling
export function useExchangeWebSocketData(exchangeIds: string[]) {
  // Get the exchange metadata for the specified exchanges
  const exchangesData = useExchangeData({ exchanges: exchangeIds });

  // Get market data from WebSockets for the specified exchanges
  const { data: wsData, isConnected } = useMultiTickerWebSocket(exchangeIds, 'BTC/USDT');

  // Combine the data
  const exchangesWithData = useMemo(() => {
    if (!wsData) {
      return exchangesData;
    }

    return exchangesData.map((exchange: any) => {
      const exchangeWsData = wsData[exchange.id];
      return {
        ...exchange,
        wsData: exchangeWsData || null
      };
    });
  }, [exchangesData, wsData]);

  return {
    exchanges: exchangesWithData,
    isLoading: !exchangesData.length,
    isConnected
  };
}

// Hook to get a single exchange by ID
export function useExchange(exchangeId: string) {
  const { data, isLoading, isError } = useQuery({
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
  };
}
