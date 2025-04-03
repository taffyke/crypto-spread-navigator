
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, RefreshCw } from 'lucide-react';
import { fetchNetworkFeeData } from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

// Define the NetworkFeeData type
interface NetworkFeeData {
  token: string;
  network: string;
  fee: number;
  congestion: 'low' | 'medium' | 'high';
}

const NetworkRecommendations = () => {
  // Use React Query for efficient data fetching with caching and automatic refetching
  const { 
    data: feeData = [], 
    isLoading,
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['networkFeeData'],
    queryFn: async ({ signal }) => {
      return await fetchNetworkFeeData(signal);
    },
    refetchInterval: 60000, // Refresh every 1 minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
    refetchOnWindowFocus: true,
  });
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Fee Data",
      description: "Fetching latest network fee information."
    });
  };
  
  // Sort networks by fee (lowest first) to recommend the cheapest
  const sortedFeeData = [...feeData].sort((a, b) => a.fee - b.fee);
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm md:text-base">Network Recommendations</CardTitle>
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
                <th className="text-left font-medium text-slate-400 py-2 px-3 md:px-4">Asset</th>
                <th className="text-left font-medium text-slate-400 py-2 px-3 md:px-4">Network</th>
                <th className="text-right font-medium text-slate-400 py-2 px-3 md:px-4">Fee</th>
                <th className="text-right font-medium text-slate-400 py-2 px-3 md:px-4">Congestion</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(6).fill(0).map((_, index) => (
                  <tr key={index} className="border-b border-slate-700/70">
                    <td colSpan={4} className="py-3">
                      <div className="flex items-center justify-center">
                        <div className="h-2 w-full mx-4 bg-slate-700/70 animate-pulse rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : sortedFeeData.length > 0 ? (
                sortedFeeData.map((item, index) => (
                  <tr 
                    key={`${item.token}-${item.network}-${index}`} 
                    className={cn(
                      "border-b border-slate-700/70 hover:bg-slate-700/30 transition-colors",
                      index < 3 ? "bg-slate-700/20" : "" // Highlight the three cheapest networks
                    )}
                  >
                    <td className="py-2 px-3 md:px-4">
                      <div className="font-medium text-white">{item.token}</div>
                    </td>
                    <td className="py-2 px-3 md:px-4 text-slate-300">
                      {item.network}
                      {index < 3 && (
                        <span className="ml-1 text-green-400 text-[10px]">
                          {index === 0 ? "Best" : index === 1 ? "Good" : "Recommended"}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 md:px-4 text-right text-slate-300">
                      ${item.fee.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 md:px-4 text-right">
                      <Badge 
                        className={cn(
                          "hover:bg-opacity-90 text-white text-[10px] md:text-xs",
                          item.congestion === 'low' ? "bg-green-600" : 
                          item.congestion === 'medium' ? "bg-amber-600" : "bg-red-600"
                        )}
                      >
                        {item.congestion.charAt(0).toUpperCase() + item.congestion.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">
                    No network data available
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

export default NetworkRecommendations;
