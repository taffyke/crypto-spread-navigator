
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import { toast } from './use-toast';

export type MarketData = {
  id?: string;
  exchange_name: string;
  symbol: string;
  price: number;
  bid_price?: number;
  ask_price?: number;
  volume?: number;
  high_24h?: number;
  low_24h?: number;
  change_percent_24h?: number;
  timestamp: string;
  error?: string;
};

type UseMarketDataOptions = {
  refreshInterval?: number;
  staleTime?: number;
  enabled?: boolean;
};

export function useMarketData(
  exchangeName: string,
  symbols: string[],
  options: UseMarketDataOptions = {}
) {
  const [user, setUser] = useState<any>(null);

  // Check for authenticated user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchMarketData = useCallback(async () => {
    if (!user || !exchangeName || !symbols || symbols.length === 0) {
      return [];
    }
    
    try {
      // First check if we have recent data in Supabase (less than 5 minutes old)
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const { data: cachedData, error: cachedError } = await supabase
        .from('market_data')
        .select('*')
        .eq('exchange_name', exchangeName)
        .in('symbol', symbols)
        .gt('timestamp', fiveMinutesAgo.toISOString())
        .order('timestamp', { ascending: false });
      
      if (cachedError) {
        throw cachedError;
      }
      
      // If we have recent data for all symbols, use it
      if (cachedData && cachedData.length >= symbols.length) {
        const latestData: Record<string, MarketData> = {};
        
        // Get the latest data for each symbol
        cachedData.forEach(item => {
          if (!latestData[item.symbol] || 
              new Date(item.timestamp) > new Date(latestData[item.symbol].timestamp)) {
            latestData[item.symbol] = item;
          }
        });
        
        // If we have data for all requested symbols, return it
        if (Object.keys(latestData).length === symbols.length) {
          return Object.values(latestData);
        }
      }
      
      // If we don't have recent data, fetch fresh data
      const response = await fetch('/api/functions/fetch-market-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          exchange_name: exchangeName,
          symbols: symbols,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market data');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error: any) {
      console.error('Error fetching market data:', error);
      toast({
        title: 'Error Fetching Market Data',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
      });
      return [];
    }
  }, [exchangeName, symbols, user]);

  const { 
    data = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['marketData', exchangeName, symbols, user?.id],
    queryFn: fetchMarketData,
    enabled: Boolean(user && exchangeName && symbols && symbols.length > 0 && options.enabled !== false),
    refetchInterval: options.refreshInterval || 60000,
    staleTime: options.staleTime || 30000,
    retry: 3,
  });

  // Map the data to be easier to use
  const marketDataMap = data.reduce((acc, item) => {
    acc[item.symbol] = item;
    return acc;
  }, {} as Record<string, MarketData>);

  return {
    data: marketDataMap,
    allData: data,
    isLoading,
    isError,
    refetch,
    isAuthenticated: Boolean(user)
  };
}
