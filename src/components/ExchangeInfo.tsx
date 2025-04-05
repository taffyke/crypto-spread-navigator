
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useExchangeData } from '@/hooks/use-exchange-data';
import { SUPPORTED_EXCHANGES } from '@/lib/api/cryptoDataApi';

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
  const { data, isLoading, isError, connectStatus, refresh } = useExchangeData({
    symbols,
    exchanges
  });
  
  // Count connected exchanges
  const connectedCount = Object.values(connectStatus).filter(Boolean).length;
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm md:text-base">{title}</CardTitle>
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-green-400">
              {connectedCount}/{exchanges.length} connected
            </span>
          </div>
          <button 
            onClick={refresh}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
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
          <div className="flex items-center justify-center py-4 text-red-400">
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Unable to connect to exchanges</span>
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
                        className={`p-2 rounded ${isConnected ? 'bg-slate-700/50' : 'bg-slate-700/20 text-slate-400'}`}
                      >
                        <div className="flex justify-between">
                          <span className="capitalize">{exchange.replace('_', ' ')}</span>
                          <span className={!isConnected ? 'text-slate-500' : ''}>
                            ${ticker?.price.toFixed(2) || '-.--'}
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
