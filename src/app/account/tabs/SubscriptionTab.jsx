"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CreditCard, Zap, ShieldCheck, Star, Loader2, Settings, Mail } from 'lucide-react';

export default function SubscriptionTab({ userTier }) {
  const { data: session } = useSession();
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const handleManageBilling = async () => {
    setIsPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Failed to open billing portal.');
    } catch (error) {
      alert('An unexpected error occurred.');
    } finally {
      setIsPortalLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
      <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">Manage Subscription</h2>
      
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
         <div className="flex items-center gap-5">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${userTier === 'pro-plus' ? 'bg-gradient-to-br from-red-600/20 to-orange-500/20 border border-red-500/30 text-red-500' : userTier === 'pro' ? 'bg-blue-900/20 border border-blue-500/30 text-blue-500' : 'bg-gray-800 border border-gray-700 text-gray-500'}`}>
                 {userTier === 'pro-plus' ? <Zap size={28} /> : userTier === 'pro' ? <ShieldCheck size={28} /> : <Star size={28} />}
             </div>
             <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1">
                     {userTier === 'pro-plus' ? 'PRO+ Member' : userTier === 'pro' ? 'PRO Member' : 'Free Account'}
                 </h3>
                 <p className="text-sm text-gray-400 font-medium">
                     {userTier === 'free' ? 'Upgrade to unlock premium tools and exclusive content.' : 'Your subscription is active.'}
                 </p>
             </div>
         </div>

         {userTier === 'free' ? (
             <Link href="/subscribe" className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 text-center">
                 Upgrade Now
             </Link>
         ) : (
             <button onClick={handleManageBilling} disabled={isPortalLoading} className="w-full md:w-auto bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                {isPortalLoading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <Settings size={16} />}
                Billing Portal
             </button>
         )}
      </div>

      {userTier !== 'free' && (
          <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 flex items-start gap-4">
              <Mail className="text-gray-500 shrink-0 mt-0.5" size={20} />
              <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Need help with your subscription?</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                      You can easily update your payment method, download invoices, or cancel your subscription at any time through the secure Stripe Billing Portal above.
                  </p>
              </div>
          </div>
      )}
    </div>
  );
}