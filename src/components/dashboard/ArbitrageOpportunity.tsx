
import React from 'react';
import { ExternalLink, TrendingUp, BarChart2 } from 'lucide-react';
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
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: Date;
  volume24h: number;
  className?: string;
  type?: 'direct' | 'triangular' | 'futures';
  isLive?: boolean;
  recommendedNetworks?: string[];
}

const ArbitrageOpportunity = ({
  id,
  pair,
  buyExchange,
  sellExchange,
  buyPrice,
  sellPrice,
  spreadPercentage,
  riskLevel = 'medium', // Provide default values to prevent undefined errors
  timestamp,
  volume24h,
  className,
  type = 'direct',
  isLive = true,
  recommendedNetworks = [],
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

  // Parse pair into base and quote currencies
  const [baseCurrency, quoteCurrency] = pair.split('/');

  // Handle clicking details button
  const handleViewDetails = () => {
    toast({
      title: "Opportunity Details",
      description: `Viewing detailed analysis for ${pair} ${type} arbitrage between ${buyExchange} and ${sellExchange}`,
      variant: "default",
    });
    navigate(`/scanner/details/${id}`);
  };

  // Handle clicking view charts button
  const handleViewCharts = () => {
    toast({
      title: "Opening Charts",
      description: `Opening ${pair} price charts for ${buyExchange} and ${sellExchange}`,
      variant: "default",
    });
    // Ensure proper URL encoding and pass exchange parameters correctly
    navigate(`/charts/${pair}?buy=${buyExchange.toLowerCase()}&sell=${sellExchange.toLowerCase()}`);
  };

  // Handle clicking execute button
  const handleExecuteTrade = () => {
    toast({
      title: "Trade Execution",
      description: `Preparing to execute ${pair} ${type} arbitrage trade with ${formatPercentage(spreadPercentage)} spread`,
      variant: "default",
    });
  };

  // Get risk level display text with a safeguard against undefined values
  const getRiskLevelText = () => {
    if (!riskLevel) return 'Medium'; // Default fallback
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  };

  // Get type display text with a safeguard against undefined values
  const getTypeText = () => {
    if (!type) return 'Direct'; // Default fallback
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Calculate risk level dynamically if not provided
  const effectiveRiskLevel = riskLevel || (
    spreadPercentage >= 3 ? 'low' : 
    spreadPercentage >= 1.5 ? 'medium' : 'high'
  );

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
          <div className="flex items-center">
            <img 
              src={`/crypto-icons/${baseCurrency.toLowerCase()}.svg`}
              alt={baseCurrency}
              className="w-5 h-5 mr-1"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/crypto-icons/generic.svg';
              }}
            />
            <span className="font-bold text-white">{pair}</span>
          </div>
          {isLive && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded",
            type === 'direct' ? "bg-blue-900/30 text-blue-400" :
            type === 'triangular' ? "bg-purple-900/30 text-purple-400" :
            "bg-amber-900/30 text-amber-400"
          )}>
            {getTypeText()}
          </span>
          <span className="text-xs text-slate-400">{formatTimeDifference(timestamp)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="bg-slate-900 rounded-md p-2">
          <div className="flex items-center text-xs text-slate-400 mb-1">
            <img 
              src={`/exchange-logos/${buyExchange.toLowerCase()}.svg`}
              alt={buyExchange}
              className="w-4 h-4 mr-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <p>Buy at {buyExchange}</p>
          </div>
          <p className="text-sm font-medium text-white">{formatCurrency(buyPrice)}</p>
        </div>
        <div className="bg-slate-900 rounded-md p-2">
          <div className="flex items-center text-xs text-slate-400 mb-1">
            <img 
              src={`/exchange-logos/${sellExchange.toLowerCase()}.svg`}
              alt={sellExchange}
              className="w-4 h-4 mr-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <p>Sell at {sellExchange}</p>
          </div>
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
          <p className="text-xs text-slate-400">Risk Level</p>
          <p className={cn(
            "text-sm font-bold",
            effectiveRiskLevel === 'low' ? "text-green-500" : 
            effectiveRiskLevel === 'medium' ? "text-yellow-500" : "text-red-500"
          )}>
            {getRiskLevelText()}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">24h Volume</p>
          <p className="text-sm font-medium text-white">{formatCurrency(volume24h)}</p>
        </div>
      </div>
      
      {recommendedNetworks && recommendedNetworks.length > 0 && (
        <div className="mt-2 mb-3">
          <p className="text-xs text-slate-400 mb-1">Recommended Networks:</p>
          <div className="flex flex-wrap gap-1">
            {recommendedNetworks.map((network, index) => (
              <span key={index} className="text-xs bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded">
                {network}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-2 mt-3">
        <button 
          className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white transition-colors flex items-center gap-1"
          onClick={handleViewCharts}
        >
          <BarChart2 className="h-3 w-3" />
          Charts
        </button>
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
