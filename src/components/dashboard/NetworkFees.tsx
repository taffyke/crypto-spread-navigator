
import React, { useState, useEffect } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NetworkFee {
  network: string;
  token: string;
  fee: number;
  transactionTime: string;
  congestion: 'low' | 'medium' | 'high';
}

const NetworkFees = () => {
  const [feeData, setFeeData] = useState<NetworkFee[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('BTC');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Define network information for different tokens
  const networkInfo: Record<string, { network: string, transactionTime: string }[]> = {
    BTC: [
      { network: 'Bitcoin', transactionTime: '10-60 minutes' },
      { network: 'Lightning Network', transactionTime: '< 1 minute' }
    ],
    ETH: [
      { network: 'Ethereum', transactionTime: '15 seconds - 5 minutes' },
      { network: 'Arbitrum', transactionTime: '< 1 minute' },
      { network: 'Optimism', transactionTime: '< 1 minute' },
      { network: 'Polygon', transactionTime: '< 30 seconds' }
    ],
    USDT: [
      { network: 'Ethereum (ERC20)', transactionTime: '15 seconds - 5 minutes' },
      { network: 'Tron (TRC20)', transactionTime: '< 1 minute' },
      { network: 'Solana', transactionTime: '< 15 seconds' },
      { network: 'BNB Chain (BEP20)', transactionTime: '< 15 seconds' }
    ],
    USDC: [
      { network: 'Ethereum (ERC20)', transactionTime: '15 seconds - 5 minutes' },
      { network: 'Solana', transactionTime: '< 15 seconds' },
      { network: 'Arbitrum', transactionTime: '< 1 minute' },
      { network: 'BNB Chain (BEP20)', transactionTime: '< 15 seconds' }
    ],
    BNB: [
      { network: 'BNB Chain (BEP2)', transactionTime: '< 15 seconds' },
      { network: 'BNB Chain (BEP20)', transactionTime: '< 15 seconds' }
    ]
  };
  
  // Base fees for different networks in USD
  const baseFees: Record<string, Record<string, number>> = {
    BTC: {
      'Bitcoin': 2.5,
      'Lightning Network': 0.01
    },
    ETH: {
      'Ethereum': 5,
      'Arbitrum': 0.25,
      'Optimism': 0.15,
      'Polygon': 0.01
    },
    USDT: {
      'Ethereum (ERC20)': 5,
      'Tron (TRC20)': 1,
      'Solana': 0.02,
      'BNB Chain (BEP20)': 0.1
    },
    USDC: {
      'Ethereum (ERC20)': 5,
      'Solana': 0.02,
      'Arbitrum': 0.25,
      'BNB Chain (BEP20)': 0.1
    },
    BNB: {
      'BNB Chain (BEP2)': 0.05,
      'BNB Chain (BEP20)': 0.1
    }
  };
  
  const fetchNetworkFees = async () => {
    setIsLoading(true);
    try {
      // In a production app, this would be a real API call to get current network fees
      // Example: const response = await fetch(`/api/network-fees?token=${selectedToken}`);
      
      // For now, we'll implement a more realistic fee calculation based on 
      // current network congestion from a hypothetical API
      const fetchPromises = networkInfo[selectedToken]?.map(async (network) => {
        try {
          // Simulate API call to get network congestion
          // In production this would be a real API call
          // const response = await fetch(`/api/network-congestion?token=${selectedToken}&network=${network.network}`);
          // const data = await response.json();
          
          // Simulate random but realistic network congestion
          const congestion = await getNetworkCongestion(selectedToken, network.network);
          
          // Get base fee for this network
          const baseFee = baseFees[selectedToken]?.[network.network] || 1;
          
          // Apply congestion multiplier
          const congestionMultiplier = getCongestionMultiplier(congestion);
          const fee = baseFee * congestionMultiplier;
          
          return {
            token: selectedToken,
            network: network.network,
            fee,
            transactionTime: network.transactionTime,
            congestion
          };
        } catch (error) {
          console.error(`Failed to fetch fees for ${network.network}:`, error);
          // Return placeholder data to maintain consistency
          return {
            token: selectedToken,
            network: network.network,
            fee: baseFees[selectedToken]?.[network.network] || 1,
            transactionTime: network.transactionTime,
            congestion: 'medium' as const
          };
        }
      }) || [];
      
      // Wait for all fetch operations to complete
      const results = await Promise.all(fetchPromises);
      
      setFeeData(results);
      setLastUpdated(new Date());
      
      // Schedule the next update (every 30 seconds)
      setTimeout(fetchNetworkFees, 30000);
    } catch (error) {
      console.error("Failed to fetch network fee data:", error);
      toast({
        title: "Network Fee Error",
        description: "Unable to retrieve current network fees. Will retry soon.",
        variant: "destructive"
      });
      
      // Retry after 15 seconds on error
      setTimeout(fetchNetworkFees, 15000);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simulate getting network congestion (would be an API call in production)
  const getNetworkCongestion = async (token: string, network: string): Promise<'low' | 'medium' | 'high'> => {
    // This would be a real API call in production
    // For now, simulate network congestion patterns based on token and network
    
    // Ethereum network is often congested
    if (network.includes('Ethereum')) {
      return Math.random() < 0.7 ? 'high' : 'medium';
    }
    
    // Bitcoin can be congested during high activity
    if (network === 'Bitcoin') {
      return Math.random() < 0.5 ? 'medium' : (Math.random() < 0.7 ? 'high' : 'low');
    }
    
    // Lightning Network is usually fast
    if (network === 'Lightning Network') {
      return Math.random() < 0.8 ? 'low' : 'medium';
    }
    
    // Layer 2 solutions like Arbitrum, Optimism are usually less congested
    if (network.includes('Arbitrum') || network.includes('Optimism')) {
      return Math.random() < 0.7 ? 'low' : 'medium';
    }
    
    // Solana is often low congestion
    if (network.includes('Solana')) {
      return Math.random() < 0.8 ? 'low' : 'medium';
    }
    
    // TRX is mostly low congestion
    if (network.includes('Tron')) {
      return Math.random() < 0.9 ? 'low' : 'medium';
    }
    
    // BNB Chain usually has low congestion
    if (network.includes('BNB Chain')) {
      return Math.random() < 0.8 ? 'low' : 'medium';
    }
    
    // Default random congestion
    const random = Math.random();
    if (random < 0.5) return 'low';
    if (random < 0.8) return 'medium';
    return 'high';
  };
  
  // Get fee multiplier based on congestion
  const getCongestionMultiplier = (congestion: string): number => {
    switch(congestion) {
      case 'low': return 0.8 + (Math.random() * 0.4); // 0.8 - 1.2
      case 'medium': return 1.2 + (Math.random() * 0.6); // 1.2 - 1.8
      case 'high': return 1.8 + (Math.random() * 1.2); // 1.8 - 3.0
      default: return 1;
    }
  };
  
  useEffect(() => {
    // Fetch fees when component mounts or token changes
    fetchNetworkFees();
    
    return () => {
      // Cleanup timers on unmount
    };
  }, [selectedToken]);
  
  const getBestNetwork = () => {
    if (feeData.length === 0) return null;
    
    return feeData.reduce((prev, current) => 
      prev.fee < current.fee ? prev : current, feeData[0]);
  };
  
  const formatFee = (fee: number) => {
    return `$${fee.toFixed(2)}`;
  };
  
  const bestNetwork = getBestNetwork();
  
  const getCongestionColor = (congestion: string) => {
    switch(congestion) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-white';
    }
  };
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Optimal Transfer Network</h2>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button 
            className={cn(
              "bg-blue-600 hover:bg-blue-500 px-3 py-1 text-xs rounded text-white transition-colors flex items-center gap-1",
              isLoading && "bg-blue-700"
            )}
            onClick={fetchNetworkFees}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-slate-400 mb-2">Select Asset</div>
        <Select defaultValue={selectedToken} onValueChange={setSelectedToken}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
            <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
            <SelectItem value="USDT">Tether (USDT)</SelectItem>
            <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
            <SelectItem value="BNB">Binance Coin (BNB)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading && feeData.length === 0 ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : bestNetwork ? (
        <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg p-4 border border-blue-800/50">
          <div className="flex items-center mb-2">
            <Zap className="text-blue-400 mr-2 h-5 w-5" />
            <h3 className="text-lg font-bold text-white">Recommended Network</h3>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300">Network</span>
            <span className="text-white font-medium">{bestNetwork.network}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300">Estimated Fee</span>
            <span className="text-green-500 font-medium">{formatFee(bestNetwork.fee)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300">Transaction Time</span>
            <span className="text-white">{bestNetwork.transactionTime}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Network Congestion</span>
            <span className={getCongestionColor(bestNetwork.congestion)}>
              {bestNetwork.congestion.charAt(0).toUpperCase() + bestNetwork.congestion.slice(1)}
            </span>
          </div>
          
          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500">
            Transfer Using {bestNetwork.network}
          </Button>
        </div>
      ) : (
        <div className="text-center py-4 text-slate-400">
          No network data available for {selectedToken}
        </div>
      )}
      
      <div className="mt-4">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>All Networks</span>
          <span>Fee</span>
        </div>
        <div className="space-y-2">
          {feeData
            .sort((a, b) => a.fee - b.fee)
            .map((network, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center p-2 rounded ${
                  bestNetwork && network.network === bestNetwork.network 
                    ? 'bg-blue-900/20 border border-blue-800/30' 
                    : 'bg-slate-700'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center mr-2">
                    {network.network.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white">{network.network}</div>
                    <div className="text-xs text-slate-400">{network.transactionTime}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white">{formatFee(network.fee)}</div>
                  <div className={`text-xs ${getCongestionColor(network.congestion)}`}>
                    {network.congestion.charAt(0).toUpperCase() + network.congestion.slice(1)} Congestion
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkFees;
