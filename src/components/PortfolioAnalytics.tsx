import React from 'react';
import { useBroker } from '../context/BrokerContext';
import { soundManager } from '../utils/audio';
import {
  TrendingUp,
  PieChart,
  Award,
  Download,
  PlusCircle,
  ArrowDownCircle,
  RefreshCcw,
  BarChart3
} from 'lucide-react';

interface PortfolioAnalyticsProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({
  onOpenDeposit,
  onOpenWithdraw
}) => {
  const { portfolio, positions, transactions, user, claimDemoFaucet, resetAccount, addToast } = useBroker();

  // Export CSV Statement
  const handleExportCSV = () => {
    soundManager.playClick();
    const rows = [
      ['Transaction ID', 'Type', 'Amount', 'Currency', 'Symbol/Method', 'Status', 'Date'],
      ...transactions.map(t => [
        t.id,
        t.type,
        t.amount.toString(),
        t.currency,
        `"${t.note || t.symbol || t.method || ''}"`,
        t.status,
        new Date(t.timestamp).toISOString()
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aether_Broker_Statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Statement Exported', 'Aether portfolio CSV statement generated and downloaded', 'success');
  };

  // Asset allocation percentages
  const totalEquity = Math.max(1, portfolio.equity);
  const cryptoPositionsVal = positions.filter(p => p.symbol.includes('/USD') && !['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'XAG/USD'].includes(p.symbol)).reduce((a, b) => a + b.margin + b.pnl, 0);
  const stockPositionsVal = positions.filter(p => ['NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL'].includes(p.symbol)).reduce((a, b) => a + b.margin + b.pnl, 0);
  const commoPositionsVal = positions.filter(p => ['XAU/USD', 'XAG/USD', 'USOIL'].includes(p.symbol)).reduce((a, b) => a + b.margin + b.pnl, 0);
  const forexPositionsVal = positions.filter(p => ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'].includes(p.symbol)).reduce((a, b) => a + b.margin + b.pnl, 0);
  const cashVal = Math.max(0, portfolio.freeMargin);

  const allocations = [
    { name: 'Cash / Collateral', val: cashVal, color: '#38BDF8', pct: Math.round((cashVal / totalEquity) * 100) },
    { name: 'Digital Assets (Crypto)', val: cryptoPositionsVal, color: '#00F2FE', pct: Math.round((cryptoPositionsVal / totalEquity) * 100) },
    { name: 'Equities & Tech', val: stockPositionsVal, color: '#10B981', pct: Math.round((stockPositionsVal / totalEquity) * 100) },
    { name: 'Precious Metals', val: commoPositionsVal, color: '#F59E0B', pct: Math.round((commoPositionsVal / totalEquity) * 100) },
    { name: 'Global Currencies', val: forexPositionsVal, color: '#A78BFA', pct: Math.round((forexPositionsVal / totalEquity) * 100) }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase glass-panel text-indigo-300 border border-indigo-500/20">
              {user.tier}
            </span>
            <span className="text-xs text-white/40 mono">Account #{user.accountNumber}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Portfolio & Risk Analytics
          </h1>
          <p className="text-xs text-white/40 mono mt-0.5">
            Real-time Mark-to-Market valuation, Sharpe metrics, and collateral utilization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-portfolio-deposit"
            onClick={onOpenDeposit}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Deposit Funds
          </button>

          <button
            id="btn-portfolio-withdraw"
            onClick={onOpenWithdraw}
            className="flex items-center gap-2 px-4 py-2.5 glass-btn text-white font-bold text-xs rounded-xl transition"
          >
            <ArrowDownCircle className="w-4 h-4 text-indigo-400" />
            Withdraw
          </button>

          <button
            id="btn-portfolio-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 glass-btn text-white/70 hover:text-white font-bold text-xs rounded-xl transition"
            title="Download CSV Statement"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            id="btn-portfolio-faucet"
            onClick={claimDemoFaucet}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl transition"
            title="Claim +$50,000 Faucet"
          >
            +$50K Faucet
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Equity */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Total Net Equity</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mono text-white tracking-tight">
            ${portfolio.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs mono">
            <span className={`font-semibold ${portfolio.unrealizedPnl >= 0 ? 'text-[#00ffa3]' : 'text-[#ff5f5f]'}`}>
              {portfolio.unrealizedPnl >= 0 ? '+' : ''}${portfolio.unrealizedPnl.toFixed(2)} ({portfolio.totalPnlPercent}%)
            </span>
            <span className="text-white/40 text-[10px] uppercase">Unrealized</span>
          </div>
        </div>

        {/* Free Collateral Margin */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Free Margin Available</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-[#00ffa3]">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mono text-white tracking-tight">
            ${portfolio.freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs mono text-white/50">
            <span className="text-[10px] uppercase opacity-60">Used Margin:</span>
            <span className="text-white/90 font-medium">${portfolio.usedMargin.toFixed(2)}</span>
          </div>
        </div>

        {/* Margin Level & Risk */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Margin Health Level</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mono text-indigo-300 tracking-tight">
            {portfolio.marginLevel.toFixed(1)}%
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-[#00ffa3] font-medium mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
            Safe (Buffer &gt; 80%)
          </div>
        </div>

        {/* Realized Profit Today */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Realized P&L (Today)</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-300">
              <RefreshCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mono text-[#00ffa3] tracking-tight">
            +${portfolio.realizedPnlToday.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40 mono">
            <span className="text-[10px] uppercase">Win Rate: </span>
            <span className="text-white font-medium">{portfolio.winRate}%</span>
          </div>
        </div>
      </div>

      {/* Quantitative Trading Analytics & Performance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sharpe Ratio & Risk Breakdown */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Institutional Risk & Alpha Statistics</h2>
              <p className="text-xs text-white/40 mono">Calculated over 90-day rolling execution window</p>
            </div>
            <span className="text-[10px] mono px-2.5 py-1 glass-panel text-indigo-300 rounded-lg border border-indigo-500/20 font-bold uppercase">
              ECN Benchmark
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1">Sharpe Ratio</span>
              <span className="text-xl font-bold mono text-indigo-300">{portfolio.sharpeRatio}</span>
              <span className="text-[10px] text-[#00ffa3] block mt-1 mono font-semibold">Institutional Grade (&gt;2.5)</span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1">Profit Factor</span>
              <span className="text-xl font-bold mono text-[#00ffa3]">{portfolio.profitFactor}</span>
              <span className="text-[10px] text-white/40 block mt-1 mono">Gross Win / Gross Loss</span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1">Max Drawdown</span>
              <span className="text-xl font-bold mono text-[#ff5f5f]">{portfolio.maxDrawdown}%</span>
              <span className="text-[10px] text-white/40 block mt-1 mono">Strict Risk Boundary</span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1">Win Rate</span>
              <span className="text-xl font-bold mono text-white">{portfolio.winRate}%</span>
              <span className="text-[10px] text-[#00ffa3] block mt-1 mono">36 of 48 Trades Won</span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1">Avg Trade R:R</span>
              <span className="text-xl font-bold mono text-indigo-300">1 : 2.45</span>
              <span className="text-[10px] text-white/40 block mt-1 mono">Asymmetric Edge</span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1">Total Executed</span>
              <span className="text-xl font-bold mono text-white">{portfolio.totalTrades} Orders</span>
              <span className="text-[10px] text-white/40 block mt-1 mono">Sub-10ms latency</span>
            </div>
          </div>

          {/* Performance Trajectory Simulated Area */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">30-Day Growth Trajectory</span>
              <span className="text-[#00ffa3] mono font-bold">+28.4% Cumulative Net</span>
            </div>

            {/* SVG Visual Curve */}
            <div className="w-full h-28 relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,80 Q 50,75 100,60 T 200,45 T 300,25 T 400,10 L 400,100 L 0,100 Z"
                  fill="url(#equityGrad)"
                />
                <path
                  d="M 0,80 Q 50,75 100,60 T 200,45 T 300,25 T 400,10"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                />
                {/* Glowing Dot on Latest Point */}
                <circle cx="400" cy="10" r="4" fill="#6366f1" className="animate-pulse" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Asset Allocation Breakdown */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Asset Allocation</h2>
          </div>

          {/* Allocation Progress Bars */}
          <div className="space-y-3.5">
            {allocations.map(item => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-xs mono">
                  <span className="text-white/70 font-sans">{item.name}</span>
                  <span className="font-bold text-white">${item.val.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({item.pct}%)</span>
                </div>
                <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Risk Advisory Note */}
          <div className="p-4 rounded-xl bg-indigo-500/[0.05] border border-indigo-500/20 text-xs text-white/60 space-y-1.5">
            <div className="font-bold text-indigo-300">Collateral Diversification: Balanced</div>
            <p className="text-[11px] leading-relaxed">
              Your portfolio margin is protected by multi-asset risk tiering and algorithmic stop protocols.
            </p>
          </div>

          {/* Reset Account Option */}
          <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center">
            <span className="text-xs text-white/40 mono">Demo Testing Environment</span>
            <button
              id="btn-portfolio-reset"
              onClick={resetAccount}
              className="text-xs text-[#ff5f5f] hover:text-rose-300 font-bold hover:underline"
            >
              Reset to $100K Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
