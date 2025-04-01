
import React, { useState } from 'react';
import { TrendingUp, Filter, RefreshCw, Download } from 'lucide-react';
import ExchangeSelector from '@/components/dashboard/ExchangeSelector';
import ArbitrageTable from '@/components/scanner/ArbitrageTable';
import { generateArbitrageOpportunities, exchanges } from '@/data/mockData';

const Scanner = () => {
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(['binance', 'coinbase', 'kucoin', 'kraken', 'gate_io']);
  const [minSpread, setMinSpread] = useState<number>(1.0);
  const [minVolume, setMinVolume] = useState<number>(100000);
  const [opportunities] = useState(generateArbitrageOpportunities(30));
  
  // Filter opportunities based on selected criteria
  const filteredOpportunities = opportunities.filter(opp => 
    opp.spreadPercentage >= minSpread && 
    opp.volume24h >= minVolume
  );
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Arbitrage Scanner</h1>
        <p className="text-slate-400">
          Find and analyze cross-exchange arbitrage opportunities in real-time
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-medium text-white">Live Opportunities</h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white text-sm flex items-center gap-2 transition-colors">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white text-sm flex items-center gap-2 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white text-sm flex items-center gap-2 transition-colors">
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
          
          <ArbitrageTable opportunities={filteredOpportunities} />
        </div>
        
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Exchange Selection</h3>
            <ExchangeSelector 
              exchanges={exchanges}
              selectedExchanges={selectedExchanges}
              onSelectionChange={setSelectedExchanges}
            />
            
            <div className="mt-6">
              <h3 className="text-white font-medium mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Minimum Spread</span>
                    <span className="text-white">{minSpread.toFixed(1)}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="5" 
                    step="0.1" 
                    value={minSpread}
                    onChange={(e) => setMinSpread(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Minimum Volume (24h)</span>
                    <span className="text-white">${(minVolume/1000).toFixed(0)}K</span>
                  </label>
                  <input 
                    type="range" 
                    min="10000" 
                    max="1000000" 
                    step="10000" 
                    value={minVolume}
                    onChange={(e) => setMinVolume(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <h3 className="text-white font-medium mb-2">Additional Options</h3>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="includeFees" 
                  defaultChecked={true}
                  className="h-4 w-4 rounded border-slate-700"
                />
                <label htmlFor="includeFees" className="text-sm text-slate-300">
                  Include exchange fees
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="checkLiquidity" 
                  defaultChecked={true}
                  className="h-4 w-4 rounded border-slate-700"
                />
                <label htmlFor="checkLiquidity" className="text-sm text-slate-300">
                  Check liquidity depth
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="checkDeposits" 
                  defaultChecked={true}
                  className="h-4 w-4 rounded border-slate-700"
                />
                <label htmlFor="checkDeposits" className="text-sm text-slate-300">
                  Check deposit/withdrawal status
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="showCompleted" 
                  defaultChecked={false}
                  className="h-4 w-4 rounded border-slate-700"
                />
                <label htmlFor="showCompleted" className="text-sm text-slate-300">
                  Show completed arbitrages
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Summary</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Opportunities</span>
                <span className="text-white">{filteredOpportunities.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Average Spread</span>
                <span className="text-white">
                  {(filteredOpportunities.reduce((acc, opp) => acc + opp.spreadPercentage, 0) / 
                    (filteredOpportunities.length || 1)).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Highest Spread</span>
                <span className="text-green-500 font-medium">
                  {filteredOpportunities.length > 0 
                    ? Math.max(...filteredOpportunities.map(opp => opp.spreadPercentage)).toFixed(2) 
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Exchanges Monitored</span>
                <span className="text-white">{selectedExchanges.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Last Updated</span>
                <span className="text-white">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
