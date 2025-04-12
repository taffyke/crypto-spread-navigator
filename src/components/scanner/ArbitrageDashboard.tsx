
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useArbitrageData } from '@/hooks/use-arbitrage-data';
import { RefreshCw, CircleDollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ArbitrageDashboardProps {
  onModeChange?: (mode: string) => void;
}

export function ArbitrageDashboard({ onModeChange }: ArbitrageDashboardProps) {
  const [arbitrageMode, setArbitrageMode] = useState<'direct' | 'triangular' | 'futures'>('direct');
  const [investment, setInvestment] = useState(1000);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Use the arbitrage data hook
  const { 
    data: opportunities, 
    isLoading, 
    refresh, 
    lastUpdated: dataLastUpdated 
  } = useArbitrageData(
    arbitrageMode, 
    [], // All exchanges
    0.2, // Min spread
    10000, // Min volume
    true, // Auto refresh
    { refreshInterval: 30000 } // Every 30 seconds
  );

  // Update last updated timestamp when data changes
  useEffect(() => {
    if (dataLastUpdated) {
      setLastUpdated(new Date(dataLastUpdated));
    }
  }, [dataLastUpdated]);
  
  // Calculate stats from opportunities
  const totalOpportunities = opportunities?.length || 0;
  
  // Calculate average spread
  const averageSpread = totalOpportunities > 0 
    ? opportunities.reduce((sum, opp) => sum + opp.spreadPercentage, 0) / totalOpportunities
    : 0;
  
  // Calculate highest spread
  const highestSpread = totalOpportunities > 0 
    ? Math.max(...opportunities.map(opp => opp.spreadPercentage))
    : 0;
  
  // Calculate potential profit based on investment
  const potentialProfit = totalOpportunities > 0 && investment > 0
    ? (investment * (highestSpread / 100)).toFixed(2)
    : "0.00";
  
  // Handle mode change
  const handleModeChange = (value: string) => {
    setArbitrageMode(value as 'direct' | 'triangular' | 'futures');
    if (onModeChange) {
      onModeChange(value);
    }
    
    toast({
      title: `${value.charAt(0).toUpperCase() + value.slice(1)} Mode Activated`,
      description: `Switched to ${value} arbitrage scanning mode`,
    });
    
    // Trigger a refresh when mode changes
    refresh();
  };
  
  // Format time for display
  const formattedTime = lastUpdated.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-white">Arbitrage Scanner Dashboard</h2>
          <div className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded ml-3 flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-1.5 animate-pulse"></span>
            Live
          </div>
        </div>
        <div className="flex items-center text-slate-400 text-sm">
          <span className="mr-2">Last Updated:</span> 
          <span className="text-white">{formattedTime}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refresh()}
            className="ml-2 h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Total Opportunities */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-slate-400 text-sm mb-1">Total Opportunities</span>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-white">{totalOpportunities}</span>
                <span className="text-sm text-slate-400 ml-2">Across 15 exchanges</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Average Spread */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-slate-400 text-sm mb-1">Average Spread</span>
              <div className="flex items-baseline">
                <span className={`text-4xl font-bold ${averageSpread >= 1 ? 'text-green-400' : averageSpread > 0.5 ? 'text-amber-400' : 'text-white'}`}>
                  {averageSpread.toFixed(2)}%
                </span>
                <span className="text-sm text-slate-400 ml-2">Min spread filter: 0.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Highest Spread */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-slate-400 text-sm mb-1">Highest Spread</span>
              <div className="flex items-baseline">
                <span className={`text-4xl font-bold ${highestSpread >= 2 ? 'text-green-400' : highestSpread >= 1 ? 'text-amber-400' : 'text-white'}`}>
                  {highestSpread.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Potential Profit Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-slate-400 text-sm mb-1">Investment</span>
              <div className="flex items-center">
                <CircleDollarSign className="text-green-500 mr-1 h-6 w-6" />
                <input
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-700 border-slate-600 text-white px-2 py-1 rounded text-lg"
                />
              </div>
              <div className="mt-2">
                <span className="text-slate-400 text-sm">Potential profit:</span>
                <span className="text-green-400 font-bold ml-1">${potentialProfit}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div>
          <h3 className="text-white font-medium mb-1">Arbitrage Mode</h3>
          <Tabs defaultValue="direct" value={arbitrageMode} onValueChange={handleModeChange}>
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="direct" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Direct
              </TabsTrigger>
              <TabsTrigger value="triangular" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Triangular
              </TabsTrigger>
              <TabsTrigger value="futures" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Futures
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Button variant="outline" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span>Advanced Filters</span>
        </Button>
      </div>
    </div>
  );
}

export default ArbitrageDashboard;
