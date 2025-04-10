
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchCryptoMarketData, TickerData } from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useMultiTickerWebSocket } from '@/hooks/use-websocket';
import { SUPPORTED_EXCHANGES } from '@/lib/api/cryptoDataApi';
import { useExchangeData } from '@/hooks/use-exchange-data';

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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Use our enhanced useExchangeData hook for better reliability
  const exchangeParams = {
    symbols: coinPairs,
    exchanges: ['binance', 'coinbase', 'kraken'], // Use 3 major exchanges for reliable market data
    refreshInterval: 30000
  };
  
  const exchangeData = useExchangeData(exchangeParams);
  
  // Use React Query as a backup for market data
  const { 
    data: apiMarketData = [], 
    isLoading: isApiLoading,
    refetch: refetchApiData, 
    isFetching 
  } = useQuery({
    queryKey: ['cryptoMarketData'],
    queryFn: async ({ signal }) => {
      return await fetchCryptoMarketData(signal);
    },
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
    refetchOnWindowFocus: true,
    enabled: true,
  });
  
  // Process exchange data into market data format
  const exchangeMarketData = useMemo(() => {
    if (!exchangeData || exchangeData.length === 0) {
      return [];
    }
    
    const marketData: CryptoMarketData[] = [];
    
    // Process each symbol
    for (const pair of coinPairs) {
      const [symbol] = pair.split('/');
      
      // Find the best exchange data for this symbol
      // Prefer in this order: binance, coinbase, kraken, or any other available
      let tickerData: TickerData | undefined;
      
      for (const preferredExchange of ['binance', 'coinbase', 'kraken']) {
        if (exchangeData[0]?.[preferredExchange]?.[pair] && 
            typeof exchangeData[0]?.[preferredExchange][pair].price === 'number') {
          tickerData = exchangeData[0][preferredExchange][pair];
          break;
        }
      }
      
      // If we still don't have data, try any exchange
      if (!tickerData && exchangeData[0]) {
        for (const [exchange, exchangeTickers] of Object.entries(exchangeData[0])) {
          if (exchangeTickers && exchangeTickers[pair] && typeof exchangeTickers[pair].price === 'number') {
            tickerData = exchangeTickers[pair];
            break;
          }
        }
      }
      
      if (tickerData) {
        marketData.push({
          symbol,
          price: tickerData.price,
          change24h: tickerData.changePercent24h || 0,
          logoUrl: `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`
        });
      }
    }
    
    return marketData;
  }, [exchangeData, coinPairs]);
  
  // Update lastUpdated timestamp whenever we get new data
  useEffect(() => {
    if (exchangeMarketData.length > 0 || apiMarketData.length > 0) {
      setLastUpdated(new Date());
    }
  }, [exchangeMarketData, apiMarketData]);
  
  // Determine which data source to use: Exchange data or API
  const marketData = useMemo(() => {
    if (exchangeMarketData && exchangeMarketData.length > 0) {
      console.log('Using real-time exchange market data');
      return exchangeMarketData;
    }
    
    console.log('Using API market data');
    return apiMarketData;
  }, [exchangeMarketData, apiMarketData]);
  
  // Initialize a default for exchange connection status
  const exchangeConnections = useMemo(() => {
    // Return an empty object as default to avoid the null/undefined error
    return {};
  }, []);
  
  // Count connected exchanges - Fixed to handle null/undefined properly
  const connectedExchangeCount = useMemo(() => {
    // Check if exchangeConnections exists and is an object before calling Object.values
    if (!exchangeConnections || typeof exchangeConnections !== 'object') {
      return 0;
    }
    return Object.values(exchangeConnections).filter(Boolean).length;
  }, [exchangeConnections]);
  
  const isExchangeLoading = true; // Simplified loading state
  const isExchangeError = false; // Simplified error state
  
  const isLoading = (!marketData || marketData.length === 0) && (isExchangeLoading || isApiLoading);
  const hasError = isExchangeError && (!marketData || marketData.length === 0);
  
  // Refresh function
  const handleRefresh = () => {
    // Refresh API data as backup
    refetchApiData();
    
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
            {connectedExchangeCount > 0 && (
              <span className="text-xs bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full">
                {connectedExchangeCount} connected
              </span>
            )}
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
                      ${typeof coin.price === 'number' ? coin.price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: coin.price < 1 ? 6 : 2
                      }) : '0.00'}
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
