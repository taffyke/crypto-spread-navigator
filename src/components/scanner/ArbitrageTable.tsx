
import React, { useState } from 'react';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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
      className="px-4 py-2 text-left cursor-pointer hover:bg-slate-700 transition-colors"
      onClick={() => handleSort(sortableKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortKey === sortableKey && (
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
        )}
      </div>
    </th>
  );

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
