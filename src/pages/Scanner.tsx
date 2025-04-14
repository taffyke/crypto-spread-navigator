
import React, { useState } from 'react';
import { ScannerLayout } from '@/components/scanner/ScannerLayout';

const Scanner = () => {
  const [activeMode, setActiveMode] = useState<'direct' | 'triangular' | 'futures'>('direct');
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
  const [minSpread, setMinSpread] = useState(0.2);
  const [minVolume, setMinVolume] = useState(100000);
  
  const handleModeChange = (mode: string) => {
    setActiveMode(mode as 'direct' | 'triangular' | 'futures');
  };
  
  const handleFiltersChange = (exchanges: string[], spread: number, volume: number) => {
    setSelectedExchanges(exchanges);
    setMinSpread(spread);
    setMinVolume(volume);
  };
  
  return (
    <ScannerLayout
      activeMode={activeMode}
      selectedExchanges={selectedExchanges}
      minSpread={minSpread}
      minVolume={minVolume}
      onModeChange={handleModeChange}
      onFiltersChange={handleFiltersChange}
    />
  );
};

export default Scanner;
