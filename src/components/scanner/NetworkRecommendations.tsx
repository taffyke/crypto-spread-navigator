
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, RefreshCw } from 'lucide-react';
import { fetchNetworkFeeData } from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';

const NetworkRecommendations = () => {
  const [feeData, setFeeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchFeeData();
    
    // Set up refresh interval - fees change frequently
    const interval = setInterval(() => {
      fetchFeeData(true);
    }, 180000); // Every 3 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchFeeData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setRefreshing(true);
    
    try {
      const data = await fetchNetworkFeeData();
      setFeeData(data);
    } catch (error) {
      console.error("Failed to fetch network fee data:", error);
      if (!silent) {
        toast({
          title: "Data Loading Error",
          description: "Unable to load network fee data.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    fetchFeeData(true);
    toast({
      title: "Refreshing Fee Data",
      description: "Fetching latest network fee information."
    });
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm md:text-base">Network Recommendations</CardTitle>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
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
              ) : feeData.length > 0 ? (
                feeData.map((item, index) => (
                  <tr 
                    key={`${item.token}-${item.network}-${index}`} 
                    className="border-b border-slate-700/70 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-2 px-3 md:px-4">
                      <div className="font-medium text-white">{item.token}</div>
                    </td>
                    <td className="py-2 px-3 md:px-4 text-slate-300">
                      {item.network}
                    </td>
                    <td className="py-2 px-3 md:px-4 text-right text-slate-300">
                      ${item.fee.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 md:px-4 text-right">
                      <Badge 
                        className={`
                          ${item.congestion === 'low' ? 'bg-green-600' : 
                            item.congestion === 'medium' ? 'bg-amber-600' : 'bg-red-600'}
                          hover:bg-opacity-90 text-white text-[10px] md:text-xs
                        `}
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
