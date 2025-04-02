import React, { useState, useEffect } from 'react';
import { ArrowUpDown, ExternalLink, ChevronDown, ChevronUp, RefreshCw, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

export interface ArbitrageOpportunity {
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
  recommendedNetworks?: string[];
  type?: 'direct' | 'triangular' | 'futures';
}

interface ArbitrageTableProps {
  opportunities: ArbitrageOpportunity[];
  className?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  arbitrageType: 'direct' | 'triangular' | 'futures';
}

type SortKey = 'pair' | 'spreadPercentage' | 'potentialProfit' | 'buyPrice' | 'sellPrice' | 'volume24h';
type SortDirection = 'asc' | 'desc';

const ArbitrageTable = ({ 
  opportunities, 
  className, 
  isLoading = false, 
  onRefresh,
  arbitrageType 
}: ArbitrageTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('spreadPercentage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Format currency amounts
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 0.01 ? 6 : 2
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Toggle row expansion (for mobile view)
  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Handle sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // Execute trade action
  const handleExecuteTrade = (opportunity: ArbitrageOpportunity) => {
    toast({
      title: "Execute Trade",
      description: `Preparing to execute ${opportunity.pair} ${arbitrageType} arbitrage between ${opportunity.buyExchange} and ${opportunity.sellExchange} with ${formatPercentage(opportunity.spreadPercentage)} spread`,
      variant: "default",
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    if (onRefresh) {
      setRefreshing(true);
      onRefresh();
      
      // Simulate reset of refreshing state after 1 second
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }
  };

  // Handle viewing charts
  const handleViewCharts = (opportunity: ArbitrageOpportunity) => {
    toast({
      title: "Opening Charts",
      description: `Opening ${opportunity.pair} charts for ${opportunity.buyExchange} and ${opportunity.sellExchange}`,
      variant: "default",
    });
    navigate(`/charts/${opportunity.pair}?buy=${opportunity.buyExchange}&sell=${opportunity.sellExchange}`);
  };

  // Sort opportunities
  const sortedOpportunities = [...opportunities].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });

  // Column component for sortable headers
  const SortableColumn = ({ label, sortableKey }: { label: string; sortableKey: SortKey }) => (
    <th
      className="px-2 md:px-4 py-2 text-left cursor-pointer hover:bg-slate-700 transition-colors"
      onClick={() => handleSort(sortableKey)}
    >
      <div className="flex items-center space-x-1">
        <span className="text-xs md:text-sm">{label}</span>
        {sortKey === sortableKey && (
          <ArrowUpDown className="h-3 md:h-4 w-3 md:w-4 text-slate-400" />
        )}
      </div>
    </th>
  );

  // Auto-refresh logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (onRefresh && !refreshing && !isLoading) {
        onRefresh();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [onRefresh, refreshing, isLoading]);

  // Mobile view with expandable rows
  if (isMobile) {
    return (
      <div className={cn("overflow-x-auto relative", className)}>
        {(isLoading || refreshing) && (
          <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-10">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}
        
        <div className="flex justify-end mb-2">
          <button 
            className={cn(
              "text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors",
              refreshing ? "bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
            )}
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={cn("h-3 w-3", refreshing ? "animate-spin" : "")} />
            Refresh
          </button>
        </div>
        
        <table className="w-full text-xs text-white">
          <thead className="bg-slate-800 border-b border-slate-700">
            <tr>
              <th className="w-8 px-2 py-2">#</th>
              <SortableColumn label="Pair" sortableKey="pair" />
              <SortableColumn label="Spread" sortableKey="spreadPercentage" />
              <SortableColumn label="Profit" sortableKey="potentialProfit" />
              <th className="w-8 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {sortedOpportunities.length > 0 ? (
              sortedOpportunities.map((opportunity, index) => {
                const isExpanded = expandedRows.has(opportunity.id);
                
                return (
                  <React.Fragment key={opportunity.id}>
                    <tr 
                      className="hover:bg-slate-800 transition-colors cursor-pointer"
                      onClick={() => toggleRowExpansion(opportunity.id)}
                    >
                      <td className="px-2 py-3 text-slate-400">{index + 1}</td>
                      <td className="px-2 py-3 font-medium">{opportunity.pair}</td>
                      <td className={cn(
                        "px-2 py-3 font-medium",
                        opportunity.spreadPercentage >= 3 ? "text-green-500" : 
                        opportunity.spreadPercentage >= 1 ? "text-yellow-500" : "text-slate-400"
                      )}>
                        {formatPercentage(opportunity.spreadPercentage)}
                      </td>
                      <td className="px-2 py-3 text-green-500 font-medium">
                        {formatCurrency(opportunity.potentialProfit)}
                      </td>
                      <td className="px-2 py-3 text-center">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-slate-900">
                        <td colSpan={5} className="px-2 py-3">
                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div>
                              <span className="text-slate-400 block">Buy at:</span>
                              <span className="font-medium">{opportunity.buyExchange}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Sell at:</span>
                              <span className="font-medium">{opportunity.sellExchange}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Buy Price:</span>
                              <span className="font-medium">{formatCurrency(opportunity.buyPrice)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Sell Price:</span>
                              <span className="font-medium">{formatCurrency(opportunity.sellPrice)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">24h Volume:</span>
                              <span className="font-medium">{formatCurrency(opportunity.volume24h)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Recommended Networks:</span>
                              <span className="font-medium">{opportunity.recommendedNetworks?.join(', ') || 'TRC20, ERC20'}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <button 
                              className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-xs flex items-center justify-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCharts(opportunity);
                              }}
                            >
                              <BarChart2 className="h-3 w-3" />
                              View Charts
                            </button>
                            <button 
                              className="p-1 bg-blue-600 hover:bg-blue-500 rounded text-xs flex items-center justify-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExecuteTrade(opportunity);
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Execute Trade
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : !isLoading ? (
              <tr>
                <td colSpan={5} className="px-2 py-8 text-center text-slate-400">
                  No arbitrage opportunities found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    );
  }

  // Desktop view with full table
  return (
    <div className={cn("overflow-x-auto relative", className)}>
      {(isLoading || refreshing) && (
        <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-10">
          <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      )}
      
      <div className="flex justify-end mb-2">
        <button 
          className={cn(
            "text-sm flex items-center gap-1 px-3 py-1.5 rounded transition-colors",
            refreshing ? "bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
          )}
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", refreshing ? "animate-spin" : "")} />
          Refresh
        </button>
      </div>
      
      <table className="w-full text-sm text-white">
        <thead className="bg-slate-800 border-b border-slate-700">
          <tr>
            <th className="w-12 px-4 py-2 text-left">#</th>
            <SortableColumn label="Pair" sortableKey="pair" />
            <th className="px-4 py-2 text-left">Buy at</th>
            <th className="px-4 py-2 text-left">Sell at</th>
            <SortableColumn label="Buy Price" sortableKey="buyPrice" />
            <SortableColumn label="Sell Price" sortableKey="sellPrice" />
            <SortableColumn label="Spread" sortableKey="spreadPercentage" />
            <SortableColumn label="Profit" sortableKey="potentialProfit" />
            <SortableColumn label="24h Volume" sortableKey="volume24h" />
            <th className="px-4 py-2 text-left">Recommended Networks</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {sortedOpportunities.length > 0 ? (
            sortedOpportunities.map((opportunity, index) => (
              <tr 
                key={opportunity.id}
                className="hover:bg-slate-800 transition-colors"
              >
                <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                <td className="px-4 py-3 font-medium">
                  <button 
                    className="text-white hover:text-blue-400 transition-colors font-medium flex items-center"
                    onClick={() => handleViewCharts(opportunity)}
                  >
                    {opportunity.pair}
                    <BarChart2 className="ml-1.5 h-3.5 w-3.5 opacity-75" />
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-300">{opportunity.buyExchange}</td>
                <td className="px-4 py-3 text-slate-300">{opportunity.sellExchange}</td>
                <td className="px-4 py-3">{formatCurrency(opportunity.buyPrice)}</td>
                <td className="px-4 py-3">{formatCurrency(opportunity.sellPrice)}</td>
                <td className={cn(
                  "px-4 py-3 font-medium",
                  opportunity.spreadPercentage >= 3 ? "text-green-500" : 
                  opportunity.spreadPercentage >= 1 ? "text-yellow-500" : "text-slate-400"
                )}>
                  {formatPercentage(opportunity.spreadPercentage)}
                </td>
                <td className="px-4 py-3 text-green-500 font-medium">
                  {formatCurrency(opportunity.potentialProfit)}
                </td>
                <td className="px-4 py-3">{formatCurrency(opportunity.volume24h)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs bg-blue-900/30 text-blue-400">
                    {opportunity.recommendedNetworks?.join(', ') || 'TRC20, ERC20'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button 
                    className="p-1 bg-blue-600 hover:bg-blue-500 rounded inline-flex items-center justify-center"
                    onClick={() => handleExecuteTrade(opportunity)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))
          ) : !isLoading ? (
            <tr>
              <td colSpan={11} className="px-4 py-10 text-center text-slate-400">
                No arbitrage opportunities found
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default ArbitrageTable;
