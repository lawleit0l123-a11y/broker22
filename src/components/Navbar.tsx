import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { soundManager } from '../utils/audio';
import {
  Search,
  PlusCircle,
  Volume2,
  VolumeX,
  ShieldCheck,
  RefreshCw,
  Bell,
  Sliders,
  Sparkles,
  ChevronDown,
  Activity,
  Key,
  LogOut,
  User,
  Zap,
  Globe
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenDeposit: () => void;
  onOpenKyc: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenDeposit,
  onOpenKyc,
  onOpenSettings
}) => {
  const {
    activeAsset,
    portfolio,
    user,
    accountMode,
    switchAccountMode,
    isLoggedIn,
    marketDataStatus,
    refreshMarketData,
    toggleSound,
    activeView,
    setActiveView,
    setIsAuthModalOpen,
    setAuthModalTab,
    logout,
    toasts
  } = useBroker();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshMarketData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.08] px-3 sm:px-6 py-2.5 select-none">
      <div className="flex items-center justify-between gap-3 max-w-[1920px] mx-auto">
        {/* Left: Brand Logo & Navigation View Links */}
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => {
              soundManager.playClick();
              setActiveView('trade');
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-base shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
              Æ
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tighter uppercase text-white font-sans">
                AETHER.IO
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline">
                PRIME ECN
              </span>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            {[
              { id: 'trade', label: 'Terminal' },
              { id: 'markets', label: 'Live Markets' },
              { id: 'portfolio', label: 'Portfolio & P/L' },
              { id: 'landing', label: 'Institutional Overview' }
            ].map(tab => (
              <button
                key={tab.id}
                id={`nav-link-${tab.id}`}
                onClick={() => {
                  soundManager.playClick();
                  setActiveView(tab.id as 'trade' | 'markets' | 'portfolio' | 'landing');
                }}
                className={`transition-all py-1 px-2.5 rounded-lg text-xs font-semibold ${
                  activeView === tab.id
                    ? 'active-tab text-white'
                    : 'text-white/60 hover:text-white glass-btn'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Center: Global Search Bar & Live Feed Status */}
        <div className="flex-1 max-w-sm hidden lg:flex items-center gap-2">
          <button
            id="btn-global-search-nav"
            onClick={onOpenSearch}
            className="flex-1 flex items-center justify-between px-3 py-1.5 text-xs text-white/50 bg-black/40 hover:bg-black/60 border border-white/[0.08] hover:border-white/[0.2] rounded-xl transition"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Search real assets & tickers...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.08] text-white/60 rounded border border-white/[0.1]">
              ⌘K
            </kbd>
          </button>

          {/* Market Feed Status Indicator */}
          <div
            onClick={handleManualRefresh}
            title="Real-time Binance & Forex Gateway Feed"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-panel text-[11px] font-mono cursor-pointer hover:border-white/20 transition"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                marketDataStatus === 'connected'
                  ? 'bg-[#00ffa3] shadow-[0_0_8px_#00ffa3]'
                  : marketDataStatus === 'connecting'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="text-white/80 hidden xl:inline">
              {marketDataStatus === 'connected' ? 'Binance WS Live' : 'Market Rail Active'}
            </span>
            <RefreshCw className={`w-3 h-3 text-white/40 hover:text-white ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </div>
        </div>

        {/* Right: Mode Toggle, Balance Snapshot, Deposit & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Account Mode Switcher (DEMO vs LIVE) */}
          <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/[0.08]">
            <button
              id="nav-btn-mode-demo"
              onClick={() => switchAccountMode('demo')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                accountMode === 'demo'
                  ? 'active-tab shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Demo $100k
            </button>
            <button
              id="nav-btn-mode-live"
              onClick={() => switchAccountMode('live')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                accountMode === 'live'
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'text-white/40 hover:text-emerald-400'
              }`}
            >
              Live ECN
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            id="btn-nav-toggle-sound"
            onClick={toggleSound}
            className="p-2 rounded-xl text-white/50 hover:text-white glass-btn transition hidden sm:flex"
            title={user.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {user.soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-white/30" />}
          </button>

          {/* Account Equity Snapshot */}
          <div
            id="nav-account-snapshot"
            onClick={() => {
              soundManager.playClick();
              setActiveView('portfolio');
            }}
            className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs cursor-pointer hover:border-white/20 transition group"
          >
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-wider text-white/50 mono leading-tight">
                {accountMode === 'live' ? 'Live Equity' : 'Demo Equity'}
              </span>
              <span className="mono font-bold text-white group-hover:text-indigo-300 transition leading-tight">
                ${portfolio.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Deposit Funds Button */}
          <button
            id="btn-nav-deposit"
            onClick={onOpenDeposit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deposit</span>
          </button>

          {/* User Profile / Auth Modal Trigger */}
          <div className="relative">
            <button
              id="btn-nav-profile-menu"
              onClick={() => {
                soundManager.playClick();
                setShowProfileMenu(!showProfileMenu);
              }}
              className="flex items-center gap-1.5 p-1 rounded-full hover:border-white/30 border border-white/20 transition"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/40 mr-0.5" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-3 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 text-xs animate-in fade-in">
                <div className="pb-2.5 mb-2 border-b border-white/[0.06]">
                  <div className="font-bold text-white text-sm">{user.name}</div>
                  <div className="text-[10px] text-white/40 font-mono truncate">{user.email}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {user.tier}
                    </span>
                    <span className="text-[9px] text-[#00ffa3] font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {user.kycStatus === 'fully_verified' ? 'Fully Verified' : 'Tier 1 Basic'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    id="btn-menu-account-profile"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setAuthModalTab('profile');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400" />
                      Account & Security
                    </span>
                  </button>

                  <button
                    id="btn-menu-api-keys"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setAuthModalTab('apikeys');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition"
                  >
                    <span className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      API Keys & Quant Bots
                    </span>
                  </button>

                  <button
                    id="btn-menu-kyc"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenKyc();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#00ffa3]" />
                      KYC Verification
                    </span>
                    <span className="text-[10px] text-indigo-300 font-mono">
                      {user.kycStatus === 'fully_verified' ? 'Passed' : 'Upgrade'}
                    </span>
                  </button>

                  <button
                    id="btn-menu-settings"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition"
                  >
                    <span className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-white/50" />
                      Preferences
                    </span>
                  </button>

                  <div className="pt-1.5 border-t border-white/[0.06]">
                    <button
                      id="btn-menu-switch-account"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setAuthModalTab('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-indigo-300 hover:bg-indigo-500/10 transition font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Switch / Login Account
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
