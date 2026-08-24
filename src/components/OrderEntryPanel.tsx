import React, { useState, useMemo } from 'react';
import { useBroker } from '../context/BrokerContext';
import { OrderSide, OrderType } from '../types';
import { soundManager } from '../utils/audio';
import { ShieldCheck, ArrowUpRight, ArrowDownRight, Zap, Target, AlertTriangle } from 'lucide-react';

interface OrderEntryPanelProps {
  onOpenBiometricAuth?: (callback: () => void) => void;
  onRequireBiometric?: (callback: () => void) => void;
}

export const OrderEntryPanel: React.FC<OrderEntryPanelProps> = ({ onOpenBiometricAuth, onRequireBiometric }) => {
  const triggerBiometric = onRequireBiometric || onOpenBiometricAuth;
  const {
    activeAsset,
    portfolio,
    placeOrder,
    user,
    toggleOneClick
  } = useBroker();

  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [sizeInput, setSizeInput] = useState<string>('');
  const [limitPriceInput, setLimitPriceInput] = useState<string>('');
  const [stopPriceInput, setStopPriceInput] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(10);
  const [enableTPSL, setEnableTPSL] = useState<boolean>(false);
  const [tpInput, setTpInput] = useState<string>('');
  const [slInput, setSlInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Maximum allowed leverage for this asset
  const maxLev = activeAsset.leverageMax || 50;
  const currentLeverage = Math.min(leverage, maxLev);

  // Parsed numerical size
  const parsedSize = parseFloat(sizeInput) || 0;
  const currentPrice = activeAsset.price;
  const executionPrice = orderType === 'market' ? currentPrice : (parseFloat(limitPriceInput) || currentPrice);
  const notionalUSD = parsedSize * executionPrice;
  const requiredMargin = currentLeverage > 0 ? notionalUSD / currentLeverage : notionalUSD;

  // Maximum size user can buy with available free margin
  const maxPossibleSize = useMemo(() => {
    if (executionPrice <= 0) return 0;
    const maxNotional = portfolio.freeMargin * currentLeverage;
    const maxSize = maxNotional / executionPrice;
    return Number(maxSize.toFixed(activeAsset.digits === 4 ? 2 : 4));
  }, [portfolio.freeMargin, currentLeverage, executionPrice, activeAsset.digits]);

  // Set percentage of max size
  const handleSetPercent = (pct: number) => {
    soundManager.playClick();
    const s = Number((maxPossibleSize * (pct / 100)).toFixed(activeAsset.digits === 4 ? 2 : 4));
    setSizeInput(s > 0 ? s.toString() : '');
  };

  // Liquidation Price calculation
  const calculatedLiquidationPrice = useMemo(() => {
    if (parsedSize <= 0 || executionPrice <= 0) return 0;
    const liqOffset = (executionPrice / currentLeverage) * 0.9;
    return side === 'buy'
      ? Math.max(0, executionPrice - liqOffset)
      : executionPrice + liqOffset;
  }, [parsedSize, executionPrice, currentLeverage, side]);

  // Calculated Risk/Reward
  const riskRewardRatio = useMemo(() => {
    const tp = parseFloat(tpInput);
    const sl = parseFloat(slInput);
    if (!tp || !sl || executionPrice <= 0) return null;

    const potentialReward = side === 'buy' ? (tp - executionPrice) : (executionPrice - tp);
    const potentialRisk = side === 'buy' ? (executionPrice - sl) : (sl - executionPrice);

    if (potentialRisk <= 0 || potentialReward <= 0) return null;
    return (potentialReward / potentialRisk).toFixed(2);
  }, [tpInput, slInput, executionPrice, side]);

  // Execute Order
  const handleExecute = () => {
    if (parsedSize <= 0) return;

    const executeLogic = () => {
      setIsSubmitting(true);
      setTimeout(() => {
        const res = placeOrder({
          symbol: activeAsset.symbol,
          side,
          type: orderType,
          size: parsedSize,
          price: (orderType === 'limit' || orderType === 'trailing_stop') ? parseFloat(limitPriceInput) : undefined,
          stopPrice: orderType === 'stop' ? parseFloat(stopPriceInput) : undefined,
          takeProfit: enableTPSL && tpInput ? parseFloat(tpInput) : undefined,
          stopLoss: enableTPSL && slInput ? parseFloat(slInput) : undefined,
          leverage: currentLeverage
        });

        setIsSubmitting(false);
        if (res.success) {
          setSizeInput('');
          setTpInput('');
          setSlInput('');
        }
      }, 150);
    };

    // If biometric is enabled and not in 1-click mode, prompt biometric modal
    if (user.biometricEnabled && !user.oneClickTrading && triggerBiometric) {
      triggerBiometric(executeLogic);
    } else {
      executeLogic();
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl p-5 text-white select-none">
      {/* Execution Header with Segmented BUY / SELL toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Execution</h3>
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/[0.08]">
          <button
            id="tab-order-buy"
            onClick={() => {
              soundManager.playClick();
              setSide('buy');
            }}
            className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all ${
              side === 'buy'
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(0,255,163,0.3)]'
                : 'text-white/40 hover:text-white'
            }`}
          >
            BUY
          </button>
          <button
            id="tab-order-sell"
            onClick={() => {
              soundManager.playClick();
              setSide('sell');
            }}
            className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all ${
              side === 'sell'
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(255,95,95,0.3)]'
                : 'text-white/40 hover:text-white'
            }`}
          >
            SELL
          </button>
        </div>
      </div>

      {/* Order Type Selector */}
      <div className="mb-3">
        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1.5">
          Order Type
        </label>
        <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
          {(['market', 'limit', 'stop'] as OrderType[]).map(ot => (
            <button
              key={ot}
              id={`btn-ordertype-${ot}`}
              onClick={() => {
                soundManager.playClick();
                setOrderType(ot);
                if (ot === 'limit' && !limitPriceInput) {
                  setLimitPriceInput(activeAsset.price.toString());
                }
              }}
              className={`py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
                orderType === ot
                  ? 'active-tab'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {ot}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs container */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
        {/* Limit Price Input if Limit Order */}
        {orderType === 'limit' && (
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1.5">
              Limit Price (USD)
            </label>
            <div className="relative">
              <input
                id="input-limit-price"
                type="number"
                step="any"
                value={limitPriceInput}
                onChange={e => setLimitPriceInput(e.target.value)}
                placeholder={activeAsset.price.toString()}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm mono focus:border-indigo-500 outline-none transition-colors text-white placeholder:text-white/20"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-bold opacity-30">
                USD
              </span>
            </div>
          </div>
        )}

        {/* Stop Price Input if Stop Order */}
        {orderType === 'stop' && (
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1.5">
              Trigger Stop Price (USD)
            </label>
            <div className="relative">
              <input
                id="input-stop-price"
                type="number"
                step="any"
                value={stopPriceInput}
                onChange={e => setStopPriceInput(e.target.value)}
                placeholder={activeAsset.price.toString()}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm mono focus:border-indigo-500 outline-none transition-colors text-white placeholder:text-white/20"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-bold opacity-30">
                USD
              </span>
            </div>
          </div>
        )}

        {/* Order Size / Quantity Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
              Amount ({activeAsset.symbol.split('/')[0]})
            </label>
            <span className="text-[10px] mono opacity-40">
              Max: {maxPossibleSize.toLocaleString()}
            </span>
          </div>
          <div className="relative">
            <input
              id="input-order-size"
              type="number"
              step="any"
              value={sizeInput}
              onChange={e => setSizeInput(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm mono focus:border-indigo-500 outline-none transition-colors text-white placeholder:text-white/20"
            />
            <span className="absolute right-3 top-2.5 text-[10px] font-bold opacity-40 text-indigo-300">
              {activeAsset.symbol.split('/')[0]}
            </span>
          </div>

          {/* Quick percentage pills */}
          <div className="flex gap-1.5 mt-2">
            {[25, 50, 75].map(pct => (
              <button
                key={pct}
                id={`btn-percent-${pct}`}
                onClick={() => handleSetPercent(pct)}
                className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold text-center cursor-pointer transition text-white/70"
              >
                {pct}%
              </button>
            ))}
            <button
              id="btn-percent-100"
              onClick={() => handleSetPercent(100)}
              className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-indigo-400 font-bold text-[9px] text-center cursor-pointer transition border border-indigo-500/20"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Leverage Slider */}
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[10px] font-bold uppercase opacity-40 tracking-wider">Leverage</span>
            <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
              {currentLeverage}x
            </span>
          </div>
          <input
            id="slider-leverage"
            type="range"
            min="1"
            max={maxLev}
            value={currentLeverage}
            onChange={e => setLeverage(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[9px] text-white/30 font-mono mt-1">
            <span>1x Spot</span>
            <span>{Math.floor(maxLev / 2)}x</span>
            <span>{maxLev}x Max</span>
          </div>
        </div>

        {/* Collapsible TP / SL Controls */}
        <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-white/80">
              <input
                id="checkbox-enable-tpsl"
                type="checkbox"
                checked={enableTPSL}
                onChange={e => {
                  soundManager.playClick();
                  setEnableTPSL(e.target.checked);
                }}
                className="w-3.5 h-3.5 rounded border-white/20 text-indigo-500 focus:ring-0 focus:ring-offset-0 bg-black/40"
              />
              <span className="flex items-center gap-1 text-[11px]">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Take Profit & Stop Loss
              </span>
            </label>

            {riskRewardRatio && (
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">
                R:R 1:{riskRewardRatio}
              </span>
            )}
          </div>

          {enableTPSL && (
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/[0.05]">
              <div>
                <span className="text-[9px] text-[#00ffa3] font-bold block mb-1 uppercase">Take Profit</span>
                <input
                  id="input-tp-price"
                  type="number"
                  step="any"
                  value={tpInput}
                  onChange={e => setTpInput(e.target.value)}
                  placeholder={side === 'buy' ? (currentPrice * 1.05).toFixed(activeAsset.digits) : (currentPrice * 0.95).toFixed(activeAsset.digits)}
                  className="w-full bg-black/40 border border-white/10 py-1.5 px-2 text-xs font-mono rounded-lg text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <span className="text-[9px] text-[#ff5f5f] font-bold block mb-1 uppercase">Stop Loss</span>
                <input
                  id="input-sl-price"
                  type="number"
                  step="any"
                  value={slInput}
                  onChange={e => setSlInput(e.target.value)}
                  placeholder={side === 'buy' ? (currentPrice * 0.97).toFixed(activeAsset.digits) : (currentPrice * 1.03).toFixed(activeAsset.digits)}
                  className="w-full bg-black/40 border border-white/10 py-1.5 px-2 text-xs font-mono rounded-lg text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Real-time Order Summary Sheet */}
        <div className="space-y-1.5 py-2 px-3 rounded-xl bg-black/20 border border-white/[0.05] text-xs font-mono">
          <div className="flex justify-between text-white/50 text-[10px] font-bold">
            <span className="opacity-40 uppercase">Notional Value</span>
            <span className="mono text-white/90">${notionalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-white/50 text-[10px] font-bold">
            <span className="opacity-40 uppercase">Required Margin</span>
            <span className="mono text-indigo-300">${requiredMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-white/50 text-[10px] font-bold">
            <span className="opacity-40 uppercase">Estimated Fee</span>
            <span className="mono">${(notionalUSD * 0.0004).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white/50 text-[10px] font-bold">
            <span className="opacity-40 uppercase">Est. Liquidation</span>
            <span className="mono text-[#ff5f5f]">
              {calculatedLiquidationPrice > 0 ? `$${calculatedLiquidationPrice.toLocaleString(undefined, { minimumFractionDigits: activeAsset.digits, maximumFractionDigits: activeAsset.digits })}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Controls: 1-Click Toggle & Primary Action Button */}
      <div className="pt-3 mt-2 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs text-white/60">
          <button
            id="btn-toggle-1click"
            onClick={toggleOneClick}
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <Zap className={`w-3.5 h-3.5 ${user.oneClickTrading ? 'text-amber-400 fill-amber-400' : 'text-white/40'}`} />
            <span className="text-[10px] font-bold uppercase opacity-60">{user.oneClickTrading ? '1-Click Active' : '1-Click Off'}</span>
          </button>

          <span className="flex items-center gap-1 text-[10px] font-bold uppercase opacity-40">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            Prime ECN
          </span>
        </div>

        {/* Main Submit Button */}
        <button
          id="btn-submit-order"
          disabled={parsedSize <= 0 || requiredMargin > portfolio.freeMargin || isSubmitting}
          onClick={handleExecute}
          className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-tight flex items-center justify-center gap-2 transition-all ${
            requiredMargin > portfolio.freeMargin
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-not-allowed'
              : parsedSize <= 0
              ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
              : side === 'buy'
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20'
          }`}
        >
          {isSubmitting ? (
            <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : requiredMargin > portfolio.freeMargin ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              Insufficient Margin
            </>
          ) : (
            <>
              {user.biometricEnabled && !user.oneClickTrading && <ShieldCheck className="w-4 h-4" />}
              {side === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
