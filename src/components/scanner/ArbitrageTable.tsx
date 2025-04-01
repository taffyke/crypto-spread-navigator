
import React, { useState } from 'react';
import { ArrowUpDown, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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
  depositStatus?: string;
  withdrawalStatus?: string;
}

interface ArbitrageTableProps {
  opportunities: ArbitrageOpportunity[];
  className?: string;
}

type SortKey = 'pair' | 'spreadPercentage' | 'potentialProfit' | 'buyPrice' | 'sellPrice' | 'volume24h';
type SortDirection = 'asc' | 'desc';

const ArbitrageTable = ({ opportunities, className }: ArbitrageTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('spreadPercentage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

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
      description: `Preparing to execute ${opportunity.pair} arbitrage between ${opportunity.buyExchange} and ${opportunity.sellExchange} with ${formatPercentage(opportunity.spreadPercentage)} spread`,
      variant: "default",
    });
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

  // Render for mobile view with expandable rows
  if (isMobile) {
    return (
      <div className={cn("overflow-x-auto", className)}>
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
            {sortedOpportunities.map((opportunity, index) => {
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
                            <span className="text-slate-400 block">Status:</span>
                            <span className={cn(
                              "px-1 py-0.5 rounded text-xs inline-block",
                              opportunity.depositStatus === "OK" && opportunity.withdrawalStatus === "OK"
                                ? "bg-green-900/30 text-green-400"
                                : "bg-red-900/30 text-red-400"
                            )}>
                              {opportunity.depositStatus === "OK" && opportunity.withdrawalStatus === "OK" 
                                ? "Ready" : "Check Status"}
                            </span>
                          </div>
                        </div>
                        <button 
                          className="w-full p-1 bg-blue-600 hover:bg-blue-500 rounded text-xs flex items-center justify-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteTrade(opportunity);
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Execute Trade
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Desktop view with full table
  return (
    <div className={cn("overflow-x-auto", className)}>
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
            <th className="px-4 py-2 text-left">Deposit Status</th>
            <th className="px-4 py-2 text-left">W/D Status</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {sortedOpportunities.map((opportunity, index) => (
            <tr 
              key={opportunity.id}
              className="hover:bg-slate-800 transition-colors"
            >
              <td className="px-4 py-3 text-slate-400">{index + 1}</td>
              <td className="px-4 py-3 font-medium">{opportunity.pair}</td>
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
                <span className={cn(
                  "px-2 py-1 rounded text-xs",
                  opportunity.depositStatus === "OK" 
                    ? "bg-green-900/30 text-green-400"
                    : "bg-red-900/30 text-red-400"
                )}>
                  {opportunity.depositStatus || "Unknown"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  "px-2 py-1 rounded text-xs",
                  opportunity.withdrawalStatus === "OK" 
                    ? "bg-green-900/30 text-green-400"
                    : "bg-red-900/30 text-red-400"
                )}>
                  {opportunity.withdrawalStatus || "Unknown"}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArbitrageTable;
