
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { fetchExchangeVolumeData } from '@/lib/api/cryptoDataApi';
import { toast } from '@/hooks/use-toast';

const ExchangeVolume = () => {
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchVolumeData();
    
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchVolumeData(true);
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchVolumeData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setRefreshing(true);
    
    try {
      const data = await fetchExchangeVolumeData();
      
      // Format data for the chart
      const formattedData = data.map(item => ({
        name: item.name,
        volume: item.volume_24h / 1000000 // Convert to millions for better display
      }));
      
      setVolumeData(formattedData);
    } catch (error) {
      console.error("Failed to fetch exchange volume data:", error);
      if (!silent) {
        toast({
          title: "Data Loading Error",
          description: "Unable to load exchange volume data.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    fetchVolumeData(true);
    toast({
      title: "Refreshing Volume Data",
      description: "Fetching latest exchange trading volumes."
    });
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-md p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-400">
            Volume: ${(payload[0].value * 1000000).toLocaleString()} (${payload[0].value.toFixed(2)}M)
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Exchange Volume (24h)</CardTitle>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
              >
                <XAxis 
                  type="number" 
                  stroke="#a0aec0" 
                  tick={{ fill: '#a0aec0', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}M`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#a0aec0" 
                  tick={{ fill: '#a0aec0', fontSize: 12 }}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="volume" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No volume data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExchangeVolume;
