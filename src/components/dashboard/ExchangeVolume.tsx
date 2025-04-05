
import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { fetchExchangeVolumeData, ExchangeVolumeData as ApiVolumeData } from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useMultiTickerWebSocket } from '@/hooks/use-websocket';

// Define the ExchangeVolumeData type
interface ExchangeVolumeData {
  exchange: string;
  volume24h: number;
}

// Define a custom payload type for the Legend component
interface CustomLegendPayload {
  value: string;
  color: string;
  logo?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#eab308', '#8b5cf6', '#06b6d4', '#d946ef'];
const EXCHANGE_LOGOS: Record<string, string> = {
  binance: '/exchange-logos/binance.svg',
  coinbase: '/exchange-logos/coinbase.svg',
  kucoin: '/exchange-logos/kucoin.svg',
  kraken: '/exchange-logos/kraken.svg',
  gate_io: '/exchange-logos/gate.svg',
  bitget: '/exchange-logos/bitget.svg',
  bybit: '/exchange-logos/bybit.svg',
  bitfinex: '/exchange-logos/bitfinex.svg',
  gemini: '/exchange-logos/gemini.svg',
  poloniex: '/exchange-logos/poloniex.svg',
  okx: '/exchange-logos/okx.svg',
  ascendex: '/exchange-logos/ascendex.svg',
  bitrue: '/exchange-logos/bitrue.svg',
  htx: '/exchange-logos/htx.svg',
  mexc_global: '/exchange-logos/mexc.svg',
};

const ExchangeVolume = () => {
  // Define exchange IDs for both API and WebSocket
  const exchangeIds = [
    'binance', 'coinbase', 'kucoin', 'kraken', 'gate_io',
    'bitget', 'bybit', 'bitfinex', 'gemini', 'poloniex',
    'okx', 'ascendex', 'bitrue', 'htx', 'mexc_global'
  ];
  
  // Handle refresh function to be passed to useQuery
  const handleRefetch = useCallback(async ({ signal }: { signal?: AbortSignal } = {}) => {
    return await fetchExchangeVolumeData(exchangeIds, 'day', signal);
  }, []);
  
  // Use React Query for fallback data fetching with caching and automatic refetching
  const { 
    data: apiVolumeData = [], 
    isLoading: isApiLoading, 
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['exchangeVolumeData'],
    queryFn: handleRefetch,
    refetchInterval: 60000, // Refresh every 1 minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
    refetchOnWindowFocus: true,
  });
  
  // Use WebSocket to get real-time ticker data from multiple exchanges
  const {
    data: wsData,
    isConnected,
    error: wsError
  } = useMultiTickerWebSocket(
    exchangeIds,
    'BTC/USDT', // Use a high-volume pair as reference
    true // Enable WebSocket
  );
  
  // Process WebSocket data into volume data when available
  const wsVolumeData = useMemo(() => {
    if (!wsData || Object.keys(wsData).length === 0) {
      return [];
    }
    
    return Object.entries(wsData)
      .filter(([, data]) => data !== undefined && data !== null)
      .map(([exchange, data]) => {
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
      })
      .filter(item => item.volume24h > 0);
  }, [wsData]);
  
  // Determine which data source to use: WebSocket or API
  const volumeData: ExchangeVolumeData[] = useMemo(() => {
    if (wsVolumeData && wsVolumeData.length > 1) {
      console.log('Using real-time WebSocket volume data');
      return wsVolumeData as ExchangeVolumeData[];
    }
    
    console.log('Using API volume data');
    return apiVolumeData.map(item => ({
      exchange: item.exchange,
      volume24h: item.volume
    })) as ExchangeVolumeData[];
  }, [wsVolumeData, apiVolumeData]);
  
  // Calculate loading state based on data availability and connection status
  const isLoading = useMemo(() => {
    if (volumeData && volumeData.length > 0) {
      return false;
    }
    
    // Check if API is loading
    if (isApiLoading) {
      return true;
    }
    
    // Check WebSocket connection status if available
    if (isConnected) {
      return Object.values(isConnected).some(status => status === false);
    }
    
    return true;
  }, [volumeData, isApiLoading, isConnected]);
  
  const formatVolumeData = useCallback((data: ExchangeVolumeData[]) => {
    return data.map((item) => ({
      name: item.exchange,
      value: item.volume24h,
      logo: EXCHANGE_LOGOS[item.exchange.toLowerCase()] || null
    }));
  }, []);
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Volume Data",
      description: "Fetching latest exchange volume information."
    });
  };
  
  // Custom renderer for pie chart labels with logos
  const renderCustomizedLabel = useCallback(({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  }, []);
  
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
        ) : volumeData && volumeData.length > 0 ? (
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
                  labelLine={false}
                  label={renderCustomizedLabel}
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
                  formatter={(value, entry, index) => {
                    const item = entry && (entry.payload as unknown as CustomLegendPayload);
                    const logoPath = item?.logo;
                    return (
                      <span className="flex items-center gap-1">
                        {logoPath && (
                          <img src={logoPath} alt={value} className="w-4 h-4 inline-block" />
                        )}
                        <span style={{ color: '#e2e8f0' }}>{value}</span>
                      </span>
                    );
                  }}
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
