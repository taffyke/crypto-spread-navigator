
import React from 'react';
import { ExternalLink, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ArbitrageOpportunityProps {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spreadPercentage: number;
  potentialProfit: number;
  timestamp: Date;
  volume24h: number;
  className?: string;
}

const ArbitrageOpportunity = ({
  id,
  pair,
  buyExchange,
  sellExchange,
  buyPrice,
  sellPrice,
  spreadPercentage,
  potentialProfit,
  timestamp,
  volume24h,
  className,
}: ArbitrageOpportunityProps) => {
  const navigate = useNavigate();

  // Format currency amounts
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Format time to show how recent the opportunity is
  const formatTimeDifference = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return `${Math.floor(diffSec / 3600)}h ago`;
  };

  // Handle clicking details button
  const handleViewDetails = () => {
    toast({
      title: "Opportunity Details",
      description: `Viewing detailed analysis for ${pair} arbitrage between ${buyExchange} and ${sellExchange}`,
      variant: "default",
    });
  };

  // Handle clicking execute button
  const handleExecuteTrade = () => {
    toast({
      title: "Trade Execution",
      description: `Preparing to execute ${pair} arbitrage trade with ${formatPercentage(spreadPercentage)} spread`,
      variant: "default",
    });
  };

  return (
    <div className={cn(
      "bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition-all",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className={cn(
            "h-5 w-5",
            spreadPercentage >= 3 ? "text-green-500" : 
            spreadPercentage >= 1 ? "text-yellow-500" : "text-slate-400"
          )} />
          <h3 className="font-bold text-white">{pair}</h3>
        </div>
        <span className="text-xs text-slate-400">{formatTimeDifference(timestamp)}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="bg-slate-900 rounded-md p-2">
          <p className="text-xs text-slate-400 mb-1">Buy at {buyExchange}</p>
          <p className="text-sm font-medium text-white">{formatCurrency(buyPrice)}</p>
        </div>
        <div className="bg-slate-900 rounded-md p-2">
          <p className="text-xs text-slate-400 mb-1">Sell at {sellExchange}</p>
          <p className="text-sm font-medium text-white">{formatCurrency(sellPrice)}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-slate-400">Spread</p>
          <p className={cn(
            "text-sm font-bold",
            spreadPercentage >= 3 ? "text-green-500" : 
            spreadPercentage >= 1 ? "text-yellow-500" : "text-slate-400"
          )}>
            {formatPercentage(spreadPercentage)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Potential Profit</p>
          <p className="text-sm font-bold text-green-500">{formatCurrency(potentialProfit)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">24h Volume</p>
          <p className="text-sm font-medium text-white">{formatCurrency(volume24h)}</p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-3">
        <button 
          className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white transition-colors"
          onClick={handleViewDetails}
        >
          Details
        </button>
        <button 
          className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white flex items-center gap-1 transition-colors"
          onClick={handleExecuteTrade}
        >
          <ExternalLink className="h-3 w-3" />
          Execute
        </button>
      </div>
    </div>
  );
};

export default ArbitrageOpportunity;
