
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { fetchCryptoMarketData } from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

// Define the CryptoMarketData type
interface CryptoMarketData {
  symbol: string;
  price: number;
  change24h: number;
}

const MarketOverview = () => {
  // Use React Query for efficient data fetching with caching and automatic refetching
  const { 
    data: marketData = [], 
    isLoading,
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['cryptoMarketData'],
    queryFn: async ({ signal }) => {
      return await fetchCryptoMarketData(signal);
    },
    refetchInterval: 60000, // Refresh every 1 minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
    refetchOnWindowFocus: true,
  });
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Market Data",
      description: "Fetching latest cryptocurrency prices."
    });
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm md:text-base">Market Overview</CardTitle>
          <button 
            onClick={handleRefresh}
            disabled={isFetching}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left font-medium text-slate-400 py-2 px-3 md:px-4">Coin</th>
                <th className="text-right font-medium text-slate-400 py-2 px-3 md:px-4">Price</th>
                <th className="text-right font-medium text-slate-400 py-2 px-3 md:px-4">24h Change</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(6).fill(0).map((_, index) => (
                  <tr key={index} className="border-b border-slate-700/70">
                    <td colSpan={3} className="py-3">
                      <div className="flex items-center justify-center">
                        <div className="h-2 w-full mx-4 bg-slate-700/70 animate-pulse rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : marketData.length > 0 ? (
                marketData.map((coin: CryptoMarketData, index) => (
                  <tr 
                    key={`${coin.symbol}-${index}`}
                    className="border-b border-slate-700/70 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-2 px-3 md:px-4">
                      <div className="font-medium text-white">{coin.symbol}</div>
                    </td>
                    <td className="py-2 px-3 md:px-4 text-right">
                      ${typeof coin.price === 'number' ? coin.price.toFixed(2) : '0.00'}
                    </td>
                    <td className="py-2 px-3 md:px-4 text-right">
                      <div className={`flex items-center justify-end ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {coin.change24h >= 0 ? 
                          <TrendingUp className="h-3 w-3 mr-1" /> : 
                          <TrendingDown className="h-3 w-3 mr-1" />
                        }
                        {typeof coin.change24h === 'number' ? coin.change24h.toFixed(2) : '0.00'}%
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-slate-400">
                    No market data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
