
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';

export interface ProfitDataPoint {
  date: string;
  profit: number;
  cumulativeProfit: number;
}

interface ProfitChartProps {
  data: ProfitDataPoint[];
  title?: string;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-md p-3 shadow-lg">
        <p className="text-slate-300 text-xs mb-1">{label}</p>
        <p className="text-green-500 text-sm font-medium">
          Daily: ${payload[0].value?.toFixed(2)}
        </p>
        <p className="text-blue-500 text-sm font-medium">
          Cumulative: ${payload[1].value?.toFixed(2)}
        </p>
      </div>
    );
  }

  return null;
};

const ProfitChart = ({ data, title, className }: ProfitChartProps) => {
  return (
    <div className={cn("bg-slate-800 border border-slate-700 rounded-lg p-4", className)}>
      {title && <h3 className="text-white font-medium mb-4">{title}</h3>}
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
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
      </div>
    </div>
  );
};

export default ProfitChart;
