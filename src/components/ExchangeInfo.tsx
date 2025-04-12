
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useExchangeData } from '@/hooks/use-exchange-data';
import { SUPPORTED_EXCHANGES } from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ExchangeInfoProps {
  symbols?: string[];
  exchanges?: string[];
  title?: string;
}

export function ExchangeInfo({ 
  symbols = ['BTC/USDT', 'ETH/USDT'], 
  exchanges = SUPPORTED_EXCHANGES.slice(0, 5),
  title = "Exchange Information"
}: ExchangeInfoProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Pass exchanges as array to the hook
  const { data, isLoading, isError, connectStatus, refresh } = useExchangeData(
    exchanges, // Now properly passing as string[]
    symbols,
    {
      refreshInterval: 15000,
      autoRefresh: true
    }
  );
  
  // Count connected exchanges
  const connectedCount = Object.values(connectStatus).filter(Boolean).length;
  const connectionQuality = connectedCount === 0 ? 'offline' : 
                           connectedCount < exchanges.length / 2 ? 'poor' :
                           connectedCount < exchanges.length ? 'good' : 'excellent';
  
  // Update last updated time whenever data changes
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      setLastUpdated(new Date());
    }
  }, [data]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    refresh();
    
    // Show immediate feedback
    toast({
      title: "Reconnecting to Exchanges",
      description: "Refreshing market data and connections...",
    });
    
    // Reset refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };
  
  // Format time since last update
  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`;
    return `${Math.floor(seconds/3600)}h ago`;
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm md:text-base">{title}</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1
                  ${connectionQuality === 'excellent' ? 'bg-green-900/40 text-green-400' :
                    connectionQuality === 'good' ? 'bg-blue-900/40 text-blue-400' :
                    connectionQuality === 'poor' ? 'bg-amber-900/40 text-amber-400' :
                    'bg-red-900/40 text-red-400'}`}>
                  {connectionQuality === 'offline' ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                  {connectedCount}/{exchanges.length}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{connectedCount} of {exchanges.length} exchanges connected</p>
                <p className="text-xs text-slate-400 mt-1">Last updated: {getTimeSinceUpdate()}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Button 
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <div className="flex items-center text-red-400">
              <AlertTriangle className="mr-2 h-4 w-4" />
              <span>Unable to connect to exchanges</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="text-xs"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {symbols.map(symbol => (
              <div key={symbol} className="border-b border-slate-700 pb-3 last:border-none">
                <h4 className="font-medium mb-2">{symbol}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {exchanges.map(exchange => {
                    const ticker = data[exchange]?.[symbol];
                    const isConnected = connectStatus[exchange];
                    
                    return (
                      <div 
                        key={exchange} 
                        className={`p-2 rounded transition-colors duration-300 ${
                          isConnected ? 'bg-slate-700/50' : 'bg-slate-700/20 text-slate-400'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="capitalize flex items-center gap-1">
                            {isConnected ? 
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> : 
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            }
                            {exchange.replace('_', ' ')}
                          </span>
                          <span className={!isConnected ? 'text-slate-500' : ''}>
                            ${ticker?.price?.toFixed(2) || '-.--'}
                          </span>
                        </div>
                        {ticker?.changePercent24h !== undefined && (
                          <div className={`text-right text-xs mt-1 ${
                            ticker.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {ticker.changePercent24h >= 0 ? '+' : ''}{ticker.changePercent24h.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ExchangeInfo;
