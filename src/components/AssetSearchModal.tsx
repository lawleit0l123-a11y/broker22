import React, { useState, useEffect, useMemo } from 'react';
import { useBroker } from '../context/BrokerContext';
import { Asset, AssetCategory } from '../types';
import { soundManager } from '../utils/audio';
import { Search, X, Star, ArrowUpRight, TrendingDown } from 'lucide-react';

interface AssetSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetSearchModal: React.FC<AssetSearchModalProps> = ({ isOpen, onClose }) => {
  const { assets, setActiveAsset, watchlist, toggleWatchlist, setActiveView } = useBroker();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AssetCategory | 'all'>('all');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const match = a.symbol.toLowerCase().includes(query.toLowerCase()) ||
                    a.name.toLowerCase().includes(query.toLowerCase());
      if (!match) return false;
      if (category !== 'all') return a.category === category;
      return true;
    });
  }, [assets, query, category]);

  if (!isOpen) return null;

  const handleSelect = (asset: Asset) => {
    soundManager.playClick();
    setActiveAsset(asset);
    setActiveView('trade');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-xl animate-in fade-in select-none">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-5 border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative flex items-center mb-4">
          <Search className="w-5 h-5 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-palette-search"
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search all 50+ institutional instruments by symbol or name..."
            className="w-full glass-input py-3 pl-11 pr-10 text-sm text-white placeholder:text-white/30 rounded-2xl"
          />
          <button
            id="btn-close-palette"
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/40 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-white/[0.06] overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'crypto', label: 'Crypto' },
            { id: 'stocks', label: 'Equities' },
            { id: 'forex', label: 'Forex' },
            { id: 'commodities', label: 'Metals / Energy' },
            { id: 'indices', label: 'Indices' }
          ].map(c => (
            <button
              key={c.id}
              id={`btn-search-cat-${c.id}`}
              onClick={() => {
                soundManager.playClick();
                setCategory(c.id as AssetCategory | 'all');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                category === c.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Assets List */}
        <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1 text-xs">
          {filteredAssets.map(asset => {
            const isStarred = watchlist.includes(asset.symbol);
            const isUp = asset.change24h >= 0;

            return (
              <div
                key={asset.symbol}
                onClick={() => handleSelect(asset)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/[0.04] hover:border-white/[0.12] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-sm">
                    {asset.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs sm:text-sm group-hover:text-cyan-300 transition">
                        {asset.symbol}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-white/50 font-mono uppercase">
                        {asset.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/40 font-sans">
                      {asset.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="font-mono-numbers">
                    <div className="font-bold text-white text-xs sm:text-sm">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.digits, maximumFractionDigits: asset.digits })}
                    </div>
                    <div className={`text-[11px] flex items-center justify-end gap-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isUp ? '+' : ''}{asset.change24h}%
                    </div>
                  </div>

                  <button
                    id={`btn-palette-star-${asset.symbol}`}
                    onClick={e => {
                      e.stopPropagation();
                      toggleWatchlist(asset.symbol);
                    }}
                    className="p-1.5 rounded-lg text-white/20 hover:text-amber-400 transition"
                  >
                    <Star className={`w-4 h-4 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredAssets.length === 0 && (
            <div className="py-8 text-center text-white/30 text-xs">
              No matching instruments found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
