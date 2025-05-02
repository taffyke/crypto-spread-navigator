
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Settings, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useMarketData } from '@/hooks/use-market-data';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exchanges, setExchanges] = useState<string[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const navigate = useNavigate();

  // Default symbols to track
  const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];

  // Get market data if an exchange is selected
  const { 
    data: marketData, 
    isLoading: isLoadingMarketData, 
    refetch: refetchMarketData,
    isAuthenticated
  } = useMarketData(selectedExchange, symbols, {
    enabled: Boolean(selectedExchange),
    refreshInterval: 30000
  });

  // Check if user is already logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Get session on first load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch the user's exchanges once authenticated
  useEffect(() => {
    if (!user) return;

    const fetchExchanges = async () => {
      try {
        const { data, error } = await supabase
          .from('exchange_api_keys')
          .select('exchange_name')
          .eq('is_active', true);

        if (error) throw error;

        const uniqueExchanges = Array.from(new Set(data.map(item => item.exchange_name)));
        setExchanges(uniqueExchanges);
        
        // If we have exchanges and none is selected, select the first one
        if (uniqueExchanges.length > 0 && !selectedExchange) {
          setSelectedExchange(uniqueExchanges[0]);
        }
      } catch (error) {
        console.error('Error fetching exchanges:', error);
      }
    };

    fetchExchanges();
  }, [user, selectedExchange]);

  const handleRefresh = () => {
    refetchMarketData();
    toast({
      title: "Refreshing Market Data",
      description: "Fetching the latest cryptocurrency prices."
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl p-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Market Explorer</h1>
        <div className="flex gap-2">
          {user ? (
            <Button onClick={() => navigate('/settings')} variant="outline" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          ) : (
            <Button onClick={() => navigate('/auth')} variant="default" className="flex items-center gap-1.5">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>

      {!user ? (
        <Card className="bg-slate-800 border-slate-700 text-white mb-8">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="font-medium text-lg mb-2">Authentication Required</h3>
            <p className="text-slate-400 mb-6 max-w-md">
              Please log in to access your exchange data and market information. 
              Add your API keys to start tracking cryptocurrency prices in real-time.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Login or Create Account
            </Button>
          </CardContent>
        </Card>
      ) : exchanges.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700 text-white mb-8">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="font-medium text-lg mb-2">No API Keys Found</h3>
            <p className="text-slate-400 mb-6 max-w-md">
              You need to add exchange API keys to fetch market data.
              Go to Settings to add your first API key.
            </p>
            <Button onClick={() => navigate('/settings')}>
              Add API Keys
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-3">
              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Market Overview</CardTitle>
                      <CardDescription className="text-slate-400">
                        Latest prices from {selectedExchange}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefresh}
                      className="text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingMarketData ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 font-medium text-slate-400">Symbol</th>
                          <th className="text-right py-3 px-4 font-medium text-slate-400">Price</th>
                          <th className="text-right py-3 px-4 font-medium text-slate-400">24h Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingMarketData ? (
                          symbols.map((symbol, index) => (
                            <tr key={`loading-${index}`} className="border-b border-slate-700/50">
                              <td colSpan={3} className="py-3 px-4">
                                <div className="h-6 bg-slate-700/50 rounded animate-pulse"></div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          symbols.map(symbol => {
                            const data = marketData[symbol];
                            return (
                              <tr key={symbol} className="border-b border-slate-700/50">
                                <td className="py-3 px-4">
                                  <div className="font-medium">{symbol}</div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  ${data?.price.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }) || '-.--'}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {data?.change_percent_24h !== undefined ? (
                                    <span className={data.change_percent_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                                      {data.change_percent_24h >= 0 ? '+' : ''}
                                      {data.change_percent_24h.toFixed(2)}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">--</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                {exchanges.length > 1 && (
                  <CardFooter className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex justify-between">
                    <div className="text-sm text-slate-400">
                      Exchange:
                    </div>
                    <div className="flex gap-2">
                      {exchanges.map(exchange => (
                        <Button
                          key={exchange}
                          variant={selectedExchange === exchange ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedExchange(exchange)}
                          className="text-xs"
                        >
                          {exchange.charAt(0).toUpperCase() + exchange.slice(1).replace(/_/g, ' ')}
                        </Button>
                      ))}
                    </div>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
