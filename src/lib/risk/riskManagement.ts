import { Trade, TradingSignal } from '@/lib/trading/tradingBot';

// Risk Score levels
export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

// Risk Assessment types
export interface RiskAssessment {
  overallScore: number; // 0-100, where 0 is lowest risk, 100 is highest
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  timestamp: Date;
}

// Individual risk factors
export interface RiskFactor {
  name: string;
  score: number; // 0-100
  level: RiskLevel;
  explanation: string;
  weight: number; // How much this factor contributes to overall score
  recommendations?: string[];
}

// Portfolio Risk Snapshot
export interface PortfolioRiskSnapshot {
  timestamp: Date;
  totalValue: number;
  valueAtRisk: number; // VaR - potential loss in worst case scenario
  maxDrawdown: number; // maximum percentage drawdown 
  sharpeRatio: number; // risk-adjusted return measure
  volatility: number; // standard deviation of returns
  exchangeExposure: Record<string, number>; // amount exposed per exchange
  assetExposure: Record<string, number>; // amount exposed per asset
  correlationMatrix?: number[][]; // correlation between assets
}

// Risk settings for a user
export interface RiskSettings {
  maxLossPerTrade: number; // maximum loss allowed for a single trade (%)
  maxDailyLoss: number; // maximum daily loss allowed (%)
  maxExposurePerExchange: number; // maximum percentage of portfolio on any one exchange
  maxExposurePerAsset: number; // maximum percentage of portfolio in any one asset
  maxLeverage: number; // maximum leverage allowed
  stopLossEnabled: boolean; // whether to use stop losses
  defaultStopLossPercentage: number; // default stop loss percentage
  takeProfitEnabled: boolean; // whether to use take profits
  defaultTakeProfitPercentage: number; // default take profit percentage
  riskManagementEnabled: boolean; // master toggle for risk management
}

// Default risk settings
export const DEFAULT_RISK_SETTINGS: RiskSettings = {
  maxLossPerTrade: 2, // 2%
  maxDailyLoss: 5, // 5%
  maxExposurePerExchange: 30, // 30%
  maxExposurePerAsset: 20, // 20%
  maxLeverage: 3, // 3x
  stopLossEnabled: true,
  defaultStopLossPercentage: 5, // 5%
  takeProfitEnabled: true,
  defaultTakeProfitPercentage: 10, // 10%
  riskManagementEnabled: true
};

// Risk Manager class
export class RiskManager {
  private settings: RiskSettings;
  private dailyLosses: Map<string, number> = new Map(); // Key: YYYY-MM-DD, Value: loss amount
  private portfolioSnapshots: PortfolioRiskSnapshot[] = [];
  private tradeHistory: Trade[] = [];
  
  constructor(settings: RiskSettings = DEFAULT_RISK_SETTINGS) {
    this.settings = settings;
  }
  
  // Update settings
  updateSettings(newSettings: Partial<RiskSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }
  
  // Get current settings
  getSettings(): RiskSettings {
    return { ...this.settings };
  }
  
  // Calculate risk for a trading signal
  assessTradeRisk(signal: TradingSignal, portfolio: PortfolioSnapshot): RiskAssessment {
    const factors: RiskFactor[] = [];
    
    // 1. Exchange Risk
    const exchangeRisk = this.assessExchangeRisk(signal.exchange);
    factors.push(exchangeRisk);
    
    // 2. Asset Volatility Risk
    const volatilityRisk = this.assessVolatilityRisk(signal.symbol);
    factors.push(volatilityRisk);
    
    // 3. Position Size Risk
    const positionSizeRisk = this.assessPositionSizeRisk(signal, portfolio);
    factors.push(positionSizeRisk);
    
    // 4. Exchange Exposure Risk
    const exchangeExposureRisk = this.assessExchangeExposureRisk(signal, portfolio);
    factors.push(exchangeExposureRisk);
    
    // 5. Asset Exposure Risk
    const assetExposureRisk = this.assessAssetExposureRisk(signal, portfolio);
    factors.push(assetExposureRisk);
    
    // 6. Liquidity Risk
    const liquidityRisk = this.assessLiquidityRisk(signal);
    factors.push(liquidityRisk);
    
    // 7. Time of Day Risk
    const timeRisk = this.assessTimeRisk(signal);
    factors.push(timeRisk);
    
    // 8. Recent Performance Risk
    const performanceRisk = this.assessRecentPerformanceRisk();
    factors.push(performanceRisk);
    
    // Calculate weighted average of risk scores
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const weightedScore = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0) / totalWeight;
    
    // Determine overall risk level
    const riskLevel = this.scoreToRiskLevel(weightedScore);
    
    return {
      overallScore: Math.round(weightedScore),
      riskLevel,
      factors,
      timestamp: new Date()
    };
  }
  
  // Should a trade be allowed based on risk assessment?
  shouldAllowTrade(signal: TradingSignal, portfolio: PortfolioSnapshot): { allowed: boolean; reason?: string } {
    if (!this.settings.riskManagementEnabled) {
      return { allowed: true };
    }
    
    // Check daily loss limit
    const today = new Date().toISOString().split('T')[0];
    const dailyLoss = this.dailyLosses.get(today) || 0;
    
    if (dailyLoss >= (portfolio.totalValue * (this.settings.maxDailyLoss / 100))) {
      return { 
        allowed: false, 
        reason: `Daily loss limit of ${this.settings.maxDailyLoss}% reached` 
      };
    }
    
    // Check position size
    const positionPercentage = (signal.total / portfolio.totalValue) * 100;
    
    if (positionPercentage > this.settings.maxLossPerTrade * 5) { // Assuming potential 20% loss on position
      return { 
        allowed: false, 
        reason: `Position size (${positionPercentage.toFixed(2)}%) exceeds maximum allowed based on risk settings` 
      };
    }
    
    // Check exchange exposure
    const currentExchangeExposure = portfolio.exchangeExposure[signal.exchange] || 0;
    const newExchangeExposure = currentExchangeExposure + signal.total;
    const exchangeExposurePercentage = (newExchangeExposure / portfolio.totalValue) * 100;
    
    if (exchangeExposurePercentage > this.settings.maxExposurePerExchange) {
      return { 
        allowed: false, 
        reason: `Exchange exposure limit of ${this.settings.maxExposurePerExchange}% would be exceeded for ${signal.exchange}` 
      };
    }
    
    // Check asset exposure
    const assetSymbol = signal.symbol.split('/')[0]; // Extract base asset (e.g., "BTC" from "BTC/USDT")
    const currentAssetExposure = portfolio.assetExposure[assetSymbol] || 0;
    const newAssetExposure = currentAssetExposure + signal.total;
    const assetExposurePercentage = (newAssetExposure / portfolio.totalValue) * 100;
    
    if (assetExposurePercentage > this.settings.maxExposurePerAsset) {
      return { 
        allowed: false, 
        reason: `Asset exposure limit of ${this.settings.maxExposurePerAsset}% would be exceeded for ${assetSymbol}` 
      };
    }
    
    return { allowed: true };
  }
  
  // Add a completed trade to history for risk analysis
  addTradeToHistory(trade: Trade): void {
    this.tradeHistory.push(trade);
    
    // If the trade was a loss, add to daily losses
    if (trade.type === 'buy' && trade.status === 'completed') {
      const profitLoss = (trade.price * trade.quantity) - trade.total - trade.fees;
      
      if (profitLoss < 0) {
        const day = trade.timestamp.toISOString().split('T')[0];
        const currentLoss = this.dailyLosses.get(day) || 0;
        this.dailyLosses.set(day, currentLoss + Math.abs(profitLoss));
      }
    }
  }
  
  // Add a portfolio snapshot for risk analysis
  addPortfolioSnapshot(snapshot: PortfolioRiskSnapshot): void {
    this.portfolioSnapshots.push(snapshot);
    
    // Keep only last 30 days of snapshots
    if (this.portfolioSnapshots.length > 30) {
      this.portfolioSnapshots.shift();
    }
  }
  
  // Get portfolio risk over time
  getPortfolioRiskTrend(days: number = 7): PortfolioRiskSnapshot[] {
    return this.portfolioSnapshots
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, days);
  }
  
  // Get latest portfolio risk snapshot
  getLatestPortfolioRisk(): PortfolioRiskSnapshot | null {
    if (this.portfolioSnapshots.length === 0) {
      return null;
    }
    
    return this.portfolioSnapshots
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }
  
  // Calculate portfolio risk metrics
  calculatePortfolioRisk(portfolio: PortfolioSnapshot): PortfolioRiskSnapshot {
    // This would involve complex risk calculations in a real implementation
    // For now, we'll return a simplified simulation
    
    const totalValue = portfolio.totalValue;
    
    // Simplified Value at Risk calculation (5% VaR)
    const valueAtRisk = totalValue * 0.05;
    
    // Simulated volatility (5-15%)
    const volatility = 5 + (Math.random() * 10); 
    
    // Simulated Sharpe ratio (0.5-2.5)
    const sharpeRatio = 0.5 + (Math.random() * 2);
    
    // Simulated max drawdown (5-25%)
    const maxDrawdown = 5 + (Math.random() * 20);
    
    return {
      timestamp: new Date(),
      totalValue,
      valueAtRisk,
      maxDrawdown,
      sharpeRatio,
      volatility,
      exchangeExposure: portfolio.exchangeExposure,
      assetExposure: portfolio.assetExposure
    };
  }
  
  // Private helper methods for risk assessment
  private assessExchangeRisk(exchangeId: string): RiskFactor {
    // In a real implementation, this would check exchange reliability, security history, insurance funds, etc.
    // For now, we'll use a simplified simulation
    
    // Sample exchange risk ratings (would be based on real data in production)
    const exchangeRiskMap: Record<string, number> = {
      'binance': 25,
      'coinbase': 20,
      'kraken': 22,
      'kucoin': 35,
      'bybit': 40,
      'okx': 38,
      'gate_io': 45,
      'bitget': 50,
      'mexc_global': 55,
      'htx': 45
    };
    
    const score = exchangeRiskMap[exchangeId] || 50; // Default to medium risk if not found
    
    return {
      name: 'Exchange Risk',
      score,
      level: this.scoreToRiskLevel(score),
      explanation: `Risk assessment for exchange ${exchangeId} based on historical reliability and security.`,
      weight: 3,
      recommendations: score > 40 ? [
        'Consider using a more established exchange',
        'Limit your exposure to this exchange',
        'Use hardware wallets for long-term storage'
      ] : []
    };
  }
  
  private assessVolatilityRisk(symbol: string): RiskFactor {
    // In a real implementation, this would calculate historical volatility
    // For now, we'll use a simplified simulation
    
    // Extract base asset (e.g., "BTC" from "BTC/USDT")
    const asset = symbol.split('/')[0];
    
    // Sample volatility risk ratings (would be based on real data in production)
    const volatilityRiskMap: Record<string, number> = {
      'BTC': 45,
      'ETH': 50,
      'BNB': 55,
      'XRP': 60,
      'ADA': 65,
      'SOL': 70,
      'AVAX': 75,
      'DOT': 70,
      'MATIC': 65,
      'LINK': 60,
      'USDT': 5,
      'USDC': 3,
      'DAI': 4
    };
    
    const score = volatilityRiskMap[asset] || 65; // Default to medium-high risk if not found
    
    return {
      name: 'Volatility Risk',
      score,
      level: this.scoreToRiskLevel(score),
      explanation: `Risk assessment for ${asset} based on historical price volatility.`,
      weight: 2.5,
      recommendations: score > 60 ? [
        'Consider using smaller position sizes',
        'Set tighter stop losses',
        'Monitor the position more frequently'
      ] : []
    };
  }
  
  private assessPositionSizeRisk(signal: TradingSignal, portfolio: PortfolioSnapshot): RiskFactor {
    const positionPercentage = (signal.total / portfolio.totalValue) * 100;
    
    // Position size risk increases as percentage of portfolio increases
    let score = 0;
    
    if (positionPercentage <= 1) {
      score = 10; // Very low risk
    } else if (positionPercentage <= 3) {
      score = 25; // Low risk
    } else if (positionPercentage <= 5) {
      score = 40; // Medium-low risk
    } else if (positionPercentage <= 10) {
      score = 60; // Medium risk
    } else if (positionPercentage <= 15) {
      score = 75; // High risk
    } else {
      score = 90; // Very high risk
    }
    
    return {
      name: 'Position Size Risk',
      score,
      level: this.scoreToRiskLevel(score),
      explanation: `This trade represents ${positionPercentage.toFixed(2)}% of your portfolio.`,
      weight: 4,
      recommendations: score > 60 ? [
        'Consider reducing position size',
        'Split the position into multiple smaller trades',
        'Use a more conservative stop loss'
      ] : []
    };
  }
  
  private assessExchangeExposureRisk(signal: TradingSignal, portfolio: PortfolioSnapshot): RiskFactor {
    const currentExchangeExposure = portfolio.exchangeExposure[signal.exchange] || 0;
    const newExchangeExposure = currentExchangeExposure + signal.total;
    const exchangeExposurePercentage = (newExchangeExposure / portfolio.totalValue) * 100;
    
    // Exchange exposure risk increases as percentage of portfolio on one exchange increases
    let score = 0;
    
    if (exchangeExposurePercentage <= 10) {
      score = 10; // Very low risk
    } else if (exchangeExposurePercentage <= 20) {
      score = 25; // Low risk
    } else if (exchangeExposurePercentage <= 30) {
      score = 40; // Medium-low risk
    } else if (exchangeExposurePercentage <= 40) {
      score = 60; // Medium risk
    } else if (exchangeExposurePercentage <= 50) {
      score = 75; // High risk
    } else {
      score = 90; // Very high risk
    }
    
    return {
      name: 'Exchange Exposure Risk',
      score,
      level: this.scoreToRiskLevel(score),
      explanation: `After this trade, you would have ${exchangeExposurePercentage.toFixed(2)}% of your portfolio on ${signal.exchange}.`,
      weight: 3,
      recommendations: score > 60 ? [
        'Consider diversifying across more exchanges',
        'Limit further exposure to this exchange',
        'Ensure you have withdrawal and security measures in place'
      ] : []
    };
  }
  
  private assessAssetExposureRisk(signal: TradingSignal, portfolio: PortfolioSnapshot): RiskFactor {
    const assetSymbol = signal.symbol.split('/')[0]; // Extract base asset (e.g., "BTC" from "BTC/USDT")
    const currentAssetExposure = portfolio.assetExposure[assetSymbol] || 0;
    const newAssetExposure = currentAssetExposure + signal.total;
    const assetExposurePercentage = (newAssetExposure / portfolio.totalValue) * 100;
    
    // Asset exposure risk increases as percentage of portfolio in one asset increases
    let score = 0;
    
    if (assetExposurePercentage <= 5) {
      score = 10; // Very low risk
    } else if (assetExposurePercentage <= 10) {
      score = 25; // Low risk
    } else if (assetExposurePercentage <= 20) {
      score = 40; // Medium-low risk
    } else if (assetExposurePercentage <= 30) {
      score = 60; // Medium risk
    } else if (assetExposurePercentage <= 40) {
      score = 75; // High risk
    } else {
      score = 90; // Very high risk
    }
    
    return {
      name: 'Asset Exposure Risk',
      score,
      level: this.scoreToRiskLevel(score),
      explanation: `After this trade, you would have ${assetExposurePercentage.toFixed(2)}% of your portfolio in ${assetSymbol}.`,
      weight: 3,
      recommendations: score > 60 ? [
        'Consider diversifying across more assets',
        'Limit further exposure to this asset',
        'Set up hedging positions if appropriate'
      ] : []
    };
  }
  
  private assessLiquidityRisk(signal: TradingSignal): RiskFactor {
    // In a real implementation, this would check order book depth and historical liquidity
    // For now, we'll use a simplified simulation based on volume
    
    // We'll assume the signal has volume information
    const volume24h = signal.volume24h || 1000000; // Default to $1M if not available
    
    let score = 0;
    
    if (volume24h >= 100000000) { // $100M+
      score = 10; // Very low risk
    } else if (volume24h >= 20000000) { // $20M+
      score = 25; // Low risk
    } else if (volume24h >= 5000000) { // $5M+
      score = 40; // Medium-low risk
    } else if (volume24h >= 1000000) { // $1M+
      score = 60; // Medium risk
    } else if (volume24h >= 500000) { // $500K+
      score = 75; // High risk
    } else {
      score = 90; // Very high risk
    }
    
    return {
      name: 'Liquidity Risk',
      score,
      level: this.scoreToRiskLevel(score),
      explanation: `This market has 24h volume of $${(volume24h / 1000000).toFixed(2)}M.`,
      weight: 2,
      recommendations: score > 60 ? [
        'Consider trading in more liquid markets',
        'Use limit orders instead of market orders',
        'Split large orders into smaller ones',
        'Be cautious of slippage during execution'
      ] : []
    };
  }
  
  private assessTimeRisk(signal: TradingSignal): RiskFactor {
    // Some times of day have higher volatility or lower liquidity
    const hour = new Date().getUTCHours();
    
    // Historically, market volatility can be higher during certain hours
    // This is a simplified model - real systems would use historical data
    let score = 30; // Base medium-low risk
    
    // Higher risk during common high volatility periods
    // UTC 13-16 (US market open), UTC 20-22 (US afternoon volatility)
    if ((hour >= 13 && hour <= 16) || (hour >= 20 && hour <= 22)) {
      score += 20;
    }
    
    // Lower risk during typically calmer periods
    // UTC 0-4 (Asian markets, typically lower volatility)
    if (hour >= 0 && hour <= 4) {
      score -= 10;
    }
    
    // Keep score within bounds
    score = Math.max(0, Math.min(100, score));
    
    return {
      name: 'Time-of-Day Risk',
      score,
      level: this.scoreToRiskLevel(score),
      explanation: `Current UTC time (${hour}:00) has historical volatility patterns affecting risk.`,
      weight: 1,
      recommendations: score > 60 ? [
        'Consider trading during less volatile hours',
        'Use tighter risk controls during high-volatility periods',
        'Be aware of major market events occurring during this time'
      ] : []
    };
  }
  
  private assessRecentPerformanceRisk(): RiskFactor {
    // In a real implementation, this would analyze recent trading performance
    // to identify if the trader is on a losing streak or showing signs of tilt
    
    // Count recent trades and their outcomes
    const recentTrades = this.tradeHistory.slice(-10);
    const recentLosses = recentTrades.filter(trade => {
      // Simplified profit/loss calculation
      const profitLoss = (trade.price * trade.quantity) - trade.total - trade.fees;
      return profitLoss < 0;
    });
    
    const lossPercentage = recentLosses.length / Math.max(1, recentTrades.length) * 100;
    
    let score = 0;
    
    if (lossPercentage <= 20) {
      score = 10; // Very low risk - good performance
    } else if (lossPercentage <= 40) {
      score = 25; // Low risk
    } else if (lossPercentage <= 60) {
      score = 50; // Medium risk
    } else if (lossPercentage <= 80) {
      score = 75; // High risk
    } else {
      score = 90; // Very high risk - possible tilt
    }
    
    return {
      name: 'Recent Performance Risk',
      score,
      level: this.scoreToRiskLevel(score),
      explanation: `${lossPercentage.toFixed(0)}% of your recent trades resulted in losses.`,
      weight: 2,
      recommendations: score > 60 ? [
        'Consider taking a short break from trading',
        'Reduce position sizes until performance improves',
        'Review your recent trades for patterns of mistakes'
      ] : []
    };
  }
  
  // Helper to convert numeric score to risk level
  private scoreToRiskLevel(score: number): RiskLevel {
    if (score < 20) return 'very_low';
    if (score < 40) return 'low';
    if (score < 60) return 'medium';
    if (score < 80) return 'high';
    return 'very_high';
  }
}

// Portfolio snapshot interface
export interface PortfolioSnapshot {
  totalValue: number;
  exchangeExposure: Record<string, number>;
  assetExposure: Record<string, number>;
}

// Create singleton instance
export const riskManager = new RiskManager(); 