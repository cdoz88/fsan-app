"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { User, Mail, Lock, Loader2, CreditCard, ShieldCheck, CheckCircle2, FileText, ShoppingCart, Tag, AlertTriangle } from 'lucide-react';

function AccountDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [userTier, setUserTier] = useState('free');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [relayId, setRelayId] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/all/home');
    }
  }, [status, router]);

  useEffect(() => {
    if (searchParams?.get('checkout') === 'success') {
      setActiveTab('subscription');
      setMessage({ type: 'success', text: 'Checkout successful! Your account has been upgraded.' });
      window.history.replaceState(null, '', '/account');
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.token) {
      fetchUserData();
    }
  }, [status, session]);

  const fetchUserData = async () => {
    const query = `
      query GetViewer {
        viewer {
          id
          firstName
          lastName
          email
          roles {
            nodes {
              name
            }
          }
        }
      }
    `;

    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ query }),
        cache: 'no-store' // FORCE NEXT.JS TO GET FRESH DATA
      });

      const json = await res.json();
      
      if (json?.data?.viewer) {
        const user = json.data.viewer;
        setRelayId(user.id);
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          password: '', 
        });

        const roles = user.roles?.nodes?.map(r => r.name.toLowerCase()) || [];
        if (roles.some(r => r.includes('pro+') || r.includes('pro+ member') || r.includes('fsan_pro_plus'))) {
          setUserTier('pro-plus');
        } else if (roles.some(r => r.includes('pro') || r.includes('pro member') || r.includes('fsan_pro'))) {
          setUserTier('pro');
        } else {
          setUserTier('free');
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load account data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    let mutationVars = `id: "${relayId}", firstName: "${formData.firstName}", lastName: "${formData.lastName}", email: "${formData.email}"`;
    if (formData.password) {
      mutationVars += `, password: "${formData.password}"`;
    }

    const query = `
      mutation UpdateAccount {
        updateUser(input: { ${mutationVars} }) {
          user {
            id
            firstName
            lastName
            email
          }
        }
      }
    `;

    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ query }),
        cache: 'no-store'
      });

      const json = await res.json();

      if (json.errors) {
        setMessage({ type: 'error', text: json.errors[0].message });
      } else {
        setMessage({ type: 'success', text: 'Account updated successfully!' });
        setFormData({ ...formData, password: '' }); 
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    setMessage({ type: '', text: '' });

    const query = `
      mutation DeleteSelf {
        deleteSelf(input: { confirm: true }) {
          deleted
        }
      }
    `;

    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ query }),
      });

      const json = await res.json();

      if (json.errors) {
        setMessage({ type: 'error', text: json.errors[0].message });
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      } else {
        signOut({ callbackUrl: '/all/home' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred while deleting.' });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <>
      <Header activeSport="All" />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-16">
        <Sidebar activeSport="All" />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <div className="mb-6">
            <h1 className="text-4xl font-black uppercase tracking-wider text-white drop-shadow-lg">My Account</h1>
            <p className="text-gray-400 mt-2 text-sm">Manage your profile, security, and billing.</p>
          </div>

          <div className="flex gap-6 border-b border-gray-800 mb-8 overflow-x-auto scrollbar-hide">
             <button 
                onClick={() => { setActiveTab('profile'); setMessage({type:'', text:''}); }} 
                className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-gray-400 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
             >
                Profile & Security
             </button>
             <button 
                onClick={() => { setActiveTab('subscription'); setMessage({type:'', text:''}); }} 
                className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === 'subscription' ? 'border-gray-400 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
             >
                Subscription
             </button>
             <button 
                onClick={() => { setActiveTab('perks'); setMessage({type:'', text:''}); }} 
                className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === 'perks' ? 'border-gray-400 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
             >
                My Perks
             </button>
          </div>

          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start animate-in fade-in duration-300">
              
              <div className="xl:col-span-2 bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-white mb-6">
                    <ShieldCheck className="text-gray-400" /> Security & Profile
                  </h3>

                  {message.text && (
                    <div className={`mb-6 p-4 border rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'error' ? 'bg-red-900/30 border-red-900 text-red-400' : 'bg-green-900/30 border-green-900 text-green-400'}`}>
                      {message.type === 'success' && <CheckCircle2 size={18} />}
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleUpdateAccount} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="relative">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">First Name</label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                            type="text" 
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Last Name</label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                            type="text" 
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Email Address</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Change Password <span className="text-gray-600 lowercase tracking-normal font-normal">(Leave blank to keep current)</span></label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="password" 
                          placeholder="Enter a new password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm placeholder-gray-600"
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-6 border-t border-gray-800 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full md:w-auto px-8 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg disabled:opacity-50"
                      >
                        {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-12 pt-8 border-t border-gray-800">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white mb-2">
                      <AlertTriangle className="text-gray-500" size={20} /> Delete Account
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Once you delete your account, your profile and subscription history will be permanently erased. This action cannot be undone.
                    </p>

                    {!showDeleteConfirm ? (
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setShowDeleteConfirm(true); }}
                        className="px-6 py-3 bg-[#111] border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-colors shadow-inner"
                      >
                        Delete My Account
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#111] p-4 rounded-xl border border-gray-700 shadow-inner">
                        <span className="text-sm font-bold text-gray-300 flex-1 text-center sm:text-left">Are you absolutely sure?</span>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); setShowDeleteConfirm(false); }}
                            disabled={isDeleting}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'Yes, Delete Everything'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-1 flex flex-col gap-6">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-white group-hover:scale-110 transition-transform">
                    <CreditCard size={64} />
                  </div>
                  
                  {userTier === 'pro-plus' ? (
                     <>
                        <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 uppercase tracking-wider mb-2 relative z-10">Pro+ Network</h3>
                        <p className="text-sm text-gray-400 mb-6 relative z-10">You have unlocked everything. Enjoy unrestricted access to all rankings, tools, and the premium community.</p>
                        <button disabled className="w-full bg-gray-800 text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-lg relative z-10 opacity-50 cursor-not-allowed">
                          Max Tier Unlocked
                        </button>
                     </>
                  ) : userTier === 'pro' ? (
                     <>
                        <h3 className="text-lg font-black text-red-400 uppercase tracking-wider mb-2 relative z-10">Pro Network</h3>
                        <p className="text-sm text-gray-400 mb-6 relative z-10">You are a Pro member! Upgrade to Pro+ to unlock the Rookie Guide, Jersey League, and merch discounts.</p>
                        <button onClick={() => router.push('/subscribe')} className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all text-sm shadow-lg relative z-10">
                          Upgrade to Pro+
                        </button>
                     </>
                  ) : (
                     <>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 relative z-10">Premium Network</h3>
                        <p className="text-sm text-gray-400 mb-6 relative z-10">You are currently on a free account. Upgrade to unlock all premium rankings, articles, and the trade calculator.</p>
                        <button onClick={() => router.push('/subscribe')} className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all text-sm shadow-lg relative z-10">
                          View Plans
                        </button>
                     </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl p-6 md:p-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  <CreditCard className="text-gray-400" /> Manage Subscription
                </h3>
              </div>

              {message.text && (
                 <div className="mb-6 p-4 bg-green-900/30 border border-green-900 rounded-xl text-green-400 text-sm font-bold flex items-center gap-3">
                   <CheckCircle2 size={18} /> {message.text}
                 </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-800 pb-3">Current Plan</h4>
                  <div className="bg-[#111] p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
                    
                    {userTier === 'pro-plus' ? (
                       <>
                         <p className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 font-black text-2xl mb-2">Pro+ Member</p>
                         <p className="text-sm text-gray-500 mb-6">You have top-tier access to the entire FSAN Network.</p>
                         <button disabled className="w-full bg-gray-800 border border-gray-700 text-gray-400 font-black uppercase tracking-widest py-3.5 rounded-xl transition-all text-sm shadow-lg mt-auto opacity-50 cursor-not-allowed">Active Plan</button>
                       </>
                    ) : userTier === 'pro' ? (
                       <>
                         <p className="text-red-400 font-black text-2xl mb-2">Pro Member</p>
                         <p className="text-sm text-gray-500 mb-6">Upgrade to Pro+ for maximum access and perks.</p>
                         <button onClick={() => router.push('/subscribe')} className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all text-sm shadow-lg mt-auto">Upgrade to Pro+</button>
                       </>
                    ) : (
                       <>
                         <p className="text-gray-200 font-black text-xl mb-2">Free Network Member</p>
                         <p className="text-sm text-gray-500 mb-6">Upgrade to Premium to access all features.</p>
                         <button onClick={() => router.push('/subscribe')} className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all text-sm shadow-lg mt-auto">Upgrade to Premium</button>
                       </>
                    )}

                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-800 pb-3">Billing History</h4>
                  <div className="bg-[#111] p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
                    <p className="text-sm text-gray-400 mb-6">Manage your payment methods and view past receipts directly in Stripe.</p>
                    <button disabled className="w-full mt-auto bg-gray-800/30 border border-gray-700 text-gray-500 font-bold uppercase tracking-widest py-3.5 rounded-xl transition-colors text-xs cursor-not-allowed">Customer Portal Coming Soon</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'perks' && (
            <div className="animate-in fade-in duration-300">
               <h3 className="text-xl font-bold flex items-center gap-2 text-white mb-6">
                 <Tag className="text-gray-400" /> Exclusive Member Perks
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 <div className={`border rounded-2xl shadow-xl p-6 md:p-8 relative overflow-hidden group transition-all ${userTier === 'pro-plus' ? 'bg-gradient-to-br from-[#2a1c11] to-[#111] border-[#f5a623]/50' : 'bg-gradient-to-br from-[#1a1a1a] to-[#111] border-gray-800'}`}>
                   <div className={`absolute top-0 right-0 p-4 transition-transform duration-500 ${userTier === 'pro-plus' ? 'opacity-20 text-[#f5a623] group-hover:scale-110' : 'opacity-5 text-white'}`}><FileText size={100} /></div>
                   <h3 className={`text-xl font-black uppercase tracking-wider mb-2 relative z-10 ${userTier === 'pro-plus' ? 'text-white drop-shadow-md' : 'text-gray-300'}`}>2026 Rookie Guide</h3>
                   <p className={`text-sm mb-8 relative z-10 ${userTier === 'pro-plus' ? 'text-gray-300' : 'text-gray-500'}`}>The ultimate 150-page breakdown of this year's draft class. Exclusive for Pro+ members.</p>
                   
                   {userTier === 'pro-plus' ? (
                     <button className="bg-gradient-to-r from-orange-500 to-[#f5a623] text-black font-black uppercase tracking-widest py-3 px-6 rounded-xl text-xs relative z-10 w-full md:w-auto shadow-lg">Download PDF</button>
                   ) : (
                     <button onClick={() => router.push('/subscribe')} className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 font-bold uppercase tracking-widest py-3 px-6 rounded-xl text-xs relative z-10 w-full md:w-auto shadow-inner transition-colors">Locked: Pro+ Only</button>
                   )}
                 </div>
                 
                 <div className={`border rounded-2xl shadow-xl p-6 md:p-8 relative overflow-hidden group transition-all ${(userTier === 'pro-plus' || userTier === 'pro') ? 'bg-gradient-to-br from-[#301012] to-[#111] border-red-900/50' : 'bg-gradient-to-br from-[#1a1a1a] to-[#111] border-gray-800'}`}>
                   <div className={`absolute top-0 right-0 p-4 transition-transform duration-500 ${(userTier === 'pro-plus' || userTier === 'pro') ? 'opacity-20 text-red-500 group-hover:scale-110' : 'opacity-5 text-white'}`}><ShoppingCart size={100} /></div>
                   <h3 className={`text-xl font-black uppercase tracking-wider mb-2 relative z-10 ${(userTier === 'pro-plus' || userTier === 'pro') ? 'text-white' : 'text-gray-300'}`}>Merch Shop Discount</h3>
                   <p className={`text-sm mb-8 relative z-10 ${(userTier === 'pro-plus' || userTier === 'pro') ? 'text-gray-300' : 'text-gray-500'}`}>Get 20% off all apparel in the FSAN shop. Exclusive for Premium members.</p>
                   
                   {(userTier === 'pro-plus' || userTier === 'pro') ? (
                     <div className="bg-red-900/30 border border-red-500 text-red-400 font-mono text-center py-3 px-6 rounded-xl text-lg font-bold tracking-widest relative z-10 shadow-inner flex items-center justify-between">
                       FSAN20X <Tag size={18} className="text-red-500/50"/>
                     </div>
                   ) : (
                     <button onClick={() => router.push('/subscribe')} className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 font-bold uppercase tracking-widest py-3 px-6 rounded-xl text-xs relative z-10 w-full shadow-inner transition-colors">Locked: Premium Only</button>
                   )}
                 </div>

               </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default function AccountDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212] flex items-center justify-center"><Loader2 size={48} className="animate-spin text-gray-600" /></div>}>
      <AccountDashboardContent />
    </Suspense>
  );
}