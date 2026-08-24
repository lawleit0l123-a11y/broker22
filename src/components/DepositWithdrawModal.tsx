import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { soundManager } from '../utils/audio';
import {
  X,
  PlusCircle,
  ArrowDownCircle,
  QrCode,
  Copy,
  Check,
  Building2,
  CreditCard,
  Coins,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'deposit' | 'withdraw';
}

export const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'deposit'
}) => {
  const { portfolio, depositFunds, withdrawFunds, user } = useBroker();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(initialTab);
  
  // Deposit States
  const [depositMethod, setDepositMethod] = useState<'crypto' | 'wire' | 'card'>('crypto');
  const [depositCrypto, setDepositCrypto] = useState<'USDC' | 'USDT' | 'BTC' | 'ETH'>('USDC');
  const [depositNetwork, setDepositNetwork] = useState<'Solana' | 'Ethereum' | 'Arbitrum'>('Solana');
  const [depositAmount, setDepositAmount] = useState<string>('10000');
  const [copied, setCopied] = useState<boolean>(false);

  // Withdraw States
  const [withdrawMethod, setWithdrawMethod] = useState<'crypto' | 'wire'>('crypto');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('0x71C...4982aF');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawCrypto, setWithdrawCrypto] = useState<'USDC' | 'USDT' | 'USD'>('USDC');

  if (!isOpen) return null;

  const cryptoAddresses: Record<string, string> = {
    'Solana': '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    'Ethereum': '0x3845cDb4324f9E34589Ab8841B09c988FE239841',
    'Arbitrum': '0x88219Fa91049281B9c02934810284091A8b41092'
  };

  const handleCopy = (text: string) => {
    soundManager.playClick();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;

    const methodDesc = depositMethod === 'crypto'
      ? `${depositCrypto} (${depositNetwork})`
      : depositMethod === 'wire'
      ? 'Instant FedWire / SEPA Prime'
      : 'Card / Apple Pay';

    depositFunds(amt, methodDesc, depositMethod === 'crypto' ? depositCrypto : 'USD');
    onClose();
  };

  const handleWithdrawSubmit = () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return;

    const res = withdrawFunds(
      amt,
      withdrawMethod === 'crypto' ? `Crypto Out (${withdrawCrypto})` : 'Wire Transfer to IBAN',
      withdrawAddress
    );

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in select-none">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Close Button */}
        <button
          id="btn-close-deposit-modal"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute right-5 top-5 p-2 rounded-xl text-white/50 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Top Tabs */}
        <div className="flex items-center gap-2 p-1 bg-black/40 rounded-2xl border border-white/[0.06] mb-6 max-w-xs">
          <button
            id="tab-modal-deposit"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('deposit');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'deposit'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Deposit
          </button>
          <button
            id="tab-modal-withdraw"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('withdraw');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'withdraw'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            Withdraw
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DEPOSIT TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Deposit Capital</h2>
              <p className="text-xs text-white/50">Instant collateral settlement into your prime trading balance.</p>
            </div>

            {/* Method Pills */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'crypto', label: 'Crypto Rails', icon: Coins },
                { id: 'wire', label: 'Bank Wire', icon: Building2 },
                { id: 'card', label: 'Card / Apple Pay', icon: CreditCard }
              ].map(m => (
                <button
                  key={m.id}
                  id={`btn-deposit-method-${m.id}`}
                  onClick={() => {
                    soundManager.playClick();
                    setDepositMethod(m.id as 'crypto' | 'wire' | 'card');
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                    depositMethod === m.id
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-white/[0.02] text-white/50 border-white/[0.05] hover:text-white'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>

            {/* If Crypto Deposit */}
            {depositMethod === 'crypto' && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3.5">
                {/* Coin & Network selectors */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-white/40 uppercase font-semibold block mb-1">Asset</label>
                    <select
                      id="select-deposit-crypto"
                      value={depositCrypto}
                      onChange={e => setDepositCrypto(e.target.value as 'USDC' | 'USDT' | 'BTC' | 'ETH')}
                      className="w-full glass-input py-2 px-3 rounded-xl text-xs text-white font-mono"
                    >
                      <option value="USDC">USDC (USD Coin)</option>
                      <option value="USDT">USDT (Tether)</option>
                      <option value="BTC">BTC (Bitcoin)</option>
                      <option value="ETH">ETH (Ethereum)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-white/40 uppercase font-semibold block mb-1">Network Rail</label>
                    <select
                      id="select-deposit-network"
                      value={depositNetwork}
                      onChange={e => setDepositNetwork(e.target.value as 'Solana' | 'Ethereum' | 'Arbitrum')}
                      className="w-full glass-input py-2 px-3 rounded-xl text-xs text-white font-mono"
                    >
                      <option value="Solana">Solana (Sub-second)</option>
                      <option value="Arbitrum">Arbitrum L2 (Low Gas)</option>
                      <option value="Ethereum">Ethereum (ERC-20)</option>
                    </select>
                  </div>
                </div>

                {/* QR Code & Address Display */}
                <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <div className="p-2 bg-white rounded-xl text-black">
                    <QrCode className="w-10 h-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-white/40 block">Deposit Address ({depositNetwork}):</span>
                    <span className="text-xs font-mono text-cyan-300 truncate block font-medium">
                      {cryptoAddresses[depositNetwork]}
                    </span>
                  </div>
                  <button
                    id="btn-copy-address"
                    onClick={() => handleCopy(cryptoAddresses[depositNetwork])}
                    className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/80 transition"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Presets & Amount Input */}
            <div>
              <div className="flex justify-between text-xs text-white/50 mb-1.5 font-medium">
                <span>Deposit Amount (USD)</span>
                <span className="font-mono">Balance: ${portfolio.balance.toLocaleString()}</span>
              </div>
              <div className="relative">
                <input
                  id="input-deposit-amount"
                  type="number"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  placeholder="10000"
                  className="w-full glass-input py-3 pl-4 pr-16 text-base font-mono rounded-2xl text-white font-semibold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-cyan-400">
                  USD
                </span>
              </div>

              {/* Amount Presets */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[1000, 5000, 25000, 100000].map(val => (
                  <button
                    key={val}
                    id={`btn-preset-deposit-${val}`}
                    onClick={() => {
                      soundManager.playClick();
                      setDepositAmount(val.toString());
                    }}
                    className="py-1.5 text-xs font-mono font-semibold text-white/60 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white rounded-xl border border-white/[0.05] transition"
                  >
                    +${(val / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Deposit Button */}
            <button
              id="btn-confirm-deposit"
              onClick={handleDepositSubmit}
              className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.4)] transition glossy-sheen"
            >
              <Sparkles className="w-4 h-4" />
              Credit ${parseFloat(depositAmount || '0').toLocaleString()} to Account
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* WITHDRAW TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'withdraw' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Withdraw Capital</h2>
              <p className="text-xs text-white/50">Discharge free collateral back to your sovereign bank or wallet.</p>
            </div>

            {/* Method selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-withdraw-method-crypto"
                onClick={() => {
                  soundManager.playClick();
                  setWithdrawMethod('crypto');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition ${
                  withdrawMethod === 'crypto'
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'bg-white/[0.02] text-white/50 border-white/[0.05]'
                }`}
              >
                <Coins className="w-4 h-4" />
                Crypto Direct
              </button>
              <button
                id="btn-withdraw-method-wire"
                onClick={() => {
                  soundManager.playClick();
                  setWithdrawMethod('wire');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition ${
                  withdrawMethod === 'wire'
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'bg-white/[0.02] text-white/50 border-white/[0.05]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                FedWire / IBAN
              </button>
            </div>

            {/* Destination Address / Account */}
            <div>
              <label className="text-xs text-white/50 block mb-1.5 font-medium">
                {withdrawMethod === 'crypto' ? 'Destination Wallet Address' : 'Recipient IBAN / Bank Account'}
              </label>
              <input
                id="input-withdraw-address"
                type="text"
                value={withdrawAddress}
                onChange={e => setWithdrawAddress(e.target.value)}
                placeholder={withdrawMethod === 'crypto' ? '0x...' : 'GB82 WEST 1234 5678 9012 34'}
                className="w-full glass-input py-2.5 px-3 text-xs font-mono rounded-xl text-white placeholder:text-white/30"
              />
            </div>

            {/* Withdraw Amount */}
            <div>
              <div className="flex justify-between text-xs text-white/50 mb-1.5 font-medium">
                <span>Withdraw Amount</span>
                <span className="font-mono text-cyan-300">
                  Available Free: ${portfolio.freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="relative">
                <input
                  id="input-withdraw-amount"
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full glass-input py-3 pl-4 pr-20 text-base font-mono rounded-2xl text-white font-semibold"
                />
                <button
                  id="btn-withdraw-max"
                  onClick={() => {
                    soundManager.playClick();
                    setWithdrawAmount(portfolio.freeMargin.toString());
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded-lg border border-cyan-500/30"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05] text-[11px] text-white/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Protected by {user.biometricEnabled ? 'Biometric 2FA' : 'Multi-Sig Escrow'}. Zero platform withdrawal fees.</span>
            </div>

            {/* Confirm Withdraw Button */}
            <button
              id="btn-confirm-withdraw"
              disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > portfolio.freeMargin}
              onClick={handleWithdrawSubmit}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                !withdrawAmount || parseFloat(withdrawAmount) > portfolio.freeMargin
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_25px_rgba(239,68,68,0.4)]'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Authorize Withdrawal of ${parseFloat(withdrawAmount || '0').toLocaleString()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
