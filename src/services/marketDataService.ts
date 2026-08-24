import { Asset, Candle, MarketTrade, OrderBook, Timeframe } from '../types';
import { generateCandleHistory } from '../utils/mockData';

// Map our platform symbols to Binance USDT pairs
export const BINANCE_SYMBOL_MAP: Record<string, string> = {
  'BTC/USD': 'BTCUSDT',
  'ETH/USD': 'ETHUSDT',
  'SOL/USD': 'SOLUSDT',
  'SUI/USD': 'SUIUSDT',
  'BNB/USD': 'BNBUSDT',
  'XRP/USD': 'XRPUSDT',
  'DOGE/USD': 'DOGEUSDT',
  'AVAX/USD': 'AVAXUSDT',
  'ADA/USD': 'ADAUSDT',
  'LINK/USD': 'LINKUSDT',
  'NEAR/USD': 'NEARUSDT',
  'PEPE/USD': 'PEPEUSDT'
};

export const BINANCE_TIMEFRAME_MAP: Record<Timeframe, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1D': '1d',
  '1W': '1w'
};

export interface LiveMarketUpdate {
  symbol: string;
  price: number;
  change24h?: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'fallback' | 'offline';

class MarketDataService {
  private ws: WebSocket | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimer: any = null;
  private activeCryptoSymbol: string = 'BTC/USD';
  private activeTimeframe: Timeframe = '15m';

  // Listeners
  private tickerListeners: Array<(update: LiveMarketUpdate) => void> = [];
  private candleListeners: Array<(candle: Candle, symbol: string, tf: Timeframe) => void> = [];
  private tradeListeners: Array<(trade: MarketTrade, symbol: string) => void> = [];
  private orderBookListeners: Array<(book: OrderBook, symbol: string) => void> = [];
  private statusListeners: Array<(status: ConnectionStatus) => void> = [];

  private currentStatus: ConnectionStatus = 'connecting';

  constructor() {
    // Start WebSocket connection
    this.initWebSocket();
    // Start periodic real Forex & Commodity updates
    this.initForexPolling();
  }

  public getStatus(): ConnectionStatus {
    return this.currentStatus;
  }

  public onStatusChange(listener: (status: ConnectionStatus) => void) {
    this.statusListeners.push(listener);
    listener(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  public onTickerUpdate(listener: (update: LiveMarketUpdate) => void) {
    this.tickerListeners.push(listener);
    return () => {
      this.tickerListeners = this.tickerListeners.filter(l => l !== listener);
    };
  }

  public onCandleUpdate(listener: (candle: Candle, symbol: string, tf: Timeframe) => void) {
    this.candleListeners.push(listener);
    return () => {
      this.candleListeners = this.candleListeners.filter(l => l !== listener);
    };
  }

  public onTradeUpdate(listener: (trade: MarketTrade, symbol: string) => void) {
    this.tradeListeners.push(listener);
    return () => {
      this.tradeListeners = this.tradeListeners.filter(l => l !== listener);
    };
  }

  public onOrderBookUpdate(listener: (book: OrderBook, symbol: string) => void) {
    this.orderBookListeners.push(listener);
    return () => {
      this.orderBookListeners = this.orderBookListeners.filter(l => l !== listener);
    };
  }

  private updateStatus(status: ConnectionStatus) {
    this.currentStatus = status;
    this.statusListeners.forEach(l => l(status));
  }

  /**
   * Initialize Binance Public Real-Time WebSocket
   */
  private initWebSocket() {
    if (typeof window === 'undefined' || !window.WebSocket) return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.updateStatus('connecting');
      // Connect to combined stream for multi-ticker updates
      const streams = [
        '!miniTicker@arr'
      ].join('/');

      this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.updateStatus('connected');
        this.subscribeActiveStreams();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Mini-ticker array (All market tickers simultaneously)
          if (Array.isArray(data)) {
            data.forEach((item: any) => {
              const binanceSymbol = item.s;
              // Find matching platform symbol
              const platformSymbol = Object.keys(BINANCE_SYMBOL_MAP).find(
                k => BINANCE_SYMBOL_MAP[k] === binanceSymbol
              );

              if (platformSymbol) {
                const currentPrice = parseFloat(item.c);
                const openPrice = parseFloat(item.o);
                const highPrice = parseFloat(item.h);
                const lowPrice = parseFloat(item.l);
                const volume = parseFloat(item.v);
                const change24h = openPrice > 0 ? Number((((currentPrice - openPrice) / openPrice) * 100).toFixed(2)) : 0;

                const update: LiveMarketUpdate = {
                  symbol: platformSymbol,
                  price: currentPrice,
                  change24h,
                  high24h: highPrice,
                  low24h: lowPrice,
                  volume24h: volume * currentPrice
                };

                this.tickerListeners.forEach(l => l(update));
              }
            });
          } else if (data.e === 'kline') {
            // Kline realtime update for active symbol
            const k = data.k;
            const binanceSymbol = data.s;
            const platformSymbol = Object.keys(BINANCE_SYMBOL_MAP).find(
              key => BINANCE_SYMBOL_MAP[key] === binanceSymbol
            );

            if (platformSymbol && k) {
              const candle: Candle = {
                time: Math.floor(k.t / 1000),
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
                volume: parseFloat(k.v)
              };

              const tf = (Object.keys(BINANCE_TIMEFRAME_MAP) as Timeframe[]).find(
                t => BINANCE_TIMEFRAME_MAP[t] === k.i
              ) || this.activeTimeframe;

              this.candleListeners.forEach(l => l(candle, platformSymbol, tf));
            }
          } else if (data.e === 'trade') {
            // Real market trade stream
            const binanceSymbol = data.s;
            const platformSymbol = Object.keys(BINANCE_SYMBOL_MAP).find(
              key => BINANCE_SYMBOL_MAP[key] === binanceSymbol
            );

            if (platformSymbol) {
              const trade: MarketTrade = {
                id: `binance-${data.t}`,
                price: parseFloat(data.p),
                amount: parseFloat(data.q),
                side: data.m ? 'sell' : 'buy', // In Binance, m = true means buyer is maker -> sell
                time: data.T
              };
              this.tradeListeners.forEach(l => l(trade, platformSymbol));
            }
          }
        } catch {}
      };

      this.ws.onerror = () => {
        this.updateStatus('fallback');
      };

      this.ws.onclose = () => {
        this.updateStatus('fallback');
        this.scheduleReconnect();
      };
    } catch {
      this.updateStatus('fallback');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(10000, 1500 * Math.pow(1.5, this.reconnectAttempts));
      this.reconnectTimer = setTimeout(() => {
        this.initWebSocket();
      }, delay);
    }
  }

  /**
   * Subscribe to specific kline and trade stream when user changes active symbol / timeframe
   */
  public setActiveSymbolAndTimeframe(symbol: string, tf: Timeframe) {
    this.activeCryptoSymbol = symbol;
    this.activeTimeframe = tf;
    this.subscribeActiveStreams();
  }

  private subscribeActiveStreams() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const binanceSymbol = BINANCE_SYMBOL_MAP[this.activeCryptoSymbol];
    if (!binanceSymbol) return;

    const interval = BINANCE_TIMEFRAME_MAP[this.activeTimeframe] || '15m';
    const klineStream = `${binanceSymbol.toLowerCase()}@kline_${interval}`;
    const tradeStream = `${binanceSymbol.toLowerCase()}@trade`;

    const subMsg = {
      method: 'SUBSCRIBE',
      params: [klineStream, tradeStream],
      id: Date.now()
    };

    try {
      this.ws.send(JSON.stringify(subMsg));
    } catch {}
  }

  /**
   * Fetch Real Historical Candlesticks from Binance REST API or High-fidelity Generator
   */
  public async fetchRealCandles(asset: Asset, timeframe: Timeframe): Promise<Candle[]> {
    const binanceSymbol = BINANCE_SYMBOL_MAP[asset.symbol];
    const binanceInterval = BINANCE_TIMEFRAME_MAP[timeframe] || '15m';

    if (binanceSymbol) {
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=150`;
        const res = await fetch(url);
        if (res.ok) {
          const rawData = await res.json();
          if (Array.isArray(rawData) && rawData.length > 0) {
            const candles: Candle[] = rawData.map((item: any) => ({
              time: Math.floor(item[0] / 1000),
              open: parseFloat(item[1]),
              high: parseFloat(item[2]),
              low: parseFloat(item[3]),
              close: parseFloat(item[4]),
              volume: parseFloat(item[5])
            }));
            return candles;
          }
        }
      } catch (err) {
        console.warn(`Falling back to synthesized candles for ${asset.symbol}:`, err);
      }
    }

    // For Forex, Commodities, Stocks, or if network restricts Binance API, generate realistic candles matching current real price
    const intervalMinutes = timeframe === '1m' ? 1 : timeframe === '5m' ? 5 : timeframe === '15m' ? 15 : timeframe === '1h' ? 60 : timeframe === '4h' ? 240 : timeframe === '1D' ? 1440 : 10080;
    return generateCandleHistory(asset.price, 120, intervalMinutes);
  }

  /**
   * Fetch Real Order Book Depth from Binance REST API
   */
  public async fetchRealOrderBook(symbol: string): Promise<OrderBook | null> {
    const binanceSymbol = BINANCE_SYMBOL_MAP[symbol];
    if (!binanceSymbol) return null;

    try {
      const url = `https://api.binance.com/api/v3/depth?symbol=${binanceSymbol}&limit=20`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let cumBid = 0;
        const bids = (data.bids || []).slice(0, 10).map((b: string[]) => {
          const price = parseFloat(b[0]);
          const amount = parseFloat(b[1]);
          cumBid += amount;
          return { price, amount: Number(amount.toFixed(4)), total: Number(cumBid.toFixed(4)) };
        });

        let cumAsk = 0;
        const asks = (data.asks || []).slice(0, 10).map((a: string[]) => {
          const price = parseFloat(a[0]);
          const amount = parseFloat(a[1]);
          cumAsk += amount;
          return { price, amount: Number(amount.toFixed(4)), total: Number(cumAsk.toFixed(4)) };
        });

        const spread = asks.length > 0 && bids.length > 0 ? Number((asks[0].price - bids[0].price).toFixed(4)) : 0.5;
        return { bids, asks: asks.reverse(), spread };
      }
    } catch {}

    return null;
  }

  /**
   * Periodic real-world Forex & Commodities exchange rate fetching
   */
  private initForexPolling() {
    const fetchForex = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          const rates = data.rates;
          if (rates) {
            // EUR/USD = 1 / rates.EUR
            if (rates.EUR) {
              const eurUsd = Number((1 / rates.EUR).toFixed(4));
              this.tickerListeners.forEach(l => l({ symbol: 'EUR/USD', price: eurUsd }));
            }
            // GBP/USD = 1 / rates.GBP
            if (rates.GBP) {
              const gbpUsd = Number((1 / rates.GBP).toFixed(4));
              this.tickerListeners.forEach(l => l({ symbol: 'GBP/USD', price: gbpUsd }));
            }
            // USD/JPY = rates.JPY
            if (rates.JPY) {
              const usdJpy = Number(rates.JPY.toFixed(2));
              this.tickerListeners.forEach(l => l({ symbol: 'USD/JPY', price: usdJpy }));
            }
          }
        }
      } catch {}
    };

    // Initial fetch
    fetchForex();
    // Poll every 30 seconds
    setInterval(fetchForex, 30000);
  }
}

export const marketDataService = new MarketDataService();
