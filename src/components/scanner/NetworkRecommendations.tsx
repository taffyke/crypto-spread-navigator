
import React, { useState, useEffect } from 'react';
import { Zap, ChevronDown, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { generateNetworkFeeData } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface NetworkFee {
  network: string;
  token: string;
  fee: number;
  transactionTime: string;
  congestion: 'low' | 'medium' | 'high';
}

const NetworkRecommendations = () => {
  const [feeData, setFeeData] = useState<NetworkFee[]>(generateNetworkFeeData());
  const [selectedToken, setSelectedToken] = useState<string>('BTC');
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  
  // Fetch network fee data
  const fetchNetworkFees = () => {
    setIsLoading(true);
    // In a real app, this would be an API call to fetch live network fee data
    setTimeout(() => {
      setFeeData(generateNetworkFeeData());
      setIsLoading(false);
    }, 500);
  };
  
  useEffect(() => {
    // Initial fetch
    fetchNetworkFees();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchNetworkFees();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getBestNetwork = () => {
    const relevantNetworks = feeData.filter(network => network.token === selectedToken);
    return relevantNetworks.reduce((prev, current) => 
      prev.fee < current.fee ? prev : current, relevantNetworks[0]);
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
        <div className="flex items-center gap-2">
          <Zap className="text-blue-400 h-5 w-5" />
          <h2 className="text-lg font-bold text-white">Optimal Transfer Network</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className={cn(
              "bg-blue-600 hover:bg-blue-500 p-1.5 text-xs rounded text-white transition-colors flex items-center justify-center",
              isLoading && "bg-blue-700"
            )}
            onClick={fetchNetworkFees}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </button>
          <button 
            className="p-1.5 text-white bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5 transform rotate-180" />}
          </button>
        </div>
      </div>
      
      {expanded && (
        <>
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
          
          {bestNetwork && (
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
          )}
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>All Networks</span>
              <span>Fee</span>
            </div>
            <div className="space-y-2">
              {feeData
                .filter(network => network.token === selectedToken)
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
        </>
      )}
    </div>
  );
};

export default NetworkRecommendations;
