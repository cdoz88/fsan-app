import React from 'react';
import { X, ShoppingCart, Minus, Plus, HeartHandshake, Loader2 } from 'lucide-react';

export default function PurchaseModal({
  setShowPurchaseModal,
  isProcessing,
  ticketCount,
  userJoinedCount,
  purchaseQuantity,
  setPurchaseQuantity,
  donationAmount,
  setDonationAmount,
  isAnonymous,
  setIsAnonymous,
  executeStripeCheckout
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#151515] p-8 rounded-3xl border border-gray-800 text-center text-white shadow-2xl w-full max-w-md relative overflow-hidden my-auto">
        <button 
          onClick={() => { setShowPurchaseModal(false); setPurchaseQuantity(1); setDonationAmount(0); setIsAnonymous(false); }} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2"
          disabled={isProcessing}
        >
          <X size={20} />
        </button>
        
        <div className="mx-auto w-12 h-12 bg-[#1b75bb]/20 text-[#1b75bb] rounded-full flex items-center justify-center mb-4">
          <ShoppingCart size={24} />
        </div>

        <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">Get Draft Tickets</h3>
        
        <div className="flex flex-col gap-3 mt-4">
          <div className="bg-[#111] border border-[#1b75bb]/30 p-4 rounded-xl text-left mb-2 shadow-inner">
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-white block mb-1">Standard Entry</strong> 
              Each ticket is $22 ($4 goes directly to charity).
            </p>
            {ticketCount <= 0 && userJoinedCount === 0 && (
              <p className="text-xs text-[#f5a623] font-bold mt-3 bg-[#f5a623]/10 p-2 rounded-lg inline-block border border-[#f5a623]/20">
                🎁 First-time buyers get a free 1-month trial of FSAN Pro+ automatically applied at checkout!
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Quantity:</span>
              <div className="flex items-center gap-3 bg-[#181818] border border-gray-700 rounded-xl px-3 py-1.5">
                <button 
                  onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                  disabled={isProcessing}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <Minus size={14} />
                </button>
                <span className="font-black text-white text-base min-w-[20px] text-center">{purchaseQuantity}</span>
                <button 
                  onClick={() => setPurchaseQuantity(Math.min(25, purchaseQuantity + 1))}
                  disabled={isProcessing}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-800 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
                <HeartHandshake size={14} className="text-[#f5a623]" /> Optional Charity Donation:
              </span>
              <div className="flex gap-2 mb-3">
                {[0, 5, 10, 25].map(amt => (
                  <button 
                    key={amt} 
                    onClick={() => setDonationAmount(amt)}
                    disabled={isProcessing}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors border ${donationAmount === amt ? 'bg-gradient-to-r from-teal-400 to-[#1b75bb] border-transparent text-white' : 'bg-[#181818] border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
                  >
                    {amt === 0 ? 'None' : `+$${amt}`}
                  </button>
                ))}
              </div>
              {donationAmount > 0 && (
                <label className="flex items-center gap-2 cursor-pointer mt-1 group">
                  <input 
                    type="checkbox" 
                    checked={isAnonymous} 
                    onChange={(e) => setIsAnonymous(e.target.checked)} 
                    className="rounded border-gray-700 bg-[#181818] text-[#1b75bb] focus:ring-[#1b75bb] focus:ring-offset-gray-900"
                  />
                  <span className="text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors">Keep my donation anonymous on the Wall of Fame</span>
                </label>
              )}
            </div>
          </div>

          <div className="my-3 text-left">
            <p className="text-[11px] text-gray-500 leading-tight">
              By proceeding to checkout, you agree to our{' '}
              <a href="/rules" target="_blank" rel="noopener noreferrer" className="text-[#1b75bb] underline hover:text-white">
                Official Contest Rules & Terms
              </a>. First-time buyers receive a 30-day free trial of FSAN Pro+, which automatically renews at $7.99/mo thereafter. Cancel anytime in account settings.
            </p>
          </div>

          <button 
            onClick={executeStripeCheckout}
            disabled={isProcessing}
            className="w-full relative group p-[2px] rounded-xl bg-gradient-to-r from-[#f5a623] to-[#c30b16] shadow-[0_0_15px_rgba(245,166,35,0.2)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-3.5 flex items-center justify-center w-full text-white font-black uppercase tracking-widest text-xs">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Checkout ($${(22 * purchaseQuantity) + donationAmount})`}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}