import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { soundManager } from '../utils/audio';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Key,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Zap,
  Users,
  Copy,
  Check,
  Trash2,
  Globe,
  Phone,
  ArrowRight,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    user,
    isLoggedIn,
    logout,
    savedAccounts,
    switchAccount,
    accountMode,
    switchAccountMode,
    updateUserProfile,
    generateApiKey,
    deleteApiKey,
    toggleTwoFactor,
    toggleBiometric
  } = useBroker();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTier, setRegTier] = useState<'Starter' | 'Pro Prime' | 'Institutional Prime'>('Pro Prime');
  const [regCurrency, setRegCurrency] = useState('USD');
  const [regLoading, setRegLoading] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Profile edit state
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone || '+1 (555) 234-8901');
  const [profileCountry, setProfileCountry] = useState(user.country || 'United States');

  // API Key creation form state
  const [newKeyName, setNewKeyName] = useState('');
  const [keyPermTrade, setKeyPermTrade] = useState(true);
  const [keyPermWithdraw, setKeyPermWithdraw] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    setLoginLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (res.success) {
      setIsAuthModalOpen(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;
    setRegLoading(true);
    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      tier: regTier,
      currency: regCurrency
    });
    setRegLoading(false);
    if (res.success) {
      setIsAuthModalOpen(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileName,
      phone: profilePhone,
      country: profileCountry
    });
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    const perms: ('read' | 'trade' | 'withdraw')[] = ['read'];
    if (keyPermTrade) perms.push('trade');
    if (keyPermWithdraw) perms.push('withdraw');

    generateApiKey(newKeyName, perms);
    setNewKeyName('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    soundManager.playClick();
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {authModalTab === 'login' && 'Account Sign In'}
                {authModalTab === 'register' && 'Open Institutional Prime Account'}
                {authModalTab === 'forgot' && 'Reset Access Password'}
                {authModalTab === 'profile' && 'User Account Profile'}
                {authModalTab === 'apikeys' && 'Algorithmic API Access Keys'}
              </h2>
              <p className="text-[11px] text-white/50 mono">
                Aether Prime ECN Sovereign Identity Portal
              </p>
            </div>
          </div>

          <button
            id="btn-close-auth-modal"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-xl text-white/40 hover:text-white glass-btn transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-white/[0.04] bg-black/20 overflow-x-auto text-xs">
          {!isLoggedIn ? (
            <>
              <button
                id="tab-auth-login"
                onClick={() => setAuthModalTab('login')}
                className={`px-4 py-1.5 rounded-xl font-semibold transition ${
                  authModalTab === 'login'
                    ? 'active-tab text-white'
                    : 'text-white/50 hover:text-white glass-btn'
                }`}
              >
                Sign In
              </button>
              <button
                id="tab-auth-register"
                onClick={() => setAuthModalTab('register')}
                className={`px-4 py-1.5 rounded-xl font-semibold transition ${
                  authModalTab === 'register'
                    ? 'active-tab text-white'
                    : 'text-white/50 hover:text-white glass-btn'
                }`}
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <button
                id="tab-auth-profile"
                onClick={() => setAuthModalTab('profile')}
                className={`px-4 py-1.5 rounded-xl font-semibold transition ${
                  authModalTab === 'profile'
                    ? 'active-tab text-white'
                    : 'text-white/50 hover:text-white glass-btn'
                }`}
              >
                Profile & Security
              </button>
              <button
                id="tab-auth-apikeys"
                onClick={() => setAuthModalTab('apikeys')}
                className={`px-4 py-1.5 rounded-xl font-semibold transition ${
                  authModalTab === 'apikeys'
                    ? 'active-tab text-white'
                    : 'text-white/50 hover:text-white glass-btn'
                }`}
              >
                API Keys
              </button>
              <button
                id="tab-auth-switch"
                onClick={() => setAuthModalTab('login')}
                className={`px-4 py-1.5 rounded-xl font-semibold transition ${
                  authModalTab === 'login'
                    ? 'active-tab text-white'
                    : 'text-white/50 hover:text-white glass-btn'
                }`}
              >
                Switch Account
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: LOGIN */}
          {authModalTab === 'login' && (
            <div className="space-y-5">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      placeholder="e.g. a.vance@prime-capital.io"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-white/70">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthModalTab('forgot')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      id="input-login-password"
                      type="password"
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>Sign In to Terminal</span>
                </button>
              </form>

              {/* Fast 1-Click Demo Profiles */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
                <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                  Quick Switch: Saved Accounts
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedAccounts.map(acct => (
                    <div
                      key={acct.id}
                      onClick={() => {
                        switchAccount(acct.id);
                        setIsAuthModalOpen(false);
                      }}
                      className="glass-panel p-3 rounded-xl hover:border-indigo-500/50 hover:bg-white/[0.04] transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-[11px] text-indigo-300">
                          {acct.name[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition">
                            {acct.name}
                          </div>
                          <div className="text-[10px] text-white/40 font-mono truncate">
                            {acct.tier}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-white/60 font-mono">
                        ${(acct.demoBalance / 1000).toFixed(0)}k
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Full Name / Entity Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    id="input-reg-name"
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Business / Personal Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    id="input-reg-email"
                    type="email"
                    required
                    placeholder="elena@hedge-fund.ch"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    id="input-reg-password"
                    type="password"
                    required
                    placeholder="Minimum 8 characters with numbers"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Account Tier
                  </label>
                  <select
                    id="select-reg-tier"
                    value={regTier}
                    onChange={(e) => setRegTier(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Starter">Starter (0.8 bps)</option>
                    <option value="Pro Prime">Pro Prime (0.2 bps)</option>
                    <option value="Institutional Prime">Institutional (Raw 0.0 bps)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Base Currency
                  </label>
                  <select
                    id="select-reg-currency"
                    value={regCurrency}
                    onChange={(e) => setRegCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="USDT">USDT (Tether)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                <span>
                  Automatic $100,000 Demo Capital allocated with instantaneous sub-millisecond ECN gateway access.
                </span>
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                disabled={regLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2"
              >
                {regLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Create Institutional Account</span>
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {authModalTab === 'forgot' && (
            <div className="space-y-4">
              {!forgotSent ? (
                <div className="space-y-4">
                  <p className="text-xs text-white/70 leading-relaxed">
                    Enter the email registered with your Aether Prime account. We will dispatch a single-use cryptographically signed recovery token.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">
                      Account Email
                    </label>
                    <input
                      id="input-forgot-email"
                      type="email"
                      required
                      placeholder="e.g. a.vance@prime-capital.io"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    id="btn-send-recovery"
                    onClick={() => setForgotSent(true)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
                  >
                    Send Recovery Instructions
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Recovery Token Dispatched</h3>
                  <p className="text-xs text-white/60 max-w-sm mx-auto">
                    Check your inbox for password reset instructions. For demo accounts, default recovery password is set to <span className="font-mono text-white">primePass123</span>.
                  </p>
                  <button
                    onClick={() => {
                      setForgotSent(false);
                      setAuthModalTab('login');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE & SECURITY */}
          {authModalTab === 'profile' && (
            <div className="space-y-6">
              {/* Account Mode Switcher */}
              <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Trading Account Mode:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${accountMode === 'live' ? 'bg-emerald-500/20 text-[#00ffa3] border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                      {accountMode.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    {accountMode === 'live' ? 'Executing with real capital and on-chain settlement' : 'Risk-free simulated $100k demo environment'}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
                  <button
                    id="btn-toggle-demo-mode"
                    onClick={() => switchAccountMode('demo')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${accountMode === 'demo' ? 'active-tab' : 'text-white/50 hover:text-white'}`}
                  >
                    Demo
                  </button>
                  <button
                    id="btn-toggle-live-mode"
                    onClick={() => switchAccountMode('live')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${accountMode === 'live' ? 'bg-emerald-600 text-white' : 'text-white/50 hover:text-white'}`}
                  >
                    Live ECN
                  </button>
                </div>
              </div>

              {/* Profile Details Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">
                      Account ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user.accountNumber}
                      className="w-full px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl text-white/50 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">
                      Jurisdiction
                    </label>
                    <input
                      type="text"
                      value={profileCountry}
                      onChange={(e) => setProfileCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Security & Multi-Factor Toggles */}
              <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                <div className="text-xs font-bold text-white uppercase tracking-wider text-white/60">
                  Security Protections
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="glass-panel p-3.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Fingerprint className="w-5 h-5 text-indigo-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Biometric Passkey</div>
                        <div className="text-[10px] text-white/40">FIDO2 WebAuthn / FaceID</div>
                      </div>
                    </div>
                    <button
                      onClick={toggleBiometric}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${user.biometricEnabled ? 'bg-indigo-500 text-white' : 'glass-btn text-white/40'}`}
                    >
                      {user.biometricEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="glass-panel p-3.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-[#00ffa3]" />
                      <div>
                        <div className="text-xs font-bold text-white">2FA Authenticator</div>
                        <div className="text-[10px] text-white/40">TOTP Google Auth</div>
                      </div>
                    </div>
                    <button
                      onClick={toggleTwoFactor}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${user.twoFactorEnabled ? 'bg-emerald-600 text-white' : 'glass-btn text-white/40'}`}
                    >
                      {user.twoFactorEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="pt-4 border-t border-white/[0.08] flex justify-between items-center">
                <button
                  onClick={() => {
                    logout();
                    setIsAuthModalOpen(false);
                  }}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-[#ff5f5f] border border-rose-500/30 rounded-xl text-xs font-bold transition"
                >
                  Sign Out Session
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: API KEYS */}
          {authModalTab === 'apikeys' && (
            <div className="space-y-5">
              <div className="text-xs text-white/70 leading-relaxed">
                Connect algorithmic high-frequency trading bots, Python quantitative scripts, or external portfolio aggregators using authenticated REST & WebSocket endpoints.
              </div>

              {/* Create API Key Form */}
              <form onSubmit={handleCreateApiKey} className="glass-panel p-4 rounded-2xl border border-white/[0.08] space-y-3">
                <div className="text-xs font-bold text-white">Create New API Credential</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Key Label (e.g. Binance Arb Bot #2)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shrink-0"
                  >
                    Generate Key
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-white/70 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keyPermTrade}
                      onChange={(e) => setKeyPermTrade(e.target.checked)}
                      className="rounded bg-black border-white/20"
                    />
                    <span>Order Execution (Trade)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keyPermWithdraw}
                      onChange={(e) => setKeyPermWithdraw(e.target.checked)}
                      className="rounded bg-black border-white/20"
                    />
                    <span>Withdrawal Authorization</span>
                  </label>
                </div>
              </form>

              {/* API Keys List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider text-white/60">
                  Active API Keys ({(user.apiKeys || []).length})
                </div>

                {(user.apiKeys || []).length === 0 ? (
                  <div className="p-4 text-center text-xs text-white/40 glass-panel rounded-xl">
                    No active API keys generated yet.
                  </div>
                ) : (
                  (user.apiKeys || []).map(k => (
                    <div key={k.id} className="glass-panel p-3.5 rounded-xl border border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-white flex items-center gap-2">
                          <Key className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{k.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                            {k.permissions.join(', ')}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteApiKey(k.id)}
                          className="text-white/30 hover:text-[#ff5f5f] transition p-1"
                          title="Revoke Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-black/40 px-3 py-1.5 rounded-lg border border-white/[0.06] text-[11px] font-mono text-white/80">
                        <span className="truncate">{k.key}</span>
                        <button
                          onClick={() => copyToClipboard(k.key, k.id)}
                          className="ml-2 text-white/40 hover:text-white transition"
                        >
                          {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-[#00ffa3]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
