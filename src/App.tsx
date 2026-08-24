import React, { useState } from 'react';
import { BrokerProvider, useBroker } from './context/BrokerContext';
import { Navbar } from './components/Navbar';
import { InteractiveChart } from './components/InteractiveChart';
import { OrderEntryPanel } from './components/OrderEntryPanel';
import { OrderBookPanel } from './components/OrderBookPanel';
import { PositionsDrawer } from './components/PositionsDrawer';
import { PortfolioAnalytics } from './components/PortfolioAnalytics';
import { MarketsWatchlist } from './components/MarketsWatchlist';
import { LandingView } from './components/LandingView';
import { MarketSentinelAI } from './components/MarketSentinelAI';
import { DepositWithdrawModal } from './components/DepositWithdrawModal';
import { AssetSearchModal } from './components/AssetSearchModal';
import { KycModal } from './components/KycModal';
import { SettingsModal } from './components/SettingsModal';
import { PriceAlertsModal } from './components/PriceAlertsModal';
import { BiometricAuthModal } from './components/BiometricAuthModal';
import { AuthModal } from './components/AuthModal';
import { soundManager } from './utils/audio';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  BookOpen,
  Bot
} from 'lucide-react';

const BrokerApp: React.FC = () => {
  const {
    activeView,
    setActiveView,
    toasts,
    dismissToast,
    activeAsset
  } = useBroker();

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositInitialTab, setDepositInitialTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);
  const [biometricCallback, setBiometricCallback] = useState<(() => void) | null>(null);

  // Right sidebar tab toggle: OrderBook or Sentinel AI
  const [rightPanelTab, setRightPanelTab] = useState<'book' | 'ai'>('book');

  // Trigger biometric execution modal
  const handleTriggerBiometric = (onSuccess: () => void) => {
    setBiometricCallback(() => onSuccess);
    setIsBiometricOpen(true);
  };

  const handleOpenDeposit = () => {
    soundManager.playClick();
    setDepositInitialTab('deposit');
    setIsDepositOpen(true);
  };

  const handleOpenWithdraw = () => {
    soundManager.playClick();
    setDepositInitialTab('withdraw');
    setIsDepositOpen(true);
  };

  return (
    <div
      className="min-h-screen bg-[#090a0c] text-[#e0e0e0] flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200"
      style={{ background: 'radial-gradient(circle at 0% 0%, #1a1c23 0%, #090a0c 50%)' }}
    >
      {/* Immersive Ambient Glow Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none z-0" />

      {/* Top Navigation */}
      <Navbar
        onOpenSearch={() => {
          soundManager.playClick();
          setIsSearchOpen(true);
        }}
        onOpenDeposit={handleOpenDeposit}
        onOpenKyc={() => {
          soundManager.playClick();
          setIsKycOpen(true);
        }}
        onOpenSettings={() => {
          soundManager.playClick();
          setIsSettingsOpen(true);
        }}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto relative z-10">
        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: TRADING TERMINAL */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'trade' && (
          <div className="space-y-4 max-w-[1920px] mx-auto">
            {/* Top Grid: Chart & Order Entry & Order Book */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 8 Cols: Interactive Chart */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <InteractiveChart onOpenAlerts={() => setIsAlertsOpen(true)} />
                {/* Positions Drawer in main desktop layout */}
                <div className="hidden lg:block h-[260px]">
                  <PositionsDrawer />
                </div>
              </div>

              {/* Right 4 Cols: Order Entry & OrderBook / Sentinel */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Order Entry Panel */}
                <OrderEntryPanel onRequireBiometric={handleTriggerBiometric} />

                {/* Right Panel Sub-tab Toggle: OrderBook vs Sentinel AI */}
                <div className="glass-panel rounded-2xl p-1 flex items-center gap-1">
                  <button
                    id="tab-toggle-orderbook"
                    onClick={() => {
                      soundManager.playClick();
                      setRightPanelTab('book');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
                      rightPanelTab === 'book'
                        ? 'active-tab text-white'
                        : 'text-white/50 hover:text-white glass-btn'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Order Book & Depth
                  </button>

                  <button
                    id="tab-toggle-sentinel"
                    onClick={() => {
                      soundManager.playClick();
                      setRightPanelTab('ai');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
                      rightPanelTab === 'ai'
                        ? 'active-tab text-white'
                        : 'text-white/50 hover:text-white glass-btn'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Sentinel AI
                  </button>
                </div>

                {/* Switchable Component */}
                <div className="h-[340px]">
                  {rightPanelTab === 'book' ? (
                    <OrderBookPanel />
                  ) : (
                    <MarketSentinelAI />
                  )}
                </div>
              </div>
            </div>

            {/* Mobile / Tablet Positions Drawer below */}
            <div className="block lg:hidden h-[280px]">
              <PositionsDrawer />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: MARKETS & WATCHLIST */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'markets' && (
          <MarketsWatchlist
            onSelectTradeAsset={() => {
              // Asset is selected inside component, view set to trade
            }}
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: PORTFOLIO ANALYTICS */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'portfolio' && (
          <PortfolioAnalytics
            onOpenDeposit={handleOpenDeposit}
            onOpenWithdraw={handleOpenWithdraw}
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 4: INSTITUTIONAL LANDING OVERVIEW */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'landing' && (
          <LandingView
            onStartTrading={() => setActiveView('trade')}
            onOpenDeposit={handleOpenDeposit}
            onOpenKyc={() => setIsKycOpen(true)}
          />
        )}
      </main>

      {/* Immersive UI Footer Status Bar */}
      <footer className="relative z-10 px-4 sm:px-6 py-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-white/50 select-none">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="glass-panel px-3 py-1 rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-[9px] text-[#00ffa3]">NY Server Sync: 12ms</span>
          </div>
          <span className="font-mono opacity-40 uppercase tracking-wider hidden sm:inline">Session ID: 491-AXQ-90L</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full border border-black bg-slate-700" />
            <div className="w-5 h-5 rounded-full border border-black bg-indigo-700" />
            <div className="w-5 h-5 rounded-full border border-black bg-slate-600 flex items-center justify-center text-[8px] font-bold text-white">
              +8
            </div>
          </div>
          <span className="font-bold uppercase tracking-wider text-[9px] opacity-60 hidden sm:inline">
            Premium Insights Active
          </span>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* GLOBAL MODALS */}
      {/* ------------------------------------------------------------- */}
      <DepositWithdrawModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        initialTab={depositInitialTab}
      />

      <AssetSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <KycModal
        isOpen={isKycOpen}
        onClose={() => setIsKycOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <PriceAlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />

      <BiometricAuthModal
        isOpen={isBiometricOpen}
        onClose={() => setIsBiometricOpen(false)}
        onSuccess={() => {
          if (biometricCallback) {
            biometricCallback();
            setBiometricCallback(null);
          }
        }}
      />

      <AuthModal />

      {/* ------------------------------------------------------------- */}
      {/* FLOATING TOAST NOTIFICATION CONTAINER */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
        {toasts.map(toast => {
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl glass-panel border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in slide-in-from-right duration-200"
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
                {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white leading-tight font-sans">
                  {toast.title}
                </div>
                <div className="text-[11px] text-white/60 mt-0.5 leading-snug break-words">
                  {toast.message}
                </div>
              </div>

              <button
                id={`btn-close-toast-${toast.id}`}
                onClick={() => dismissToast(toast.id)}
                className="text-white/30 hover:text-white transition p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrokerProvider>
      <BrokerApp />
    </BrokerProvider>
  );
}
