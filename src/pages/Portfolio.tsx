import React, { useState } from 'react';
import { Wallet, ArrowUpRight, PieChart, BarChart3, RefreshCw, Plus, Filter, Download, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, PieChart as RechartPieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Types
interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
  price: number;
  priceChange24h: number;
  allocationPercentage: number;
  color: string;
}

interface AssetPerformance {
  timeframe: string;
  btc: number;
  eth: number;
  sol: number;
  portfolio: number;
}

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('7d');
  
  // Sample portfolio data
  const assets: Asset[] = [
    { 
      id: 'btc', 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      amount: 1.234, 
      value: 73452.67, 
      price: 59523.24, 
      priceChange24h: 2.3, 
      allocationPercentage: 48.5,
      color: '#F7931A'
    },
    { 
      id: 'eth', 
      name: 'Ethereum', 
      symbol: 'ETH', 
      amount: 15.721, 
      value: 43928.79, 
      price: 2794.91, 
      priceChange24h: -1.2, 
      allocationPercentage: 29.0,
      color: '#627EEA'
    },
    { 
      id: 'sol', 
      name: 'Solana', 
      symbol: 'SOL', 
      amount: 253.45, 
      value: 25723.31, 
      price: 101.49, 
      priceChange24h: 5.7, 
      allocationPercentage: 17.0,
      color: '#14F195'
    },
    { 
      id: 'bnb', 
      name: 'Binance Coin', 
      symbol: 'BNB', 
      amount: 12.5, 
      value: 4832.50, 
      price: 386.6, 
      priceChange24h: 0.3, 
      allocationPercentage: 3.2,
      color: '#F3BA2F'
    },
    { 
      id: 'matic', 
      name: 'Polygon', 
      symbol: 'MATIC', 
      amount: 3456.78, 
      value: 3456.78, 
      price: 1.0, 
      priceChange24h: -3.1, 
      allocationPercentage: 2.3,
      color: '#8247E5'
    }
  ];
  
  // Calculate portfolio total value
  const portfolioValue = assets.reduce((total, asset) => total + asset.value, 0);
  
  // Portfolio performance data (simulated)
  const performanceData: AssetPerformance[] = [
    { timeframe: 'Jan', btc: 10, eth: 5, sol: 8, portfolio: 7.5 },
    { timeframe: 'Feb', btc: 12, eth: 7, sol: 15, portfolio: 10.2 },
    { timeframe: 'Mar', btc: 8, eth: 3, sol: 12, portfolio: 6.8 },
    { timeframe: 'Apr', btc: -5, eth: -2, sol: -8, portfolio: -4.3 },
    { timeframe: 'May', btc: 15, eth: 10, sol: 18, portfolio: 13.5 },
    { timeframe: 'Jun', btc: 7, eth: 9, sol: 2, portfolio: 6.4 },
    { timeframe: 'Jul', btc: 9, eth: 12, sol: 10, portfolio: 10.1 },
  ];
  
  // Handle refresh portfolio
  const refreshPortfolio = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Format percentage change
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Portfolio</h1>
        <p className="text-sm md:text-base text-slate-400">
          Track and manage your cryptocurrency assets and performance
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <Card className="bg-slate-800 border-slate-700 text-white flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-400 text-sm font-normal">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold">{formatCurrency(portfolioValue)}</h2>
              <span className="text-green-400 text-sm font-medium flex items-center">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                +7.2%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Last updated: Today, 2:45 PM</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 text-white flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-400 text-sm font-normal">24h Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold text-green-400">+$3,256.89</h2>
              <span className="text-green-400 text-sm font-medium flex items-center">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                +2.1%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Compared to 24 hours ago</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 text-white flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-400 text-sm font-normal">Number of Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold">{assets.length}</h2>
              <span className="text-blue-400 text-sm font-medium px-2 py-0.5 bg-blue-400/10 rounded-md">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Across 3 exchanges and 2 wallets</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col-reverse lg:flex-row gap-6 mb-6">
        <Card className="bg-slate-800 border-slate-700 text-white lg:w-8/12">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Performance</CardTitle>
              <div className="flex gap-2">
                <Select defaultValue={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-24 h-8 text-xs bg-slate-700 border-slate-600">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="7d">1 Week</SelectItem>
                    <SelectItem value="1m">1 Month</SelectItem>
                    <SelectItem value="3m">3 Months</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis 
                    dataKey="timeframe" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#475569',
                      borderRadius: '0.375rem',
                      color: '#ffffff'
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                  />
                  <Bar dataKey="portfolio" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex gap-4 mt-4 items-center justify-center">
              <div className="flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-[#F7931A]" />
                <span className="text-xs text-slate-400">BTC</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-[#627EEA]" />
                <span className="text-xs text-slate-400">ETH</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-[#14F195]" />
                <span className="text-xs text-slate-400">SOL</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                <span className="text-xs text-slate-400">Portfolio</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 text-white lg:w-4/12">
          <CardHeader className="pb-2">
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartPieChart>
                  <Pie
                    data={assets}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="allocationPercentage"
                  >
                    {assets.map((asset) => (
                      <Cell key={asset.id} fill={asset.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Allocation']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#475569',
                      borderRadius: '0.375rem',
                      color: '#ffffff'
                    }}
                  />
                </RechartPieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              {assets.slice(0, 4).map((asset) => (
                <div 
                  key={asset.id} 
                  className="flex gap-2 items-center"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: asset.color }}
                  />
                  <span className="text-xs text-slate-400">{asset.symbol} - {asset.allocationPercentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border border-slate-700 p-1 mb-6">
          <TabsTrigger 
            value="overview" 
            className={`${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300'} 
            text-xs rounded-sm transition-colors px-3 py-1`}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="transactions" 
            className={`${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300'} 
            text-xs rounded-sm transition-colors px-3 py-1`}
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger 
            value="rebalance" 
            className={`${activeTab === 'rebalance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-300'} 
            text-xs rounded-sm transition-colors px-3 py-1`}
          >
            Rebalance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium text-white">Assets</h2>
              <Badge className="bg-blue-600 hover:bg-blue-600">{assets.length} assets</Badge>
            </div>
            
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search assets..."
                  className="pl-10 bg-slate-700 border-slate-600 text-white text-sm h-9"
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-xs"
                onClick={refreshPortfolio}
                disabled={loading}
              >
                <RefreshCw 
                  className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} 
                />
                Refresh
              </Button>
              
              <Button className="h-9 bg-blue-600 hover:bg-blue-500 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Asset
              </Button>
            </div>
          </div>
          
          <Card className="bg-slate-800 border-slate-700 text-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left font-medium text-slate-400 py-3 px-4">Asset</th>
                    <th className="text-right font-medium text-slate-400 py-3 px-4">Price</th>
                    <th className="text-right font-medium text-slate-400 py-3 px-4">24h</th>
                    <th className="text-right font-medium text-slate-400 py-3 px-4">Holdings</th>
                    <th className="text-right font-medium text-slate-400 py-3 px-4">Value</th>
                    <th className="text-right font-medium text-slate-400 py-3 px-4">Allocation</th>
                    <th className="text-right font-medium text-slate-400 py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr 
                      key={asset.id} 
                      className="border-b border-slate-700/70 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${asset.color}30` }}
                          >
                            <span className="text-xs font-bold" style={{ color: asset.color }}>
                              {asset.symbol.substring(0, 1)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{asset.name}</div>
                            <div className="text-xs text-slate-400">{asset.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(asset.price)}</td>
                      <td className="py-3 px-4 text-right">
                        <span 
                          className={`text-xs ${asset.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center justify-end`}
                        >
                          {asset.priceChange24h >= 0 ? (
                            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5 rotate-180" />
                          )}
                          {formatPercentage(asset.priceChange24h)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-white">{asset.amount.toFixed(4)}</div>
                        <div className="text-xs text-slate-400">{asset.symbol}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(asset.value)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={asset.allocationPercentage} 
                            className="h-1.5 w-16 bg-slate-700 [&>div]:bg-blue-500" 
                          />
                          <span className="text-xs text-slate-400">
                            {asset.allocationPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card className="bg-slate-800 border-slate-700 text-white p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Transaction History</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              Track all your buy and sell transactions, deposits, and withdrawals across all your connected exchanges and wallets.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-500">
              Connect Exchange
            </Button>
          </Card>
        </TabsContent>
        
        <TabsContent value="rebalance">
          <Card className="bg-slate-800 border-slate-700 text-white p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-4">
              <PieChart className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Portfolio Rebalancing</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              Keep your portfolio aligned with your target allocations. Set custom targets for each asset and rebalance with a single click.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-500">
              Set Target Allocations
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Portfolio; 