import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Percent, ArrowRight, BarChart, RefreshCw } from 'lucide-react';
import { exchangeMetadata } from '@/data/exchangeMetadata';

interface FeeCalculatorProps {
  selectedExchanges: string[];
}

interface CalculationResult {
  trade: {
    baseCurrency: string;
    quoteCurrency: string;
    type: 'spot' | 'margin' | 'futures';
    tradeAmount: number;
    tradeSize: number;
    side: 'buy' | 'sell';
  };
  exchangeResults: {
    exchange: string;
    makerFee: number;
    takerFee: number;
    withdrawalFee: number;
    depositFee: number;
    totalFees: number;
    netProfit: number;
    profitPercentage: number;
    breakEvenSpreadPercentage: number;
  }[];
}

const FeeCalculator: React.FC<FeeCalculatorProps> = ({ selectedExchanges }) => {
  // Input state
  const [baseCurrency, setBaseCurrency] = useState('BTC');
  const [quoteCurrency, setQuoteCurrency] = useState('USDT');
  const [tradeType, setTradeType] = useState<'spot' | 'margin' | 'futures'>('spot');
  const [tradeAmount, setTradeAmount] = useState(1000);
  const [tradeSize, setTradeSize] = useState(0.015); // BTC amount for $1000 at ~$66,000/BTC
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [spreadPercentage, setSpreadPercentage] = useState(1.0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Update trade size when base currency or trade amount changes
  useEffect(() => {
    // This is a simplified calculation for demo
    // In a real implementation, this would use current market prices
    const prices: Record<string, number> = {
      'BTC': 66000,
      'ETH': 3200,
      'SOL': 150,
      'XRP': 0.52,
      'ADA': 0.45,
      'DOGE': 0.15,
      'DOT': 7,
      'LINK': 15
    };

    const price = prices[baseCurrency] || 100;
    setTradeSize(Number((tradeAmount / price).toFixed(8)));
  }, [baseCurrency, tradeAmount]);

  // Calculate fees and profits
  const calculateFees = () => {
    setIsCalculating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Prepare results for each selected exchange
      const exchangeResults = selectedExchanges.map(exchangeName => {
        // Get exchange metadata or use default values
        const metadata = exchangeMetadata[exchangeName] || {
          makerFee: 0.1,
          takerFee: 0.15,
          feeScore: 75
        };
        
        // Calculate fees based on trade parameters
        const makerFeePercentage = (100 - metadata.feeScore) / 1000; // Convert feeScore to percentage (0.1% to 0.5%)
        const takerFeePercentage = makerFeePercentage * 1.5; // Taker fee is typically higher
        
        // For demo purposes, we'll simplify withdrawal fees
        const withdrawalFeeUSD = baseCurrency === 'BTC' ? 15 : 10;
        const depositFeeUSD = 0; // Most exchanges don't charge deposit fees
        
        // Calculate total fees
        const tradeFee = tradeAmount * (side === 'buy' ? takerFeePercentage : makerFeePercentage) / 100;
        const totalFees = tradeFee + withdrawalFeeUSD + depositFeeUSD;
        
        // Calculate potential profit based on spread
        const potentialProfit = tradeAmount * (spreadPercentage / 100);
        const netProfit = potentialProfit - totalFees;
        const profitPercentage = (netProfit / tradeAmount) * 100;
        
        // Calculate break-even spread
        const breakEvenSpreadPercentage = (totalFees / tradeAmount) * 100;
        
        return {
          exchange: exchangeName,
          makerFee: makerFeePercentage,
          takerFee: takerFeePercentage,
          withdrawalFee: withdrawalFeeUSD,
          depositFee: depositFeeUSD,
          totalFees,
          netProfit,
          profitPercentage,
          breakEvenSpreadPercentage
        };
      });
      
      // Sort by net profit (descending)
      exchangeResults.sort((a, b) => b.netProfit - a.netProfit);
      
      // Set the result
      setResult({
        trade: {
          baseCurrency,
          quoteCurrency,
          type: tradeType,
          tradeAmount,
          tradeSize,
          side
        },
        exchangeResults
      });
      
      setIsCalculating(false);
    }, 800);
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <DollarSign className="h-4 w-4 mr-2" />
          Interactive Fee Calculator
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Calculate and compare fees across exchanges for specific trading scenarios
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">Trading Pair</Label>
              <div className="flex items-center space-x-2">
                <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                  <SelectTrigger className="h-9 bg-slate-900 border-slate-700 flex-1">
                    <SelectValue placeholder="Base Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="SOL">SOL</SelectItem>
                    <SelectItem value="XRP">XRP</SelectItem>
                    <SelectItem value="ADA">ADA</SelectItem>
                    <SelectItem value="DOGE">DOGE</SelectItem>
                    <SelectItem value="DOT">DOT</SelectItem>
                    <SelectItem value="LINK">LINK</SelectItem>
                  </SelectContent>
                </Select>
                
                <span className="text-slate-500">/</span>
                
                <Select value={quoteCurrency} onValueChange={setQuoteCurrency}>
                  <SelectTrigger className="h-9 bg-slate-900 border-slate-700 flex-1">
                    <SelectValue placeholder="Quote Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">Trade Type</Label>
              <RadioGroup value={tradeType} onValueChange={(value: 'spot' | 'margin' | 'futures') => setTradeType(value)} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="spot" id="spot" />
                  <Label htmlFor="spot" className="text-xs cursor-pointer">Spot</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="margin" id="margin" />
                  <Label htmlFor="margin" className="text-xs cursor-pointer">Margin</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="futures" id="futures" />
                  <Label htmlFor="futures" className="text-xs cursor-pointer">Futures</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">Side</Label>
              <RadioGroup value={side} onValueChange={(value: 'buy' | 'sell') => setSide(value)} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="buy" id="buy" />
                  <Label htmlFor="buy" className="text-xs cursor-pointer">Buy (Taker)</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="sell" id="sell" />
                  <Label htmlFor="sell" className="text-xs cursor-pointer">Sell (Maker)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">Trade Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <Input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Number(e.target.value))}
                  className="h-9 pl-8 bg-slate-900 border-slate-700"
                  min={10}
                  max={1000000}
                  step={100}
                />
              </div>
              <span className="text-xs text-slate-500">{tradeSize} {baseCurrency}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-slate-400">Spread Percentage</Label>
                <span className="text-xs text-slate-500">{spreadPercentage.toFixed(2)}%</span>
              </div>
              <Slider
                value={[spreadPercentage]}
                onValueChange={(values) => setSpreadPercentage(values[0])}
                min={0.1}
                max={5}
                step={0.1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0.1%</span>
                <span>5%</span>
              </div>
            </div>
            
            <Button 
              onClick={calculateFees} 
              disabled={isCalculating} 
              className="w-full mt-2"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <BarChart className="h-4 w-4 mr-2" />
                  Calculate Fees
                </>
              )}
            </Button>
          </div>
        </div>
        
        {result && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <h4 className="text-sm font-medium mb-2">Results</h4>
            
            <div className="space-y-3">
              {result.exchangeResults.map((item, index) => (
                <div key={index} className="bg-slate-750 rounded-lg p-3 border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{item.exchange}</span>
                    <Badge className={item.netProfit > 0 ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"}>
                      Net: ${item.netProfit.toFixed(2)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-slate-400">Maker Fee:</span>
                      <span className="float-right">{item.makerFee.toFixed(3)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Taker Fee:</span>
                      <span className="float-right">{item.takerFee.toFixed(3)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Withdrawal:</span>
                      <span className="float-right">${item.withdrawalFee.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Fees:</span>
                      <span className="float-right">${item.totalFees.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400">Break-even Spread:</span>
                      <span className="text-xs">{item.breakEvenSpreadPercentage.toFixed(3)}%</span>
                    </div>
                    <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${spreadPercentage > item.breakEvenSpreadPercentage ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, (spreadPercentage / 5) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="h-2 relative">
                      <div 
                        className="absolute h-4 w-1 bg-white rounded-full top-0 transform -translate-x-1/2"
                        style={{ left: `${Math.min(100, (item.breakEvenSpreadPercentage / 5) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400">Profit Retention:</span>
                      <span className="text-xs">{item.profitPercentage > 0 ? Math.round(item.profitPercentage / spreadPercentage * 100) : 0}%</span>
                    </div>
                    <Progress 
                      value={item.profitPercentage > 0 ? (item.profitPercentage / spreadPercentage) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-slate-700 pt-4 text-xs text-slate-400">
        <p>The calculator shows the impact of trading fees, withdrawal fees, and deposit fees on potential arbitrage profits.</p>
      </CardFooter>
    </Card>
  );
};

export default FeeCalculator; 