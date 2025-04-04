
import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface ArbitrageFilters {
  minSpread: number;
  maxRiskLevel: 'low' | 'medium' | 'high' | 'any';
  minVolume: number;
  exchanges: string[];
  networks: string[];
  pairs: string[];
  arbitrageType: 'direct' | 'triangular' | 'futures' | 'all';
}

interface ArbitrageFiltersProps {
  filters: ArbitrageFilters;
  onFiltersChange: (filters: ArbitrageFilters) => void;
  availableExchanges: string[];
  availableNetworks: string[];
  availablePairs: string[];
  className?: string;
}

const ArbitrageFilters = ({
  filters,
  onFiltersChange,
  availableExchanges,
  availableNetworks,
  availablePairs,
  className
}: ArbitrageFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    exchanges: true,
    networks: false,
    pairs: false
  });

  // Format numbers with commas for large values
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const toggleSection = (section: 'exchanges' | 'networks' | 'pairs') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle exchange in filter
  const toggleExchange = (exchange: string) => {
    if (filters.exchanges.includes(exchange)) {
      onFiltersChange({
        ...filters,
        exchanges: filters.exchanges.filter(e => e !== exchange)
      });
    } else {
      onFiltersChange({
        ...filters,
        exchanges: [...filters.exchanges, exchange]
      });
    }
  };

  // Toggle network in filter
  const toggleNetwork = (network: string) => {
    if (filters.networks.includes(network)) {
      onFiltersChange({
        ...filters,
        networks: filters.networks.filter(n => n !== network)
      });
    } else {
      onFiltersChange({
        ...filters,
        networks: [...filters.networks, network]
      });
    }
  };

  // Toggle pair in filter
  const togglePair = (pair: string) => {
    if (filters.pairs.includes(pair)) {
      onFiltersChange({
        ...filters,
        pairs: filters.pairs.filter(p => p !== pair)
      });
    } else {
      onFiltersChange({
        ...filters,
        pairs: [...filters.pairs, pair]
      });
    }
  };

  // Reset all filters to default
  const resetFilters = () => {
    onFiltersChange({
      minSpread: 0.5,
      maxRiskLevel: 'any',
      minVolume: 10000,
      exchanges: [],
      networks: [],
      pairs: [],
      arbitrageType: 'all'
    });
  };

  // Handle min spread change
  const handleMinSpreadChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      minSpread: value[0]
    });
  };

  // Handle min volume change
  const handleMinVolumeChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      minVolume: value[0]
    });
  };

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.minSpread > 0.5) count++;
    if (filters.maxRiskLevel !== 'any') count++;
    if (filters.minVolume > 10000) count++;
    if (filters.exchanges.length > 0) count++;
    if (filters.networks.length > 0) count++;
    if (filters.pairs.length > 0) count++;
    if (filters.arbitrageType !== 'all') count++;
    return count;
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0 bg-slate-800 border-slate-700 text-white">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-medium">Arbitrage Filters</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="mr-1 h-4 w-4" />
              Reset
            </Button>
          </div>
          
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {/* Arbitrage Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Arbitrage Type
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-slate-900 border-slate-700 text-white"
                  >
                    {filters.arbitrageType === 'all' 
                      ? 'All Types' 
                      : filters.arbitrageType.charAt(0).toUpperCase() + filters.arbitrageType.slice(1)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-slate-800 border-slate-700 text-white">
                  <DropdownMenuRadioGroup 
                    value={filters.arbitrageType} 
                    onValueChange={(value) => 
                      onFiltersChange({
                        ...filters, 
                        arbitrageType: value as ArbitrageFilters['arbitrageType']
                      })
                    }
                  >
                    <DropdownMenuRadioItem value="all">All Types</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="direct">Direct</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="triangular">Triangular</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="futures">Futures</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Min Spread Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Minimum Spread: {filters.minSpread.toFixed(1)}%
              </label>
              <Slider
                defaultValue={[filters.minSpread]}
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={handleMinSpreadChange}
                className="py-4"
              />
            </div>
            
            {/* Risk Level Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Maximum Risk Level
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-slate-900 border-slate-700 text-white"
                  >
                    {filters.maxRiskLevel === 'any' 
                      ? 'Any Risk Level' 
                      : filters.maxRiskLevel.charAt(0).toUpperCase() + filters.maxRiskLevel.slice(1)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-slate-800 border-slate-700 text-white">
                  <DropdownMenuRadioGroup 
                    value={filters.maxRiskLevel} 
                    onValueChange={(value) => 
                      onFiltersChange({
                        ...filters, 
                        maxRiskLevel: value as ArbitrageFilters['maxRiskLevel']
                      })
                    }
                  >
                    <DropdownMenuRadioItem value="any">Any Risk Level</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="low">Low</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="high">High</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Min Volume Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Minimum 24h Volume: ${formatNumber(filters.minVolume)}
              </label>
              <Slider
                defaultValue={[filters.minVolume]}
                min={1000}
                max={10000000}
                step={1000}
                onValueChange={handleMinVolumeChange}
                className="py-4"
              />
            </div>
            
            {/* Exchanges Section */}
            <div className="mb-4 border border-slate-700 rounded-md overflow-hidden">
              <div 
                className="flex justify-between items-center p-3 bg-slate-900 cursor-pointer"
                onClick={() => toggleSection('exchanges')}
              >
                <h4 className="font-medium text-sm">Exchanges</h4>
                {expandedSections.exchanges ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
              
              {expandedSections.exchanges && (
                <div className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
                  {availableExchanges.map(exchange => (
                    <div key={exchange} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`exchange-${exchange}`}
                        checked={filters.exchanges.includes(exchange)}
                        onChange={() => toggleExchange(exchange)}
                        className="mr-2 h-4 w-4 rounded border-slate-600 text-blue-600 focus:ring-blue-600 bg-slate-700"
                      />
                      <label 
                        htmlFor={`exchange-${exchange}`}
                        className="text-sm cursor-pointer select-none flex items-center"
                      >
                        <img 
                          src={`/exchange-logos/${exchange.toLowerCase()}.svg`} 
                          alt={exchange}
                          className="w-4 h-4 mr-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {exchange.charAt(0).toUpperCase() + exchange.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Networks Section */}
            <div className="mb-4 border border-slate-700 rounded-md overflow-hidden">
              <div 
                className="flex justify-between items-center p-3 bg-slate-900 cursor-pointer"
                onClick={() => toggleSection('networks')}
              >
                <h4 className="font-medium text-sm">Networks</h4>
                {expandedSections.networks ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
              
              {expandedSections.networks && (
                <div className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
                  {availableNetworks.map(network => (
                    <div key={network} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`network-${network}`}
                        checked={filters.networks.includes(network)}
                        onChange={() => toggleNetwork(network)}
                        className="mr-2 h-4 w-4 rounded border-slate-600 text-blue-600 focus:ring-blue-600 bg-slate-700"
                      />
                      <label 
                        htmlFor={`network-${network}`}
                        className="text-sm cursor-pointer select-none"
                      >
                        {network}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Pairs Section */}
            <div className="mb-4 border border-slate-700 rounded-md overflow-hidden">
              <div 
                className="flex justify-between items-center p-3 bg-slate-900 cursor-pointer"
                onClick={() => toggleSection('pairs')}
              >
                <h4 className="font-medium text-sm">Trading Pairs</h4>
                {expandedSections.pairs ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
              
              {expandedSections.pairs && (
                <div className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
                  {availablePairs.map(pair => {
                    const [base, quote] = pair.split('/');
                    return (
                      <div key={pair} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`pair-${pair}`}
                          checked={filters.pairs.includes(pair)}
                          onChange={() => togglePair(pair)}
                          className="mr-2 h-4 w-4 rounded border-slate-600 text-blue-600 focus:ring-blue-600 bg-slate-700"
                        />
                        <label 
                          htmlFor={`pair-${pair}`}
                          className="text-sm cursor-pointer select-none flex items-center"
                        >
                          <img 
                            src={`/crypto-icons/${base.toLowerCase()}.svg`} 
                            alt={base}
                            className="w-4 h-4 mr-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="mr-1">{base}</span>
                          <span className="text-slate-400">/</span>
                          <img 
                            src={`/crypto-icons/${quote.toLowerCase()}.svg`} 
                            alt={quote}
                            className="w-4 h-4 mx-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span>{quote}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="p-2 border-t border-slate-700 flex justify-end">
            <Button onClick={() => setIsOpen(false)} className="bg-blue-600 hover:bg-blue-500">
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ArbitrageFilters;
