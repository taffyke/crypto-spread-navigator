import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart2, RefreshCw } from 'lucide-react';
import { useMultiTickerWebSocket } from '@/hooks/use-websocket';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from '@/hooks/use-toast';

// Helper function to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Charts = () => {
  const { pair } = useParams<{ pair: string }>();
  const queryParams = useQuery();
  const navigate = useNavigate();
  
  const buyExchange = queryParams.get('buy') || 'Binance';
  const sellExchange = queryParams.get('sell') || 'Coinbase';
  
  const [priceHistory, setPriceHistory] = useState<{ timestamp: number; buyPrice: number; sellPrice: number; spread: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize exchanges for WebSocket connection (lowercase & remove spaces)
  const normalizedBuyExchange = buyExchange.toLowerCase().replace(/\s/g, '');
  const normalizedSellExchange = sellExchange.toLowerCase().replace(/\s/g, '');
  
  // Use the WebSocket hook to get real-time ticker data
  const { 
    data: tickerData,
    isConnected,
    reconnect 
  } = useMultiTickerWebSocket(
    [normalizedBuyExchange, normalizedSellExchange],
    pair || 'BTC/USDT'
  );
  
  // Add new price data points when ticker data changes
  useEffect(() => {
    if (tickerData && Object.keys(tickerData).length > 0) {
      const buyTickerData = tickerData[normalizedBuyExchange];
      const sellTickerData = tickerData[normalizedSellExchange];
      
      if (buyTickerData?.last && sellTickerData?.last) {
        const buyPrice = parseFloat(buyTickerData.last);
        const sellPrice = parseFloat(sellTickerData.last);
        const spread = ((sellPrice - buyPrice) / buyPrice) * 100;
        
        setPriceHistory(prev => {
          // Add new data point
          const newDataPoint = {
            timestamp: Date.now(),
            buyPrice,
            sellPrice,
            spread
          };
          
          // Keep only the most recent 100 data points
          const updatedHistory = [...prev, newDataPoint].slice(-100);
          return updatedHistory;
        });
        
        setIsLoading(false);
      }
    }
  }, [tickerData, normalizedBuyExchange, normalizedSellExchange]);
  
  // Format prices for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 0.1 ? 6 : price < 1 ? 4 : 2
    }).format(price);
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    reconnect();
    toast({
      title: "Refreshing Chart Data",
      description: "Reconnecting to WebSocket feeds..."
    });
  };
  
  // Go back handler
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // Get latest prices
  const latestData = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1] : null;
  const currentBuyPrice = latestData?.buyPrice || 0;
  const currentSellPrice = latestData?.sellPrice || 0;
  const currentSpread = latestData?.spread || 0;
  
  // Format time for X-axis
  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-md p-3 shadow-lg">
          <p className="text-white text-sm mb-1">
            {new Date(payload[0].payload.timestamp).toLocaleTimeString()}
          </p>
          <p className="text-blue-400 text-xs">
            {buyExchange}: {formatPrice(payload[0].payload.buyPrice)}
          </p>
          <p className="text-green-400 text-xs">
            {sellExchange}: {formatPrice(payload[0].payload.sellPrice)}
          </p>
          <p className="text-yellow-400 text-xs">
            Spread: {payload[0].payload.spread.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <button 
            onClick={handleGoBack} 
            className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white">{pair} Price Charts</h1>
        </div>
        <p className="text-sm md:text-base text-slate-400">
          Compare real-time prices between {buyExchange} and {sellExchange}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-blue-400" />
                  <CardTitle>{pair} Price Comparison</CardTitle>
                </div>
                <button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isLoading || priceHistory.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={priceHistory}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={formatXAxis} 
                        stroke="#64748b" 
                      />
                      <YAxis 
                        stroke="#64748b"
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => formatPrice(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="buyPrice" 
                        name={`${buyExchange} Price`} 
                        stroke="#3b82f6" 
                        dot={false} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sellPrice" 
                        name={`${sellExchange} Price`} 
                        stroke="#10b981" 
                        dot={false} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="text-base">Current Prices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900 p-3 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">
                  {buyExchange}
                </div>
                <div className="text-lg font-bold text-white">
                  {formatPrice(currentBuyPrice)}
                </div>
              </div>
              
              <div className="bg-slate-900 p-3 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">
                  {sellExchange}
                </div>
                <div className="text-lg font-bold text-white">
                  {formatPrice(currentSellPrice)}
                </div>
              </div>
              
              <div className="bg-slate-900 p-3 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">
                  Current Spread
                </div>
                <div className={`text-lg font-bold ${
                  currentSpread >= 2 ? "text-green-500" :
                  currentSpread >= 0.5 ? "text-yellow-500" :
                  currentSpread < 0 ? "text-red-500" : "text-slate-400"
                }`}>
                  {currentSpread.toFixed(2)}%
                </div>
              </div>
              
              <div className="bg-slate-900 p-3 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">
                  Arbitrage Opportunity
                </div>
                <div className="flex gap-2">
                  <Badge className={
                    currentSpread >= 1.5 ? "bg-green-600" :
                    currentSpread >= 0.5 ? "bg-yellow-600" :
                    "bg-red-600"
                  }>
                    {currentSpread >= 1.5 ? "Profitable" :
                     currentSpread >= 0.5 ? "Marginal" :
                     "Not Recommended"}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-slate-900 p-3 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">
                  WebSocket Status
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="text-base">Spread History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px]">
                {isLoading || priceHistory.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={priceHistory}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={formatXAxis} 
                        stroke="#64748b"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        stroke="#64748b"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => `${value.toFixed(1)}%`}
                      />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="spread" 
                        name="Spread %" 
                        stroke="#eab308" 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Charts;
