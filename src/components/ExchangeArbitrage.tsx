
import React, { useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { useExchangeData } from '@/hooks/use-exchange-data';
import { SUPPORTED_EXCHANGES } from '@/lib/api/cryptoDataApi';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ExchangeArbitrageProps {
  symbols?: string[];
  minSpreadPercent?: number; 
}

export function ExchangeArbitrage({
  symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT'],
  minSpreadPercent = 0.1
}: ExchangeArbitrageProps) {
  // Use all supported exchanges for maximum arbitrage opportunities
  const { data, isLoading, refresh, connectStatus } = useExchangeData({
    symbols,
    exchanges: SUPPORTED_EXCHANGES,
    refreshInterval: 15000,  // Refresh more frequently (every 15 seconds)
    retryWebSocketInterval: 20000  // Retry connections every 20 seconds
  });
  
  // Find arbitrage opportunities
  const opportunities = useMemo(() => {
    if (!data || Object.keys(data).length < 2) return [];
    
    const results = [];
    
    for (const symbol of symbols) {
      // Collect prices from all exchanges that have data for this symbol
      const exchangePrices = [];
      
      for (const [exchange, exchangeData] of Object.entries(data)) {
        if (exchangeData[symbol] && exchangeData[symbol].price) {
          exchangePrices.push({
            exchange,
            price: exchangeData[symbol].price
          });
        }
      }
      
      // Sort by price (lowest first)
      exchangePrices.sort((a, b) => a.price - b.price);
      
      // If we have at least 2 exchanges, check for arbitrage opportunities
      if (exchangePrices.length >= 2) {
        // Compare lowest and highest price
        const lowest = exchangePrices[0];
        const highest = exchangePrices[exchangePrices.length - 1];
        
        // Calculate spread percentage
        const spreadPercent = ((highest.price - lowest.price) / lowest.price) * 100;
        
        // If spread is significant enough, add to opportunities
        if (spreadPercent >= minSpreadPercent) {
          results.push({
            symbol,
            buyExchange: lowest.exchange,
            buyPrice: lowest.price,
            sellExchange: highest.exchange,
            sellPrice: highest.price,
            spreadPercent,
            profit: highest.price - lowest.price,
            profitPercent: spreadPercent
          });
        }
      }
    }
    
    // Sort by profit percentage (highest first)
    return results.sort((a, b) => b.profitPercent - a.profitPercent);
  }, [data, symbols, minSpreadPercent]);
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm md:text-base">Arbitrage Opportunities</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs bg-blue-800/60 px-2 py-0.5 rounded-full">
                  {opportunities.length} found
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Opportunities with at least {minSpreadPercent}% spread</p>
              </TooltipContent>
            </Tooltip>
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
              <div key={i} className="h-16 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        ) : opportunities.length > 0 ? (
          <div className="space-y-3">
            {opportunities.slice(0, 5).map((opportunity, index) => (
              <div key={index} className="p-3 border border-slate-700 rounded-lg bg-slate-800">
                <div className="flex items-center text-sm font-medium text-blue-400 mb-2">
                  {opportunity.symbol}
                  <span className="ml-auto flex items-center text-green-400">
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                    {opportunity.profitPercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 bg-slate-700/50 p-2 rounded text-xs">
                    <div className="text-slate-400 mb-1">Buy Price</div>
                    <div className="font-medium">${opportunity.buyPrice.toFixed(2)}</div>
                    <div className="text-xs mt-1 capitalize text-slate-400">{opportunity.buyExchange.replace('_', ' ')}</div>
                  </div>
                  <ArrowRightCircle className="h-4 w-4 text-slate-500" />
                  <div className="flex-1 bg-slate-700/50 p-2 rounded text-xs">
                    <div className="text-slate-400 mb-1">Sell Price</div>
                    <div className="font-medium">${opportunity.sellPrice.toFixed(2)}</div>
                    <div className="text-xs mt-1 capitalize text-slate-400">{opportunity.sellExchange.replace('_', ' ')}</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full text-xs h-8">View Details</Button>
              </div>
            ))}
            {opportunities.length > 5 && (
              <Button variant="outline" className="w-full mt-2">
                View All {opportunities.length} Opportunities
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <TrendingUp className="h-8 w-8 mb-2" />
            <h4 className="text-sm font-medium mb-1">No arbitrage opportunities found</h4>
            <p className="text-xs text-center">
              Current spreads are below the {minSpreadPercent}% threshold
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ExchangeArbitrage;
