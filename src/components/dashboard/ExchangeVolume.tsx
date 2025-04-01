
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Bar, BarChart, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { generateExchangeVolumeData } from '@/data/mockData';

const ExchangeVolume = () => {
  const [volumeData, setVolumeData] = React.useState(generateExchangeVolumeData());
  
  React.useEffect(() => {
    // In a real app, this would fetch data from an API
    const interval = setInterval(() => {
      setVolumeData(generateExchangeVolumeData());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const colors = [
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#14b8a6', // teal-500
    '#6366f1', // indigo-500
    '#ec4899', // pink-500
  ];
  
  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) {
      return `$${(volume / 1_000_000_000).toFixed(1)}B`;
    }
    return `$${(volume / 1_000_000).toFixed(1)}M`;
  };
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Exchange Volume (24h)</h2>
        <button className="bg-blue-600 hover:bg-blue-500 px-3 py-1 text-xs rounded text-white transition-colors">
          Refresh
        </button>
      </div>
      
      <div className="h-[300px] mt-2">
        <ChartContainer config={{ volume: {} }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} layout="vertical" margin={{ left: 70, right: 20, top: 10, bottom: 10 }}>
              <XAxis
                type="number"
                tickFormatter={formatVolume}
                tick={{ fill: '#94a3b8' }}
                axisLine={{ stroke: '#475569' }}
                tickLine={{ stroke: '#475569' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#e2e8f0' }}
                axisLine={{ stroke: '#475569' }}
                tickLine={{ stroke: '#475569' }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: number) => formatVolume(value)}
                  />
                }
              />
              <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
                {volumeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default ExchangeVolume;
