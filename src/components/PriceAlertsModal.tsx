import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { soundManager } from '../utils/audio';
import { Bell, X, Trash2, Plus, ArrowUpRight, TrendingDown } from 'lucide-react';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({ isOpen, onClose }) => {
  const { activeAsset, alerts, createAlert, deleteAlert } = useBroker();
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState<string>(
    (activeAsset.price * 1.02).toFixed(activeAsset.digits)
  );

  if (!isOpen) return null;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (!price || price <= 0) return;

    soundManager.playClick();
    createAlert(activeAsset.symbol, price, condition);
    setTargetPrice((activeAsset.price * 1.05).toFixed(activeAsset.digits));
  };

  const handleSetQuickPreset = (pct: number) => {
    soundManager.playClick();
    const newTarget = activeAsset.price * (1 + pct / 100);
    setTargetPrice(newTarget.toFixed(activeAsset.digits));
    setCondition(pct >= 0 ? 'above' : 'below');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in select-none">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85)]">
        {/* Close Button */}
        <button
          id="btn-close-alerts"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-white/50 hover:text-white bg-white/[0.04] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-xl">
            <Bell className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white font-display">Price Trigger Alerts</h2>
        </div>
        <p className="text-xs text-white/50 mb-4">
          Real-time push notifications & acoustic chime when price breaches threshold.
        </p>

        {/* Create Alert Form */}
        <form onSubmit={handleCreateAlert} className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/[0.06] mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">{activeAsset.symbol}</span>
            <span className="font-mono text-cyan-300 font-medium">
              Live: ${activeAsset.price.toLocaleString(undefined, { minimumFractionDigits: activeAsset.digits })}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-alert-condition-above"
              onClick={() => {
                soundManager.playClick();
                setCondition('above');
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                condition === 'above'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/[0.02] text-white/40 border-white/[0.05]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Crosses Above
            </button>

            <button
              type="button"
              id="btn-alert-condition-below"
              onClick={() => {
                soundManager.playClick();
                setCondition('below');
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                condition === 'below'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-white/[0.02] text-white/40 border-white/[0.05]'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Crosses Below
            </button>
          </div>

          {/* Target Price input */}
          <div className="relative">
            <input
              id="input-alert-target-price"
              type="number"
              step="any"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              placeholder="Target Price"
              className="w-full glass-input py-2.5 pl-3 pr-12 text-sm font-mono rounded-xl text-white font-semibold"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 font-mono">
              USD
            </span>
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {[-5, -1, 1, 5].map(pct => (
              <button
                key={pct}
                type="button"
                id={`btn-alert-preset-${pct}`}
                onClick={() => handleSetQuickPreset(pct)}
                className="py-1 text-[10px] font-mono font-semibold rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.04] transition"
              >
                {pct > 0 ? `+${pct}%` : `${pct}%`}
              </button>
            ))}
          </div>

          <button
            id="btn-submit-create-alert"
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition glossy-sheen"
          >
            <Plus className="w-4 h-4" />
            Set Alert Trigger
          </button>
        </form>

        {/* Existing Alerts List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider block mb-1">
            Active Alerts ({(alerts || []).length})
          </span>

          {(alerts || []).map(alert => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-sans">{alert.symbol}</span>
                <span className={alert.condition === 'above' ? 'text-emerald-400' : 'text-rose-400'}>
                  {alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toLocaleString()}
                </span>
              </div>

              <button
                id={`btn-remove-alert-${alert.id}`}
                onClick={() => {
                  soundManager.playClick();
                  deleteAlert(alert.id);
                }}
                className="p-1 text-white/30 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {(!alerts || alerts.length === 0) && (
            <div className="text-center py-4 text-xs text-white/30">
              No active price alerts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
