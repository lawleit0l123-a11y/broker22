import React from 'react';
import { useBroker } from '../context/BrokerContext';
import { soundManager } from '../utils/audio';
import {
  Zap,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  Globe2,
  Lock,
  BarChart2,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface LandingViewProps {
  onStartTrading: () => void;
  onOpenDeposit: () => void;
  onOpenKyc: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartTrading,
  onOpenDeposit,
  onOpenKyc
}) => {
  const { assets, setActiveAsset } = useBroker();

  const handleLaunchTrade = (symbol?: string) => {
    soundManager.playClick();
    if (symbol) {
      const found = assets.find(a => a.symbol === symbol);
      if (found) setActiveAsset(found);
    }
    onStartTrading();
  };

  return (
    <div className="space-y-16 max-w-7xl mx-auto pb-24 select-none">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 text-center space-y-6">
        {/* Futuristic Ambient Glow Backdrop */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-xs font-bold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Institutional Prime Brokerage</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Architected for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">Pure Speed</span> and Sovereign Execution.
        </h1>

        <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
          Access raw ECN liquidity across digital assets, tech equities, precious metals, and foreign exchange with sub-millisecond execution and algorithmic risk shielding.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            id="btn-hero-launch-terminal"
            onClick={() => handleLaunchTrade()}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Zap className="w-4 h-4" />
            Launch Pro Terminal ($100K Demo)
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="btn-hero-deposit"
            onClick={onOpenDeposit}
            className="flex items-center gap-2 px-5 py-3.5 glass-btn text-white font-bold text-sm rounded-xl transition"
          >
            Instant Deposit Rails
          </button>

          <button
            id="btn-hero-kyc"
            onClick={onOpenKyc}
            className="flex items-center gap-1.5 px-4 py-3.5 text-xs text-white/50 hover:text-white transition font-bold"
          >
            <ShieldCheck className="w-4 h-4 text-[#00ffa3]" />
            Tier-1 Verification
          </button>
        </div>

        {/* Live Streaming Ticker Strip */}
        <div className="pt-10">
          <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 scrollbar-none">
            {assets.slice(0, 6).map(asset => {
              const isUp = asset.change24h >= 0;
              return (
                <div
                  key={asset.symbol}
                  onClick={() => handleLaunchTrade(asset.symbol)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass-panel hover:bg-white/[0.06] transition cursor-pointer group shrink-0"
                >
                  <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition flex items-center gap-1.5">
                    <span>{asset.icon}</span>
                    <span>{asset.symbol}</span>
                  </div>
                  <div className="text-xs mono font-bold text-white">
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.digits, maximumFractionDigits: asset.digits })}
                  </div>
                  <div className={`text-[11px] mono font-bold ${isUp ? 'text-[#00ffa3]' : 'text-[#ff5f5f]'}`}>
                    {isUp ? '+' : ''}{asset.change24h}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 Core Pillars of Aether Prime */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Institutional Technology Stack
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-lg mx-auto mono">
            Engineered for high-frequency quantitative traders, family offices, and sovereign capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-300 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Sub-1ms ECN Matching</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Direct market access through our low-latency matching engine connected to global Tier-1 liquidity providers.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-[#00ffa3] w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Sovereign Cold Custody</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Multi-party computation (MPC) and segregated collateral vaults ensuring client assets are never co-mingled.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-300 w-fit">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Asset Collateral</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Cross-margin with crypto, tech stocks, and cash in a single unified portfolio with real-time mark-to-market pricing.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-300 w-fit">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">REST & FIX 4.4 APIs</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Programmatic order routing, WebSocket tick feeds, and FIX gateway for institutional automated trading bots.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Aether Prime vs. Traditional Retail Brokers
          </h2>
          <p className="text-xs text-white/50 mono">
            Why professional traders migrate their capital to Aether Prime.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs mono">
            <thead className="bg-white/[0.02] text-white/40 border-b border-white/[0.06] text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="py-3 px-4">Feature / Specification</th>
                <th className="py-3 px-4 text-indigo-300 font-bold">Aether Prime ECN</th>
                <th className="py-3 px-4 text-white/40">Legacy Retail Brokers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-white">Execution Latency</td>
                <td className="py-3.5 px-4 text-indigo-300 font-bold">&lt; 0.8ms Direct Memory</td>
                <td className="py-3.5 px-4 text-white/40">250ms - 800ms B-Book Delay</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-white">EUR/USD & BTC Spreads</td>
                <td className="py-3.5 px-4 text-[#00ffa3] font-bold">Raw from 0.0 - 0.2 bps</td>
                <td className="py-3.5 px-4 text-white/40">1.8 - 4.5 bps Marked-up</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-white">Order Routing Model</td>
                <td className="py-3.5 px-4 text-white font-medium">100% ECN / STP Direct Liquidity</td>
                <td className="py-3.5 px-4 text-white/40">Internal Dealing Desk (PFOF)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-white">Maximum Leverage Tier</td>
                <td className="py-3.5 px-4 text-white font-medium">Up to 100x Cross-Margin</td>
                <td className="py-3.5 px-4 text-white/40">Strictly 5x - 30x Capped</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-white">Security & Biometrics</td>
                <td className="py-3.5 px-4 text-indigo-300 font-bold">FIDO2 Hardware + Neural Biometrics</td>
                <td className="py-3.5 px-4 text-white/40">Basic SMS / Email OTP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <section className="glass-panel p-8 sm:p-12 rounded-2xl text-center relative overflow-hidden border border-indigo-500/30">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-cyan-500/10 pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Start Trading in Seconds
          </h2>
          <p className="text-xs sm:text-sm text-white/60">
            Every new account is provisioned with $100,000 in simulated demo capital and instant access to all 50+ institutional markets.
          </p>
          <div className="pt-2">
            <button
              id="btn-bottom-start-trading"
              onClick={() => handleLaunchTrade()}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition-all inline-flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Launch Trading Terminal Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
