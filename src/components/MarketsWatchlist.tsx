import React, { useState, useMemo } from 'react';
import { useBroker } from '../context/BrokerContext';
import { Asset, AssetCategory } from '../types';
import { soundManager } from '../utils/audio';
import { Search, Star, TrendingUp, TrendingDown, ArrowUpRight, Filter, Zap } from 'lucide-react';

interface MarketsWatchlistProps {
  onSelectTradeAsset: (asset: Asset) => void;
}

export const MarketsWatchlist: React.FC<MarketsWatchlistProps> = ({ onSelectTradeAsset }) => {
  const { assets, watchlist, toggleWatchlist, setActiveAsset, setActiveView } = useBroker();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all' | 'watchlist'>('all');
  const [sortBy, setSortBy] = useState<'change' | 'volume' | 'price'>('change');

  // Top gainers & losers
  const sortedGainers = useMemo(() => [...assets].sort((a, b) => b.change24h - a.change24h).slice(0, 3), [assets]);
  const sortedLosers = useMemo(() => [...assets].sort((a, b) => a.change24h - b.change24h).slice(0, 3), [assets]);

  // Filtered and sorted assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory === 'watchlist') {
        return watchlist.includes(asset.symbol);
      }
      if (selectedCategory !== 'all') {
        return asset.category === selectedCategory;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'change') return b.change24h - a.change24h;
      if (sortBy === 'volume') return b.volume24h - a.volume24h;
      if (sortBy === 'price') return b.price - a.price;
      return 0;
    });
  }, [assets, searchQuery, selectedCategory, watchlist, sortBy]);

  const handleTrade = (asset: Asset) => {
    soundManager.playClick();
    setActiveAsset(asset);
    setActiveView('trade');
    if (onSelectTradeAsset) onSelectTradeAsset(asset);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Top Banner Highlights: Gainers & Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Gainers Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 text-[#00ffa3] rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">Top 24h Performers</h3>
            </div>
            <span className="text-[10px] text-white/40 mono font-bold uppercase">Momentum</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {sortedGainers.map(asset => (
              <div
                key={asset.symbol}
                onClick={() => handleTrade(asset)}
                className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] rounded-xl cursor-pointer transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition">{asset.symbol}</span>
                  <span className="text-[10px] text-[#00ffa3] mono font-bold">+{asset.change24h}%</span>
                </div>
                <div className="text-xs mono font-semibold text-white/80">
                  ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.digits, maximumFractionDigits: asset.digits })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers / Dips Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500/20 text-[#ff5f5f] rounded-lg">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">Dip Opportunities</h3>
            </div>
            <span className="text-[10px] text-white/40 mono font-bold uppercase">Mean Reversion</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {sortedLosers.map(asset => (
              <div
                key={asset.symbol}
                onClick={() => handleTrade(asset)}
                className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] rounded-xl cursor-pointer transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition">{asset.symbol}</span>
                  <span className="text-[10px] text-[#ff5f5f] mono font-bold">{asset.change24h}%</span>
                </div>
                <div className="text-xs mono font-semibold text-white/80">
                  ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.digits, maximumFractionDigits: asset.digits })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Filter & Search Toolbar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-markets-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by asset ticker or name (e.g. BTC, NVDA, Gold)..."
              className="w-full bg-black/40 border border-white/10 py-2.5 pl-10 pr-4 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs text-white/60">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase opacity-40">Sort By:</span>
            <select
              id="select-markets-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'change' | 'volume' | 'price')}
              className="bg-black/40 border border-white/10 py-1.5 px-3 rounded-lg text-xs font-medium text-white outline-none cursor-pointer focus:border-indigo-500"
            >
              <option value="change">24h Price Change</option>
              <option value="volume">24h Liquidity Volume</option>
              <option value="price">Asset Price</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Assets' },
            { id: 'watchlist', label: 'Starred Watchlist', icon: Star },
            { id: 'crypto', label: 'Crypto' },
            { id: 'stocks', label: 'Equities' },
            { id: 'forex', label: 'Forex' },
            { id: 'commodities', label: 'Commodities' },
            { id: 'indices', label: 'Indices' }
          ].map(cat => (
            <button
              key={cat.id}
              id={`btn-cat-${cat.id}`}
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory(cat.id as AssetCategory | 'all' | 'watchlist');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'active-tab'
                  : 'glass-btn text-white/50'
              }`}
            >
              {cat.icon && <cat.icon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid / Table View */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs mono">
            <thead className="bg-white/[0.02] text-white/40 border-b border-white/[0.06] text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Fav</th>
                <th className="py-3 px-4">Market Asset</th>
                <th className="py-3 px-3">Live Price (USD)</th>
                <th className="py-3 px-3">24h Change</th>
                <th className="py-3 px-3 hidden md:table-cell">24h Range</th>
                <th className="py-3 px-3 hidden lg:table-cell">24h Volume</th>
                <th className="py-3 px-3 hidden sm:table-cell">Leverage</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredAssets.map(asset => {
                const isStarred = watchlist.includes(asset.symbol);
                const isUp = asset.change24h >= 0;

                return (
                  <tr
                    key={asset.symbol}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => handleTrade(asset)}
                  >
                    {/* Star toggle */}
                    <td
                      className="py-3.5 px-4 text-center"
                      onClick={e => {
                        e.stopPropagation();
                        toggleWatchlist(asset.symbol);
                      }}
                    >
                      <button
                        id={`star-${asset.symbol}`}
                        className="p-1 hover:scale-125 transition"
                        title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isStarred ? 'text-amber-400 fill-amber-400' : 'text-white/20 hover:text-white/50'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Market Asset Name & Icon */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm">
                          {asset.icon}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs sm:text-sm font-sans flex items-center gap-1.5">
                            {asset.symbol}
                            <span className="text-[9px] px-1.5 py-0.5 rounded glass-panel text-indigo-300 font-bold uppercase border border-indigo-500/20">
                              {asset.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-white/40 font-sans truncate max-w-[180px]">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Live Price */}
                    <td className="py-3.5 px-3 font-bold text-white text-xs sm:text-sm mono">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.digits, maximumFractionDigits: asset.digits })}
                    </td>

                    {/* 24h Dynamic */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-xs mono ${
                        isUp ? 'text-[#00ffa3] bg-[#00ffa3]/10' : 'text-[#ff5f5f] bg-[#ff5f5f]/10'
                      }`}>
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{asset.change24h}%
                      </span>
                    </td>

                    {/* 24h High / Low */}
                    <td className="py-3.5 px-3 hidden md:table-cell text-white/60 text-xs mono">
                      <div>H: <span className="text-[#00ffa3]">${asset.high24h.toLocaleString()}</span></div>
                      <div>L: <span className="text-[#ff5f5f]">${asset.low24h.toLocaleString()}</span></div>
                    </td>

                    {/* 24h Volume */}
                    <td className="py-3.5 px-3 hidden lg:table-cell text-white/70 text-xs mono">
                      ${(asset.volume24h / 1e6).toFixed(1)}M
                    </td>

                    {/* Max Leverage */}
                    <td className="py-3.5 px-3 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold mono">
                        {asset.leverageMax}x
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        id={`btn-trade-${asset.symbol}`}
                        onClick={() => handleTrade(asset)}
                        className="flex items-center gap-1.5 ml-auto px-3.5 py-1.5 glass-btn hover:bg-indigo-600 hover:text-white text-indigo-300 font-bold text-xs rounded-lg transition"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-white/40 text-sm">
                    No assets matched your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
