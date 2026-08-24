import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';
import { ShieldCheck, Scan, CheckCircle2, X } from 'lucide-react';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Biometric Authorization',
  subtitle = 'Scanning FaceID / Neural Passkey to authorize trade execution'
}) => {
  const [scanState, setScanState] = useState<'scanning' | 'success' | 'failed'>('scanning');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setScanState('scanning');
      setProgress(0);
      return;
    }

    // Sound scan trigger
    soundManager.playClick();

    // Progress animation
    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += 12;
      setProgress(Math.min(100, currentProg));

      if (currentProg >= 100) {
        clearInterval(interval);
        setScanState('success');
        soundManager.playBiometricSuccess();
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 650);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in select-none">
      <div className="relative w-full max-w-sm glass-panel rounded-3xl p-6 border border-white/15 text-center shadow-[0_30px_70px_rgba(0,0,0,0.9)]">
        {/* Close Button */}
        <button
          id="btn-close-biometric"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-white/40 hover:text-white bg-white/[0.04] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Biometric Scanning Radar */}
        <div className="relative w-32 h-32 mx-auto my-6 flex items-center justify-center">
          {/* Glowing Animated Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '6s' }} />
          <div className="absolute inset-4 rounded-full bg-cyan-500/5 border border-cyan-400/30 backdrop-blur-sm" />

          {/* Futuristic Scanline */}
          {scanState === 'scanning' && (
            <div className="absolute inset-4 rounded-full overflow-hidden pointer-events-none">
              <div className="w-full h-1 bg-cyan-400 shadow-[0_0_12px_#00F2FE] animate-scanline" />
            </div>
          )}

          {/* Center Icon */}
          <div className="relative z-10">
            {scanState === 'scanning' ? (
              <Scan className="w-12 h-12 text-cyan-400 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-in zoom-in" />
            )}
          </div>
        </div>

        {/* Status Text */}
        <h3 className="text-lg font-bold text-white font-display">
          {scanState === 'scanning' ? title : 'Identity Verified'}
        </h3>
        <p className="text-xs text-white/50 mt-1 max-w-[260px] mx-auto">
          {scanState === 'scanning' ? subtitle : 'Biometric match 99.98% — order signed securely.'}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-6">
          <div
            className="h-full bg-cyan-400 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 mt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>FIDO2 WebAuthn Hardware Security Module</span>
        </div>
      </div>
    </div>
  );
};
