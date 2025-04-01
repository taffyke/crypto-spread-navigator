
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  isPositive?: boolean;
  icon?: LucideIcon;
  className?: string;
}

const StatCard = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  className,
}: StatCardProps) => {
  return (
    <div className={cn(
      "bg-slate-800 border border-slate-700 rounded-lg p-4",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-slate-400 text-sm">{title}</p>
        {Icon && (
          <Icon className="h-5 w-5 text-slate-400" />
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={cn(
              "text-xs flex items-center space-x-1",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{change}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
