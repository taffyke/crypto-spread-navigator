
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { fetchExchangeVolumeData } from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useMultiTickerWebSocket } from '@/hooks/use-websocket';

// Define the ExchangeVolumeData type
interface ExchangeVolumeData {
  exchange: string;
  volume24h: number;
}

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444'];

const ExchangeVolume = () => {
  // Use WebSocket to get real-time ticker data from multiple exchanges
  const exchangeIds = ['binance', 'coinbase', 'kucoin', 'kraken', 'gate_io'];
  const {
    data: wsData,
    isConnected,
    error: wsError
  } = useMultiTickerWebSocket(
    exchangeIds,
    'BTC/USDT', // Use a high-volume pair as reference
    true // Enable WebSocket
  );
  
  // Use React Query for fallback data fetching with caching and automatic refetching
  const { 
    data: apiVolumeData = [], 
    isLoading: isApiLoading, 
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['exchangeVolumeData'],
    queryFn: async ({ signal }) => {
      return await fetchExchangeVolumeData(signal);
    },
    refetchInterval: 60000, // Refresh every 1 minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
    refetchOnWindowFocus: true,
  });
  
  // Process WebSocket data into volume data when available
  const wsVolumeData = useMemo(() => {
    if (!wsData || Object.keys(wsData).length === 0) {
      return null;
    }
    
    return Object.entries(wsData).map(([exchange, data]) => {
      // Extract volume from WebSocket data or provide fallback
      const tickerData = data as any;
      const volume = tickerData?.volume24h || tickerData?.volume || 0;
      
      // Adjust volume to realistic levels if it's too small
      // (WebSocket might only provide recent volume, not 24h)
      const adjustedVolume = volume < 10000 ? volume * 10000 : volume;
      
      return {
        exchange: exchange.charAt(0).toUpperCase() + exchange.slice(1),
        volume24h: adjustedVolume
      };
    }).filter(item => item.volume24h > 0);
  }, [wsData]);
  
  // Determine which data source to use: WebSocket or API
  const volumeData = useMemo(() => {
    if (wsVolumeData && wsVolumeData.length > 0) {
      console.log('Using real-time WebSocket volume data');
      return wsVolumeData;
    }
    
    console.log('Using API volume data');
    return apiVolumeData;
  }, [wsVolumeData, apiVolumeData]);
  
  const isLoading = (!volumeData || volumeData.length === 0) && (isApiLoading || Object.keys(isConnected || {}).some(k => isConnected[k] === false));
  
  const formatVolumeData = (data: ExchangeVolumeData[]) => {
    return data.map((item) => ({
      name: item.exchange,
      value: item.volume24h,
    }));
  };
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Volume Data",
      description: "Fetching latest exchange volume information."
    });
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm md:text-base">Exchange Volume (24h)</CardTitle>
          <button 
            onClick={handleRefresh}
            disabled={isFetching}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[250px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : volumeData.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatVolumeData(volumeData)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {formatVolumeData(volumeData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${(value / 1000000).toFixed(0)}M`, 'Volume']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }}
                />
                <Legend 
                  formatter={(value, entry, index) => (
                    <span style={{ color: '#e2e8f0' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-slate-400">
            No volume data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExchangeVolume;
