import { Asset, Candle, MarketInsight, Order, Position, Transaction } from '../types';

export const INITIAL_ASSETS: Asset[] = [
  // Crypto
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    category: 'crypto',
    price: 94820.50,
    change24h: 3.42,
    high24h: 96150.00,
    low24h: 92400.00,
    volume24h: 38450210000,
    digits: 2,
    spread: 0.50,
    leverageMax: 100,
    icon: '₿',
    sparkline: [92400, 93100, 92800, 94200, 93900, 95400, 94820.50],
    marketCap: '$1.86T',
    description: 'The foundational digital gold asset and premier decentralized store of value.'
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum',
    category: 'crypto',
    price: 3420.80,
    change24h: 2.15,
    high24h: 3495.00,
    low24h: 3340.00,
    volume24h: 19200450000,
    digits: 2,
    spread: 0.10,
    leverageMax: 75,
    icon: 'Ξ',
    sparkline: [3340, 3370, 3360, 3410, 3390, 3440, 3420.80],
    marketCap: '$412B',
    description: 'Leading programmable blockchain network powering DeFi and smart contracts.'
  },
  {
    symbol: 'SOL/USD',
    name: 'Solana',
    category: 'crypto',
    price: 198.45,
    change24h: 5.84,
    high24h: 204.50,
    low24h: 187.20,
    volume24h: 8430120000,
    digits: 2,
    spread: 0.05,
    leverageMax: 50,
    icon: '◎',
    sparkline: [187.2, 191.0, 189.5, 194.8, 196.2, 201.0, 198.45],
    marketCap: '$93B',
    description: 'High-throughput Layer 1 network engineered for sub-second global settlement.'
  },
  {
    symbol: 'SUI/USD',
    name: 'Sui Network',
    category: 'crypto',
    price: 3.84,
    change24h: -1.28,
    high24h: 4.12,
    low24h: 3.75,
    volume24h: 1240000000,
    digits: 3,
    spread: 0.002,
    leverageMax: 30,
    icon: '💧',
    sparkline: [3.95, 4.05, 3.88, 4.12, 3.80, 3.76, 3.84],
    marketCap: '$11.2B',
    description: 'Object-centric Layer 1 blockchain offering high-speed parallel execution.'
  },

  // Equities
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'stocks',
    price: 138.45,
    change24h: 4.12,
    high24h: 140.20,
    low24h: 133.50,
    volume24h: 28540000000,
    digits: 2,
    spread: 0.02,
    leverageMax: 20,
    icon: '🟢',
    sparkline: [133.5, 134.8, 136.2, 135.9, 138.9, 140.1, 138.45],
    marketCap: '$3.40T',
    description: 'Pioneer of accelerated computing and global leader in AI hardware architectures.'
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'stocks',
    price: 232.80,
    change24h: 0.85,
    high24h: 234.40,
    low24h: 230.90,
    volume24h: 14200000000,
    digits: 2,
    spread: 0.02,
    leverageMax: 20,
    icon: '',
    sparkline: [230.9, 231.5, 232.0, 231.8, 233.5, 234.1, 232.80],
    marketCap: '$3.55T',
    description: 'Global technology titan with unmatched consumer hardware and services ecosystem.'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    category: 'stocks',
    price: 258.90,
    change24h: -2.34,
    high24h: 268.40,
    low24h: 255.10,
    volume24h: 18900000000,
    digits: 2,
    spread: 0.04,
    leverageMax: 20,
    icon: '⚡',
    sparkline: [265.0, 268.4, 262.1, 260.5, 257.0, 256.2, 258.90],
    marketCap: '$825B',
    description: 'Electric mobility, autonomous AI robotics, and sustainable energy producer.'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    category: 'stocks',
    price: 448.30,
    change24h: 1.14,
    high24h: 451.20,
    low24h: 443.80,
    volume24h: 9800000000,
    digits: 2,
    spread: 0.05,
    leverageMax: 20,
    icon: '田',
    sparkline: [443.8, 445.0, 446.2, 444.9, 449.0, 450.5, 448.30],
    marketCap: '$3.33T',
    description: 'Cloud infrastructure leader, enterprise software powerhouse, and AI frontier investor.'
  },

  // Forex
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'forex',
    price: 1.0845,
    change24h: 0.28,
    high24h: 1.0872,
    low24h: 1.0815,
    volume24h: 85000000000,
    digits: 4,
    spread: 0.0001,
    leverageMax: 100,
    icon: '€',
    sparkline: [1.0815, 1.0830, 1.0825, 1.0850, 1.0840, 1.0865, 1.0845],
    description: 'The most traded currency pair globally, reflecting transatlantic macroeconomic flows.'
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'forex',
    price: 1.2980,
    change24h: -0.15,
    high24h: 1.3025,
    low24h: 1.2940,
    volume24h: 48000000000,
    digits: 4,
    spread: 0.00015,
    leverageMax: 100,
    icon: '£',
    sparkline: [1.3000, 1.3020, 1.2990, 1.2960, 1.2945, 1.2970, 1.2980],
    description: 'Cable pair driven by Bank of England interest rates and UK-US trade fundamentals.'
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'forex',
    price: 154.20,
    change24h: 0.62,
    high24h: 154.85,
    low24h: 153.40,
    volume24h: 62000000000,
    digits: 2,
    spread: 0.01,
    leverageMax: 100,
    icon: '¥',
    sparkline: [153.4, 153.8, 154.1, 153.9, 154.5, 154.7, 154.20],
    description: 'Classic yield-differential pair sensitive to Federal Reserve and BOJ policy stances.'
  },

  // Commodities
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold',
    category: 'commodities',
    price: 2745.50,
    change24h: 1.48,
    high24h: 2758.00,
    low24h: 2718.00,
    volume24h: 34000000000,
    digits: 2,
    spread: 0.25,
    leverageMax: 50,
    icon: '🥇',
    sparkline: [2718, 2728, 2735, 2730, 2748, 2755, 2745.50],
    description: 'Universal sovereign monetary hedge and premier safe-haven precious metal.'
  },
  {
    symbol: 'XAG/USD',
    name: 'Spot Silver',
    category: 'commodities',
    price: 33.85,
    change24h: 2.30,
    high24h: 34.20,
    low24h: 32.90,
    volume24h: 12000000000,
    digits: 2,
    spread: 0.02,
    leverageMax: 40,
    icon: '🥈',
    sparkline: [32.9, 33.2, 33.1, 33.6, 33.4, 34.1, 33.85],
    description: 'High-beta precious and green-industrial metal essential for photovoltaics and tech.'
  },
  {
    symbol: 'USOIL',
    name: 'WTI Crude Oil',
    category: 'commodities',
    price: 71.40,
    change24h: -1.10,
    high24h: 73.10,
    low24h: 70.80,
    volume24h: 22000000000,
    digits: 2,
    spread: 0.03,
    leverageMax: 30,
    icon: '🛢️',
    sparkline: [72.2, 72.8, 73.1, 71.8, 71.2, 70.9, 71.40],
    description: 'Global benchmark light sweet crude oil futures contract.'
  },

  // Indices
  {
    symbol: 'SPX500',
    name: 'S&P 500 Index',
    category: 'indices',
    price: 5864.20,
    change24h: 0.72,
    high24h: 5885.00,
    low24h: 5820.00,
    volume24h: 42000000000,
    digits: 2,
    spread: 0.40,
    leverageMax: 50,
    icon: '📈',
    sparkline: [5820, 5835, 5842, 5838, 5870, 5882, 5864.20],
    description: 'Leading benchmark for large-cap US equities covering 500 leading companies.'
  },
  {
    symbol: 'NDX100',
    name: 'Nasdaq 100 Index',
    category: 'indices',
    price: 20450.80,
    change24h: 1.18,
    high24h: 20580.00,
    low24h: 20210.00,
    volume24h: 31000000000,
    digits: 2,
    spread: 0.80,
    leverageMax: 50,
    icon: '📊',
    sparkline: [20210, 20290, 20380, 20320, 20510, 20560, 20450.80],
    description: 'Top 100 non-financial tech-heavy growth corporations listed on Nasdaq.'
  }
];

// Generates high-fidelity historical OHLCV candles
export function generateCandleHistory(basePrice: number, count: number = 100, intervalMinutes: number = 15): Candle[] {
  const candles: Candle[] = [];
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = intervalMinutes * 60;
  let currentPrice = basePrice * (1 - (count * 0.001));

  for (let i = count; i >= 0; i--) {
    const time = now - (i * intervalSeconds);
    const volatility = basePrice * 0.004;
    const change = (Math.random() - 0.48) * volatility;
    const open = currentPrice;
    const close = open + change;
    const high = Math.max(open, close) + (Math.random() * volatility * 0.8);
    const low = Math.min(open, close) - (Math.random() * volatility * 0.8);
    const volume = Math.floor((basePrice * 2.5) + (Math.random() * basePrice * 8));

    candles.push({
      time,
      open: Number(open.toFixed(4)),
      high: Number(high.toFixed(4)),
      low: Number(low.toFixed(4)),
      close: Number(close.toFixed(4)),
      volume
    });

    currentPrice = close;
  }

  // Ensure last candle matches current price closely
  if (candles.length > 0) {
    candles[candles.length - 1].close = basePrice;
    candles[candles.length - 1].high = Math.max(candles[candles.length - 1].high, basePrice);
    candles[candles.length - 1].low = Math.min(candles[candles.length - 1].low, basePrice);
  }

  return candles;
}

// Indicator math utilities
export function calculateEMA(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const emaArray: (number | null)[] = [];
  let ema = data[0];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      emaArray.push(null);
    } else if (i === period - 1) {
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0);
      ema = sum / period;
      emaArray.push(ema);
    } else {
      ema = (data[i] * k) + (ema * (1 - k));
      emaArray.push(ema);
    }
  }
  return emaArray;
}

export function calculateRSI(closes: number[], period: number = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  if (closes.length < period) return closes.map(() => null);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < closes.length; i++) {
    if (i < period) {
      rsi.push(null);
    } else if (i === period) {
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    } else {
      const diff = closes[i] - closes[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  return rsi;
}

export function calculateBollingerBands(closes: number[], period: number = 20, multiplier: number = 2) {
  const middle: (number | null)[] = [];
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      middle.push(null);
      upper.push(null);
      lower.push(null);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      middle.push(mean);
      upper.push(mean + (multiplier * stdDev));
      lower.push(mean - (multiplier * stdDev));
    }
  }
  return { middle, upper, lower };
}

export const INITIAL_POSITIONS: Position[] = [
  {
    id: 'pos-101',
    symbol: 'BTC/USD',
    side: 'long',
    size: 0.45,
    entryPrice: 92800.00,
    markPrice: 94820.50,
    margin: 4176.00,
    leverage: 10,
    pnl: 909.22,
    pnlPercent: 21.77,
    liquidationPrice: 83520.00,
    takeProfit: 98500.00,
    stopLoss: 90000.00,
    openedAt: Date.now() - 3600000 * 14
  },
  {
    id: 'pos-102',
    symbol: 'NVDA',
    side: 'long',
    size: 50,
    entryPrice: 132.80,
    markPrice: 138.45,
    margin: 664.00,
    leverage: 10,
    pnl: 282.50,
    pnlPercent: 42.54,
    liquidationPrice: 119.52,
    takeProfit: 145.00,
    stopLoss: 128.00,
    openedAt: Date.now() - 3600000 * 28
  },
  {
    id: 'pos-103',
    symbol: 'XAU/USD',
    side: 'short',
    size: 4.0,
    entryPrice: 2752.00,
    markPrice: 2745.50,
    margin: 550.40,
    leverage: 20,
    pnl: 26.00,
    pnlPercent: 4.72,
    liquidationPrice: 2889.60,
    takeProfit: 2710.00,
    stopLoss: 2775.00,
    openedAt: Date.now() - 3600000 * 4
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-301',
    symbol: 'ETH/USD',
    side: 'buy',
    type: 'limit',
    size: 2.5,
    price: 3350.00,
    leverage: 15,
    status: 'open',
    createdAt: Date.now() - 7200000
  },
  {
    id: 'ord-302',
    symbol: 'SOL/USD',
    side: 'buy',
    type: 'limit',
    size: 15,
    price: 191.50,
    leverage: 10,
    status: 'open',
    createdAt: Date.now() - 14400000
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-801',
    type: 'deposit',
    amount: 25000,
    currency: 'USD',
    status: 'completed',
    timestamp: Date.now() - 86400000 * 3,
    method: 'Instant FedWire / SEPA Prime',
    note: 'Initial account funding'
  },
  {
    id: 'tx-802',
    type: 'deposit',
    amount: 10000,
    currency: 'USDC',
    status: 'completed',
    timestamp: Date.now() - 86400000 * 2,
    method: 'Solana USDC Direct',
    txHash: '5Kz7q9...Wb2x19'
  },
  {
    id: 'tx-803',
    type: 'trade_pnl',
    amount: 1450.80,
    currency: 'USD',
    status: 'completed',
    symbol: 'TSLA',
    timestamp: Date.now() - 86400000 * 1,
    note: 'Realized Long Profit 50 shares'
  }
];

export const MARKET_INSIGHTS_DATABASE: Record<string, MarketInsight> = {
  'BTC/USD': {
    symbol: 'BTC/USD',
    sentiment: 'strong_buy',
    score: 88,
    summary: 'Macro structural breakout confirmed above $92,000 with institutional spot accumulation accelerating. Funding rates remain healthy while open interest suggests further leg higher.',
    supportLevel: 91800,
    resistanceLevel: 98000,
    rsi: 64.8,
    macdSignal: 'Bullish Crossover',
    volatility: 'Medium',
    catalysts: ['Institutional ETF inflows surpassing $1.2B weekly', 'Treasury reserve adoption proposals', 'Global liquidity expansion cycle']
  },
  'ETH/USD': {
    symbol: 'ETH/USD',
    sentiment: 'buy',
    score: 74,
    summary: 'Consolidating above 200 EMA support. Layer 2 gas throughput hitting all-time highs and staking yields attracting treasury yield funds.',
    supportLevel: 3280,
    resistanceLevel: 3650,
    rsi: 58.2,
    macdSignal: 'Bullish Crossover',
    volatility: 'Medium',
    catalysts: ['Staking inflows reaching 34M ETH locked', 'Blob capacity scaling upgrade', 'DeFi TVL rebound']
  },
  'SOL/USD': {
    symbol: 'SOL/USD',
    sentiment: 'strong_buy',
    score: 91,
    summary: 'Massive relative strength vs broader market. DEX trading volume flipping central exchanges with surging developer momentum and sub-second finality adoption.',
    supportLevel: 184,
    resistanceLevel: 215,
    rsi: 68.5,
    macdSignal: 'Bullish Crossover',
    volatility: 'High',
    catalysts: ['Firedancer validator testnet performance', 'Payment rails integrations with major card networks', 'Record active addresses']
  },
  'NVDA': {
    symbol: 'NVDA',
    sentiment: 'buy',
    score: 82,
    summary: 'Blackwell architecture rack shipments ramping up to hyperscalers with backlog extended through next 4 quarters. Margins remain above 75%.',
    supportLevel: 130,
    resistanceLevel: 148,
    rsi: 62.1,
    macdSignal: 'Bullish Crossover',
    volatility: 'Medium',
    catalysts: ['Data center AI capital expenditure upgrades', 'Sovereign AI supercomputer contracts', 'Enterprise enterprise copilot adoption']
  },
  'XAU/USD': {
    symbol: 'XAU/USD',
    sentiment: 'buy',
    score: 79,
    summary: 'Central bank gold reserve diversification and sovereign debt monetization dynamics support elevated structural floor despite real rate firmness.',
    supportLevel: 2705,
    resistanceLevel: 2780,
    rsi: 61.4,
    macdSignal: 'Bullish Crossover',
    volatility: 'Low',
    catalysts: ['Global central bank net monthly gold purchases', 'Geopolitical reserve de-dollarization', 'Physical ETF net demand']
  }
};
