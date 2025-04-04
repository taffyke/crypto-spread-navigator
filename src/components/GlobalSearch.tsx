
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, BarChart2, TrendingUp, Settings, Home, Activity, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { toast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: 'page' | 'feature' | 'tool' | 'arbitrage';
  icon: React.ReactNode;
}

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Create a comprehensive list of searchable items
  const searchResults: SearchResult[] = [
    // Pages
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Main overview of your arbitrage activities',
      url: '/',
      tags: ['home', 'overview', 'summary', 'dashboard'],
      category: 'page',
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      id: 'scanner',
      title: 'Arbitrage Scanner',
      description: 'Find and analyze arbitrage opportunities',
      url: '/scanner',
      tags: ['scan', 'arbitrage', 'opportunities', 'analyze'],
      category: 'page',
      icon: <TrendingUp className="h-4 w-4 mr-2" />,
    },
    {
      id: 'charts',
      title: 'Price Charts',
      description: 'View and analyze price charts',
      url: '/charts/BTC/USDT',
      tags: ['chart', 'price', 'analysis', 'compare'],
      category: 'page',
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure your account and application settings',
      url: '/settings',
      tags: ['settings', 'config', 'preferences'],
      category: 'page',
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
    // Features
    {
      id: 'direct-arbitrage',
      title: 'Direct Arbitrage',
      description: 'Find opportunities between different exchanges',
      url: '/scanner?type=direct',
      tags: ['direct', 'scan', 'opportunity'],
      category: 'arbitrage',
      icon: <Activity className="h-4 w-4 mr-2" />,
    },
    {
      id: 'triangular-arbitrage',
      title: 'Triangular Arbitrage',
      description: 'Find triangular arbitrage opportunities',
      url: '/scanner?type=triangular',
      tags: ['triangular', 'scan', 'three-way'],
      category: 'arbitrage',
      icon: <Activity className="h-4 w-4 mr-2" />,
    },
    {
      id: 'futures-arbitrage',
      title: 'Futures Arbitrage',
      description: 'Find futures arbitrage opportunities',
      url: '/scanner?type=futures',
      tags: ['futures', 'contracts', 'derivatives'],
      category: 'arbitrage',
      icon: <Activity className="h-4 w-4 mr-2" />,
    },
    {
      id: 'risk-calculator',
      title: 'Risk Calculator',
      description: 'Calculate risk and profit potential for arbitrage trades',
      url: '/scanner#risk-calculator',
      tags: ['risk', 'calculator', 'profit', 'potential'],
      category: 'tool',
      icon: <Calculator className="h-4 w-4 mr-2" />,
    },
    // Popular Trading Pairs
    {
      id: 'btc-usdt-chart',
      title: 'BTC/USDT Chart',
      description: 'View Bitcoin to USDT price chart',
      url: '/charts/BTC/USDT',
      tags: ['btc', 'bitcoin', 'chart', 'usdt'],
      category: 'feature',
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
    },
    {
      id: 'eth-usdt-chart',
      title: 'ETH/USDT Chart',
      description: 'View Ethereum to USDT price chart',
      url: '/charts/ETH/USDT',
      tags: ['eth', 'ethereum', 'chart', 'usdt'],
      category: 'feature',
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
    },
    {
      id: 'sol-usdt-chart',
      title: 'SOL/USDT Chart',
      description: 'View Solana to USDT price chart',
      url: '/charts/SOL/USDT',
      tags: ['sol', 'solana', 'chart', 'usdt'],
      category: 'feature',
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
    },
    {
      id: 'ada-usdt-chart',
      title: 'ADA/USDT Chart',
      description: 'View Cardano to USDT price chart',
      url: '/charts/ADA/USDT',
      tags: ['ada', 'cardano', 'chart', 'usdt'],
      category: 'feature',
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
    },
  ];

  // Filter results based on search input
  const filteredResults = search.trim() === '' 
    ? searchResults 
    : searchResults.filter(result => {
        const searchLower = search.toLowerCase();
        return (
          result.title.toLowerCase().includes(searchLower) ||
          result.description.toLowerCase().includes(searchLower) ||
          result.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });

  // Group results by category
  const groupedResults = filteredResults.reduce<Record<string, SearchResult[]>>((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {});

  // Handle keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    navigate(result.url);
    toast({
      title: "Navigating",
      description: `Going to ${result.title}`,
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-flex ml-2 items-center gap-1 rounded border border-slate-700 bg-slate-900 px-1.5 font-mono text-xs text-slate-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          ref={inputRef}
          placeholder="Search features, pages, pairs..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {Object.entries(groupedResults).map(([category, results]) => (
            <CommandGroup key={category} heading={
              category === 'page' ? 'Pages' :
              category === 'feature' ? 'Charts' :
              category === 'tool' ? 'Tools' :
              'Arbitrage Types'
            }>
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center cursor-pointer"
                >
                  {result.icon}
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    <span className="text-xs text-slate-400">{result.description}</span>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
