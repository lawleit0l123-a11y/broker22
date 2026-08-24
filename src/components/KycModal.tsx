import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { soundManager } from '../utils/audio';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Camera,
  UploadCloud,
  ChevronRight,
  Award
} from 'lucide-react';

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KycModal: React.FC<KycModalProps> = ({ isOpen, onClose }) => {
  const { user, verifyKYC } = useBroker();
  const [step, setStep] = useState<number>(1);
  const [docType, setDocType] = useState<'passport' | 'id_card' | 'license'>('passport');
  const [fullName, setFullName] = useState<string>(user.name);
  const [country, setCountry] = useState<string>('United States / Global Prime');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNextStep = () => {
    soundManager.playClick();
    if (step < 3) {
      setStep(s => s + 1);
    } else {
      // Finalize KYC
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        verifyKYC('full');
        setStep(4);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in select-none">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85)]">
        {/* Close */}
        <button
          id="btn-close-kyc-modal"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute right-5 top-5 p-2 rounded-xl text-white/50 hover:text-white bg-white/[0.04] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center justify-between max-w-xs mx-auto mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > i
                    ? 'bg-emerald-500 text-black'
                    : step === i
                    ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
              </div>
              {i < 3 && (
                <div
                  className={`w-12 h-0.5 mx-1 transition-all ${
                    step > i ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Personal & Legal Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Step 1: Legal Identity Profile</h2>
              <p className="text-xs text-white/50">Required for institutional regulatory compliance and zero-limit trading.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 block mb-1 font-medium">Full Legal Name</label>
                <input
                  id="input-kyc-name"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full glass-input py-2.5 px-3 text-xs font-medium rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/50 block mb-1 font-medium">Jurisdiction / Country</label>
                  <input
                    id="input-kyc-country"
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full glass-input py-2.5 px-3 text-xs font-medium rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1 font-medium">Date of Birth</label>
                  <input
                    id="input-kyc-dob"
                    type="date"
                    defaultValue="1992-04-16"
                    className="w-full glass-input py-2.5 px-3 text-xs font-medium rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 block mb-1 font-medium">Residential Street Address</label>
                <input
                  id="input-kyc-address"
                  type="text"
                  defaultValue="100 Wall Street, Suite 4800, New York, NY"
                  className="w-full glass-input py-2.5 px-3 text-xs font-medium rounded-xl text-white"
                />
              </div>
            </div>

            <button
              id="btn-kyc-step1-next"
              onClick={handleNextStep}
              className="w-full py-3 mt-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition glossy-sheen"
            >
              Continue to Document Scan
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Document Upload */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Step 2: Sovereign Document Verification</h2>
              <p className="text-xs text-white/50">Select your document type and upload a clear photographic record.</p>
            </div>

            {/* Document Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'passport', label: 'Passport' },
                { id: 'id_card', label: 'National ID' },
                { id: 'license', label: 'Driver License' }
              ].map(d => (
                <button
                  key={d.id}
                  id={`btn-doctype-${d.id}`}
                  onClick={() => {
                    soundManager.playClick();
                    setDocType(d.id as 'passport' | 'id_card' | 'license');
                  }}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition ${
                    docType === d.id
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                      : 'bg-white/[0.02] text-white/50 border-white/[0.05]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Upload Area */}
            <div className="p-6 rounded-2xl bg-black/40 border-2 border-dashed border-white/20 text-center hover:border-cyan-400/50 transition cursor-pointer group">
              <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold text-white block">Click to upload {docType.replace('_', ' ')} or drag & drop</span>
              <span className="text-[10px] text-white/40 block mt-1">High-resolution JPEG, PNG, or PDF up to 15MB</span>
              
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] rounded-lg text-[10px] text-white/70">
                <FileText className="w-3 h-3 text-cyan-400" />
                <span>passport_scan_hd.pdf (Ready)</span>
              </div>
            </div>

            <button
              id="btn-kyc-step2-next"
              onClick={handleNextStep}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition glossy-sheen"
            >
              Proceed to Biometric Liveness Check
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Facial Liveness Check */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Step 3: 3D Facial Liveness Match</h2>
              <p className="text-xs text-white/50">Look directly into the camera frame for automated biometric comparison.</p>
            </div>

            {/* Live Camera Frame Container */}
            <div className="relative w-44 h-44 mx-auto rounded-3xl overflow-hidden border-2 border-cyan-400/40 bg-black/60 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex items-center justify-center">
              <div className="w-full h-1 bg-cyan-400 shadow-[0_0_12px_#00F2FE] animate-scanline" />
              <Camera className="w-12 h-12 text-cyan-300/40" />
              <div className="absolute bottom-2 text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded">
                Neural Reticle Active
              </div>
            </div>

            <button
              id="btn-kyc-step3-submit"
              disabled={isProcessing}
              onClick={handleNextStep}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition glossy-sheen"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Running Neural Analysis...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Complete Verification
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 4: Approved Celebration */}
        {step === 4 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Award className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-extrabold text-white font-display">
              Verification Approved!
            </h2>
            <p className="text-xs text-white/60 max-w-sm mx-auto">
              Your identity has been authenticated under global regulatory frameworks. Unlimited deposit/withdrawal capacity and Tier-1 Prime spreads are now active.
            </p>

            <button
              id="btn-kyc-finish"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition"
            >
              Return to Trading Terminal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
