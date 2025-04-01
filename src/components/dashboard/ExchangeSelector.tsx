
import React, { useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Interface for exchange data
export interface Exchange {
  id: string;
  name: string;
  logo?: string;
  isSelected?: boolean;
}

interface ExchangeSelectorProps {
  exchanges: Exchange[];
  selectedExchanges: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  className?: string;
}

const ExchangeSelector = ({
  exchanges,
  selectedExchanges,
  onSelectionChange,
  className,
}: ExchangeSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Filter exchanges based on search query
  const filteredExchanges = exchanges.filter(exchange => 
    exchange.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle selection of a single exchange
  const toggleExchange = (exchangeId: string) => {
    if (selectedExchanges.includes(exchangeId)) {
      onSelectionChange(selectedExchanges.filter(id => id !== exchangeId));
    } else {
      onSelectionChange([...selectedExchanges, exchangeId]);
    }
  };

  // Select all exchanges
  const selectAll = () => {
    onSelectionChange(exchanges.map(exchange => exchange.id));
  };

  // Reset selection
  const resetSelection = () => {
    onSelectionChange([]);
  };

  // Toggles the dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={cn("relative", className)}>
      <div 
        className="bg-slate-800 border border-slate-700 rounded-lg p-2 cursor-pointer flex items-center"
        onClick={toggleDropdown}
      >
        <div className="flex-1 flex items-center flex-wrap gap-1">
          {selectedExchanges.length === 0 ? (
            <span className="text-slate-400 text-sm">Select Exchanges</span>
          ) : (
            selectedExchanges.map(id => {
              const exchange = exchanges.find(e => e.id === id);
              return exchange ? (
                <div 
                  key={exchange.id}
                  className="bg-slate-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                >
                  <span>{exchange.name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExchange(exchange.id);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : null;
            })
          )}
        </div>
        <div className="ml-2 text-slate-400">▼</div>
      </div>
      
      {isDropdownOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search exchanges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-700 text-white rounded pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="p-2 border-b border-slate-700 flex justify-between">
            <button
              onClick={selectAll}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-1 rounded text-sm flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Select All
            </button>
            <button
              onClick={resetSelection}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-1 rounded text-sm flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Reset
            </button>
          </div>
          
          <div className="p-2">
            <div className="grid grid-cols-2 gap-2">
              {filteredExchanges.map(exchange => (
                <div
                  key={exchange.id}
                  onClick={() => toggleExchange(exchange.id)}
                  className={cn(
                    "p-2 rounded cursor-pointer flex items-center gap-2",
                    selectedExchanges.includes(exchange.id)
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-700 text-slate-300"
                  )}
                >
                  {exchange.logo ? (
                    <img src={exchange.logo} alt={exchange.name} className="h-4 w-4" />
                  ) : (
                    <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">{exchange.name.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-sm">{exchange.name}</span>
                  {selectedExchanges.includes(exchange.id) && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeSelector;
