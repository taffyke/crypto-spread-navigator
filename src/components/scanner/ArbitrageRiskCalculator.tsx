import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";

interface ArbitrageRiskCalculatorProps {
  className?: string;
  arbitrageType?: 'direct' | 'triangular' | 'futures';
  sameExchangeChecked?: boolean;
}

const ArbitrageRiskCalculator = ({ className, arbitrageType = 'direct', sameExchangeChecked = false }: ArbitrageRiskCalculatorProps) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(1);
  const [spreadPercentage, setSpreadPercentage] = useState<number>(2.5);
  const [slippagePercentage, setSlippagePercentage] = useState<number>(0.5);
  const [exchangeFee1, setExchangeFee1] = useState<number>(0.1);
  const [exchangeFee2, setExchangeFee2] = useState<number>(0.1);
  const [networkFee, setNetworkFee] = useState<number>(5);
  const [potentialProfit, setPotentialProfit] = useState<number>(0);
  const [riskRatio, setRiskRatio] = useState<number>(0);
  const [profitability, setProfitability] = useState<string>('Calculating...');

  // Adjust factors based on arbitrage type
  const getArbitrageTypeFactor = () => {
    switch(arbitrageType) {
      case 'triangular': return 0.85; // Triangular has slightly less profit due to more trades
      case 'futures': return 1.2; // Futures can have higher profit but higher risk
      default: return 1.0; // Direct/standard arbitrage
    }
  };

  // Get description based on arbitrage type
  const getArbitrageTypeDescription = () => {
    switch(arbitrageType) {
      case 'triangular': 
        return "Triangular arbitrage involves more trades and potentially higher fees, but can sometimes find opportunities not visible in direct arbitrage.";
      case 'futures': 
        return "Futures arbitrage can offer higher leverage and profit potential, but involves greater market timing risk and funding rates.";
      default: 
        return "Direct arbitrage is straightforward with fewer steps, typically focusing on the same asset across different exchanges.";
    }
  };

  // New function to determine if network fees apply
  const getNetworkFeeFactor = () => {
    // For triangular on same exchange, no network fee
    if (arbitrageType === 'triangular' && sameExchangeChecked) {
      return 0; // No network fee when trading on the same exchange
    }
    // For futures, reduce network fee
    else if (arbitrageType === 'futures') {
      return 0.5; // Futures typically have lower network fees
    }
    // For triangular across exchanges, increase network fee
    else if (arbitrageType === 'triangular' && !sameExchangeChecked) {
      return 1.5; // More on-chain transactions
    }
    // Standard case
    return 1.0;
  };

  // Calculate potential profit and risk metrics
  useEffect(() => {
    // Calculate gross profit before fees, incorporating arbitrage type
    const grossProfit = investmentAmount * (spreadPercentage / 100) * getArbitrageTypeFactor();
    
    // Calculate exchange fees
    const exchangeFee1Amount = investmentAmount * (exchangeFee1 / 100);
    const exchangeFee2Amount = (investmentAmount + grossProfit) * (exchangeFee2 / 100);
    
    // Calculate slippage impact
    const slippageAmount = investmentAmount * (slippagePercentage / 100);
    
    // Apply different network fees based on arbitrage type and exchange settings
    const networkFeeAmount = networkFee * getNetworkFeeFactor();
    
    // Total costs
    const totalCosts = exchangeFee1Amount + exchangeFee2Amount + networkFeeAmount + slippageAmount;
    
    // Net profit
    const calculatedProfit = grossProfit - totalCosts;
    setPotentialProfit(calculatedProfit);
    
    // Risk ratio (profit-to-cost ratio)
    const calculatedRiskRatio = totalCosts > 0 ? calculatedProfit / totalCosts : 0;
    setRiskRatio(calculatedRiskRatio);
    
    // Determine profitability status
    if (calculatedProfit <= 0) {
      setProfitability('Not Profitable');
    } else if (calculatedRiskRatio < 1) {
      setProfitability('High Risk');
    } else if (calculatedRiskRatio < 2) {
      setProfitability('Medium Risk');
    } else {
      setProfitability('Low Risk');
    }
  }, [investmentAmount, spreadPercentage, slippagePercentage, exchangeFee1, exchangeFee2, networkFee, arbitrageType, sameExchangeChecked]);

  // Format currency amounts
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleCalculate = () => {
    toast({
      title: `${arbitrageType.charAt(0).toUpperCase() + arbitrageType.slice(1)} Arbitrage Calculation`,
      description: `Potential Profit: ${formatCurrency(potentialProfit)} | Risk Ratio: ${riskRatio.toFixed(2)}`,
    });
  };

  // Get badge color for arbitrage type
  const getArbitrageTypeBadgeColor = () => {
    switch(arbitrageType) {
      case 'triangular': return "bg-purple-600 hover:bg-purple-500";
      case 'futures': return "bg-amber-600 hover:bg-amber-500";
      default: return "bg-blue-600 hover:bg-blue-500";
    }
  };

  return (
    <Card className={`bg-slate-800 border-slate-700 text-white ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-sm md:text-base">Arbitrage Risk Calculator</CardTitle>
          </div>
          <Badge className={getArbitrageTypeBadgeColor()}>
            {arbitrageType.charAt(0).toUpperCase() + arbitrageType.slice(1)}
          </Badge>
        </div>
        <p className="text-xs text-slate-400 mt-1">{getArbitrageTypeDescription()}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="flex justify-between text-xs md:text-sm mb-2">
              <span className="text-slate-400">Investment Amount</span>
              <span className="text-white">{formatCurrency(investmentAmount)}</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input 
                type="number" 
                min="1" 
                max="1000000" 
                step="1" 
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Math.max(1, Math.min(1000000, parseFloat(e.target.value) || 1)))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1 text-white"
              />
            </div>
            <input 
              type="range" 
              min="1" 
              max="10000" 
              step="1" 
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div>
            <label className="flex justify-between text-xs md:text-sm mb-2">
              <span className="text-slate-400">Spread Percentage</span>
              <span className="text-white">{spreadPercentage.toFixed(1)}%</span>
            </label>
            <input 
              type="range" 
              min="0.1" 
              max="5" 
              step="0.1" 
              value={spreadPercentage}
              onChange={(e) => setSpreadPercentage(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div>
            <label className="flex justify-between text-xs md:text-sm mb-2">
              <span className="text-slate-400">Expected Slippage</span>
              <span className="text-white">{slippagePercentage.toFixed(1)}%</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="2" 
              step="0.1" 
              value={slippagePercentage}
              onChange={(e) => setSlippagePercentage(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex justify-between text-xs md:text-sm mb-2">
                <span className="text-slate-400">Exchange 1 Fee</span>
                <span className="text-white">{exchangeFee1.toFixed(1)}%</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={exchangeFee1}
                onChange={(e) => setExchangeFee1(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            
            <div>
              <label className="flex justify-between text-xs md:text-sm mb-2">
                <span className="text-slate-400">Exchange 2 Fee</span>
                <span className="text-white">{exchangeFee2.toFixed(1)}%</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={exchangeFee2}
                onChange={(e) => setExchangeFee2(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="flex justify-between text-xs md:text-sm mb-2">
              <span className="text-slate-400">Network Fee (USD)</span>
              <span className="text-white">{formatCurrency(networkFee)}</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="20" 
              step="0.5" 
              value={networkFee}
              onChange={(e) => setNetworkFee(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Potential Profit</p>
                <p className={`text-base font-bold ${potentialProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(potentialProfit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Risk Ratio</p>
                <p className="text-base font-bold text-white">
                  {riskRatio.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-1">Assessment</p>
              <div className={`text-sm font-medium px-2 py-1 rounded inline-block
                ${profitability === 'Low Risk' ? 'bg-green-900/30 text-green-500' : 
                profitability === 'Medium Risk' ? 'bg-yellow-900/30 text-yellow-500' : 
                profitability === 'High Risk' ? 'bg-orange-900/30 text-orange-500' : 
                'bg-red-900/30 text-red-500'}`}
              >
                {profitability}
              </div>
            </div>
            
            <button 
              className="w-full bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm text-white transition-colors"
              onClick={handleCalculate}
            >
              Calculate Risk
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArbitrageRiskCalculator;
