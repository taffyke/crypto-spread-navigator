
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArbitrageDashboard } from '@/components/scanner/ArbitrageDashboard';
import { NetworkRecommendations } from '@/components/scanner/NetworkRecommendations';
import ExchangeArbitrage from '@/components/ExchangeArbitrage';
import ArbitrageRiskCalculator from '@/components/scanner/ArbitrageRiskCalculator';
import { ScannerContent } from '@/components/scanner/ScannerContent';

interface ScannerLayoutProps {
  activeMode: 'direct' | 'triangular' | 'futures';
  selectedExchanges: string[];
  minSpread: number;
  minVolume: number;
  onModeChange: (mode: string) => void;
  onFiltersChange: (exchanges: string[], spread: number, volume: number) => void;
}

export function ScannerLayout({
  activeMode,
  selectedExchanges,
  minSpread,
  minVolume,
  onModeChange,
  onFiltersChange
}: ScannerLayoutProps) {
  return (
    <TooltipProvider>
      <div className="container mx-auto py-6">
        <ArbitrageDashboard onModeChange={onModeChange} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ScannerContent
              activeMode={activeMode}
              selectedExchanges={selectedExchanges}
              minSpread={minSpread}
              minVolume={minVolume}
              onFiltersChange={onFiltersChange}
            />
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
    </TooltipProvider>
  );
}
