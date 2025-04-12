
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchNetworkFeeData, NetworkFeeData } from '@/lib/api/cryptoDataApi';
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';

const networks = ['ETH', 'BSC', 'SOL', 'TRX', 'ARBITRUM', 'OPTIMISM', 'POLYGON', 'AVALANCHE'];

interface NetworkRecommendationsProps {
  activeMode?: 'direct' | 'triangular' | 'futures';
}

export function NetworkRecommendations({ activeMode = 'direct' }: NetworkRecommendationsProps) {
  const [expandedNetwork, setExpandedNetwork] = useState<string | null>(null);
  
  const toggleNetwork = (network: string) => {
    if (expandedNetwork === network) {
      setExpandedNetwork(null);
    } else {
      setExpandedNetwork(network);
    }
  };

  // Fetch network fee data
  const { 
    data: networkFeeData = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['networkFees'],
    queryFn: async () => {
      return await fetchNetworkFeeData(networks);
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    retry: 2
  });

  // Helper function to render the color based on fee comparison
  const getFeeColor = (a: number, b: number) => {
    const ratio = a / b;
    if (ratio < 0.8) return 'text-green-500';
    if (ratio > 1.2) return 'text-red-500';
    return 'text-yellow-400';
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Network Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || networkFeeData.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Network Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4 text-slate-400">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>Unable to load network data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort networks by fee (lowest first)
  const sortedNetworks = [...networkFeeData].sort((a, b) => a.currentFee - b.currentFee);

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="text-sm md:text-base">Network Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedNetworks.map((networkData) => (
          <div key={networkData.network} className="border border-slate-700 rounded-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-700/50"
              onClick={() => toggleNetwork(networkData.network)}
            >
              <div className="flex items-center">
                <img 
                  src={`/network-logos/${networkData.network.toLowerCase()}.svg`} 
                  alt={networkData.network}
                  className="w-5 h-5 mr-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/network-logos/generic.svg';
                  }}
                />
                <span>{networkData.network}</span>
              </div>
              <div className="flex items-center">
                <span className={`mr-3 ${networkData.changePercent > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {networkData.changePercent > 0 ? '+' : ''}{networkData.changePercent.toFixed(1)}%
                </span>
                <span className="mr-3 font-medium">${networkData.currentFee.toFixed(2)}</span>
                {expandedNetwork === networkData.network ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
            {expandedNetwork === networkData.network && (
              <div className="p-3 bg-slate-700/30 border-t border-slate-700">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Standard Fee:</span>
                  <span>${networkData.currentFee.toFixed(4)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Recommended Fee:</span>
                  <span className={getFeeColor(networkData.recommendedFee, networkData.currentFee)}>
                    ${networkData.recommendedFee.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-slate-400">Fast Fee:</span>
                  <span className={getFeeColor(networkData.fastFee, networkData.currentFee)}>
                    ${networkData.fastFee.toFixed(4)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-200">
                    View Details
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Use Network
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default NetworkRecommendations;
