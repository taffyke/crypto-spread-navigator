import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, Info, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Slider } from '@/components/ui/slider';
import { getHeatmapColor } from '@/lib/dataUtils';
import { cn } from '@/lib/utils';

// Types for the correlation data
interface CorrelationItem {
  id: string;
  name: string;
  symbol?: string;
  correlations: {
    [key: string]: number;
  };
}

interface CorrelationMatrixProps {
  data: CorrelationItem[];
  title?: string;
  description?: string;
  type?: 'assets' | 'exchanges';
}

export const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
  data,
  title = 'Correlation Matrix',
  description = 'Visualize price movement correlations between different assets',
  type = 'assets',
}) => {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'table'>('heatmap');
  const [filteredData, setFilteredData] = useState<CorrelationItem[]>(data);
  const [timeframe, setTimeframe] = useState<string>('7d');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [threshold, setThreshold] = useState<number>(0);
  const [highlightStrong, setHighlightStrong] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);

  // Update filtered data when props or filters change
  useEffect(() => {
    let result = [...data];

    // Apply threshold filter
    if (threshold > 0) {
      result = result.map(item => {
        const filteredCorrelations = { ...item.correlations };
        
        Object.keys(filteredCorrelations).forEach(key => {
          const value = Math.abs(filteredCorrelations[key]);
          if (value < threshold) {
            delete filteredCorrelations[key];
          }
        });
        
        return {
          ...item,
          correlations: filteredCorrelations
        };
      });
    }

    // Sort the data
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'strength') {
        // Sort by average correlation strength
        const avgA = Object.values(a.correlations).reduce((sum, val) => sum + Math.abs(val), 0) / 
                    (Object.values(a.correlations).length || 1);
        const avgB = Object.values(b.correlations).reduce((sum, val) => sum + Math.abs(val), 0) / 
                    (Object.values(b.correlations).length || 1);
        return sortDirection === 'asc' ? avgA - avgB : avgB - avgA;
      }
      return 0;
    });

    setFilteredData(result);
  }, [data, threshold, sortBy, sortDirection]);

  // Get all unique entities (cryptos or exchanges)
  const entities = filteredData.map(item => ({
    id: item.id,
    name: item.name,
    symbol: item.symbol
  }));

  // Sort entities for consistent display
  const sortedEntities = [...entities].sort((a, b) => a.name.localeCompare(b.name));

  // Toggle sort direction and potentially sort field
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Format correlation value for display
  const formatCorrelation = (value: number): string => {
    if (isNaN(value)) return 'N/A';
    return value.toFixed(2);
  };

  // Get CSS class for a correlation cell based on its value
  const getCorrelationClass = (value: number): string => {
    if (isNaN(value)) return 'bg-slate-800';
    if (value === 1) return 'bg-slate-700'; // Self-correlation

    // Get the appropriate color based on the correlation strength
    const color = getHeatmapColor(value);
    return `correlation-cell`;
  };

  // Get a description of what the correlation means
  const getCorrelationDescription = (value: number): string => {
    if (isNaN(value)) return 'No correlation data available';
    if (value === 1) return 'Perfect correlation (self)';
    if (value > 0.8) return 'Very strong positive correlation';
    if (value > 0.6) return 'Strong positive correlation';
    if (value > 0.4) return 'Moderate positive correlation';
    if (value > 0.2) return 'Weak positive correlation';
    if (value >= 0) return 'Little to no correlation';
    if (value > -0.2) return 'Little to no correlation';
    if (value > -0.4) return 'Weak negative correlation';
    if (value > -0.6) return 'Moderate negative correlation';
    if (value > -0.8) return 'Strong negative correlation';
    return 'Very strong negative correlation';
  };

  return (
    <Card className="bg-slate-800 border-slate-700 w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              {title}
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              {description}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="h-7 w-24 text-xs bg-slate-900 border-slate-700">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'heatmap' | 'table')} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-slate-900">
              <TabsTrigger value="heatmap" className="text-xs">Heatmap</TabsTrigger>
              <TabsTrigger value="table" className="text-xs">Table</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span>Threshold:</span>
                <span className="w-8 text-center">{threshold.toFixed(1)}</span>
              </div>
              <Slider
                value={[threshold]}
                onValueChange={(values) => setThreshold(values[0])}
                min={0}
                max={1}
                step={0.1}
                className="w-24"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle
                      pressed={highlightStrong}
                      onPressedChange={setHighlightStrong}
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 bg-slate-900 border-slate-700 data-[state=on]:bg-slate-700"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Highlight strong correlations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <TabsContent value="heatmap" className="mt-0">
            <div className="rounded-md border border-slate-700 bg-slate-850 overflow-auto max-h-[400px]">
              <table className="w-full correlations-heatmap">
                <thead>
                  <tr>
                    <th className="sticky left-0 top-0 bg-slate-900 z-10 min-w-[120px] p-2 text-xs font-medium text-slate-400">
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSort('name')}>
                        <span>{type === 'assets' ? 'Asset' : 'Exchange'}</span>
                        {sortBy === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    {sortedEntities.map(entity => (
                      <th 
                        key={entity.id} 
                        className={cn(
                          "p-2 text-xs font-medium text-slate-400 whitespace-nowrap",
                          selectedItem === entity.id && "bg-slate-750"
                        )}
                        onClick={() => setSelectedItem(selectedItem === entity.id ? null : entity.id)}
                      >
                        {entity.symbol || entity.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(row => (
                    <tr key={row.id} className={selectedItem === row.id ? "bg-slate-750" : ""}>
                      <td 
                        className="sticky left-0 bg-slate-900 p-2 text-xs whitespace-nowrap"
                        onClick={() => setSelectedItem(selectedItem === row.id ? null : row.id)}
                      >
                        {row.symbol ? `${row.symbol} (${row.name})` : row.name}
                      </td>
                      {sortedEntities.map(entity => {
                        const correlationValue = row.correlations[entity.id] || NaN;
                        const isHighlighted = highlightStrong && Math.abs(correlationValue) > 0.7;
                        
                        return (
                          <td 
                            key={`${row.id}-${entity.id}`} 
                            className={cn(
                              "p-0 relative cursor-pointer transition-opacity duration-200",
                              selectedItem && selectedItem !== row.id && selectedItem !== entity.id ? "opacity-40" : "opacity-100",
                              (selectedItem === row.id || selectedItem === entity.id) && "opacity-100"
                            )}
                            style={{ 
                              backgroundColor: isNaN(correlationValue) ? '#1e293b' : getHeatmapColor(correlationValue),
                              minWidth: '36px',
                              height: '36px'
                            }}
                          >
                            {showTooltip ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className={cn(
                                        "text-[10px] font-medium",
                                        correlationValue > 0 ? "text-slate-900" : "text-slate-100"
                                      )}>
                                        {isNaN(correlationValue) ? "-" : correlationValue.toFixed(2)}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    <div className="space-y-1">
                                      <div className="font-medium">{row.name} ↔ {entity.name}</div>
                                      <div>Correlation: {formatCorrelation(correlationValue)}</div>
                                      <div>{getCorrelationDescription(correlationValue)}</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className={cn(
                                  "text-[10px] font-medium",
                                  correlationValue > 0 ? "text-slate-900" : "text-slate-100"
                                )}>
                                  {isNaN(correlationValue) ? "-" : correlationValue.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {isHighlighted && (
                              <div className="absolute inset-0 border-2 border-white/30 pointer-events-none"></div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 h-4">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatmapColor(-1) }}></div>
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatmapColor(-0.7) }}></div>
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatmapColor(-0.3) }}></div>
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatmapColor(0) }}></div>
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatmapColor(0.3) }}></div>
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatmapColor(0.7) }}></div>
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatmapColor(1) }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 w-36">
                  <span>-1.0</span>
                  <span>0</span>
                  <span>+1.0</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-400">Click on row/column headers to focus</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-0">
            <div className="rounded-md border border-slate-700 bg-slate-850 overflow-auto max-h-[400px]">
              <table className="w-full min-w-full">
                <thead>
                  <tr>
                    <th className="sticky left-0 top-0 bg-slate-900 z-10 p-2 text-left text-xs font-medium text-slate-400">
                      <div className="flex items-center cursor-pointer" onClick={() => toggleSort('name')}>
                        <span>{type === 'assets' ? 'Asset Pair' : 'Exchange Pair'}</span>
                        {sortBy === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="p-2 text-left text-xs font-medium text-slate-400">
                      <div className="flex items-center cursor-pointer" onClick={() => toggleSort('strength')}>
                        <span>Correlation</span>
                        {sortBy === 'strength' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="p-2 text-left text-xs font-medium text-slate-400">Relationship</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.flatMap(row => (
                    sortedEntities
                      .filter(entity => entity.id !== row.id && !isNaN(row.correlations[entity.id]))
                      .map(entity => {
                        const correlationValue = row.correlations[entity.id];
                        
                        return (
                          <tr key={`${row.id}-${entity.id}`} className="border-t border-slate-700">
                            <td className="p-2 text-xs whitespace-nowrap">
                              {row.symbol || row.name} ↔ {entity.symbol || entity.name}
                            </td>
                            <td className="p-2">
                              <div className="flex items-center">
                                <div 
                                  className="w-16 h-4 rounded mr-2"
                                  style={{ 
                                    backgroundColor: getHeatmapColor(correlationValue)
                                  }}
                                >
                                </div>
                                <span className="text-xs">{formatCorrelation(correlationValue)}</span>
                              </div>
                            </td>
                            <td className="p-2 text-xs">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "font-normal",
                                  Math.abs(correlationValue) > 0.6 ? 
                                    correlationValue > 0 ? "bg-green-900/20 text-green-400 border-green-800" : 
                                                          "bg-red-900/20 text-red-400 border-red-800" : 
                                    "bg-slate-900/50 border-slate-700"
                                )}
                              >
                                {getCorrelationDescription(correlationValue)}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-xs text-slate-400">
          <p>
            <span className="font-semibold">Understanding Correlations:</span> Values range from -1 (perfect negative correlation) to +1 (perfect positive correlation).
          </p>
          <p className="mt-1">
            Assets with strong positive correlations tend to move in the same direction, while negative correlations indicate opposite movements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrelationMatrix; 