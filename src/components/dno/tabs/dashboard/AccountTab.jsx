import React from 'react';
import { signOut } from 'next-auth/react';
import { UserCog, ShieldCheck, CreditCard, ExternalLink, Loader2, Key, FileText, LogOut } from 'lucide-react';

export default function AccountTab({
  session,
  ticketCount,
  userJoinedCount,
  handleBillingPortal,
  isPortalLoading
}) {
  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Profile Details Section */}
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#1b75bb] opacity-5 blur-[60px] rounded-full pointer-events-none"></div>
          <h3 className="text-xl font-black text-white uppercase italic mb-6 tracking-wide flex items-center gap-2">
            <UserCog className="text-[#1b75bb]" size={20} /> Profile Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-[#151515] border border-gray-800 p-4 rounded-2xl">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Username</label>
              <p className="text-white font-bold text-sm truncate">{session?.user?.name || 'N/A'}</p>
            </div>
            <div className="bg-[#151515] border border-gray-800 p-4 rounded-2xl">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Email Address</label>
              <p className="text-white font-bold text-sm truncate">{session?.user?.email || 'N/A'}</p>
            </div>
            <div className="bg-[#151515] border border-gray-800 p-4 rounded-2xl">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Total Lifetime Tickets</label>
              <p className="text-[#f5a623] font-black text-xl leading-none mt-1">{ticketCount + userJoinedCount}</p>
            </div>
            <div className="bg-[#151515] border border-gray-800 p-4 rounded-2xl">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Leagues Joined</label>
              <p className="text-teal-400 font-black text-xl leading-none mt-1">{userJoinedCount}</p>
            </div>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-inner">
          <h3 className="text-xl font-black text-white uppercase italic mb-6 tracking-wide flex items-center gap-2">
            <ShieldCheck className="text-teal-400" size={20} /> Account Actions
          </h3>
          
          <div className="space-y-4">
            {/* Stripe Billing Portal Button */}
            <button 
              onClick={handleBillingPortal}
              disabled={isPortalLoading}
              className="w-full bg-[#151515] hover:bg-[#1a1a1a] border border-gray-800 hover:border-gray-600 transition-colors rounded-2xl p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-900/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <CreditCard size={18} className="text-indigo-400" />
                </div>
                <div className="text-left">
                  <span className="block text-white font-bold text-sm uppercase tracking-wide">Purchase History & Billing</span>
                  <span className="block text-[11px] text-gray-500 font-medium mt-0.5">Manage your cards and view past DNO ticket receipts</span>
                </div>
              </div>
              {isPortalLoading ? <Loader2 size={18} className="text-gray-500 animate-spin shrink-0" /> : <ExternalLink size={18} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />}
            </button>

            {/* Reset Password Link */}
            <a 
              href="/reset-password"
              className="w-full bg-[#151515] hover:bg-[#1a1a1a] border border-gray-800 hover:border-gray-600 transition-colors rounded-2xl p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-900/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Key size={18} className="text-amber-400" />
                </div>
                <div className="text-left">
                  <span className="block text-white font-bold text-sm uppercase tracking-wide">Reset Password</span>
                  <span className="block text-[11px] text-gray-500 font-medium mt-0.5">Update your shared FSAN and Draft Night Out login credentials</span>
                </div>
              </div>
              <ExternalLink size={18} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />
            </a>

            {/* Legal Terms Link */}
            <a 
              href="/dno/agreement"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#151515] hover:bg-[#1a1a1a] border border-gray-800 hover:border-gray-600 transition-colors rounded-2xl p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800/50 border border-gray-600/50 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-gray-400" />
                </div>
                <div className="text-left">
                  <span className="block text-white font-bold text-sm uppercase tracking-wide">Terms & Conditions</span>
                  <span className="block text-[11px] text-gray-500 font-medium mt-0.5">Review the official rules and DNO contest agreement</span>
                </div>
              </div>
              <ExternalLink size={18} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />
            </a>
          </div>

          {/* Sign Out Button */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/50 transition-colors text-red-400 font-black uppercase tracking-widest text-xs rounded-xl"
            >
              <LogOut size={16} /> Sign Out of Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}