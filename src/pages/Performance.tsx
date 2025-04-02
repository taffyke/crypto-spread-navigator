import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  Wallet, 
  TrendingUp, 
  Clock, 
  Building, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  PieChart as PieChartIcon,
  Download,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  PieChart,
  Pie,
  Sector
} from 'recharts';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { generateMarketData } from '@/data/mockData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock data for performance metrics
const overviewData = [
  { name: 'Jan', profit: 1200, volume: 24000 },
  { name: 'Feb', profit: 1900, volume: 28000 },
  { name: 'Mar', profit: 800, volume: 22000 },
  { name: 'Apr', profit: 1600, volume: 26000 },
  { name: 'May', profit: 2500, volume: 32000 },
  { name: 'Jun', profit: 1800, volume: 28000 },
  { name: 'Jul', profit: 3000, volume: 40000 },
  { name: 'Aug', profit: 2100, volume: 30000 },
  { name: 'Sep', profit: 2400, volume: 34000 },
  { name: 'Oct', profit: 1400, volume: 26000 },
  { name: 'Nov', profit: 2200, volume: 32000 },
  { name: 'Dec', profit: 2800, volume: 38000 }
];

// Mock data for exchange performance
const exchangePerformance = [
  { name: 'Binance', profit: 5200, trades: 126, successRate: 72 },
  { name: 'Coinbase', profit: 3800, trades: 95, successRate: 68 },
  { name: 'Kraken', profit: 2100, trades: 63, successRate: 65 },
  { name: 'KuCoin', profit: 1900, trades: 48, successRate: 70 },
  { name: 'Gate.io', profit: 1200, trades: 32, successRate: 62 }
];

// Mock data for asset performance
const assetPerformance = [
  { name: 'BTC', profit: 3200, trades: 42, successRate: 76, allocation: 35 },
  { name: 'ETH', profit: 2800, trades: 38, successRate: 72, allocation: 25 },
  { name: 'SOL', profit: 1900, trades: 28, successRate: 68, allocation: 15 },
  { name: 'XRP', profit: 1200, trades: 22, successRate: 64, allocation: 10 },
  { name: 'ADA', profit: 800, trades: 18, successRate: 60, allocation: 8 },
  { name: 'Other', profit: 600, trades: 12, successRate: 58, allocation: 7 }
];

// Mock data for trade history
const tradeHistory = [
  { 
    id: 'trade-1',
    type: 'Arbitrage',
    pair: 'BTC/USDT',
    buyExchange: 'Binance',
    sellExchange: 'Coinbase',
    buyPrice: 64235.48,
    sellPrice: 64498.72,
    profit: 263.24,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'completed',
    volume: 1.2
  },
  { 
    id: 'trade-2',
    type: 'Triangular',
    pair: 'ETH/BTC/USDT',
    buyExchange: 'Binance',
    sellExchange: 'Binance',
    buyPrice: 3500.25,
    sellPrice: 3530.15,
    profit: 29.90,
    date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    status: 'completed',
    volume: 2.5
  },
  { 
    id: 'trade-3',
    type: 'Arbitrage',
    pair: 'SOL/USDT',
    buyExchange: 'KuCoin',
    sellExchange: 'Binance',
    buyPrice: 172.36,
    sellPrice: 175.28,
    profit: 2.92,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'completed',
    volume: 15
  },
  { 
    id: 'trade-4',
    type: 'Futures',
    pair: 'ETH/USDT',
    buyExchange: 'Binance',
    sellExchange: 'Binance',
    buyPrice: 3480.12,
    sellPrice: 3460.25,
    profit: -19.87,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'completed',
    volume: 5
  },
  { 
    id: 'trade-5',
    type: 'Arbitrage',
    pair: 'ADA/USDT',
    buyExchange: 'Gate.io',
    sellExchange: 'KuCoin',
    buyPrice: 0.58,
    sellPrice: 0.60,
    profit: 0.02,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    status: 'completed',
    volume: 2000
  }
];

// Statistic cards data
const performanceStats = [
  { label: 'Total Profit', value: '$12,438.29', change: '+8.2%', isPositive: true },
  { label: 'Win Rate', value: '68%', change: '+4.5%', isPositive: true },
  { label: 'Avg. Return', value: '3.2%', change: '-0.5%', isPositive: false },
  { label: 'Total Trades', value: '342', change: '+12.8%', isPositive: true },
  { label: 'Trading Volume', value: '$1.24M', change: '+15.3%', isPositive: true },
  { label: 'Active Bots', value: '3', change: '+1', isPositive: true }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Performance = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(overviewData);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle export data
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your performance data is being exported to CSV",
    });
  };
  
  // Add useEffect to handle initial loading
  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add useEffect to update data when timeframe changes
  useEffect(() => {
    if (timeframe === '7d') {
      // Simulate 7-day data
      setChartData(overviewData.slice(-7));
    } else if (timeframe === '30d') {
      // Use full month data
      setChartData(overviewData);
    } else if (timeframe === '90d') {
      // Simulate 90-day data by tripling and adjusting
      const extendedData = [...overviewData];
      for (let i = 0; i < 2; i++) {
        overviewData.forEach(item => {
          extendedData.push({
            name: `${item.name}-${i+1}`,
            profit: item.profit * (1 + Math.random() * 0.3),
            volume: item.volume * (1 + Math.random() * 0.2)
          });
        });
      }
      setChartData(extendedData);
    }
  }, [timeframe]);
  
  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    toast({
      title: "Timeframe Changed",
      description: `Performance data updated to ${newTimeframe} view`,
    });
  };
  
  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-600 border-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading performance data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Performance</h1>
        <p className="text-sm md:text-base text-slate-400">
          Track and analyze your trading performance metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {performanceStats.slice(0, 6).map((stat, index) => (
          <div 
            key={index} 
            className="bg-slate-800 border border-slate-700 rounded-lg p-4"
          >
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-semibold text-white">{stat.value}</h3>
              {stat.change && (
                <span className={`text-xs ${stat.isPositive ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                  {stat.isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trade-history" className="data-[state=active]:bg-blue-600">
              <Clock className="h-4 w-4 mr-2" />
              Trade History
            </TabsTrigger>
            <TabsTrigger value="exchange-analysis" className="data-[state=active]:bg-blue-600">
              <Building className="h-4 w-4 mr-2" />
              Exchange Analysis
            </TabsTrigger>
            <TabsTrigger value="asset-performance" className="data-[state=active]:bg-blue-600">
              <Wallet className="h-4 w-4 mr-2" />
              Asset Performance
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Filter className="h-4 w-4" />
                  {timeframe}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleTimeframeChange('7d')}>
                  7 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTimeframeChange('30d')}>
                  30 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTimeframeChange('90d')}>
                  90 Days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <TabsContent value="overview" className="mt-0">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Profit Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '0.375rem'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="Profit ($)" 
                    stroke="#0ea5e9" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    name="Volume ($)" 
                    stroke="#a855f7" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Strategy Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Direct', value: 6500 },
                      { name: 'Triangular', value: 3200 },
                      { name: 'Futures', value: 2700 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '0.375rem'
                      }} 
                      formatter={(value) => [`$${value}`, 'Profit']}
                    />
                    <Bar dataKey="value" name="Profit" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Daily vs. Cumulative Profit</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { day: 1, daily: 120, cumulative: 120 },
                      { day: 2, daily: 180, cumulative: 300 },
                      { day: 3, daily: 100, cumulative: 400 },
                      { day: 4, daily: 250, cumulative: 650 },
                      { day: 5, daily: 300, cumulative: 950 },
                      { day: 6, daily: 200, cumulative: 1150 },
                      { day: 7, daily: 180, cumulative: 1330 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '0.375rem'
                      }} 
                      formatter={(value) => [`$${value}`, '']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="daily" 
                      name="Daily Profit" 
                      stroke="#10b981" 
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      name="Cumulative Profit" 
                      stroke="#f97316" 
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="trade-history" className="mt-0">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Trade History</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-700">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Pair</th>
                    <th className="px-4 py-3">Buy Exchange</th>
                    <th className="px-4 py-3">Sell Exchange</th>
                    <th className="px-4 py-3">Buy Price</th>
                    <th className="px-4 py-3">Sell Price</th>
                    <th className="px-4 py-3">Volume</th>
                    <th className="px-4 py-3">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {tradeHistory.map((trade) => (
                    <tr key={trade.id} className="hover:bg-slate-700">
                      <td className="px-4 py-3 text-slate-300">{formatDate(trade.date)}</td>
                      <td className="px-4 py-3 text-slate-300">{trade.type}</td>
                      <td className="px-4 py-3 font-medium text-white">{trade.pair}</td>
                      <td className="px-4 py-3 text-slate-300">{trade.buyExchange}</td>
                      <td className="px-4 py-3 text-slate-300">{trade.sellExchange}</td>
                      <td className="px-4 py-3 text-slate-300">${trade.buyPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-300">${trade.sellPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-300">{trade.volume}</td>
                      <td className={`px-4 py-3 font-medium ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm">
                Load More Trades
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="exchange-analysis" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Exchange Profit Comparison</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={exchangePerformance}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '0.375rem'
                      }} 
                      formatter={(value) => [`$${value}`, 'Profit']}
                    />
                    <Bar dataKey="profit" name="Profit" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                      {exchangePerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Exchange Success Rate</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={exchangePerformance}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '0.375rem'
                      }} 
                      formatter={(value) => [`${value}%`, 'Success Rate']}
                    />
                    <Bar dataKey="successRate" name="Success Rate" fill="#10b981" radius={[0, 4, 4, 0]}>
                      {exchangePerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Exchange Performance Metrics</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-700">
                    <tr>
                      <th className="px-4 py-3">Exchange</th>
                      <th className="px-4 py-3">Total Profit</th>
                      <th className="px-4 py-3">Total Trades</th>
                      <th className="px-4 py-3">Success Rate</th>
                      <th className="px-4 py-3">Avg. Spread</th>
                      <th className="px-4 py-3">Fees Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {exchangePerformance.map((exchange, index) => (
                      <tr key={index} className="hover:bg-slate-700">
                        <td className="px-4 py-3 font-medium text-white">{exchange.name}</td>
                        <td className="px-4 py-3 text-green-400">${exchange.profit.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-300">{exchange.trades}</td>
                        <td className="px-4 py-3 text-slate-300">{exchange.successRate}%</td>
                        <td className="px-4 py-3 text-slate-300">{(exchange.profit / exchange.trades).toFixed(2)}%</td>
                        <td className="px-4 py-3 text-red-400">${(exchange.profit * 0.15).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="asset-performance" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Asset Allocation</h3>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="allocation"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {assetPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '0.375rem'
                      }} 
                      formatter={(value) => [`${value}%`, 'Allocation']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Asset Profit Comparison</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={assetPerformance}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '0.375rem'
                      }} 
                      formatter={(value) => [`$${value}`, 'Profit']}
                    />
                    <Legend />
                    <Bar dataKey="profit" name="Profit" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                      {assetPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Asset Performance Metrics</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-700">
                    <tr>
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-4 py-3">Total Profit</th>
                      <th className="px-4 py-3">Total Trades</th>
                      <th className="px-4 py-3">Success Rate</th>
                      <th className="px-4 py-3">Allocation</th>
                      <th className="px-4 py-3">Profit per Trade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {assetPerformance.map((asset, index) => (
                      <tr key={index} className="hover:bg-slate-700">
                        <td className="px-4 py-3 font-medium text-white">{asset.name}</td>
                        <td className="px-4 py-3 text-green-400">${asset.profit.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-300">{asset.trades}</td>
                        <td className="px-4 py-3 text-slate-300">{asset.successRate}%</td>
                        <td className="px-4 py-3 text-slate-300">{asset.allocation}%</td>
                        <td className="px-4 py-3 text-slate-300">${(asset.profit / asset.trades).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance; 