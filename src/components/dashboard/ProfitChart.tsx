
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';
import { useTickerWebSocket } from '@/hooks/use-websocket';
import { toast } from '@/hooks/use-toast';
import { Ticker } from '@/lib/exchanges/exchangeApi';
import { calculateProfitData } from '@/lib/api/cryptoDataApi';

export interface ProfitDataPoint {
  date: string;
  profit: number;
  cumulativeProfit: number;
}

interface ProfitChartProps {
  data?: ProfitDataPoint[];
  title?: string;
  className?: string;
  symbol?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-md p-3 shadow-lg">
        <p className="text-slate-300 text-xs mb-1">{label}</p>
        <p className="text-green-500 text-sm font-medium">
          Daily: ${payload[0]?.value?.toFixed(2) || '0.00'}
        </p>
        <p className="text-blue-500 text-sm font-medium">
          Cumulative: ${payload[1]?.value?.toFixed(2) || '0.00'}
        </p>
      </div>
    );
  }

  return null;
};

const ProfitChart = ({ data: initialData, title, className, symbol = 'BTC/USDT' }: ProfitChartProps) => {
  const [chartData, setChartData] = useState<ProfitDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get ticker data for profit calculation
  const { data: tickerData, isConnected, error } = useTickerWebSocket('binance', symbol, true);
  
  // Set up initial chart data
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setChartData(initialData);
      setIsLoading(false);
      return;
    }
    
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        
        // Use real ticker data to generate profit data that reflects actual market movements
        // Safely pass tickerData with fallbacks
        const profitData = calculateProfitData(tickerData || {}, 30);
        setChartData(profitData);
      } catch (err) {
        console.error("Failed to fetch historical data:", err);
        toast({
          title: "Data Loading Error",
          description: "Unable to load historical price data. Using available data instead.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [initialData, symbol, tickerData]);
  
  // Update chart data when ticker data changes
  useEffect(() => {
    // Safely cast tickerData to Ticker if it exists and has the right shape
    const ticker = tickerData as Ticker | null;
    
    if (ticker && typeof ticker === 'object' && 'changePercent' in ticker && chartData.length > 0) {
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Cast changePercent to number with fallback
      const changePercent = typeof ticker.changePercent === 'number' 
        ? ticker.changePercent 
        : parseFloat(String(ticker.changePercent) || '0');
        
      if (!isNaN(changePercent)) {
        const newProfit = changePercent * 10;
        
        setChartData(prevData => {
          const newData = [...prevData];
          const lastIndex = newData.findIndex(d => d.date === today);
          
          if (lastIndex >= 0) {
            newData[lastIndex] = {
              ...newData[lastIndex],
              profit: newProfit,
              cumulativeProfit: lastIndex > 0 ? newData[lastIndex - 1].cumulativeProfit + newProfit : newProfit
            };
          } else if (newData.length > 0) {
            const lastCumulative = newData[newData.length - 1].cumulativeProfit || 0;
            newData.push({
              date: today,
              profit: newProfit,
              cumulativeProfit: lastCumulative + newProfit
            });
            
            if (newData.length > 30) {
              newData.shift();
            }
          }
          
          return newData;
        });
      }
    }
  }, [tickerData, chartData]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to exchange for real-time updates.",
        variant: "destructive"
      });
    }
  }, [error]);

  return (
    <div className={cn("bg-slate-800 border border-slate-700 rounded-lg p-4", className)}>
      <div className="flex justify-between items-center mb-4">
        {title && <h3 className="text-white font-medium">{title}</h3>}
        
        {!isConnected && !isLoading && (
          <div className="text-xs text-amber-500 bg-amber-950/30 rounded px-2 py-1">
            Offline - Using latest data
          </div>
        )}
        
        {isConnected && (
          <div className="text-xs text-green-500 bg-green-950/30 rounded px-2 py-1 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Live
          </div>
        )}
      </div>
      
      <div className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis 
                dataKey="date" 
                stroke="#a0aec0" 
                tick={{ fill: '#a0aec0', fontSize: 12 }}
              />
              <YAxis 
                stroke="#a0aec0"
                tick={{ fill: '#a0aec0', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10b981" 
                activeDot={{ r: 8 }} 
                name="Daily Profit" 
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeProfit" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Cumulative Profit" 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfitChart;
