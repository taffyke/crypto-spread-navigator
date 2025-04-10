import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useMultiTickerWebSocket } from './use-websocket';
import { useSettings } from '@/lib/contexts/SettingsContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

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
export function useExchangeData(exchangeIds?: string[]) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['exchanges', exchangeIds],
        queryFn: () => fetchExchangeData(exchangeIds),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return useMemo(() => {
        if (!data) return [];
        return data.map((exchange: any) => ({
            id: exchange.id,
            name: exchange.name,
            logo: exchange.logo,
            website: exchange.website,
            pairs: exchange.pairs,
            fees: exchange.fees,
            transferMethods: exchange.transferMethods,
            withdrawalLimits: exchange.withdrawalLimits,
            apiDocumentation: exchange.apiDocumentation,
            notes: exchange.notes,
            isAvailable: exchange.isAvailable,
            createdAt: exchange.createdAt,
            updatedAt: exchange.updatedAt,
        }));
    }, [data]);
}

// This is the corrected function that had the error:
export function useExchangeWebSocketData(exchangeIds: string[]) {
  // Get the exchange metadata for the specified exchanges
  const exchangesData = useExchangeData(exchangeIds);

  // Get market data from WebSockets for the specified exchanges
  // FIXED: Changed to use correct number of arguments
  const { data: wsData, isConnected } = useMultiTickerWebSocket(exchangeIds);

  // Combine the data
  const exchangesWithData = useMemo(() => {
    if (!wsData) {
      return exchangesData;
    }

    return exchangesData.map(exchange => {
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
      const res = await fetch(`${API_BASE_URL}/api/exchanges/${exchangeId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    exchange: data,
    isLoading,
    isError,
  };
}
