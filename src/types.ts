export type AssetCategory = 'crypto' | 'stocks' | 'forex' | 'commodities' | 'indices';

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  digits: number;
  spread: number;
  leverageMax: number;
  icon: string;
  sparkline: number[];
  marketCap?: string;
  description: string;
}

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';
export type ChartType = 'candles' | 'area' | 'hollow' | 'heikin';

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
}

export interface MarketTrade {
  id: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  time: number;
}

export type OrderType = 'market' | 'limit' | 'stop' | 'trailing_stop';
export type OrderSide = 'buy' | 'sell';
export type PositionSide = 'long' | 'short';

export interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  size: number; // Quantity in units
  entryPrice: number;
  markPrice: number;
  margin: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
  takeProfit?: number;
  stopLoss?: number;
  openedAt: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  size: number;
  price?: number;
  stopPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
  leverage: number;
  status: 'open' | 'filled' | 'cancelled';
  createdAt: number;
  filledAt?: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'trade_pnl' | 'fee' | 'dividend';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
  method?: string;
  txHash?: string;
  symbol?: string;
  note?: string;
}

export interface PortfolioSummary {
  balance: number; // Cash balance
  equity: number;  // Cash + Unrealized PnL
  freeMargin: number;
  usedMargin: number;
  marginLevel: number; // Percentage (equity / usedMargin * 100)
  unrealizedPnl: number;
  realizedPnlToday: number;
  totalPnlPercent: number;
  winRate: number;
  totalTrades: number;
  sharpeRatio: number;
  profitFactor: number;
  maxDrawdown: number;
}

export type AccountMode = 'live' | 'demo';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  permissions: ('read' | 'trade' | 'withdraw')[];
  createdAt: number;
  lastUsed?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  tier: 'Starter' | 'Pro Prime' | 'Institutional Prime';
  accountNumber: string;
  kycStatus: 'unverified' | 'tier1_verified' | 'fully_verified';
  biometricEnabled: boolean;
  twoFactorEnabled?: boolean;
  soundEnabled: boolean;
  oneClickTrading: boolean;
  currency: string;
  accountMode: AccountMode;
  apiKeys?: ApiKey[];
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncedAt: number;
  phone?: string;
  country?: string;
}

export interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  tier: 'Starter' | 'Pro Prime' | 'Institutional Prime';
  accountNumber: string;
  kycStatus: 'unverified' | 'tier1_verified' | 'fully_verified';
  liveBalance: number;
  demoBalance: number;
  currency: string;
  createdAt: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered: boolean;
  note?: string;
}

export interface MarketInsight {
  symbol: string;
  sentiment: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  score: number; // 0 to 100
  summary: string;
  supportLevel: number;
  resistanceLevel: number;
  rsi: number;
  macdSignal: 'Bullish Crossover' | 'Bearish Crossover' | 'Neutral Consolidation';
  volatility: 'Low' | 'Medium' | 'High' | 'Extreme';
  catalysts: string[];
}
