import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { soundManager } from '../utils/audio';

export const OrderBookPanel: React.FC = () => {
  const { orderBook, recentTrades, activeAsset } = useBroker();
  const [tab, setTab] = useState<'book' | 'trades' | 'depth'>('book');

  // Max cumulative for visual depth bars
  const maxBidTotal = orderBook.bids.length > 0 ? orderBook.bids[orderBook.bids.length - 1].total : 1;
  const maxAskTotal = orderBook.asks.length > 0 ? orderBook.asks[0].total : 1;
  const maxTotal = Math.max(maxBidTotal, maxAskTotal, 1);

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl p-4 overflow-hidden select-none">
      {/* Header with Title and Tabs */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Order Book</h3>
        <span className="text-[10px] mono opacity-40">
          Spread {activeAsset.spread} USD
        </span>
      </div>

      {/* Tab Segment Controls */}
      <div className="flex items-center gap-1 mb-3 bg-black/40 p-1 rounded-xl border border-white/10">
        <button
          id="tab-book-orderbook"
          onClick={() => {
            soundManager.playClick();
            setTab('book');
          }}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
            tab === 'book'
              ? 'active-tab'
              : 'text-white/40 hover:text-white'
          }`}
        >
          Book
        </button>
        <button
          id="tab-book-trades"
          onClick={() => {
            soundManager.playClick();
            setTab('trades');
          }}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
            tab === 'trades'
              ? 'active-tab'
              : 'text-white/40 hover:text-white'
          }`}
        >
          Trades
        </button>
        <button
          id="tab-book-depth"
          onClick={() => {
            soundManager.playClick();
            setTab('depth');
          }}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
            tab === 'depth'
              ? 'active-tab'
              : 'text-white/40 hover:text-white'
          }`}
        >
          Depth
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 px-1 py-1 text-[9px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 mb-1">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Tab 1: Order Book */}
      {tab === 'book' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden text-xs mono py-1">
          {/* Asks (Sell Orders) - Red */}
          <div className="flex-1 flex flex-col justify-end space-y-1">
            {orderBook.asks.slice(-6).map((ask, idx) => {
              const depthPct = Math.min(100, (ask.total / maxTotal) * 100);
              return (
                <div key={`ask-${idx}`} className="relative grid grid-cols-3 py-0.5 group">
                  <div
                    className="absolute inset-y-0 right-0 bg-[#ff5f5f]/[0.10] rounded-sm transition-all pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-[#ff5f5f] font-medium z-10">{ask.price.toFixed(activeAsset.digits)}</span>
                  <span className="text-right text-white/70 z-10">{ask.amount.toFixed(activeAsset.digits === 4 ? 0 : 2)}</span>
                  <span className="text-right text-white/40 z-10">{ask.total.toFixed(activeAsset.digits === 4 ? 0 : 2)}</span>
                </div>
              );
            })}
          </div>

          {/* Current Middle Price Spread Strip */}
          <div className="py-2 my-1.5 border-y border-white/5 flex items-center justify-between font-bold bg-white/[0.01] px-1 rounded">
            <span className={`text-sm mono ${activeAsset.change24h >= 0 ? 'text-[#00ffa3]' : 'text-[#ff5f5f]'}`}>
              ${activeAsset.price.toLocaleString(undefined, { minimumFractionDigits: activeAsset.digits, maximumFractionDigits: activeAsset.digits })}
            </span>
            <span className={`text-[10px] mono px-1.5 py-0.5 rounded ${activeAsset.change24h >= 0 ? 'text-[#00ffa3] bg-[#00ffa3]/10' : 'text-[#ff5f5f] bg-[#ff5f5f]/10'}`}>
              {activeAsset.change24h >= 0 ? '+' : ''}{activeAsset.change24h}%
            </span>
          </div>

          {/* Bids (Buy Orders) - Green */}
          <div className="flex-1 flex flex-col justify-start space-y-1">
            {orderBook.bids.slice(0, 6).map((bid, idx) => {
              const depthPct = Math.min(100, (bid.total / maxTotal) * 100);
              return (
                <div key={`bid-${idx}`} className="relative grid grid-cols-3 py-0.5 group">
                  <div
                    className="absolute inset-y-0 right-0 bg-[#00ffa3]/[0.10] rounded-sm transition-all pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-[#00ffa3] font-medium z-10">{bid.price.toFixed(activeAsset.digits)}</span>
                  <span className="text-right text-white/70 z-10">{bid.amount.toFixed(activeAsset.digits === 4 ? 0 : 2)}</span>
                  <span className="text-right text-white/40 z-10">{bid.total.toFixed(activeAsset.digits === 4 ? 0 : 2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Live Trades Stream */}
      {tab === 'trades' && (
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1 text-xs font-mono-numbers">
          {recentTrades.map((tr) => (
            <div key={tr.id} className="grid grid-cols-3 py-0.5 text-[11px] border-b border-white/[0.02]">
              <span className={`font-medium ${tr.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {tr.price.toFixed(activeAsset.digits)}
              </span>
              <span className="text-right text-white/80">{tr.amount}</span>
              <span className="text-right text-white/40">
                {new Date(tr.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
          {recentTrades.length === 0 && (
            <div className="flex items-center justify-center h-32 text-xs text-white/40">
              Connecting to live feed...
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Visual Depth Ladder */}
      {tab === 'depth' && (
        <div className="flex-1 flex flex-col justify-center px-4 py-3 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-white/60">
              <span className="text-emerald-400 font-bold">Total Bids Pressure</span>
              <span className="font-mono text-emerald-300">54.2%</span>
            </div>
            <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden flex border border-white/[0.06]">
              <div className="h-full bg-emerald-500" style={{ width: '54.2%' }} />
              <div className="h-full bg-rose-500" style={{ width: '45.8%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/40 font-mono">
              <span>$142.8M Buyer Liquidity</span>
              <span>$120.6M Seller Liquidity</span>
            </div>
          </div>

          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.05] text-xs space-y-2">
            <div className="flex justify-between text-white/50">
              <span>Order Flow Imbalance:</span>
              <span className="text-emerald-400 font-semibold">+8.4% Buy Skew</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Market Maker Depth:</span>
              <span className="text-cyan-300 font-semibold">Tier-1 Institutional</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Average Slippage:</span>
              <span className="text-white font-mono">&lt; 0.002%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
