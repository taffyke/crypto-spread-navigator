
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SmallStatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  className?: string;
}

const SmallStatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className,
}: SmallStatCardProps) => {
  return (
    <div className={cn(
      "bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-center",
      className
    )}>
      {Icon && (
        <div className="mr-3 p-2 bg-slate-700 rounded-lg">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
      )}
      
      <div className="flex-1">
        <h3 className="text-sm text-slate-400">{title}</h3>
        <p className="text-lg font-bold text-white">{value}</p>
        
        {trend && trendValue && (
          <p className={cn(
            "text-xs mt-1",
            trend === 'up' ? "text-green-500" : 
            trend === 'down' ? "text-red-500" : "text-slate-400"
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '−'} {trendValue}
          </p>
        )}
      </div>
    </div>
  );
};

export default SmallStatCard;
