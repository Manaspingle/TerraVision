import React, { useState } from 'react';
import { X, Crown, Check, ShieldCheck, Zap, CreditCard } from 'lucide-react';
import { UserProfile } from '../types';
import { purchaseSubscriptionApi } from '../api';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSubscriptionSuccess: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubscriptionSuccess
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async (planName: string, amount: string) => {
    setLoading(true);
    try {
      // Simulate Razorpay / Stripe Payment Gateway Modal Checkout
      const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 11)}`;
      
      await purchaseSubscriptionApi({
        userEmail: user?.email || 'guest@terravision.org',
        userName: user?.displayName || 'User',
        plan: planName,
        amount: amount,
        paymentId: mockPaymentId
      });

      onSubscriptionSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl glass-panel p-8 border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 border border-amber-800/80 rounded-full text-xs font-bold text-amber-400">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" /> Terravision Pro Tier
          </div>
          <h2 className="text-3xl font-extrabold text-white">Unlock Advanced Satellite Operations</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upgrade your plan to unlock Pro algorithms: Watershed Segmentation, GLCM Texture Entropy, CLAHE, and Image Registration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Tier */}
          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200">Free Explorer</h3>
              <div className="text-3xl font-extrabold text-white">$0 <span className="text-xs font-normal text-slate-400">/forever</span></div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Basic Acquisition & Sampling</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Mean/Gaussian Noise Filters</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Global Thresholding</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Shape Features Extraction</li>
              </ul>
            </div>
            <button
              disabled
              className="w-full py-2.5 bg-slate-800 text-slate-400 font-semibold text-xs rounded-xl"
            >
              Current Basic Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="p-6 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 rounded-2xl border border-amber-500/50 flex flex-col justify-between space-y-6 shadow-xl shadow-amber-950/20 relative">
            <div className="absolute -top-3 right-6 px-3 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-widest rounded-full">
              Recommended
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <Crown className="w-5 h-5 fill-amber-400" /> Pro Geospatial
              </h3>
              <div className="text-3xl font-extrabold text-white">$29 <span className="text-xs font-normal text-slate-400">/month</span></div>
              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> All 6 Pipeline Stages Unlocked</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Watershed & Morphological Segmentation</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> GLCM Texture Matrix & HOG Features</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> CLAHE & Wiener Noise Filters</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Unlimited PDF Report Exports</li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout("Pro Geospatial Plan", "$29/mo")}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              {loading ? 'Processing Payment...' : 'Pay $29 with Razorpay/Stripe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
