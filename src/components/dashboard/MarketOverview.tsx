
import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useMultiTickerWebSocket } from '@/hooks/use-websocket';
import { cn } from '@/lib/utils';

interface CryptoData {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

const MarketOverview = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Pairs we want to track
  const trackedSymbols = [
    'BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT', 
    'DOGE/USDT', 'MATIC/USDT', 'LINK/USDT', 'AVAX/USDT', 'DOT/USDT'
  ];
  
  // Map of symbols to their full names
  const symbolToName: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'XRP': 'XRP',
    'SOL': 'Solana',
    'ADA': 'Cardano',
    'DOGE': 'Dogecoin',
    'MATIC': 'Polygon',
    'LINK': 'Chainlink',
    'AVAX': 'Avalanche',
    'DOT': 'Polkadot',
    'UNI': 'Uniswap',
    'XLM': 'Stellar',
    'ATOM': 'Cosmos',
    'LTC': 'Litecoin',
    'BCH': 'Bitcoin Cash'
  };
  
  // Base market caps in USD (these would be fetched from API in production)
  const baseMarketCaps: Record<string, number> = {
    'BTC': 1200000000000,
    'ETH': 500000000000,
    'XRP': 50000000000,
    'SOL': 40000000000,
    'ADA': 15000000000,
    'DOGE': 20000000000,
    'MATIC': 8000000000,
    'LINK': 9000000000,
    'AVAX': 13000000000,
    'DOT': 12000000000,
    'UNI': 5000000000,
    'XLM': 3000000000,
    'ATOM': 2500000000,
    'LTC': 6000000000,
    'BCH': 7000000000
  };
  
  // Use WebSocket for real-time data for multiple tickers
  // For this example we use Binance, but in production you might use multiple exchanges
  const { 
    data: tickersData,
    isConnected,
    error,
    reconnect
  } = useMultiTickerWebSocket(
    ['binance'], // Use Binance for all symbols
    'BTC/USDT', // This is the main symbol, but we handle all symbols in useEffect
    true // Enable WebSocket
  );
  
  // Initial market data setup
  useEffect(() => {
    const fetchInitialMarketData = async () => {
      setIsLoading(true);
      try {
        // In a production app, this would be an API call to get initial market data
        // For each symbol, we create an initial placeholder data entry
        const initialData = trackedSymbols.map(pair => {
          const symbol = pair.split('/')[0];
          return {
            name: symbolToName[symbol] || symbol,
            symbol: symbol,
            price: 0, // Will be updated by WebSocket
            change24h: 0, // Will be updated by WebSocket
            volume24h: 0, // Will be updated by WebSocket
            marketCap: baseMarketCaps[symbol] || 0
          };
        });
        
        setCryptoData(initialData);
      } catch (error) {
        console.error("Failed to fetch initial market data:", error);
        toast({
          title: "Data Loading Error",
          description: "Unable to load market data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialMarketData();
  }, []);
  
  // Update with real-time WebSocket data
  useEffect(() => {
    if (tickersData && Object.keys(tickersData).length > 0) {
      const now = new Date();
      setLastUpdated(now);
      
      // Update crypto data with real-time ticker information
      setCryptoData(prevData => {
        return prevData.map(crypto => {
          const tickerKey = Object.keys(tickersData).find(key => 
            tickersData[key]?.symbol === `${crypto.symbol}/USDT`
          );
          
          if (tickerKey && tickersData[tickerKey]) {
            const ticker = tickersData[tickerKey];
            
            // Calculate market cap based on current price and known supply
            const marketCap = baseMarketCaps[crypto.symbol] || 0;
            
            return {
              ...crypto,
              price: ticker.last,
              change24h: ticker.changePercent,
              volume24h: ticker.volume * ticker.last, // volume * price for USD volume
              marketCap: marketCap * (1 + ticker.changePercent / 100) // Adjust market cap based on price change
            };
          }
          
          return crypto;
        });
      });
    }
  }, [tickersData]);
  
  // Handle WebSocket errors
  useEffect(() => {
    if (error && Object.values(error).some(e => e !== null)) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to exchange for real-time updates. Retrying...",
        variant: "destructive"
      });
      
      // Auto reconnect after 5 seconds
      const timer = setTimeout(() => {
        reconnect();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, reconnect]);
  
  const formatPrice = (price: number) => {
    return price > 1 
      ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 });
  };
  
  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) {
      return `$${(volume / 1_000_000_000).toFixed(2)}B`;
    }
    return `$${(volume / 1_000_000).toFixed(2)}M`;
  };
  
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    }
    return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  };
  
  const handleRefresh = () => {
    // Force WebSocket reconnection
    reconnect();
    
    toast({
      title: "Refreshing Data",
      description: "Reconnecting to exchange for latest market data.",
    });
  };
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Market Overview</h2>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-slate-700 hover:bg-slate-600 px-3 py-1 text-xs rounded text-white transition-colors">
              24h
            </button>
            <button 
              className={cn(
                "bg-blue-600 hover:bg-blue-500 px-3 py-1 text-xs rounded text-white transition-colors flex items-center gap-1",
                isLoading && "bg-blue-700"
              )}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Asset</TableHead>
                <TableHead className="text-white text-right">Price</TableHead>
                <TableHead className="text-white text-right">24h Change</TableHead>
                <TableHead className="text-white text-right">24h Volume</TableHead>
                <TableHead className="text-white text-right">Market Cap</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cryptoData.length > 0 ? (
                cryptoData.map((crypto) => (
                  <TableRow key={crypto.symbol} className="hover:bg-slate-700/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center mr-2">
                          {crypto.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{crypto.name}</div>
                          <div className="text-xs text-slate-400">{crypto.symbol}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-white">{formatPrice(crypto.price)}</TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end ${crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {crypto.change24h >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {Math.abs(crypto.change24h).toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-slate-300">{formatVolume(crypto.volume24h)}</TableCell>
                    <TableCell className="text-right text-slate-300">{formatMarketCap(crypto.marketCap)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-slate-400">
                    No market data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      {!isConnected && !isLoading && (
        <div className="mt-4 text-amber-500 bg-amber-950/30 rounded px-3 py-2 text-sm flex items-center">
          <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
          Disconnected from exchange. Using latest available data.
        </div>
      )}
    </div>
  );
};

export default MarketOverview;
