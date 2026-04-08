"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { User, Mail, Lock, Loader2, CreditCard, ShieldCheck, CheckCircle2, FileText, ShoppingCart, Tag, AlertTriangle, ShieldAlert, Book, Download, Shirt, Users, Settings, Gift, LogOut, ChevronRight, Image as ImageIcon } from 'lucide-react';

function AccountDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState('Profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [userTier, setUserTier] = useState('free');
  const [isAdmin, setIsAdmin] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [relayId, setRelayId] = useState('');
  const [rookieGuideUrl, setRookieGuideUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const activeSport = 'All';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/home');
    }
  }, [status, router]);

  useEffect(() => {
    if (searchParams?.get('checkout') === 'success') {
      setActiveTab('Subscription');
      window.history.replaceState(null, '', '/account');
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.token) {
      fetchUserData();
      fetchRookieGuideLink();
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
        cache: 'no-store' 
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
        
        if (roles.includes('administrator')) {
          setIsAdmin(true);
        }

        if (roles.some(r => r.includes('pro+') || r.includes('pro+ member') || r.includes('fsan_pro_plus'))) {
          setUserTier('pro-plus');
        } else if (roles.some(r => r.includes('pro') || r.includes('pro member') || r.includes('fsan_pro'))) {
          setUserTier('pro');
        } else {
          setUserTier('free');
        }
      } else {
        setUserTier('free');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load account data.' });
      setUserTier('free');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRookieGuideLink = async () => {
    const query = `
      query GetRookieGuide {
        menu(id: "rookie-guide", idType: SLUG) {
          menuItems {
            nodes {
              url
            }
          }
        }
      }
    `;
    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        cache: 'no-store'
      });
      const json = await res.json();
      if (json?.data?.menu?.menuItems?.nodes?.[0]?.url) {
        setRookieGuideUrl(json.data.menu.menuItems.nodes[0].url);
      }
    } catch (error) {
      console.error("Failed to fetch Rookie Guide link.");
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
        signOut({ callbackUrl: '/home' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred while deleting.' });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleManageBilling = async () => {
    setIsPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to open billing portal.');
        setIsPortalLoading(false);
      }
    } catch (error) {
      console.error('Portal Error:', error);
      alert('An unexpected error occurred.');
      setIsPortalLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <>
        <Header activeSport={activeSport} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="animate-spin text-red-600" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Loading Account...</p>
        </div>
      </>
    );
  }

  if (!session) return null;

  const tabs = [
    { id: 'Profile', icon: <User size={18} /> },
    { id: 'Subscription', icon: <CreditCard size={18} /> },
    { id: 'My Perks', icon: <Gift size={18} /> },
  ];

  if (isAdmin) {
    tabs.push({ id: 'Admin Tools', icon: <ShieldAlert size={18} /> });
  }

  const renderTabContent = () => {
    return (
      <div className="bg-[#111] rounded-3xl border border-gray-800 p-6 md:p-10 shadow-2xl relative overflow-hidden min-h-[400px]">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        {activeTab === 'Profile' && (
          <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6 flex items-center gap-2">
              <ShieldCheck className="text-gray-400" /> Security & Profile
            </h2>

            {message.text && (
              <div className={`mb-6 p-4 border rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'error' ? 'bg-red-900/30 border-red-900 text-red-400' : 'bg-green-900/30 border-green-900 text-green-400'}`}>
                {message.type === 'success' && <CheckCircle2 size={18} />}
                {message.text}
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
               <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="w-32 h-32 rounded-full bg-[#1a1a1a] border border-gray-700 flex items-center justify-center overflow-hidden shadow-inner relative group cursor-pointer">
                    {session.user?.image ? (
                        <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl font-black text-gray-600">{session.user?.name?.charAt(0) || 'U'}</span>
                    )}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon size={24} className="text-white" />
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Avatar synced via Gravatar</span>
               </div>

               <div className="flex-1 w-full space-y-6">
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
                            className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white"
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
                            className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white"
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
                          className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white"
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
                          className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white placeholder-gray-600"
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
               </div>
            </div>

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
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 shadow-inner">
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
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border border-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'Yes, Delete Everything'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'Subscription' && (
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
                   <button 
                      onClick={handleManageBilling}
                      disabled={isPortalLoading}
                      className="w-full md:w-auto bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                   >
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
        )}

        {activeTab === 'My Perks' && (
          <div className="space-y-6 animate-in fade-in duration-500 relative z-10">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">Your Exclusive Perks</h2>
            
            {userTier === 'free' ? (
               <div className="bg-[#1a1a1a] rounded-2xl border border-dashed border-gray-700 p-10 text-center flex flex-col items-center">
                   <Gift size={48} className="text-gray-600 mb-4" />
                   <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Upgrade to Unlock Perks</h3>
                   <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">Pro and Pro+ members get exclusive access to our Rookie Draft Guide, Jersey Leagues, and the Sellout Crowds community.</p>
                   <Link href="/subscribe" className="bg-gradient-to-r from-red-600 to-red-800 text-white font-black uppercase tracking-widest text-xs px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg">
                       View Premium Plans
                   </Link>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Rookie Draft Guide Card - PRO+ ONLY */}
                  {userTier === 'pro-plus' ? (
                      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-600 transition-all shadow-lg flex flex-col">
                          <div className="absolute -right-4 -top-4 text-gray-800/20 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500"><Book size={120} /></div>
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="w-12 h-12 bg-red-900/20 text-red-500 border border-red-500/30 rounded-xl flex items-center justify-center mb-4 shadow-inner"><Book size={20} /></div>
                              <h3 className="text-lg font-black text-white uppercase tracking-wide mb-2">Rookie Draft Guide</h3>
                              <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-1 pr-4">Download the official FSAN Rookie Guide to dominate your dynasty rookie drafts with exclusive player grades and tape breakdowns.</p>
                              
                              {rookieGuideUrl ? (
                                  <a href={rookieGuideUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-[#1b75bb] via-[#c30b16] to-[#f5a623] hover:opacity-90 text-white font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                                      <Download size={16} /> Download PDF
                                  </a>
                              ) : (
                                  <button disabled className="w-full bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                                      <Loader2 size={16} className="animate-spin" /> Syncing File...
                                  </button>
                              )}
                          </div>
                      </div>
                  ) : (
                      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                          <div className="absolute -right-4 -top-4 text-gray-800/20 z-0 pointer-events-none"><Book size={120} /></div>
                          <div className="relative z-10 flex flex-col h-full">
                              <h3 className="text-lg font-black text-gray-300 uppercase tracking-wide mb-2">Rookie Draft Guide</h3>
                              <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-1 pr-4">The ultimate 150-page breakdown of this year's draft class. Exclusive for Pro+ members.</p>
                              
                              <button onClick={() => router.push('/subscribe')} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 font-bold uppercase tracking-widest py-3 px-6 rounded-xl text-xs relative z-10 shadow-inner transition-colors">Locked: Pro+ Only</button>
                          </div>
                      </div>
                  )}

                  {/* Merch Shop Discount - PRO & PRO+ */}
                  <div className={`border rounded-2xl shadow-xl p-6 relative overflow-hidden group transition-all flex flex-col h-full ${(userTier === 'pro-plus' || userTier === 'pro') ? 'bg-gradient-to-br from-[#301012] to-[#111] border-red-900/50' : 'bg-gradient-to-br from-[#1a1a1a] to-[#111] border-gray-800'}`}>
                   <div className={`absolute -right-4 -top-4 transition-transform duration-500 pointer-events-none ${(userTier === 'pro-plus' || userTier === 'pro') ? 'text-red-500/20 group-hover:scale-110' : 'text-gray-800/20'}`}><ShoppingCart size={120} /></div>
                   
                   <div className="relative z-10 flex flex-col h-full">
                     <h3 className={`text-lg font-black uppercase tracking-wider mb-2 ${(userTier === 'pro-plus' || userTier === 'pro') ? 'text-white' : 'text-gray-300'}`}>Merch Shop Discount</h3>
                     <p className={`text-xs leading-relaxed mb-6 flex-1 pr-4 ${(userTier === 'pro-plus' || userTier === 'pro') ? 'text-gray-300' : 'text-gray-500'}`}>Get 20% off all apparel in the FSAN shop. Exclusive for Premium members.</p>
                     
                     {(userTier === 'pro-plus' || userTier === 'pro') ? (
                       <div className="bg-red-900/30 border border-red-500 text-red-400 font-mono text-center py-3 px-6 rounded-xl text-lg font-bold tracking-widest relative z-10 shadow-inner flex items-center justify-between">
                         FSAN20X <Tag size={18} className="text-red-500/50"/>
                       </div>
                     ) : (
                       <button onClick={() => router.push('/subscribe')} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 font-bold uppercase tracking-widest py-3 px-6 rounded-xl text-xs relative z-10 shadow-inner transition-colors">Locked: Premium Only</button>
                     )}
                   </div>
                 </div>

                  {/* Jersey Leagues Card - PRO+ ONLY */}
                  {userTier === 'pro-plus' && (
                      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-600 transition-all shadow-lg flex flex-col">
                          <div className="absolute -right-4 -top-4 text-gray-800/20 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500"><Shirt size={120} /></div>
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="w-12 h-12 bg-orange-900/20 text-orange-500 border border-orange-500/30 rounded-xl flex items-center justify-center mb-4 shadow-inner"><Shirt size={20} /></div>
                              <h3 className="text-lg font-black text-white uppercase tracking-wide mb-2">Jersey Leagues</h3>
                              <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-1 pr-4">Compete in an exclusive redraft tournament to win an autographed jersey from your favorite NFL player and a championship ring.</p>
                              
                              <Link href="/football/jersey-leagues" className="w-full bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                                  Submit Registration <ChevronRight size={14} />
                              </Link>
                          </div>
                      </div>
                  )}

                  {/* Community Card - PRO & PRO+ */}
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-600 transition-all shadow-lg flex flex-col">
                      <div className="absolute -right-4 -top-4 text-gray-800/20 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500"><Users size={120} /></div>
                      <div className="relative z-10 flex flex-col h-full">
                          <div className="w-12 h-12 bg-blue-900/20 text-blue-500 border border-blue-500/30 rounded-xl flex items-center justify-center mb-4 shadow-inner"><Users size={20} /></div>
                          <h3 className="text-lg font-black text-white uppercase tracking-wide mb-2">Premium Community</h3>
                          <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-1 pr-4">Get direct access to our analysts and chat with other premium members in our exclusive Sellout Crowds community boards.</p>
                          
                          <a href="https://selloutcrowds.com/" target="_blank" rel="noopener noreferrer" className="w-full bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                              Join the Conversation <ChevronRight size={14} />
                          </a>
                      </div>
                  </div>

               </div>
            )}
          </div>
        )}

        {activeTab === 'Admin Tools' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-500 relative z-10">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">Admin Tools</h2>
            
            <div className="bg-gradient-to-br from-red-900/20 to-[#111] border border-red-900/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500 group-hover:scale-110 transition-transform pointer-events-none">
                <ShieldAlert size={120} />
              </div>
              <h3 className="text-xl font-black text-red-500 uppercase tracking-wider mb-2 relative z-10">Ad Manager</h3>
              <p className="text-sm text-gray-300 mb-8 max-w-lg relative z-10">Manage global advertisements and promotional banners across the entire network.</p>
              <Link href="/admin/ads" className="inline-block bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-3 px-8 rounded-xl transition-all text-sm shadow-lg relative z-10 text-center w-full md:w-auto">
                Launch Ad Manager
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Header activeSport={activeSport} />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport={activeSport} />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <div className="flex flex-col md:flex-row gap-8">
             
             {/* LEFT NAV BAR */}
             <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMessage({type:'', text:''}); }}
                    className={`flex items-center justify-between px-5 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg' 
                        : 'bg-[#111] border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       {tab.icon} {tab.id}
                    </div>
                    {activeTab === tab.id && <ChevronRight size={16} />}
                  </button>
                ))}

                <button 
                  onClick={() => signOut({ callbackUrl: '/home' })}
                  className="flex items-center gap-3 px-5 py-4 rounded-xl font-bold uppercase tracking-widest text-xs text-gray-500 hover:text-red-500 bg-[#111] border border-gray-800 hover:border-red-900/50 hover:bg-red-900/10 transition-all mt-4"
                >
                  <LogOut size={18} /> Sign Out
                </button>
             </div>

             {/* MAIN CONTENT AREA */}
             <div className="flex-1 w-full">
                {renderTabContent()}
             </div>
          </div>
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