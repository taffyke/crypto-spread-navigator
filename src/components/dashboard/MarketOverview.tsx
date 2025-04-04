import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchCryptoMarketData, getFallbackTickerData } from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useMultiTickerWebSocket } from '@/hooks/use-websocket';

// Define the CryptoMarketData type
interface CryptoMarketData {
  symbol: string;
  price: number;
  change24h: number;
  logoUrl?: string; // Add logo URL for coin icons
}

const MarketOverview = () => {
  // Define constants outside of any hooks
  const coinPairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT', 'ADA/USDT', 'DOGE/USDT', 'DOT/USDT'];
  const exchanges = ['binance', 'coinbase', 'kraken', 'kucoin']; // Use multiple exchanges for reliability
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Use React Query for fallback market data
  const { 
    data: apiMarketData = [], 
    isLoading: isApiLoading,
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['cryptoMarketData'],
    queryFn: async ({ signal }) => {
      return await fetchCryptoMarketData(signal);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3,
    refetchOnWindowFocus: true,
  });
  
  // Create WebSocket connections to multiple exchanges
  const { 
    data: wsTickerData,
    isConnected,
    error: wsError,
    reconnect
  } = useMultiTickerWebSocket(
    exchanges,
    coinPairs.join(','),
    true // Always start connected, we'll handle reconnection logic below
  );
  
  // Automatically reconnect WebSocket if it fails
  useEffect(() => {
    if (wsError) {
      console.error('WebSocket error in MarketOverview:', wsError);
      
      // Only attempt reconnect if we haven't exceeded max attempts
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const timer = setTimeout(() => {
          console.log(`Attempting to reconnect market data WebSocket (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);
          reconnectAttempts.current += 1;
          reconnect();
        }, 3000 + (reconnectAttempts.current * 1000)); // Increasing backoff
        
        return () => clearTimeout(timer);
      } else {
        console.log('Max reconnection attempts reached, falling back to API data');
        // Reset counter after some time to allow future reconnection attempts
        const resetTimer = setTimeout(() => {
          reconnectAttempts.current = 0;
        }, 60000);
        
        return () => clearTimeout(resetTimer);
      }
    } else if (isConnected && Object.values(isConnected).some(Boolean)) {
      // Reset attempts when successfully connected
      reconnectAttempts.current = 0;
    }
  }, [wsError, reconnect, isConnected]);
  
  // Process WebSocket data into market data when available
  const wsMarketData = useMemo(() => {
    if (!wsTickerData || Object.keys(wsTickerData).length === 0) {
      // If WebSocket data is not available, return empty array
      return [];
    }
    
    // Extract data from WebSocket responses and format it
    const marketData: CryptoMarketData[] = [];
    
    // Try all connected exchanges, prioritizing binance then coinbase
    const availableExchanges = Object.keys(wsTickerData).filter(ex => 
      wsTickerData[ex] && Object.keys(wsTickerData[ex]).length > 0
    );
    
    if (availableExchanges.length === 0) return [];
    
    // For each coin pair, find data from the first available exchange
    coinPairs.forEach(pair => {
      const [baseCurrency, quoteCurrency] = pair.split('/');
      const symbol = baseCurrency;
      const tickerKey = baseCurrency.toLowerCase() + quoteCurrency.toLowerCase();
      
      // Try to find this pair in any connected exchange
      let pairData = null;
      for (const exchange of availableExchanges) {
        if (wsTickerData[exchange] && (
            wsTickerData[exchange][tickerKey] || 
            wsTickerData[exchange][pair] ||
            wsTickerData[exchange][pair.replace('/', '')] ||
            wsTickerData[exchange][pair.toLowerCase().replace('/', '')]
        )) {
          const key = wsTickerData[exchange][tickerKey] ? tickerKey :
                     wsTickerData[exchange][pair] ? pair :
                     wsTickerData[exchange][pair.replace('/', '')] ? pair.replace('/', '') :
                     pair.toLowerCase().replace('/', '');
                     
          pairData = {
            exchange,
            data: wsTickerData[exchange][key]
          };
          break;
        }
      }
      
      if (pairData) {
        const tickerData = pairData.data;
        const price = parseFloat(tickerData.price || tickerData.lastPrice || 0);
        const change24h = parseFloat(tickerData.priceChangePercent || tickerData.changePercent || 0);
        
        if (!isNaN(price)) {
          marketData.push({
            symbol,
            price,
            change24h,
            logoUrl: `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`
          });
        }
      } else {
        // If no real-time data found for this pair, use fallback
        const fallbackData = getFallbackTickerData('binance', pair);
        marketData.push({
          symbol,
          price: fallbackData.price,
          change24h: fallbackData.changePercent,
          logoUrl: `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`
        });
      }
    });
    
    return marketData;
  }, [wsTickerData, coinPairs]);
  
  // Update lastUpdated timestamp whenever we get new data
  useEffect(() => {
    if (wsMarketData.length > 0 || apiMarketData.length > 0) {
      setLastUpdated(new Date());
    }
  }, [wsMarketData, apiMarketData]);
  
  // Determine which data source to use: WebSocket or API
  const marketData = useMemo(() => {
    if (wsMarketData && wsMarketData.length > 0) {
      console.log('Using real-time WebSocket market data');
      return wsMarketData;
    }
    
    console.log('Using API market data');
    return apiMarketData;
  }, [wsMarketData, apiMarketData]);
  
  const isLoading = (!marketData || marketData.length === 0) && isApiLoading;
  const hasError = wsError && reconnectAttempts.current >= maxReconnectAttempts && (!marketData || marketData.length === 0);
  
  const handleRefresh = () => {
    // Reset the reconnect attempts
    reconnectAttempts.current = 0;
    
    // Try to reconnect the WebSocket first
    reconnect();
    
    // Also refresh API data as backup
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
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm md:text-base">Market Overview</CardTitle>
            {lastUpdated && (
              <span className="text-xs text-slate-400">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasError && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Connection error
              </span>
            )}
            <button 
              onClick={handleRefresh}
              disabled={isFetching}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
                      <div className="flex items-center gap-2">
                        <img 
                          src={coin.logoUrl || `/crypto-icons/${coin.symbol.toLowerCase()}.svg`}
                          alt={coin.symbol}
                          className="w-5 h-5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = `/crypto-icons/${coin.symbol.toLowerCase()}.svg`;
                            target.onerror = () => {
                              target.onerror = null;
                              target.src = '/crypto-icons/generic.svg';
                            };
                          }}
                        />
                        <span className="font-medium text-white">{coin.symbol}</span>
                      </div>
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
