"use client";
import React, { useState } from 'react';
import { X, HeartHandshake, Loader2, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function DonationModal({ onClose }) {
  const { data: session, status } = useSession();
  const [donationAmount, setDonationAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const executeDonationCheckout = async () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : donationAmount;
    if (!finalAmount || finalAmount < 1) {
      alert("Please enter a valid donation amount of at least $1.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'dno_donation_only', // Custom type for backend processing
          donationAmount: finalAmount,
          isAnonymous: isAnonymous,
          userId: session?.user?.id || null,
          email: session?.user?.email || null,
          returnUrl: `${window.location.origin}/dno/dashboard?tab=charity`
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      alert("Unable to initiate checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#151515] p-8 rounded-3xl border border-gray-800 text-center text-white shadow-2xl w-full max-w-md relative overflow-hidden my-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2"
          disabled={isProcessing}
        >
          <X size={20} />
        </button>
        
        <div className="mx-auto w-12 h-12 bg-emerald-900/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
          <HeartHandshake size={24} />
        </div>

        <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">Support Mission 22</h3>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          100% of this donation goes directly to supporting Veterans and their families. 
        </p>
        
        {status !== 'authenticated' && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3 mb-6 text-left flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-100/70">
              You are not logged in. You can still donate, but your contribution will automatically be marked as Anonymous on the Wall of Fame.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 25, 50, 100].map(amt => (
              <button 
                key={amt} 
                onClick={() => { setDonationAmount(amt); setCustomAmount(''); }}
                disabled={isProcessing}
                className={`py-3 rounded-xl text-sm font-black transition-colors border ${donationAmount === amt && !customAmount ? 'bg-gradient-to-r from-emerald-500 to-teal-400 border-transparent text-white shadow-lg' : 'bg-[#111] border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
              >
                ${amt}
              </button>
            ))}
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input 
                type="number" 
                placeholder="Other"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setDonationAmount(0);
                }}
                disabled={isProcessing}
                className={`w-full h-full bg-[#111] border rounded-xl pl-7 pr-2 text-sm font-black transition-colors focus:outline-none focus:border-emerald-400 ${customAmount ? 'border-emerald-500 text-white' : 'border-gray-700 text-gray-400'}`}
              />
            </div>
          </div>

          {status === 'authenticated' && (
            <label className="flex items-start gap-3 cursor-pointer mt-2 group bg-[#111] p-3 rounded-xl border border-gray-800">
              <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={(e) => setIsAnonymous(e.target.checked)} 
                className="mt-0.5 rounded border-gray-700 bg-[#181818] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900"
              />
              <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors text-left leading-tight">
                Keep my donation anonymous (Do not list my username on the public Wall of Fame).
              </span>
            </label>
          )}

          <button 
            onClick={executeDonationCheckout}
            disabled={isProcessing}
            className="w-full mt-4 relative group p-[2px] rounded-xl bg-gradient-to-r from-emerald-400 to-teal-600 shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-3.5 flex items-center justify-center w-full text-white font-black uppercase tracking-widest text-xs">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Donate $${customAmount || donationAmount}`}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}