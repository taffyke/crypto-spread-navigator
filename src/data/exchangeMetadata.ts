// Exchange metadata for improved categorization and analysis

// Exchange categories
export type ExchangeCategory = 'tier1' | 'tier2' | 'dex' | 'derivatives' | 'us' | 'asia' | 'europe' | 'global';

// Exchange region mapping
export type ExchangeRegion = 'global' | 'us' | 'asia' | 'europe' | 'other';

// Exchange status for operational health
export type ExchangeStatus = 'operational' | 'issues' | 'maintenance' | 'degraded';

// Enhanced metadata for each exchange
export interface ExchangeMetadata {
  id: string;
  name: string;
  categories: ExchangeCategory[];
  region: ExchangeRegion;
  tradingVolume: number; // Daily trading volume in millions USD
  reliability: number; // 1-100 score
  status: ExchangeStatus;
  liquidityScore: number; // 1-100 score
  feeScore: number; // 1-100 score (higher is better - lower fees)
  yearEstablished?: number;
  depositMethods?: string[];
  withdrawalMethods?: string[];
  features?: string[];
  logoUrl?: string;
}

// Exchange metadata for all supported exchanges
export const exchangeMetadata: Record<string, ExchangeMetadata> = {
  'Binance': {
    id: 'binance',
    name: 'Binance',
    categories: ['tier1', 'global'],
    region: 'global',
    tradingVolume: 12000,
    reliability: 95,
    status: 'operational',
    liquidityScore: 97,
    feeScore: 88,
    yearEstablished: 2017,
    depositMethods: ['crypto', 'wire', 'credit card'],
    withdrawalMethods: ['crypto', 'wire'],
    features: ['futures', 'margin', 'staking', 'lending'],
    logoUrl: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png'
  },
  'Coinbase': {
    id: 'coinbase',
    name: 'Coinbase',
    categories: ['tier1', 'us'],
    region: 'us',
    tradingVolume: 5000,
    reliability: 92,
    status: 'operational',
    liquidityScore: 90,
    feeScore: 70,
    yearEstablished: 2012,
    depositMethods: ['ach', 'wire', 'paypal', 'credit card'],
    withdrawalMethods: ['crypto', 'paypal', 'ach', 'wire'],
    features: ['staking', 'institutional services'],
    logoUrl: 'https://cryptologos.cc/logos/coinbase-coin-logo.png'
  },
  'Kraken': {
    id: 'kraken',
    name: 'Kraken',
    categories: ['tier1', 'us'],
    region: 'us',
    tradingVolume: 2000,
    reliability: 93,
    status: 'operational',
    liquidityScore: 88,
    feeScore: 80,
    yearEstablished: 2011,
    depositMethods: ['wire', 'crypto'],
    withdrawalMethods: ['crypto', 'wire'],
    features: ['futures', 'margin', 'staking', 'dark pool'],
    logoUrl: 'https://cryptologos.cc/logos/kraken-logo.png'
  },
  'KuCoin': {
    id: 'kucoin',
    name: 'KuCoin',
    categories: ['tier1', 'asia'],
    region: 'asia',
    tradingVolume: 3500,
    reliability: 87,
    status: 'operational',
    liquidityScore: 85,
    feeScore: 85,
    yearEstablished: 2017,
    depositMethods: ['crypto'],
    withdrawalMethods: ['crypto'],
    features: ['futures', 'margin', 'lending', 'staking'],
    logoUrl: 'https://cryptologos.cc/logos/kucoin-kcs-logo.png'
  },
  'Bybit': {
    id: 'bybit',
    name: 'Bybit',
    categories: ['tier1', 'derivatives', 'asia'],
    region: 'asia',
    tradingVolume: 5500,
    reliability: 85,
    status: 'operational',
    liquidityScore: 87,
    feeScore: 83,
    yearEstablished: 2018,
    depositMethods: ['crypto'],
    withdrawalMethods: ['crypto'],
    features: ['futures', 'margin'],
    logoUrl: 'https://cryptologos.cc/logos/bybit-logo.png'
  },
  'OKX': {
    id: 'okx',
    name: 'OKX',
    categories: ['tier1', 'asia'],
    region: 'asia',
    tradingVolume: 4000,
    reliability: 86,
    status: 'operational',
    liquidityScore: 86,
    feeScore: 82,
    yearEstablished: 2017,
    depositMethods: ['crypto'],
    withdrawalMethods: ['crypto'],
    features: ['futures', 'margin', 'staking'],
    logoUrl: 'https://cryptologos.cc/logos/okb-okb-logo.png'
  },
  'Bitfinex': {
    id: 'bitfinex',
    name: 'Bitfinex',
    categories: ['tier1', 'global'],
    region: 'global',
    tradingVolume: 1200,
    reliability: 84,
    status: 'operational',
    liquidityScore: 83,
    feeScore: 80,
    yearEstablished: 2012,
    depositMethods: ['crypto', 'wire'],
    withdrawalMethods: ['crypto', 'wire'],
    features: ['margin', 'lending', 'otc'],
    logoUrl: 'https://cryptologos.cc/logos/bitfinex-logo.png'
  },
  'Gate.io': {
    id: 'gate_io',
    name: 'Gate.io',
    categories: ['tier2', 'global'],
    region: 'asia',
    tradingVolume: 800,
    reliability: 83,
    status: 'operational',
    liquidityScore: 78,
    feeScore: 85,
    yearEstablished: 2013,
    depositMethods: ['crypto'],
    withdrawalMethods: ['crypto'],
    features: ['margin', 'lending', 'staking'],
    logoUrl: 'https://cryptologos.cc/logos/gate-logo.png'
  },
  'Gemini': {
    id: 'gemini',
    name: 'Gemini',
    categories: ['tier1', 'us'],
    region: 'us',
    tradingVolume: 700,
    reliability: 91,
    status: 'operational',
    liquidityScore: 82,
    feeScore: 75,
    yearEstablished: 2014,
    depositMethods: ['wire', 'ach', 'debit card'],
    withdrawalMethods: ['crypto', 'wire', 'ach'],
    features: ['custody', 'otc', 'clearing'],
    logoUrl: 'https://cryptologos.cc/logos/gemini-dollar-gusd-logo.png'
  },
  'Bitget': {
    id: 'bitget',
    name: 'Bitget',
    categories: ['tier2', 'asia'],
    region: 'asia',
    tradingVolume: 1100,
    reliability: 82,
    status: 'operational',
    liquidityScore: 79,
    feeScore: 84,
    yearEstablished: 2018,
    depositMethods: ['crypto'],
    withdrawalMethods: ['crypto'],
    features: ['futures', 'copy trading', 'margin'],
    logoUrl: 'https://cryptologos.cc/logos/bitget-logo.png'
  },
  'Poloniex': {
    id: 'poloniex',
    name: 'Poloniex',
    categories: ['tier2', 'global'],
    region: 'global',
    tradingVolume: 450,
    reliability: 80,
    status: 'operational',
    liquidityScore: 75,
    feeScore: 82,
    yearEstablished: 2014,
    depositMethods: ['crypto'],
    withdrawalMethods: ['crypto'],
    features: ['margin', 'lending'],
    logoUrl: 'https://cryptologos.cc/logos/poloniex-logo.png'
  },
  'AscendEX': {
    id: 'ascendex',
    name: 'AscendEX',
    categories: ['tier2', 'asia'],
    region: 'asia',
    tradingVolume: 380,
    reliability: 79,
    status: 'operational',
    liquidityScore: 74,
    feeScore: 83,
    yearEstablished: 2018,
    depositMethods: ['crypto'],
    withdrawalMethods: ['crypto'],
    features: ['futures', 'margin', 'staking'],
    logoUrl: 'https://cryptologos.cc/logos/ascendex-logo.png'
  },
  'Bitrue': {
    id: 'bitrue',
    name: 'Bitrue',
    categories: ['tier2', 'asia'],
    region: 'asia',
    tradingVolume: 400,
    reliability: 75,
    status: 'operational',
    liquidityScore: 72,
    feeScore: 82,
    yearEstablished: 2018,
    depositMethods: ['crypto'],
    withdrawalMethods: ['crypto'],
    features: ['margin', 'lending', 'staking'],
    logoUrl: 'https://cryptologos.cc/logos/bitrue-logo.png'
  },
  'MEXC Global': {
    id: 'mexc_global',
    name: 'MEXC Global',
    categories: ['tier2', 'asia'],
    region: 'asia',
    tradingVolume: 850,
    reliability: 77,
    status: 'operational',
    liquidityScore: 79,
    feeScore: 86,
    yearEstablished: 2018,
    depositMethods: ['crypto'],
    withdrawalMethods: ['crypto'],
    features: ['futures', 'margin', 'staking'],
    logoUrl: 'https://cryptologos.cc/logos/mexc-logo.png'
  },
  'HTX': {
    id: 'htx',
    name: 'HTX',
    categories: ['tier2', 'asia'],
    region: 'asia',
    tradingVolume: 900,
    reliability: 79,
    status: 'operational',
    liquidityScore: 78,
    feeScore: 81,
    yearEstablished: 2013,
    depositMethods: ['crypto'],
    withdrawalMethods: ['crypto'],
    features: ['futures', 'margin', 'staking'],
    logoUrl: 'https://cryptologos.cc/logos/htx-logo.png'
  }
};

// Get a list of exchanges by category
export function getExchangesByCategory(category: ExchangeCategory): string[] {
  return Object.values(exchangeMetadata)
    .filter(exchange => exchange.categories.includes(category))
    .map(exchange => exchange.name);
}

// Get a list of exchanges by region
export function getExchangesByRegion(region: ExchangeRegion): string[] {
  return Object.values(exchangeMetadata)
    .filter(exchange => exchange.region === region)
    .map(exchange => exchange.name);
}

// Get top exchanges by liquidity
export function getTopExchangesByLiquidity(limit: number = 5): ExchangeMetadata[] {
  return Object.values(exchangeMetadata)
    .sort((a, b) => b.liquidityScore - a.liquidityScore)
    .slice(0, limit);
}

// Get exchange metadata by name
export function getExchangeMetadata(name: string): ExchangeMetadata | undefined {
  return exchangeMetadata[name];
}

// Exchange category presets for quick filtering
export const exchangePresets = {
  'tier1': getExchangesByCategory('tier1'),
  'us': getExchangesByCategory('us'),
  'asia': getExchangesByCategory('asia'),
  'europe': getExchangesByCategory('europe'),
  'derivatives': getExchangesByCategory('derivatives'),
}; 