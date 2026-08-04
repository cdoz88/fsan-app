import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { UserCog, ShieldCheck, CreditCard, ExternalLink, Loader2, Key, FileText, LogOut, CheckCircle2, UserMinus, AlertTriangle } from 'lucide-react';

export default function AccountTab({
  session,
  ticketCount,
  userJoinedCount,
  handleBillingPortal,
  isPortalLoading
}) {
  const [resetStatus, setResetStatus] = useState('idle');
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Trigger WordPress GraphQL to send the secure reset email
  const handlePasswordReset = async () => {
    if (!session?.user?.email) return;
    setResetStatus('loading');
    
    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation SendPasswordResetEmail($username: String!) {
              sendPasswordResetEmail(input: { username: $username }) {
                user { databaseId }
              }
            }
          `,
          variables: { username: session.user.email }
        })
      });
      
      const data = await res.json();
      
      if (data?.errors) {
        console.error("GraphQL Error:", data.errors);
        setResetStatus('error');
      } else {
        setResetStatus('success');
      }
    } catch (err) {
      console.error("Reset Email Error:", err);
      setResetStatus('error');
    }
    
    // Reset the button state back to normal after 5 seconds
    setTimeout(() => {
      setResetStatus('idle');
    }, 5000);
  };

  // Trigger WordPress REST API to scrub DNO data and deactivate the profile
  const executeProfileDeactivation = async () => {
    if (!session?.user?.id) return;
    setIsDeactivating(true);
    
    try {
      const res = await fetch('/api/scl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dno_deactivate_profile',
          user_id: session.user.id
        })
      });

      const data = await res.json();

      if (data.success) {
        // Clear local Sleeper cache
        localStorage.removeItem(`dno_dedicated_sleeper_${session.user.id}`);
        // Sign out to clear the session and return to the lobby
        signOut({ callbackUrl: '/dno' });
      } else {
        throw new Error(data.message || "Deactivation failed.");
      }
    } catch (err) {
      console.error("Profile Deactivation Error:", err);
      alert("Unable to deactivate profile. Please try again.");
      setIsDeactivating(false);
      setShowDeactivateConfirm(false);
    }
  };

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

            {/* Reset Password Button */}
            <button 
              onClick={handlePasswordReset}
              disabled={resetStatus === 'loading' || resetStatus === 'success'}
              className="w-full bg-[#151515] hover:bg-[#1a1a1a] border border-gray-800 hover:border-gray-600 transition-colors rounded-2xl p-4 flex items-center justify-between group disabled:hover:border-gray-800"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-900/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Key size={18} className="text-amber-400" />
                </div>
                <div className="text-left">
                  <span className="block text-white font-bold text-sm uppercase tracking-wide">
                    {resetStatus === 'success' ? 'Reset Email Sent!' : resetStatus === 'error' ? 'Error Sending Email' : 'Reset Password'}
                  </span>
                  <span className="block text-[11px] text-gray-500 font-medium mt-0.5">
                    {resetStatus === 'success' 
                      ? 'Check your inbox for the secure reset link.' 
                      : 'Send a secure password reset link to your email address.'}
                  </span>
                </div>
              </div>
              {resetStatus === 'loading' ? (
                <Loader2 size={18} className="text-gray-500 animate-spin shrink-0" />
              ) : resetStatus === 'success' ? (
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              ) : (
                <ExternalLink size={18} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />
              )}
            </button>

            {/* Legal Terms Link */}
            <a 
              href="/rules"
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

          {/* Danger Zone: Sign Out & Deactivate Profile */}
          <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-gray-800 hover:bg-gray-700 transition-colors text-white font-black uppercase tracking-widest text-xs rounded-xl"
            >
              <LogOut size={16} /> Sign Out
            </button>
            
            <div className="w-full sm:w-auto relative">
              {!showDeactivateConfirm ? (
                <button 
                  onClick={() => setShowDeactivateConfirm(true)}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-red-950/30 text-red-500/70 hover:text-red-500 transition-colors font-black uppercase tracking-widest text-xs rounded-xl"
                >
                  <UserMinus size={16} /> Deactivate DNO Profile
                </button>
              ) : (
                <div className="absolute bottom-0 right-0 w-full sm:w-[320px] bg-[#1a1a1a] border border-red-900/50 p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 z-20">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-white font-bold text-sm leading-tight mb-1">Are you sure?</p>
                      <p className="text-xs text-gray-400 leading-relaxed">This will disconnect your Sleeper account and hide your DNO profile. Your FSAN Pro+ login and subscription will remain fully active.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowDeactivateConfirm(false)}
                      className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={executeProfileDeactivation}
                      disabled={isDeactivating}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center"
                    >
                      {isDeactivating ? <Loader2 size={14} className="animate-spin" /> : 'Yes, Deactivate'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}