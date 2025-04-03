
import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchCryptoMarketData, CryptoMarketData } from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';

const MarketOverview = () => {
  const [marketData, setMarketData] = useState<CryptoMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchMarketData();
    
    // Set up auto refresh every 2 minutes
    const interval = setInterval(() => {
      fetchMarketData(true);
    }, 120000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchMarketData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setRefreshing(true);
    
    try {
      const data = await fetchCryptoMarketData(8);
      setMarketData(data);
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      if (!silent) {
        toast({
          title: "Data Loading Error",
          description: "Unable to load cryptocurrency market data.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const formatLargeNumber = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return formatCurrency(value);
  };
  
  const handleRefresh = () => {
    fetchMarketData(true);
    toast({
      title: "Refreshing Market Data",
      description: "Fetching latest cryptocurrency market information."
    });
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Market Overview</CardTitle>
          <div className="flex gap-2 items-center">
            <Badge className="bg-blue-600 hover:bg-blue-600">{marketData.length} assets</Badge>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left font-medium text-slate-400 py-3 px-4">#</th>
                <th className="text-left font-medium text-slate-400 py-3 px-4">Asset</th>
                <th className="text-right font-medium text-slate-400 py-3 px-4">Price</th>
                <th className="text-right font-medium text-slate-400 py-3 px-4">24h</th>
                <th className="text-right font-medium text-slate-400 py-3 px-4">Volume (24h)</th>
                <th className="text-right font-medium text-slate-400 py-3 px-4">Market Cap</th>
                <th className="text-right font-medium text-slate-400 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, index) => (
                  <tr key={index} className="border-b border-slate-700/70">
                    <td colSpan={7} className="py-4">
                      <div className="flex items-center justify-center">
                        <div className="h-2 w-full mx-4 bg-slate-700/70 animate-pulse rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : marketData.length > 0 ? (
                marketData.map((asset, index) => (
                  <tr 
                    key={asset.id} 
                    className="border-b border-slate-700/70 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-400">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {asset.image && (
                          <img src={asset.image} alt={asset.name} className="w-5 h-5 rounded-full" />
                        )}
                        <div>
                          <div className="font-medium text-white">{asset.name}</div>
                          <div className="text-xs text-slate-400">{asset.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(asset.current_price)}</td>
                    <td className="py-3 px-4 text-right">
                      <span 
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          asset.price_change_percentage_24h >= 0 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {asset.price_change_percentage_24h >= 0 ? '+' : ''}
                        {asset.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">{formatLargeNumber(asset.volume)}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{formatLargeNumber(asset.market_cap)}</td>
                    <td className="py-3 px-4 text-right">
                      <a 
                        href={`https://www.coingecko.com/en/coins/${asset.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 inline-flex transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No market data available</td>
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
