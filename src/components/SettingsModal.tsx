import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { soundManager } from '../utils/audio';
import {
  X,
  Shield,
  Key,
  Volume2,
  Zap,
  RotateCcw,
  Check,
  Copy,
  Crown,
  Sparkles
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    toggleBiometric,
    toggleSound,
    toggleOneClick,
    updateUserTier,
    resetAccount,
    addToast
  } = useBroker();

  const [activeTab, setActiveTab] = useState<'tier' | 'security' | 'api'>('tier');
  const [apiKey, setApiKey] = useState<string>('ae_live_89f3a8b29c1d04481029');
  const [apiCopied, setApiCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateApiKey = () => {
    soundManager.playClick();
    const newKey = `ae_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 8)}`;
    setApiKey(newKey);
    addToast('New API Key Generated', 'Sub-1ms FIX/WebSocket credentials active', 'success');
  };

  const handleCopyApi = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(apiKey);
    setApiCopied(true);
    setTimeout(() => setApiCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in select-none">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85)]">
        {/* Close Button */}
        <button
          id="btn-close-settings"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-white/50 hover:text-white bg-white/[0.04] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold text-white font-display mb-1">Terminal Preferences & Security</h2>
        <p className="text-xs text-white/50 mb-6">Manage institutional tiers, WebAuthn credentials, and trading configurations.</p>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/[0.06] mb-6">
          {[
            { id: 'tier', label: 'Prime Tiers', icon: Crown },
            { id: 'security', label: 'Security & Audio', icon: Shield },
            { id: 'api', label: 'API & Webhooks', icon: Key }
          ].map(t => (
            <button
              key={t.id}
              id={`tab-settings-${t.id}`}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(t.id as 'tier' | 'security' | 'api');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === t.id
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Prime Tiers */}
        {activeTab === 'tier' && (
          <div className="space-y-3.5">
            {[
              {
                id: 'Starter',
                title: 'Starter Retail',
                spread: 'Standard 0.8 bps',
                leverage: 'Up to 30x',
                fee: '0.03% Taker'
              },
              {
                id: 'Pro Prime',
                title: 'Pro Prime',
                spread: 'Raw 0.2 bps',
                leverage: 'Up to 100x',
                fee: '0.015% Taker',
                badge: 'Popular'
              },
              {
                id: 'Institutional Prime',
                title: 'Institutional Prime',
                spread: 'Zero Spread 0.0 bps',
                leverage: 'Up to 100x Custom',
                fee: '0.005% Direct Fix'
              }
            ].map(t => (
              <div
                key={t.id}
                onClick={() => updateUserTier(t.id as 'Starter' | 'Pro Prime' | 'Institutional Prime')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  user.tier === t.id
                    ? 'bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_20px_rgba(0,242,254,0.15)]'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{t.title}</span>
                    {t.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  {user.tier === t.id && (
                    <span className="text-xs font-mono text-cyan-300 flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      Active Tier
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-white/60 font-mono mt-2 pt-2 border-t border-white/[0.05]">
                  <div>Spread: <span className="text-white">{t.spread}</span></div>
                  <div>Lev: <span className="text-white">{t.leverage}</span></div>
                  <div>Fee: <span className="text-emerald-400">{t.fee}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Security & Audio Settings */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            {/* Biometric Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <div className="font-semibold text-white text-xs">Biometric Execution Security</div>
                <div className="text-[11px] text-white/40">Require FaceID / Passkey authorization for high-volume orders</div>
              </div>
              <button
                id="btn-toggle-biometric-setting"
                onClick={toggleBiometric}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  user.biometricEnabled ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                    user.biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <div className="font-semibold text-white text-xs">Tactile Synthesizer Audio</div>
                <div className="text-[11px] text-white/40">Synthesized acoustic feedback for order fills, ticks, and alerts</div>
              </div>
              <button
                id="btn-toggle-sound-setting"
                onClick={toggleSound}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  user.soundEnabled ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                    user.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 1-Click Fast Trading */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <div className="font-semibold text-white text-xs">One-Click Execution Mode</div>
                <div className="text-[11px] text-white/40">Bypass secondary order confirmation prompts for scalping speed</div>
              </div>
              <button
                id="btn-toggle-oneclick-setting"
                onClick={toggleOneClick}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  user.oneClickTrading ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                    user.oneClickTrading ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reset Account */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="font-semibold text-rose-400 text-xs">Reset Sandbox Capital</div>
                <div className="text-[10px] text-white/40">Restore default $100,000 demo collateral</div>
              </div>
              <button
                id="btn-settings-reset"
                onClick={resetAccount}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Account
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: API & Webhooks */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3">
              <span className="text-xs font-semibold text-white block">Active REST & FIX 4.4 API Key</span>
              <div className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                <span className="text-xs font-mono text-cyan-300 flex-1 truncate font-medium">{apiKey}</span>
                <button
                  id="btn-copy-api-key"
                  onClick={handleCopyApi}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/80 transition"
                  title="Copy Key"
                >
                  {apiCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                <span>Rate Limit: 10,000 req/sec</span>
                <span>Latency: &lt; 0.8ms co-located</span>
              </div>
            </div>

            <button
              id="btn-generate-apikey"
              onClick={handleGenerateApiKey}
              className="w-full py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/[0.08] transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Regenerate Institutional Key
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
