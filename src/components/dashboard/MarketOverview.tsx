
import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { generateMarketData } from '@/data/mockData';

interface CryptoData {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

const MarketOverview = () => {
  const [cryptoData, setCryptoData] = React.useState<CryptoData[]>(generateMarketData(10));
  
  React.useEffect(() => {
    // In a real app, this would fetch data from an API
    const interval = setInterval(() => {
      setCryptoData(generateMarketData(10));
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
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
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Market Overview</h2>
        <div className="flex items-center gap-2">
          <button className="bg-slate-700 hover:bg-slate-600 px-3 py-1 text-xs rounded text-white transition-colors">
            24h
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 px-3 py-1 text-xs rounded text-white transition-colors">
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
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
            {cryptoData.map((crypto) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MarketOverview;
