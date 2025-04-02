import { notificationManager } from '@/lib/notifications/notificationSystem';

// Types for risk management
export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export type StopLossType = 'fixed' | 'trailing' | 'atr_based' | 'volatility_based';
export type TakeProfitType = 'fixed' | 'scaled' | 'ratio_based';
export type RiskEventType = 
  | 'position_size_exceeded' 
  | 'drawdown_exceeded' 
  | 'stop_loss_triggered' 
  | 'take_profit_triggered'
  | 'max_loss_reached'
  | 'portfolio_allocation_exceeded'
  | 'volatility_warning'
  | 'slippage_warning';

// Interface for risk event
export interface RiskEvent {
  id: string;
  type: RiskEventType;
  timestamp: Date;
  description: string;
  symbol?: string;
  exchange?: string;
  position?: string;
  severity: 'info' | 'warning' | 'critical';
  metadata?: Record<string, any>;
  handled: boolean;
}

// Interface for risk profile
export interface RiskProfile {
  id: string;
  name: string;
  description: string;
  maxPositionSize: {
    percentage: number;
    absolute: number;
    currency: string;
  };
  maxDrawdown: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  stopLoss: {
    type: StopLossType;
    percentage: number;
    trailingOffset?: number;
    atrMultiplier?: number;
  };
  takeProfit: {
    type: TakeProfitType;
    percentage: number;
    scaledLevels?: { percentage: number; sizePercentage: number }[];
    riskRewardRatio?: number;
  };
  maxOpenPositions: number;
  portfolioAllocation: {
    maxPerAsset: number;
    maxPerSector: number;
    maxPerExchange: number;
  };
  riskLevel: RiskLevel;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
}

// Interface for position
export interface Position {
  id: string;
  symbol: string;
  exchange: string;
  type: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  leverage: number;
  openTime: Date;
  closeTime?: Date;
  stopLossPrice?: number;
  takeProfitPrice?: number;
  unrealizedPnl: number;
  unrealizedPnlPercentage: number;
  fees: number;
  status: 'open' | 'closed' | 'partially_closed';
  riskProfileId: string;
}

// Interface for portfolio
export interface Portfolio {
  totalValue: number;
  currency: string;
  positions: Position[];
  allocation: {
    perAsset: Map<string, number>;
    perExchange: Map<string, number>;
  };
  metrics: {
    dailyPnl: number;
    dailyPnlPercentage: number;
    weeklyPnl: number;
    weeklyPnlPercentage: number;
    monthlyPnl: number;
    monthlyPnlPercentage: number;
    currentDrawdown: number;
    maxDrawdown: number;
    sharpeRatio?: number;
    volatility: number;
  };
}

// Class to manage risk
export class RiskManager {
  private riskProfiles: Map<string, RiskProfile> = new Map();
  private riskEvents: RiskEvent[] = [];
  private positions: Map<string, Position> = new Map();
  private portfolio: Portfolio;
  
  constructor() {
    // Initialize with default profile
    this.initializeDefaultProfile();
    
    // Initialize empty portfolio
    this.portfolio = {
      totalValue: 0,
      currency: 'USD',
      positions: [],
      allocation: {
        perAsset: new Map(),
        perExchange: new Map(),
      },
      metrics: {
        dailyPnl: 0,
        dailyPnlPercentage: 0,
        weeklyPnl: 0,
        weeklyPnlPercentage: 0,
        monthlyPnl: 0,
        monthlyPnlPercentage: 0,
        currentDrawdown: 0,
        maxDrawdown: 0,
        volatility: 0,
      },
    };
  }
  
  /**
   * Initialize default risk profile
   */
  private initializeDefaultProfile(): void {
    const defaultProfile: RiskProfile = {
      id: crypto.randomUUID(),
      name: 'Default Risk Profile',
      description: 'Default risk settings with moderate parameters',
      maxPositionSize: {
        percentage: 2.0, // Max 2% of portfolio per position
        absolute: 1000,
        currency: 'USD',
      },
      maxDrawdown: {
        daily: 3.0, // Max 3% daily drawdown
        weekly: 7.0, // Max 7% weekly drawdown
        monthly: 15.0, // Max 15% monthly drawdown
      },
      stopLoss: {
        type: 'trailing',
        percentage: 2.0, // 2% stop loss
        trailingOffset: 1.0, // 1% trailing offset
      },
      takeProfit: {
        type: 'ratio_based',
        percentage: 4.0, // 4% take profit
        riskRewardRatio: 2.0, // 2:1 risk-reward ratio
      },
      maxOpenPositions: 5,
      portfolioAllocation: {
        maxPerAsset: 20.0, // Max 20% in one asset
        maxPerSector: 40.0, // Max 40% in one sector
        maxPerExchange: 60.0, // Max 60% in one exchange
      },
      riskLevel: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true,
    };
    
    this.riskProfiles.set(defaultProfile.id, defaultProfile);
  }
  
  /**
   * Add or update a risk profile
   */
  public addOrUpdateRiskProfile(profile: RiskProfile): string {
    if (!profile.id) {
      profile.id = crypto.randomUUID();
      profile.createdAt = new Date();
    }
    
    profile.updatedAt = new Date();
    this.riskProfiles.set(profile.id, profile);
    
    return profile.id;
  }
  
  /**
   * Get a risk profile by ID
   */
  public getRiskProfile(id: string): RiskProfile | undefined {
    return this.riskProfiles.get(id);
  }
  
  /**
   * Get the default risk profile
   */
  public getDefaultRiskProfile(): RiskProfile {
    const defaultProfile = Array.from(this.riskProfiles.values()).find(profile => profile.isDefault);
    
    if (!defaultProfile) {
      // This shouldn't happen as we initialize with a default profile
      this.initializeDefaultProfile();
      return Array.from(this.riskProfiles.values()).find(profile => profile.isDefault)!;
    }
    
    return defaultProfile;
  }
  
  /**
   * Get all risk profiles
   */
  public getAllRiskProfiles(): RiskProfile[] {
    return Array.from(this.riskProfiles.values());
  }
  
  /**
   * Delete a risk profile
   */
  public deleteRiskProfile(id: string): boolean {
    const profile = this.riskProfiles.get(id);
    
    if (!profile) {
      return false;
    }
    
    if (profile.isDefault) {
      // Cannot delete the default profile
      return false;
    }
    
    return this.riskProfiles.delete(id);
  }
  
  /**
   * Set a profile as the default
   */
  public setDefaultRiskProfile(id: string): boolean {
    const profile = this.riskProfiles.get(id);
    
    if (!profile) {
      return false;
    }
    
    // Remove default flag from the current default
    for (const p of this.riskProfiles.values()) {
      p.isDefault = false;
    }
    
    // Set the new default
    profile.isDefault = true;
    this.riskProfiles.set(id, profile);
    
    return true;
  }
  
  /**
   * Check if a position size is within risk limits
   */
  public checkPositionSize(
    symbol: string,
    quantity: number,
    price: number,
    profileId?: string
  ): { allowed: boolean; reason?: string } {
    const profile = profileId ? this.getRiskProfile(profileId) : this.getDefaultRiskProfile();
    const positionValue = quantity * price;
    
    // Check absolute position size
    if (positionValue > profile.maxPositionSize.absolute) {
      return {
        allowed: false,
        reason: `Position size (${positionValue.toFixed(2)} ${profile.maxPositionSize.currency}) exceeds the maximum allowed (${profile.maxPositionSize.absolute} ${profile.maxPositionSize.currency})`,
      };
    }
    
    // Check percentage of portfolio
    const positionPercentage = (positionValue / this.portfolio.totalValue) * 100;
    if (positionPercentage > profile.maxPositionSize.percentage) {
      return {
        allowed: false,
        reason: `Position size (${positionPercentage.toFixed(2)}% of portfolio) exceeds the maximum allowed percentage (${profile.maxPositionSize.percentage}%)`,
      };
    }
    
    // Check max open positions
    if (this.getOpenPositionsCount() >= profile.maxOpenPositions) {
      return {
        allowed: false,
        reason: `Opening this position would exceed the maximum number of open positions (${profile.maxOpenPositions})`,
      };
    }
    
    // Check portfolio allocation per asset
    const currentAllocation = this.portfolio.allocation.perAsset.get(symbol) || 0;
    const newAllocation = currentAllocation + positionPercentage;
    if (newAllocation > profile.portfolioAllocation.maxPerAsset) {
      return {
        allowed: false,
        reason: `This position would result in ${newAllocation.toFixed(2)}% allocation to ${symbol}, exceeding the maximum allowed (${profile.portfolioAllocation.maxPerAsset}%)`,
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Log a risk event
   */
  public logRiskEvent(event: Omit<RiskEvent, 'id' | 'timestamp' | 'handled'>): string {
    const id = crypto.randomUUID();
    const riskEvent: RiskEvent = {
      ...event,
      id,
      timestamp: new Date(),
      handled: false,
    };
    
    this.riskEvents.push(riskEvent);
    
    // Notify about critical events
    if (event.severity === 'critical') {
      this.notifyAboutRiskEvent(riskEvent);
    }
    
    return id;
  }
  
  /**
   * Send a notification about a risk event
   */
  private notifyAboutRiskEvent(event: RiskEvent): void {
    const title = this.formatRiskEventType(event.type);
    
    notificationManager.notify(
      title,
      event.description,
      'system',
      event.severity === 'critical' ? 'high' : event.severity === 'warning' ? 'medium' : 'low',
      'risk_manager'
    );
  }
  
  /**
   * Format risk event type for display
   */
  private formatRiskEventType(type: RiskEventType): string {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Get risk events, with optional filtering
   */
  public getRiskEvents(filter?: {
    type?: RiskEventType;
    severity?: 'info' | 'warning' | 'critical';
    handled?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): RiskEvent[] {
    let events = [...this.riskEvents];
    
    // Apply filters if provided
    if (filter) {
      if (filter.type) {
        events = events.filter(event => event.type === filter.type);
      }
      
      if (filter.severity) {
        events = events.filter(event => event.severity === filter.severity);
      }
      
      if (filter.handled !== undefined) {
        events = events.filter(event => event.handled === filter.handled);
      }
      
      if (filter.startDate) {
        events = events.filter(event => event.timestamp >= filter.startDate);
      }
      
      if (filter.endDate) {
        events = events.filter(event => event.timestamp <= filter.endDate);
      }
    }
    
    // Sort by timestamp descending (newest first)
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  /**
   * Mark a risk event as handled
   */
  public markRiskEventAsHandled(id: string): boolean {
    const event = this.riskEvents.find(e => e.id === id);
    
    if (!event) {
      return false;
    }
    
    event.handled = true;
    return true;
  }
  
  /**
   * Add or update a position
   */
  public addOrUpdatePosition(position: Position): void {
    this.positions.set(position.id, position);
    this.updatePortfolio();
  }
  
  /**
   * Close a position
   */
  public closePosition(id: string, exitPrice: number): boolean {
    const position = this.positions.get(id);
    
    if (!position) {
      return false;
    }
    
    position.currentPrice = exitPrice;
    position.closeTime = new Date();
    position.status = 'closed';
    position.unrealizedPnl = this.calculatePnl(position, exitPrice);
    position.unrealizedPnlPercentage = this.calculatePnlPercentage(position, exitPrice);
    
    this.positions.set(id, position);
    this.updatePortfolio();
    
    return true;
  }
  
  /**
   * Calculate PnL for a position
   */
  private calculatePnl(position: Position, currentPrice: number): number {
    const direction = position.type === 'long' ? 1 : -1;
    const priceDifference = (currentPrice - position.entryPrice) * direction;
    return priceDifference * position.quantity - position.fees;
  }
  
  /**
   * Calculate PnL percentage for a position
   */
  private calculatePnlPercentage(position: Position, currentPrice: number): number {
    const pnl = this.calculatePnl(position, currentPrice);
    const positionValue = position.entryPrice * position.quantity;
    return (pnl / positionValue) * 100;
  }
  
  /**
   * Get all positions
   */
  public getPositions(filter?: { status?: 'open' | 'closed' | 'partially_closed' }): Position[] {
    let positions = Array.from(this.positions.values());
    
    // Apply filter if provided
    if (filter?.status) {
      positions = positions.filter(position => position.status === filter.status);
    }
    
    return positions;
  }
  
  /**
   * Get a position by ID
   */
  public getPosition(id: string): Position | undefined {
    return this.positions.get(id);
  }
  
  /**
   * Get count of open positions
   */
  public getOpenPositionsCount(): number {
    return this.getPositions({ status: 'open' }).length;
  }
  
  /**
   * Update position with current market price
   */
  public updatePositionPrice(id: string, currentPrice: number): boolean {
    const position = this.positions.get(id);
    
    if (!position || position.status !== 'open') {
      return false;
    }
    
    position.currentPrice = currentPrice;
    position.unrealizedPnl = this.calculatePnl(position, currentPrice);
    position.unrealizedPnlPercentage = this.calculatePnlPercentage(position, currentPrice);
    
    this.positions.set(id, position);
    
    // Check if stop loss or take profit has been triggered
    this.checkStopLossAndTakeProfit(position);
    
    return true;
  }
  
  /**
   * Check if stop loss or take profit has been triggered
   */
  private checkStopLossAndTakeProfit(position: Position): void {
    if (position.status !== 'open') {
      return;
    }
    
    // Check stop loss
    if (position.stopLossPrice !== undefined) {
      const isStopLossTriggered = position.type === 'long'
        ? position.currentPrice <= position.stopLossPrice
        : position.currentPrice >= position.stopLossPrice;
      
      if (isStopLossTriggered) {
        this.logRiskEvent({
          type: 'stop_loss_triggered',
          description: `Stop loss triggered for ${position.symbol} at ${position.currentPrice}`,
          symbol: position.symbol,
          exchange: position.exchange,
          position: position.id,
          severity: 'warning',
        });
      }
    }
    
    // Check take profit
    if (position.takeProfitPrice !== undefined) {
      const isTakeProfitTriggered = position.type === 'long'
        ? position.currentPrice >= position.takeProfitPrice
        : position.currentPrice <= position.takeProfitPrice;
      
      if (isTakeProfitTriggered) {
        this.logRiskEvent({
          type: 'take_profit_triggered',
          description: `Take profit triggered for ${position.symbol} at ${position.currentPrice}`,
          symbol: position.symbol,
          exchange: position.exchange,
          position: position.id,
          severity: 'info',
        });
      }
    }
  }
  
  /**
   * Update the portfolio with current positions
   */
  private updatePortfolio(): void {
    const openPositions = this.getPositions({ status: 'open' });
    
    // Calculate total value and positions
    let totalValue = 0;
    for (const position of openPositions) {
      totalValue += position.currentPrice * position.quantity;
    }
    
    // Update portfolio value
    this.portfolio.totalValue = totalValue;
    this.portfolio.positions = openPositions;
    
    // Calculate allocations
    const perAsset = new Map<string, number>();
    const perExchange = new Map<string, number>();
    
    for (const position of openPositions) {
      const positionValue = position.currentPrice * position.quantity;
      const percentage = (positionValue / totalValue) * 100;
      
      // Update per asset allocation
      const currentAssetAllocation = perAsset.get(position.symbol) || 0;
      perAsset.set(position.symbol, currentAssetAllocation + percentage);
      
      // Update per exchange allocation
      const currentExchangeAllocation = perExchange.get(position.exchange) || 0;
      perExchange.set(position.exchange, currentExchangeAllocation + percentage);
    }
    
    this.portfolio.allocation.perAsset = perAsset;
    this.portfolio.allocation.perExchange = perExchange;
    
    // Check for risk events based on the updated portfolio
    this.checkPortfolioRiskEvents();
  }
  
  /**
   * Check for risk events based on the portfolio
   */
  private checkPortfolioRiskEvents(): void {
    const defaultProfile = this.getDefaultRiskProfile();
    
    // Check for allocation exceeding limits
    for (const [asset, percentage] of this.portfolio.allocation.perAsset.entries()) {
      if (percentage > defaultProfile.portfolioAllocation.maxPerAsset) {
        this.logRiskEvent({
          type: 'portfolio_allocation_exceeded',
          description: `Allocation to ${asset} (${percentage.toFixed(2)}%) exceeds maximum allowed (${defaultProfile.portfolioAllocation.maxPerAsset}%)`,
          severity: 'warning',
          metadata: { asset, allocation: percentage },
        });
      }
    }
    
    for (const [exchange, percentage] of this.portfolio.allocation.perExchange.entries()) {
      if (percentage > defaultProfile.portfolioAllocation.maxPerExchange) {
        this.logRiskEvent({
          type: 'portfolio_allocation_exceeded',
          description: `Allocation to exchange ${exchange} (${percentage.toFixed(2)}%) exceeds maximum allowed (${defaultProfile.portfolioAllocation.maxPerExchange}%)`,
          severity: 'warning',
          metadata: { exchange, allocation: percentage },
        });
      }
    }
    
    // Check for drawdown limits
    if (this.portfolio.metrics.dailyPnlPercentage < -defaultProfile.maxDrawdown.daily) {
      this.logRiskEvent({
        type: 'drawdown_exceeded',
        description: `Daily drawdown (${Math.abs(this.portfolio.metrics.dailyPnlPercentage).toFixed(2)}%) exceeds maximum allowed (${defaultProfile.maxDrawdown.daily}%)`,
        severity: 'critical',
        metadata: { drawdown: this.portfolio.metrics.dailyPnlPercentage },
      });
    }
    
    if (this.portfolio.metrics.weeklyPnlPercentage < -defaultProfile.maxDrawdown.weekly) {
      this.logRiskEvent({
        type: 'drawdown_exceeded',
        description: `Weekly drawdown (${Math.abs(this.portfolio.metrics.weeklyPnlPercentage).toFixed(2)}%) exceeds maximum allowed (${defaultProfile.maxDrawdown.weekly}%)`,
        severity: 'critical',
        metadata: { drawdown: this.portfolio.metrics.weeklyPnlPercentage },
      });
    }
    
    if (this.portfolio.metrics.monthlyPnlPercentage < -defaultProfile.maxDrawdown.monthly) {
      this.logRiskEvent({
        type: 'drawdown_exceeded',
        description: `Monthly drawdown (${Math.abs(this.portfolio.metrics.monthlyPnlPercentage).toFixed(2)}%) exceeds maximum allowed (${defaultProfile.maxDrawdown.monthly}%)`,
        severity: 'critical',
        metadata: { drawdown: this.portfolio.metrics.monthlyPnlPercentage },
      });
    }
  }
  
  /**
   * Update portfolio metrics
   */
  public updatePortfolioMetrics(metrics: Partial<Portfolio['metrics']>): void {
    this.portfolio.metrics = { ...this.portfolio.metrics, ...metrics };
    
    // Check for risk events after metrics update
    this.checkPortfolioRiskEvents();
  }
  
  /**
   * Get the current portfolio
   */
  public getPortfolio(): Portfolio {
    return { ...this.portfolio };
  }
  
  /**
   * Calculate position size based on risk parameters
   */
  public calculatePositionSize(
    symbol: string,
    price: number,
    riskPercentage: number,
    stopLossPrice?: number,
    profileId?: string
  ): { quantity: number; value: number; percentage: number } {
    const profile = profileId ? this.getRiskProfile(profileId) : this.getDefaultRiskProfile();
    
    // Ensure risk percentage is not greater than max position size percentage
    const effectiveRiskPercentage = Math.min(riskPercentage, profile.maxPositionSize.percentage);
    
    // Calculate position value based on portfolio percentage
    const positionValue = (this.portfolio.totalValue * effectiveRiskPercentage) / 100;
    
    // Calculate quantity
    let quantity = positionValue / price;
    
    // If stop loss is provided, adjust quantity based on risk per trade
    if (stopLossPrice !== undefined) {
      const riskPerTrade = profile.maxPositionSize.percentage / 100 * this.portfolio.totalValue;
      const riskPerUnit = Math.abs(price - stopLossPrice);
      
      if (riskPerUnit > 0) {
        const riskAdjustedQuantity = riskPerTrade / riskPerUnit;
        // Use the smaller of the two quantities to be conservative
        quantity = Math.min(quantity, riskAdjustedQuantity);
      }
    }
    
    // Calculate actual position value and percentage
    const actualValue = quantity * price;
    const actualPercentage = (actualValue / this.portfolio.totalValue) * 100;
    
    return {
      quantity,
      value: actualValue,
      percentage: actualPercentage,
    };
  }
  
  /**
   * Calculate stop loss price based on risk profile
   */
  public calculateStopLoss(
    entryPrice: number,
    type: 'long' | 'short',
    profileId?: string,
    atr?: number
  ): number {
    const profile = profileId ? this.getRiskProfile(profileId) : this.getDefaultRiskProfile();
    const direction = type === 'long' ? -1 : 1;
    
    switch (profile.stopLoss.type) {
      case 'fixed':
        return entryPrice * (1 + direction * profile.stopLoss.percentage / 100);
        
      case 'trailing':
        // Initial stop loss is the same as fixed
        return entryPrice * (1 + direction * profile.stopLoss.percentage / 100);
        
      case 'atr_based':
        if (!atr || !profile.stopLoss.atrMultiplier) {
          // Fall back to fixed if ATR is not provided
          return entryPrice * (1 + direction * profile.stopLoss.percentage / 100);
        }
        return entryPrice + (direction * -1 * atr * profile.stopLoss.atrMultiplier);
        
      case 'volatility_based':
        // Similar to ATR but using a percentage of price as volatility measure
        const volatility = entryPrice * (profile.stopLoss.percentage / 100);
        return entryPrice + (direction * -1 * volatility);
        
      default:
        return entryPrice * (1 + direction * profile.stopLoss.percentage / 100);
    }
  }
  
  /**
   * Calculate take profit price based on risk profile
   */
  public calculateTakeProfit(
    entryPrice: number,
    stopLossPrice: number,
    type: 'long' | 'short',
    profileId?: string
  ): number | { levels: { price: number; size: number }[] } {
    const profile = profileId ? this.getRiskProfile(profileId) : this.getDefaultRiskProfile();
    const direction = type === 'long' ? 1 : -1;
    
    switch (profile.takeProfit.type) {
      case 'fixed':
        return entryPrice * (1 + direction * profile.takeProfit.percentage / 100);
        
      case 'ratio_based':
        if (!profile.takeProfit.riskRewardRatio) {
          // Fall back to fixed if ratio is not provided
          return entryPrice * (1 + direction * profile.takeProfit.percentage / 100);
        }
        
        const risk = Math.abs(entryPrice - stopLossPrice);
        return entryPrice + (direction * risk * profile.takeProfit.riskRewardRatio);
        
      case 'scaled':
        if (!profile.takeProfit.scaledLevels || profile.takeProfit.scaledLevels.length === 0) {
          // Fall back to fixed if scaled levels are not provided
          return entryPrice * (1 + direction * profile.takeProfit.percentage / 100);
        }
        
        // Return multiple take profit levels
        return {
          levels: profile.takeProfit.scaledLevels.map(level => ({
            price: entryPrice * (1 + direction * level.percentage / 100),
            size: level.sizePercentage,
          })),
        };
        
      default:
        return entryPrice * (1 + direction * profile.takeProfit.percentage / 100);
    }
  }
}

// Export singleton instance
export const riskManager = new RiskManager(); 