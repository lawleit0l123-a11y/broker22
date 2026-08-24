import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { MARKET_INSIGHTS_DATABASE } from '../utils/mockData';
import { soundManager } from '../utils/audio';
import { Bot, Sparkles, Send, Activity, ShieldAlert, Cpu } from 'lucide-react';

export const MarketSentinelAI: React.FC = () => {
  const { activeAsset } = useBroker();
  const [query, setQuery] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: number }>>([
    {
      sender: 'ai',
      text: `Sentinel AI online. Monitoring liquidity clusters and momentum signals for ${activeAsset.symbol}. How can I assist your execution strategy?`,
      time: Date.now()
    }
  ]);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Get active asset insight from database or build dynamic fallback
  const insight = MARKET_INSIGHTS_DATABASE[activeAsset.symbol] || {
    symbol: activeAsset.symbol,
    sentiment: activeAsset.change24h >= 0 ? 'buy' : 'neutral',
    score: activeAsset.change24h >= 0 ? 78 : 52,
    summary: `${activeAsset.name} demonstrates firm volume retention across primary liquidity pools with moderate volatility index.`,
    supportLevel: Number((activeAsset.price * 0.96).toFixed(activeAsset.digits)),
    resistanceLevel: Number((activeAsset.price * 1.04).toFixed(activeAsset.digits)),
    rsi: 56.4,
    macdSignal: activeAsset.change24h >= 0 ? 'Bullish Crossover' : 'Neutral Consolidation',
    volatility: 'Medium',
    catalysts: ['Sector rotation flows', 'Open interest expansion', 'Institutional volume rebalancing']
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isThinking) return;

    soundManager.playClick();
    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userText, time: Date.now() }]);
    setIsThinking(true);

    setTimeout(() => {
      let aiResponse = '';
      const lower = userText.toLowerCase();

      if (lower.includes('buy') || lower.includes('long') || lower.includes('entry')) {
        aiResponse = `Analyzing entry for ${activeAsset.symbol}: Technical support sits at $${insight.supportLevel.toLocaleString()}. Given the ${insight.sentiment.replace('_', ' ')} setup and RSI of ${insight.rsi}, an entry near $${activeAsset.price.toLocaleString()} with a strict Stop Loss below $${insight.supportLevel.toLocaleString()} gives an asymmetric Risk:Reward of ~1:2.4.`;
      } else if (lower.includes('stop') || lower.includes('risk') || lower.includes('loss')) {
        aiResponse = `Recommended Risk Protocol: Set Stop Loss at $${insight.supportLevel.toLocaleString()} (-${((1 - insight.supportLevel / activeAsset.price) * 100).toFixed(2)}%) and Take Profit target at $${insight.resistanceLevel.toLocaleString()} (+${((insight.resistanceLevel / activeAsset.price - 1) * 100).toFixed(2)}%). Keep position leverage at or below ${Math.min(10, activeAsset.leverageMax)}x for optimal drawdown protection.`;
      } else if (lower.includes('catalyst') || lower.includes('news') || lower.includes('why')) {
        aiResponse = `Primary ${activeAsset.symbol} catalysts: 1) ${insight.catalysts[0]}, 2) ${insight.catalysts[1] || 'Macro liquidity easing'}, 3) Order flow depth skewing positive.`;
      } else {
        aiResponse = `For ${activeAsset.symbol}, our multi-timeframe algorithm indicates a ${insight.sentiment.toUpperCase()} rating (Score: ${insight.score}/100). Momentum oscillators show ${insight.macdSignal} with key resistance at $${insight.resistanceLevel.toLocaleString()}.`;
      }

      setIsThinking(false);
      soundManager.playClick();
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse, time: Date.now() }]);
    }, 850);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0D14]/80 backdrop-blur-md rounded-2xl border border-white/[0.07] p-4 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-xl text-black">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-display flex items-center gap-1.5">
              Sentinel AI Copilot
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <span className="text-[10px] text-white/40">Real-time Quantitative Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          <Cpu className="w-3 h-3" />
          Score: {insight.score}/100
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05]">
          <span className="text-[10px] text-white/40 font-medium block mb-0.5">Key Support</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            ${insight.supportLevel.toLocaleString()}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05]">
          <span className="text-[10px] text-white/40 font-medium block mb-0.5">Key Resistance</span>
          <span className="text-xs font-mono font-bold text-rose-400">
            ${insight.resistanceLevel.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Quick Signal Summary Box */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-white/70 space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-white">
          <span className="flex items-center gap-1 text-cyan-300">
            <Activity className="w-3.5 h-3.5" />
            {insight.macdSignal}
          </span>
          <span className="text-[10px] font-mono text-white/50">RSI: {insight.rsi}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-white/60">
          {insight.summary}
        </p>
      </div>

      {/* Interactive Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[88%] p-2.5 rounded-2xl ${
                m.sender === 'user'
                  ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 rounded-tr-sm'
                  : 'bg-black/50 text-white/80 border border-white/[0.06] rounded-tl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-white/40 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            Synthesizing order flow parameters...
          </div>
        )}
      </div>

      {/* Prompt suggestions pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2">
        {['Entry Strategy', 'Risk / Stop Loss', 'Macro Catalysts'].map(t => (
          <button
            key={t}
            id={`btn-sentinel-suggest-${t}`}
            onClick={() => {
              setQuery(t);
            }}
            className="px-2 py-0.5 text-[10px] whitespace-nowrap bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white rounded-md border border-white/[0.05] transition"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="relative">
        <input
          id="input-sentinel-query"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Ask Sentinel about ${activeAsset.symbol}...`}
          className="w-full glass-input py-2 pl-3 pr-10 text-xs rounded-xl text-white placeholder:text-white/30"
        />
        <button
          id="btn-sentinel-send"
          type="submit"
          disabled={!query.trim() || isThinking}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cyan-400 hover:text-cyan-300 disabled:opacity-30 transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
