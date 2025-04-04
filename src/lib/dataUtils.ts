// Utility functions for data processing and visualization

// Time range options for data visualization
export type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d';

/**
 * Filter data points by time range
 * @param data Array of data objects with timestamp property
 * @param timeRange Time range to filter by
 * @param timestampKey The key in the data object that contains the timestamp
 * @returns Filtered data array
 */
export function filterByTimeRange<T>(data: T[], timeRange: TimeRange, timestampKey: keyof T = 'timestamp' as keyof T): T[] {
  const now = new Date();
  const cutoffTime = new Date();
  
  switch (timeRange) {
    case '1h':
      cutoffTime.setHours(now.getHours() - 1);
      break;
    case '24h':
      cutoffTime.setDate(now.getDate() - 1);
      break;
    case '7d':
      cutoffTime.setDate(now.getDate() - 7);
      break;
    case '30d':
      cutoffTime.setDate(now.getDate() - 30);
      break;
    case '90d':
      cutoffTime.setDate(now.getDate() - 90);
      break;
  }
  
  return data.filter(item => {
    const timestamp = item[timestampKey];
    // Handle both Date objects and ISO strings
    const itemDate = timestamp instanceof Date ? timestamp : new Date(timestamp as string);
    return itemDate >= cutoffTime;
  });
}

/**
 * Calculate percentage change between values
 * @param currentValue Current value
 * @param previousValue Previous value
 * @returns Percentage change
 */
export function calculatePercentChange(currentValue: number, previousValue: number): number {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

/**
 * Calculate standard deviation of a set of numbers
 * @param values Array of numeric values
 * @returns Standard deviation
 */
export function calculateStdDev(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate correlation coefficient between two sets of numbers
 * @param xValues First array of values
 * @param yValues Second array of values
 * @returns Correlation coefficient (-1 to 1)
 */
export function calculateCorrelation(xValues: number[], yValues: number[]): number {
  if (xValues.length !== yValues.length || xValues.length === 0) {
    return 0;
  }
  
  const n = xValues.length;
  const xMean = xValues.reduce((sum, val) => sum + val, 0) / n;
  const yMean = yValues.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = xValues[i] - xMean;
    const yDiff = yValues[i] - yMean;
    
    numerator += xDiff * yDiff;
    xDenominator += xDiff * xDiff;
    yDenominator += yDiff * yDiff;
  }
  
  if (xDenominator === 0 || yDenominator === 0) {
    return 0;
  }
  
  return numerator / Math.sqrt(xDenominator * yDenominator);
}

/**
 * Format large numbers for display
 * @param num Number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string
 */
export function formatLargeNumber(num: number, decimals: number = 2): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(decimals)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
  return `$${num.toFixed(decimals)}`;
}

/**
 * Format percentage for display
 * @param value Percentage value
 * @param showSign Whether to show plus sign for positive values
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, showSign: boolean = true, decimals: number = 2): string {
  const sign = value >= 0 && showSign ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Calculate color for heatmap based on a value
 * @param value Numeric value (-1 to 1)
 * @returns HEX color code
 */
export function getHeatmapColor(value: number): string {
  if (value >= 0.7) return '#22c55e'; // Strong positive: green
  if (value >= 0.3) return '#4ade80'; // Moderate positive: lighter green
  if (value >= 0) return '#86efac'; // Weak positive: lightest green
  if (value >= -0.3) return '#fca5a5'; // Weak negative: light red
  if (value >= -0.7) return '#f87171'; // Moderate negative: medium red
  return '#ef4444'; // Strong negative: dark red
}

/**
 * Calculate volume profile for a given price series
 * @param prices Array of price data points
 * @param numBuckets Number of price buckets to create
 * @returns Volume profile data for visualization
 */
export function calculateVolumeProfile(prices: number[], volumes: number[], numBuckets: number = 10): { price: number, volume: number }[] {
  if (prices.length === 0 || volumes.length === 0 || prices.length !== volumes.length) {
    return [];
  }
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const bucketSize = (maxPrice - minPrice) / numBuckets;
  
  // Initialize buckets
  const buckets: { price: number, volume: number }[] = [];
  for (let i = 0; i < numBuckets; i++) {
    const bucketPrice = minPrice + (i * bucketSize) + (bucketSize / 2); // Center of bucket
    buckets.push({ price: bucketPrice, volume: 0 });
  }
  
  // Distribute volumes into buckets
  for (let i = 0; i < prices.length; i++) {
    const price = prices[i];
    const volume = volumes[i];
    const bucketIndex = Math.min(
      numBuckets - 1, 
      Math.floor((price - minPrice) / bucketSize)
    );
    buckets[bucketIndex].volume += volume;
  }
  
  return buckets;
}

/**
 * Calculate moving average for a series of values
 * @param values Array of numeric values
 * @param period Moving average period
 * @returns Array of moving average values
 */
export function calculateMovingAverage(values: number[], period: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(NaN); // Not enough data for full period
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += values[i - j];
    }
    
    result.push(sum / period);
  }
  
  return result;
}

/**
 * Generate order book depth chart data
 * @param bids Array of [price, amount] bid arrays
 * @param asks Array of [price, amount] ask arrays
 * @param levels Number of levels to include
 * @returns Processed data for depth chart visualization
 */
export function generateDepthChartData(
  bids: [number, number][],
  asks: [number, number][],
  levels: number = 20
): { price: number, type: 'bid' | 'ask', depth: number, totalDepth: number }[] {
  // Sort bids in descending order by price
  const sortedBids = [...bids].sort((a, b) => b[0] - a[0]).slice(0, levels);
  
  // Sort asks in ascending order by price
  const sortedAsks = [...asks].sort((a, b) => a[0] - b[0]).slice(0, levels);
  
  // Calculate cumulative depths
  let bidDepth = 0;
  const bidData = sortedBids.map(([price, amount]) => {
    bidDepth += amount;
    return { price, type: 'bid' as const, depth: amount, totalDepth: bidDepth };
  });
  
  let askDepth = 0;
  const askData = sortedAsks.map(([price, amount]) => {
    askDepth += amount;
    return { price, type: 'ask' as const, depth: amount, totalDepth: askDepth };
  });
  
  // Combine bid and ask data
  return [...bidData, ...askData];
}

/**
 * Calculate slippage for a given order size
 * @param orderBookData Order book data with bids and asks
 * @param orderSize Size of the order in base currency
 * @param side 'buy' or 'sell'
 * @returns Estimated slippage percentage
 */
export function calculateSlippage(
  orderBookData: { bids: [number, number][], asks: [number, number][] },
  orderSize: number,
  side: 'buy' | 'sell'
): number {
  const { bids, asks } = orderBookData;
  const orders = side === 'buy' ? asks : bids;
  
  if (orders.length === 0) return 0;
  
  // Get the best price as reference
  const bestPrice = side === 'buy' ? orders[0][0] : orders[0][0];
  
  let remainingSize = orderSize;
  let totalCost = 0;
  
  for (const [price, size] of orders) {
    const fillSize = Math.min(remainingSize, size);
    totalCost += fillSize * price;
    remainingSize -= fillSize;
    
    if (remainingSize <= 0) break;
  }
  
  // If we couldn't fill the entire order, return a high slippage value
  if (remainingSize > 0) return 100;
  
  const avgPrice = totalCost / orderSize;
  const slippage = side === 'buy' 
    ? ((avgPrice - bestPrice) / bestPrice) * 100 
    : ((bestPrice - avgPrice) / bestPrice) * 100;
  
  return Math.max(0, slippage);
}

/**
 * Calculate realized volatility from price data
 * @param prices Array of price data points
 * @param window Number of periods to use for calculation
 * @returns Annualized volatility as a percentage
 */
export function calculateVolatility(prices: number[], window: number = 14): number {
  if (prices.length < 2) return 0;
  
  // Calculate log returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  
  // Use only the most recent 'window' returns
  const recentReturns = returns.slice(-Math.min(window, returns.length));
  
  // Calculate standard deviation of returns
  const stdDev = calculateStdDev(recentReturns);
  
  // Annualize (assuming daily data - multiply by sqrt of trading days in a year)
  return stdDev * Math.sqrt(365) * 100;
} 