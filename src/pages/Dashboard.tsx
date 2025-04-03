
import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, LineChart, BarChart3, History, Bot } from 'lucide-react';
import ArbitrageOpportunity from '@/components/dashboard/ArbitrageOpportunity';
import StatCard from '@/components/dashboard/StatCard';
import SmallStatCard from '@/components/dashboard/SmallStatCard';
import ProfitChart from '@/components/dashboard/ProfitChart';
import ExchangeSelector from '@/components/dashboard/ExchangeSelector';
import MarketOverview from '@/components/dashboard/MarketOverview';
import ExchangeVolume from '@/components/dashboard/ExchangeVolume';
import { Button } from '@/components/ui/button';
import { exchanges } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { fetchArbitrageOpportunities } from '@/lib/api/cryptoDataApi';

const Dashboard = () => {
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(['binance', 'coinbase', 'kucoin']);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Fetch real arbitrage opportunities
    const getArbitrageOpportunities = async () => {
      setIsLoading(true);
      try {
        const data = await fetchArbitrageOpportunities('direct', 0.5, 10000);
        setOpportunities(data);
      } catch (err) {
        console.error("Failed to fetch arbitrage opportunities:", err);
        toast({
          title: "Data Loading Error",
          description: "Unable to load arbitrage opportunities. Please refresh and try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getArbitrageOpportunities();
    
    // Set up regular data refresh
    const interval = setInterval(() => {
      getArbitrageOpportunities();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Filter top 3 opportunities for the dashboard cards
  const topOpportunities = opportunities.slice(0, 3);
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Monitor your arbitrage opportunities and trading performance</p>
      </div>
      
      {/* Top Arbitrage Opportunities - Moved to the top for better visibility */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Top Arbitrage Opportunities</h2>
          <Button className="bg-blue-600 hover:bg-blue-500">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div 
                key={index} 
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 animate-pulse"
              >
                <div className="h-6 bg-slate-700 rounded mb-4 w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-700 rounded w-4/6"></div>
                </div>
              </div>
            ))
          ) : topOpportunities.length > 0 ? (
            topOpportunities.map((opportunity) => (
              <ArbitrageOpportunity 
                key={opportunity.id}
                id={opportunity.id}
                pair={opportunity.pair}
                buyExchange={opportunity.buyExchange}
                sellExchange={opportunity.sellExchange}
                buyPrice={opportunity.buyPrice}
                sellPrice={opportunity.sellPrice}
                spreadPercentage={opportunity.spreadPercentage}
                potentialProfit={opportunity.potentialProfit}
                timestamp={opportunity.timestamp}
                volume24h={opportunity.volume24h}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-8 bg-slate-800 border border-slate-700 rounded-lg">
              <p className="text-slate-400">No arbitrage opportunities found. Please try again later.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Active Arbitrage Opportunities" 
          value={opportunities.length.toString()} 
          change={opportunities.length > 10 ? "12%" : "5%"} 
          isPositive={true} 
          icon={TrendingUp}
        />
        <StatCard 
          title="Today's Profit" 
          value="$1,245.32" 
          change="8.5%" 
          isPositive={true} 
          icon={DollarSign}
        />
        <StatCard 
          title="Total Profit (30d)" 
          value="$28,392.15" 
          change="15.3%" 
          isPositive={true} 
          icon={LineChart}
        />
        <StatCard 
          title="Active Bots" 
          value="3/5" 
          change="2" 
          isPositive={true} 
          icon={Bot}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ProfitChart title="Profit Performance (30 Days)" />
        </div>
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Exchange Selection</h3>
            <ExchangeSelector 
              exchanges={exchanges}
              selectedExchanges={selectedExchanges}
              onSelectionChange={setSelectedExchanges}
            />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <SmallStatCard 
                title="Active Exchanges" 
                value={selectedExchanges.length.toString()} 
                icon={BarChart3}
              />
              <SmallStatCard 
                title="Total Trades" 
                value="1,253" 
                icon={History}
                trend="up"
                trendValue="12%"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MarketOverview />
        <ExchangeVolume />
      </div>
      
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Active Bots</h2>
          <Button className="bg-blue-600 hover:bg-blue-500">
            Manage Bots
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-white">Cross-Exchange Bot</h3>
              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">Active</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Pairs</span>
                <span className="text-white">BTC/USDT, ETH/USDT</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Exchanges</span>
                <span className="text-white">Binance, Coinbase</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Min Spread</span>
                <span className="text-white">0.8%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Today's Profit</span>
                <span className="text-green-500 font-medium">$583.21</span>
              </div>
            </div>
            <Button className="w-full bg-slate-600 hover:bg-slate-500">
              View Details
            </Button>
          </div>
          
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-white">Triangular Bot</h3>
              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">Active</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Exchange</span>
                <span className="text-white">Binance</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Base Asset</span>
                <span className="text-white">USDT</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Min ROI</span>
                <span className="text-white">0.5%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Today's Profit</span>
                <span className="text-green-500 font-medium">$302.87</span>
              </div>
            </div>
            <Button className="w-full bg-slate-600 hover:bg-slate-500">
              View Details
            </Button>
          </div>
          
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-white">Statistical Bot</h3>
              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">Active</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Pairs</span>
                <span className="text-white">BTC/USDT, SOL/USDT</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Exchanges</span>
                <span className="text-white">Kraken, Kucoin</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Strategy</span>
                <span className="text-white">Mean Reversion</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Today's Profit</span>
                <span className="text-green-500 font-medium">$218.45</span>
              </div>
            </div>
            <Button className="w-full bg-slate-600 hover:bg-slate-500">
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
