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
      <div className="flex items-center mb-6">
        <button 
          onClick={handleGoBack}
          className="mr-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <div className="flex items-center">
            <img 
              src={`/crypto-icons/${baseCurrency.toLowerCase()}.svg`}
              alt={baseCurrency}
              className="w-6 h-6 mr-1"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/crypto-icons/generic.svg';
              }}
            />
            <span>{formattedPair}</span>
          </div>
          <span className="text-slate-400 font-normal text-sm md:text-base">
            Arbitrage Charts
          </span>
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-blue-400" />
                  Price Comparison
                  
                  {errorMessage && (
                    <span className="ml-2 text-xs text-red-400 font-normal flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errorMessage}
                    </span>
                  )}
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  {lastUpdated && (
                    <span className="text-xs text-slate-400">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  <button 
                    onClick={handleRefresh}
                    className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] mt-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                ) : priceHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={priceHistory}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#94a3b8" 
                        tickFormatter={formatXAxis}
                        minTickGap={30}
                      />
                      <YAxis 
                        stroke="#94a3b8"
                        tickFormatter={(value) => `$${value.toFixed(value < 1 ? 4 : 2)}`}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="buyPrice" 
                        stroke="#3b82f6" 
                        name={`${buyExchange} (Buy)`}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sellPrice" 
                        stroke="#10b981" 
                        name={`${sellExchange} (Sell)`}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-slate-400">No price data available</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="bg-slate-800 border-slate-700 text-white mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base">Arbitrage Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-md p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                      <img 
                        src={`/exchange-logos/${normalizedBuyExchange}.svg`}
                        alt={buyExchange}
                        className="w-4 h-4 mr-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p>Buy at {buyExchange}</p>
                    </div>
                    <p className="text-sm font-medium text-white">{formatPrice(currentBuyPrice)}</p>
                  </div>
                  <div className="bg-slate-900 rounded-md p-3">
                    <div className="flex items-center text-xs text-slate-400 mb-1">
                      <img 
                        src={`/exchange-logos/${normalizedSellExchange}.svg`}
                        alt={sellExchange}
                        className="w-4 h-4 mr-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p>Sell at {sellExchange}</p>
                    </div>
                    <p className="text-sm font-medium text-white">{formatPrice(currentSellPrice)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-slate-400 mb-1">Current Spread</p>
                  <p className={`text-xl font-bold ${currentSpread >= 3 ? 'text-green-500' : currentSpread >= 1 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {currentSpread.toFixed(2)}%
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-400 mb-1">Estimated Profit (on $1000)</p>
                  <p className={`text-base font-medium ${(currentSpread / 100 * 1000) > 15 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {formatPrice((currentSpread / 100) * 1000)}
                  </p>
                </div>
                
                <div className="border-t border-slate-700 pt-4">
                  <div className="flex justify-between mb-2">
                    <p className="text-xs text-slate-400">Risk Level</p>
                    <p className={`text-xs font-medium ${
                      currentSpread >= 3 ? 'text-green-500' : 
                      currentSpread >= 1.5 ? 'text-yellow-500' : 
                      'text-red-500'
                    }`}>
                      {currentSpread >= 3 ? 'Low Risk' : 
                       currentSpread >= 1.5 ? 'Medium Risk' : 
                       'High Risk'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-xs text-slate-400">Exchange Volume</p>
                    <p className="text-xs text-white">High</p>
                  </div>
                </div>
                
                <a 
                  href={`https://www.binance.com/en/trade/${baseCurrency}_${quoteCurrency}?theme=dark&type=spot`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm text-white transition-colors text-center"
                >
                  Trade on {buyExchange}
                </a>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm md:text-base">Spread History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                  </div>
                ) : priceHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={priceHistory}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#94a3b8" 
                        tickFormatter={formatXAxis}
                        minTickGap={30}
                      />
                      <YAxis 
                        stroke="#94a3b8"
                        tickFormatter={(value) => `${value.toFixed(2)}%`}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${parseFloat(value).toFixed(2)}%`, 'Spread']}
                        labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="spread" 
                        stroke="#a855f7" 
                        name="Spread %"
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-slate-400">No spread data available</span>
                  </div>
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
