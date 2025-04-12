import React, { useState } from 'react';
import ArbitrageFilters from '@/components/scanner/ArbitrageFilters';
import ArbitrageTable from '@/components/scanner/ArbitrageTable';
import { NetworkRecommendations } from '@/components/scanner/NetworkRecommendations';
import ExchangeArbitrage from '@/components/ExchangeArbitrage';
import { ArbitrageDashboard } from '@/components/scanner/ArbitrageDashboard';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import ArbitrageRiskCalculator from '@/components/scanner/ArbitrageRiskCalculator';
import { toast } from '@/hooks/use-toast';
import { useArbitrageData } from '@/hooks/use-arbitrage-data';

interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spreadPercentage: number;
  timestamp: Date;
  volume24h: number;
  riskLevel: string;
  recommendedNetworks?: string[];
  type: "direct" | "triangular" | "futures";
}

const Scanner = () => {
  const [activeMode, setActiveMode] = useState<'direct' | 'triangular' | 'futures'>('direct');
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
  const [minSpread, setMinSpread] = useState(0.2);
  const [minVolume, setMinVolume] = useState(100000);
  
  const { data, isLoading, refresh } = useArbitrageData(
    activeMode, 
    selectedExchanges, 
    minSpread,
    minVolume,
    true,
    { refreshInterval: 30000 }
  );
  
  const handleModeChange = (mode: string) => {
    setActiveMode(mode as 'direct' | 'triangular' | 'futures');
  };
  
  const handleFiltersChange = (exchanges: string[], spread: number, volume: number) => {
    setSelectedExchanges(exchanges);
    setMinSpread(spread);
    setMinVolume(volume);
  };
  
  const handleRefresh = () => {
    refresh();
    toast({
      title: 'Refreshing Data',
      description: 'Fetching the latest arbitrage opportunities...',
    });
  };
  
  const handleDownloadCSV = () => {
    if (!data || data.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'There are no arbitrage opportunities to export.',
        variant: 'destructive',
      });
      return;
    }
    
    const headers = [
      'Pair', 
      'Buy Exchange', 
      'Buy Price', 
      'Sell Exchange', 
      'Sell Price', 
      'Spread %', 
      'Volume 24h', 
      'Risk Level', 
      'Timestamp'
    ].join(',');
    
    const rows = data.map(opp => [
      opp.pair,
      opp.buyExchange,
      opp.buyPrice,
      opp.sellExchange,
      opp.sellPrice,
      opp.spreadPercentage.toFixed(2) + '%',
      opp.volume24h.toLocaleString(),
      opp.riskLevel,
      new Date(opp.timestamp).toLocaleString()
    ].join(','));
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `arbitrage-opportunities-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Export Successful',
      description: 'Arbitrage opportunities have been downloaded as CSV.',
    });
  };
  
  const typedData = data?.map(opp => ({
    ...opp,
    type: opp.type as "direct" | "triangular" | "futures"
  })) || [];
  
  return (
    <div className="container mx-auto py-6">
      <ArbitrageDashboard onModeChange={handleModeChange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Arbitrage Opportunities</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>
            </div>
            <Separator className="bg-slate-700" />
            <div className="px-4 py-3 bg-slate-850">
              <ArbitrageFilters 
                filters={{
                  minSpread: minSpread,
                  maxRiskLevel: 'any',
                  minVolume: minVolume,
                  exchanges: selectedExchanges,
                  networks: [],
                  pairs: [],
                  arbitrageType: activeMode
                }}
                onFiltersChange={(filters) => {
                  handleFiltersChange(
                    filters.exchanges,
                    filters.minSpread,
                    filters.minVolume
                  );
                }}
                availableExchanges={[
                  'binance', 'bitfinex', 'coinbase', 'kraken', 'kucoin',
                  'bybit', 'gate_io', 'gemini', 'poloniex', 'okx', 
                  'ascendex', 'bitrue', 'htx', 'mexc_global', 'bitget'
                ]}
                availableNetworks={['ETH', 'BSC', 'Solana', 'Polygon', 'Avalanche']}
                availablePairs={[
                  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ADA/USDT', 
                  'BNB/USDT', 'DOT/USDT', 'XRP/USDT', 'DOGE/USDT',
                  'AVAX/USDT', 'MATIC/USDT', 'LINK/USDT'
                ]}
                className="w-full"
              />
            </div>
            <Separator className="bg-slate-700" />
            <div className="p-0">
              <ArbitrageTable 
                opportunities={typedData}
                isLoading={isLoading}
                type={activeMode}
              />
            </div>
          </Card>
          
          <NetworkRecommendations activeMode={activeMode} />
        </div>
        
        <div className="flex flex-col gap-6">
          <ArbitrageRiskCalculator />
          <ExchangeArbitrage 
            symbols={['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT']} 
            minSpreadPercent={0.2}
          />
        </div>
      </div>
    </div>
  );
};

export default Scanner;
