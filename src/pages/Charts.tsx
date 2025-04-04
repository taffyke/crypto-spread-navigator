import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart2, RefreshCw, AlertTriangle } from 'lucide-react';
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

// Helper function to clean exchange IDs
function cleanExchangeId(exchangeName: string): string {
  return exchangeName.toLowerCase().replace(/\s/g, '').replace(/_/g, '');
}

const Charts = () => {
  const { pair = 'BTC/USDT' } = useParams<{ pair: string }>();
  const queryParams = useQuery();
  const navigate = useNavigate();
  
  // Get exchange names from URL parameters, default to Binance and Coinbase if not specified
  const buyExchange = queryParams.get('buy') || 'binance';
  const sellExchange = queryParams.get('sell') || 'coinbase';
  
  // Format pair properly
  const formattedPair = useMemo(() => {
    // Handle cases where pair might be formatted incorrectly (e.g., ADA-USDT instead of ADA/USDT)
    if (pair && !pair.includes('/')) {
      // Try to identify the separator or add one if needed
      if (pair.includes('-')) {
        const [base, quote] = pair.split('-');
        return `${base}/${quote}`;
      }
      // This is a basic assumption, better handling would check common quote currencies
      if (['USDT', 'USD', 'USDC', 'BTC', 'ETH'].some(quote => pair.endsWith(quote))) {
        // For pairs like ADAUSDT, try to split at common quote currency
        for (const quote of ['USDT', 'USD', 'USDC', 'BTC', 'ETH']) {
          if (pair.endsWith(quote)) {
            const base = pair.slice(0, pair.length - quote.length);
            return `${base}/${quote}`;
          }
        }
      }
    }
    return pair;
  }, [pair]);
  
  const [priceHistory, setPriceHistory] = useState<{ timestamp: number; buyPrice: number; sellPrice: number; spread: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Normalize exchanges for WebSocket connection (lowercase & remove spaces)
  const normalizedBuyExchange = useMemo(() => cleanExchangeId(buyExchange), [buyExchange]);
  const normalizedSellExchange = useMemo(() => cleanExchangeId(sellExchange), [sellExchange]);
  
  // Extract baseCurrency and quoteCurrency for icons
  const [baseCurrency, quoteCurrency] = useMemo(() => {
    const parts = formattedPair.split('/');
    return [parts[0] || 'BTC', parts[1] || 'USDT'];
  }, [formattedPair]);
  
  // Use the WebSocket hook to get real-time ticker data - now with the reconnect function
  const { 
    data: tickerData,
    isConnected,
    error: wsError,
    reconnect 
  } = useMultiTickerWebSocket(
    [normalizedBuyExchange, normalizedSellExchange],
    formattedPair,
    true // Explicitly enable WebSocket
  );
  
  // Add new price data points when ticker data changes
  useEffect(() => {
    if (tickerData && Object.keys(tickerData).length > 0) {
      console.log('Received ticker data:', tickerData);
      
      const buyTickerData = tickerData[normalizedBuyExchange];
      const sellTickerData = tickerData[normalizedSellExchange];
      
      if (buyTickerData && sellTickerData) {
        try {
          // Safely extract price data with fallbacks
          const buyPrice = parseFloat(buyTickerData.last || buyTickerData.price || buyTickerData.close || '0');
          const sellPrice = parseFloat(sellTickerData.last || sellTickerData.price || sellTickerData.close || '0');
          
          console.log(`Buy price (${normalizedBuyExchange}): ${buyPrice}, Sell price (${normalizedSellExchange}): ${sellPrice}`);
          
          if (buyPrice > 0 && sellPrice > 0) {
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
            
            setLastUpdated(new Date());
            setIsLoading(false);
            setErrorMessage(null);
          }
        } catch (error) {
          console.error('Error processing ticker data:', error);
          setErrorMessage('Error processing price data');
        }
      }
    }
  }, [tickerData, normalizedBuyExchange, normalizedSellExchange]);
  
  // If we don't have real data yet and the connection is established, add simulated data
  useEffect(() => {
    if (priceHistory.length === 0 && (isConnected || wsError)) {
      // Show toast for WebSocket error or simulated data
      if (wsError) {
        console.log('WebSocket error, using simulated data', wsError);
        toast({
          title: "WebSocket Connection Issue",
          description: "Using simulated data instead of real-time prices.",
          variant: "destructive"
        });
        setErrorMessage('WebSocket connection failed. Using simulated data.');
      } else if (priceHistory.length === 0) {
        console.log('Generating simulated price data for visualization');
        toast({
          title: "Using Simulated Data",
          description: "Real-time data unavailable. Using simulated data for preview.",
          variant: "default"
        });
      }

      // Generate simulated price data for visualization purposes
      const simulatedHistory = [];
      // Base price varies by currency pair
      let basePrice = 100; // Default
      if (formattedPair.startsWith('BTC')) {
        basePrice = 30000 + Math.random() * 2000;
      } else if (formattedPair.startsWith('ETH')) {
        basePrice = 2000 + Math.random() * 100;
      } else if (formattedPair.startsWith('ADA')) {
        basePrice = 0.5 + Math.random() * 0.1;
      }
      
      for (let i = 0; i < 20; i++) {
        const timestamp = Date.now() - (20 - i) * 30000; // Last 10 minutes
        const randomFluctuation1 = (Math.random() - 0.5) * (basePrice * 0.01); // 1% fluctuation
        const randomFluctuation2 = (Math.random() - 0.5) * (basePrice * 0.01) + (basePrice * 0.003); // Slight bias
        
        const buyPrice = basePrice + randomFluctuation1;
        const sellPrice = basePrice + randomFluctuation2;
        const spread = ((sellPrice - buyPrice) / buyPrice) * 100;
        
        simulatedHistory.push({
          timestamp,
          buyPrice,
          sellPrice,
          spread
        });
      }
      
      setPriceHistory(simulatedHistory);
      setLastUpdated(new Date());
      setIsLoading(false);
    }
  }, [isConnected, wsError, priceHistory.length, formattedPair]);
  
  // Format prices for display
  const formatPrice = (price: number) => {
    if (isNaN(price) || price === 0) return '$0.00';
    
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
    setErrorMessage(null);
    toast({
      title: "Refreshing Chart Data",
      description: "Reconnecting to WebSocket feeds..."
    });
  };
  
  // Go back handler
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // Get latest prices with safe fallbacks
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
          <p className="text-blue-400 text-xs flex items-center">
            <img 
              src={`/exchange-logos/${normalizedBuyExchange}.svg`}
              alt={buyExchange}
              className="w-3 h-3 mr-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {buyExchange}: {formatPrice(payload[0].payload.buyPrice)}
          </p>
          <p className="text-green-400 text-xs flex items-center">
            <img 
              src={`/exchange-logos/${normalizedSellExchange}.svg`}
              alt={sellExchange}
              className="w-3 h-3 mr-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
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
          <div className="flex items-center">
            <img 
              src={`/crypto-icons/${baseCurrency.toLowerCase()}.svg`}
              alt={baseCurrency}
              className="h-6 w-6 mr-1"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/crypto-icons/generic.svg';
              }}
            />
            <h1 className="text-xl md:text-2xl font-bold text-white mr-1">{formattedPair}</h1>
            <img 
              src={`/crypto-icons/${quoteCurrency.toLowerCase()}.svg`}
              alt={quoteCurrency}
              className="h-5 w-5 opacity-75"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/crypto-icons/generic.svg';
              }}
            />
          </div>
        </div>
        <p className="text-sm md:text-base text-slate-400 flex items-center">
          Compare real-time prices between 
          <span className="inline-flex items-center mx-1">
            <img 
              src={`/exchange-logos/${normalizedBuyExchange}.svg`}
              alt={buyExchange}
              className="h-4 w-4 mr-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {buyExchange}
          </span> 
          and 
          <span className="inline-flex items-center mx-1">
            <img 
              src={`/exchange-logos/${normalizedSellExchange}.svg`}
              alt={sellExchange}
              className="h-4 w-4 mr-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {sellExchange}
          </span>
        </p>
      </div>
      
      {errorMessage && (
        <div className="mb-4 bg-red-900/30 border border-red-700 rounded-md p-3 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-200 text-sm">{errorMessage}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-blue-400" />
                  <CardTitle>{formattedPair} Price Comparison</CardTitle>
                </div>
                <div className="flex items-center">
                  {lastUpdated && (
                    <span className="text-xs text-slate-400 mr-4">
                      Last update: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  <button 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
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
                <div className="text-sm text-slate-400 mb-1 flex items-center">
                  <img 
                    src={`/exchange-logos/${normalizedBuyExchange}.svg`}
                    alt={buyExchange}
                    className="h-4 w-4 mr-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {buyExchange}
                </div>
                <div className="text-lg font-bold text-white">
                  {formatPrice(currentBuyPrice)}
                </div>
              </div>
              
              <div className="bg-slate-900 p-3 rounded-lg">
                <div className="text-sm text-slate-400 mb-1 flex items-center">
                  <img 
                    src={`/exchange-logos/${normalizedSellExchange}.svg`}
                    alt={sellExchange}
                    className="h-4 w-4 mr-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
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
                  <div className={`h-2 w-2 rounded-full ${errorMessage ? "bg-red-500" : (wsError ? "bg-yellow-500" : "bg-green-500")}`}></div>
                  <span className="text-sm">
                    {errorMessage ? "Error" : (wsError ? "Using Fallback Data" : "Connected")}
                  </span>
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
