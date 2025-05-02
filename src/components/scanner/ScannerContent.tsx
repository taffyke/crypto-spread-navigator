
import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ArbitrageFilters from '@/components/scanner/ArbitrageFilters';
import ArbitrageTable, { ArbitrageOpportunity } from '@/components/scanner/ArbitrageTable';
import { useArbitrageData } from '@/hooks/use-arbitrage-data';
import { toast } from '@/hooks/use-toast';
import { ScannerHeader } from '@/components/scanner/ScannerHeader';

interface ScannerContentProps {
  activeMode: 'direct' | 'triangular' | 'futures';
  selectedExchanges: string[];
  minSpread: number;
  minVolume: number;
  onFiltersChange: (exchanges: string[], spread: number, volume: number) => void;
}

export function ScannerContent({
  activeMode,
  selectedExchanges,
  minSpread,
  minVolume,
  onFiltersChange
}: ScannerContentProps) {
  const { data, isLoading, refresh } = useArbitrageData(
    activeMode, 
    selectedExchanges, 
    minSpread,
    minVolume,
    true,
    { refreshInterval: 30000 }
  );

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

  const handleRefresh = () => {
    refresh();
    toast({
      title: 'Refreshing Data',
      description: 'Fetching the latest arbitrage opportunities...',
    });
  };

  // Convert the data to the correct type expected by ArbitrageTable
  const typedData: ArbitrageOpportunity[] = data ? data.map(item => ({
    ...item,
    type: activeMode as "direct" | "triangular" | "futures"
  })) : [];

  return (
    <Card className="bg-slate-800 border-slate-700 mb-6">
      <ScannerHeader 
        onRefresh={handleRefresh}
        onDownload={handleDownloadCSV}
        data={data || []}
      />
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
            onFiltersChange(
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
          arbitrageType={activeMode}
          onRefresh={refresh}
        />
      </div>
    </Card>
  );
}
