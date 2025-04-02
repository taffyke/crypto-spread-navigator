
import { useState, useEffect } from 'react';
import { generateArbitrageOpportunities } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

export interface ArbitrageData {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spreadPercentage: number;
  potentialProfit: number;
  timestamp: Date;
  volume24h: number;
  depositStatus?: string;
  withdrawalStatus?: string;
  type: 'direct' | 'triangular' | 'futures';
}

// This would be replaced with real API calls in a production environment
const fetchArbitrageData = async (
  type: 'direct' | 'triangular' | 'futures', 
  exchanges: string[],
  minSpread: number,
  minVolume: number
): Promise<ArbitrageData[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would be an API call to a backend service
  // that fetches real-time data from exchange APIs
  const opportunities = generateArbitrageOpportunities(30).map(opp => ({
    ...opp,
    type,
    // Create different data for different arbitrage types to simulate real data
    pair: type === 'direct' ? opp.pair : 
          type === 'triangular' ? `${opp.pair.split('/')[0]}/ETH/BTC` : 
          `${opp.pair} (Futures)`,
    buyExchange: type === 'futures' ? opp.buyExchange + " Spot" : opp.buyExchange,
    sellExchange: type === 'futures' ? opp.sellExchange + " Futures" : opp.sellExchange,
    spreadPercentage: type === 'direct' ? opp.spreadPercentage : 
                    type === 'triangular' ? opp.spreadPercentage * 0.8 : 
                    opp.spreadPercentage * 1.2,
    potentialProfit: type === 'direct' ? opp.potentialProfit : 
                    type === 'triangular' ? opp.potentialProfit * 0.9 : 
                    opp.potentialProfit * 1.1
  }));
  
  return opportunities.filter(opp => 
    opp.spreadPercentage >= minSpread && 
    opp.volume24h >= minVolume &&
    exchanges.includes(opp.buyExchange.replace(' Spot', '')) && 
    exchanges.includes(opp.sellExchange.replace(' Futures', ''))
  );
};

export const useArbitrageData = (
  type: 'direct' | 'triangular' | 'futures',
  exchanges: string[] = [],
  minSpread: number = 0.5,
  minVolume: number = 10000,
  autoRefresh: boolean = true
) => {
  const [data, setData] = useState<ArbitrageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchArbitrageData(type, exchanges, minSpread, minVolume);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: "Error",
        description: "Failed to fetch arbitrage opportunities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [type, exchanges.join(','), minSpread, minVolume]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    lastUpdated
  };
};

// Add a hook for triangular arbitrage paths
export const useTriangularPaths = (baseCurrency: string = 'BTC') => {
  const [paths, setPaths] = useState<string[]>([]);
  
  useEffect(() => {
    // In a real app, these would be dynamically generated based on available markets
    const commonPaths = [
      `${baseCurrency}/ETH/USDT`,
      `${baseCurrency}/BNB/USDT`,
      `${baseCurrency}/SOL/USDT`,
      `${baseCurrency}/XRP/USDT`,
      `${baseCurrency}/ADA/USDT`,
    ];
    
    setPaths(commonPaths);
  }, [baseCurrency]);
  
  return paths;
};
