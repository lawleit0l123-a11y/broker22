import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { Position } from '../types';
import { soundManager } from '../utils/audio';
import { Layers, ListOrdered, History, X, Edit3, Check, DollarSign } from 'lucide-react';

export const PositionsDrawer: React.FC = () => {
  const {
    positions,
    orders,
    transactions,
    closePosition,
    updatePositionTPSL,
    cancelOrder,
    portfolio
  } = useBroker();

  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [editingPosId, setEditingPosId] = useState<string | null>(null);
  const [editTP, setEditTP] = useState<string>('');
  const [editSL, setEditSL] = useState<string>('');

  const handleStartEdit = (pos: Position) => {
    soundManager.playClick();
    setEditingPosId(pos.id);
    setEditTP(pos.takeProfit ? pos.takeProfit.toString() : '');
    setEditSL(pos.stopLoss ? pos.stopLoss.toString() : '');
  };

  const handleSaveEdit = (posId: string) => {
    soundManager.playClick();
    updatePositionTPSL(
      posId,
      editTP ? parseFloat(editTP) : undefined,
      editSL ? parseFloat(editSL) : undefined
    );
    setEditingPosId(null);
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden select-none">
      {/* Header Tabs & Quick Account Snapshot */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-white/[0.06] bg-white/[0.01]">
        {/* Left Tabs */}
        <div className="flex items-center gap-5 text-xs font-bold">
          <button
            id="tab-drawer-positions"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('positions');
            }}
            className={`flex items-center gap-1.5 pb-1 transition-all ${
              activeTab === 'positions'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Open Positions ({positions.length})
          </button>

          <button
            id="tab-drawer-orders"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('orders');
            }}
            className={`flex items-center gap-1.5 pb-1 transition-all ${
              activeTab === 'orders'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Pending Orders ({orders.length})
          </button>

          <button
            id="tab-drawer-history"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('history');
            }}
            className={`flex items-center gap-1.5 pb-1 transition-all ${
              activeTab === 'history'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Order & Trade History
          </button>
        </div>

        {/* Right Summary Badges */}
        <div className="flex items-center gap-4 text-xs mono">
          <div className="flex items-center gap-1.5">
            <span className="opacity-40 uppercase text-[10px] font-bold">Total Unrealized PnL:</span>
            <span className={`font-bold ${portfolio.unrealizedPnl >= 0 ? 'text-[#00ffa3]' : 'text-[#ff5f5f]'}`}>
              {portfolio.unrealizedPnl >= 0 ? '+' : ''}${portfolio.unrealizedPnl.toFixed(2)} ({portfolio.totalPnlPercent}%)
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 opacity-40 text-[10px] font-bold">
            <span className="uppercase">Margin Level:</span>
            <span className={`mono text-xs ${portfolio.marginLevel < 150 ? 'text-[#ff5f5f]' : 'text-indigo-300'}`}>
              {portfolio.marginLevel.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-[160px]">
        {/* Tab 1: Positions Table */}
        {activeTab === 'positions' && (
          <div className="w-full min-w-[760px]">
            <table className="w-full text-left text-xs font-mono-numbers">
              <thead className="bg-white/[0.02] text-white/40 border-b border-white/[0.04] text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Instrument</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Entry Price</th>
                  <th className="py-2.5 px-3">Mark Price</th>
                  <th className="py-2.5 px-3">Liq. Price</th>
                  <th className="py-2.5 px-3">Margin</th>
                  <th className="py-2.5 px-3">Unrealized P&L</th>
                  <th className="py-2.5 px-3">TP / SL</th>
                  <th className="py-2.5 px-4 text-right">Close Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {positions.map(pos => {
                  const isEditing = editingPosId === pos.id;
                  const isProfit = pos.pnl >= 0;

                  return (
                    <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Instrument */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-sans text-white text-xs">{pos.symbol}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            pos.side === 'long' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {pos.side} {pos.leverage}x
                          </span>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-3 text-white/90 font-medium">
                        {pos.size} {pos.symbol.split('/')[0]}
                      </td>

                      {/* Entry Price */}
                      <td className="py-3 px-3 text-white/70">
                        ${pos.entryPrice.toLocaleString()}
                      </td>

                      {/* Mark Price */}
                      <td className="py-3 px-3 text-white font-medium">
                        ${pos.markPrice.toLocaleString()}
                      </td>

                      {/* Liq Price */}
                      <td className="py-3 px-3 text-rose-400/80">
                        ${pos.liquidationPrice.toLocaleString()}
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-3 text-white/70">
                        ${pos.margin.toFixed(2)}
                      </td>

                      {/* P&L */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? '+' : ''}${pos.pnl.toFixed(2)}
                          </span>
                          <span className={`text-[10px] ${isProfit ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                            {isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      {/* TP / SL Target */}
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              placeholder="TP"
                              value={editTP}
                              onChange={e => setEditTP(e.target.value)}
                              className="w-16 px-1.5 py-0.5 text-[10px] glass-input rounded text-emerald-300"
                            />
                            <input
                              type="number"
                              placeholder="SL"
                              value={editSL}
                              onChange={e => setEditSL(e.target.value)}
                              className="w-16 px-1.5 py-0.5 text-[10px] glass-input rounded text-rose-300"
                            />
                            <button
                              id={`save-tpsl-${pos.id}`}
                              onClick={() => handleSaveEdit(pos.id)}
                              className="p-1 bg-cyan-500/20 text-cyan-300 rounded hover:bg-cyan-500/30"
                              title="Save"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              id={`cancel-tpsl-${pos.id}`}
                              onClick={() => setEditingPosId(null)}
                              className="p-1 bg-white/5 text-white/40 rounded hover:text-white"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => handleStartEdit(pos)}>
                            <div className="text-[10px] text-white/60">
                              <div>TP: <span className="text-emerald-400">{pos.takeProfit ? `$${pos.takeProfit}` : 'None'}</span></div>
                              <div>SL: <span className="text-rose-400">{pos.stopLoss ? `$${pos.stopLoss}` : 'None'}</span></div>
                            </div>
                            <Edit3 className="w-3 h-3 text-white/30 group-hover:text-cyan-300 transition" />
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-partial-close-50-${pos.id}`}
                            onClick={() => closePosition(pos.id, 50)}
                            className="px-2 py-1 text-[10px] font-semibold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-md border border-white/[0.06] transition"
                            title="Close 50% Position"
                          >
                            50%
                          </button>
                          <button
                            id={`btn-close-position-${pos.id}`}
                            onClick={() => closePosition(pos.id, 100)}
                            className="px-2.5 py-1 text-[10px] font-bold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 rounded-md border border-rose-500/30 transition shadow-sm"
                          >
                            Market Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {positions.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-white/30 text-xs">
                      No open positions active. Use the order panel to initiate a trade.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Open Orders Table */}
        {activeTab === 'orders' && (
          <div className="w-full min-w-[640px]">
            <table className="w-full text-left text-xs font-mono-numbers">
              <thead className="bg-white/[0.02] text-white/40 border-b border-white/[0.04] text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Instrument & Type</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3">Order Price</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Leverage</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-sans text-white text-xs">{order.symbol}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/80 font-mono uppercase">
                          {order.type}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`font-bold uppercase ${order.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {order.side}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-cyan-300 font-medium">
                      ${(order.price || order.stopPrice || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-white/90">
                      {order.size} {order.symbol.split('/')[0]}
                    </td>

                    <td className="py-3 px-3 text-white/70">
                      {order.leverage}x
                    </td>

                    <td className="py-3 px-3 text-white/40 text-[11px]">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        id={`btn-cancel-order-${order.id}`}
                        onClick={() => cancelOrder(order.id)}
                        className="px-2.5 py-1 text-[10px] font-semibold text-white/50 hover:text-rose-300 bg-white/[0.03] hover:bg-rose-500/20 rounded-md border border-white/[0.06] hover:border-rose-500/30 transition"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-white/30 text-xs">
                      No pending limit or stop orders currently in book.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="w-full min-w-[640px]">
            <table className="w-full text-left text-xs font-mono-numbers">
              <thead className="bg-white/[0.02] text-white/40 border-b border-white/[0.04] text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Event Type</th>
                  <th className="py-2.5 px-3">Details / Asset</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {transactions.slice(0, 15).map(tx => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className={`w-3.5 h-3.5 ${
                          tx.type === 'deposit' ? 'text-emerald-400' : tx.type === 'withdraw' ? 'text-amber-400' : 'text-cyan-400'
                        }`} />
                        <span className="capitalize font-sans font-medium text-white/90">{tx.type.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-white/70">
                      {tx.note || tx.symbol || tx.method || 'ECN Settlement'}
                    </td>

                    <td className="py-3 px-3 font-semibold">
                      <span className={tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {tx.amount >= 0 ? '+' : '-'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.currency}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 capitalize font-sans">
                        {tx.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-white/40 text-[11px]">
                      {new Date(tx.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
