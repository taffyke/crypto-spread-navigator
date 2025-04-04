
import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/hooks/use-toast';

interface ArbitrageRiskCalculatorProps {
  className?: string;
}

const ArbitrageRiskCalculator = ({ className }: ArbitrageRiskCalculatorProps) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [spreadPercentage, setSpreadPercentage] = useState<number>(2.5);
  const [slippagePercentage, setSlippagePercentage] = useState<number>(0.5);
  const [exchangeFee1, setExchangeFee1] = useState<number>(0.1);
  const [exchangeFee2, setExchangeFee2] = useState<number>(0.1);
  const [networkFee, setNetworkFee] = useState<number>(5);
  const [potentialProfit, setPotentialProfit] = useState<number>(0);
  const [riskRatio, setRiskRatio] = useState<number>(0);
  const [profitability, setProfitability] = useState<string>('Calculating...');

  // Calculate potential profit and risk metrics
  useEffect(() => {
    // Calculate gross profit before fees
    const grossProfit = investmentAmount * (spreadPercentage / 100);
    
    // Calculate exchange fees
    const exchangeFee1Amount = investmentAmount * (exchangeFee1 / 100);
    const exchangeFee2Amount = (investmentAmount + grossProfit) * (exchangeFee2 / 100);
    
    // Calculate slippage impact
    const slippageAmount = investmentAmount * (slippagePercentage / 100);
    
    // Total costs
    const totalCosts = exchangeFee1Amount + exchangeFee2Amount + networkFee + slippageAmount;
    
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
  }, [investmentAmount, spreadPercentage, slippagePercentage, exchangeFee1, exchangeFee2, networkFee]);

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
      title: "Risk Calculation",
      description: `Potential Profit: ${formatCurrency(potentialProfit)} | Risk Ratio: ${riskRatio.toFixed(2)}`,
    });
  };

  return (
    <Card className={`bg-slate-800 border-slate-700 text-white ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-sm md:text-base">Arbitrage Risk Calculator</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="flex justify-between text-xs md:text-sm mb-2">
              <span className="text-slate-400">Investment Amount</span>
              <span className="text-white">{formatCurrency(investmentAmount)}</span>
            </label>
            <input 
              type="range" 
              min="100" 
              max="10000" 
              step="100" 
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
