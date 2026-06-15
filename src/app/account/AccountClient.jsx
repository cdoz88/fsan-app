"use client";
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, CreditCard, ShieldAlert, Gift, LogOut, ChevronRight, Link as LinkIcon } from 'lucide-react';

// Import the specific tab components
import ProfileTab from './tabs/ProfileTab';
import SyncedLeaguesTab from './tabs/SyncedLeaguesTab';
import SubscriptionTab from './tabs/SubscriptionTab';
import MyPerksTab from './tabs/MyPerksTab';

export default function AccountClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('Profile');
  const [userTier, setUserTier] = useState('free');
  const [isAdmin, setIsAdmin] = useState(false); 

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'profile') setActiveTab('Profile');
      else if (hash === 'synced-leagues') setActiveTab('Synced Leagues');
      else if (hash === 'subscription') setActiveTab('Subscription');
      else if (hash === 'my-perks') setActiveTab('My Perks');
      else if (hash === 'admin-tools') setActiveTab('Admin Tools');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const hash = tabId.toLowerCase().replace(/\s+/g, '-');
    window.history.pushState(null, '', `#${hash}`);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/home');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const roles = session.user.roles || [];
      
      // Grant Ads Manager access to Admins & Editors
      if (roles.includes('administrator') || roles.includes('editor')) {
        setIsAdmin(true);
      }

      // 🚀 CLIENT-SIDE FAILSAFE: Explicitly grant Pro+ tools to staff regardless of cached session token!
      const isStaff = roles.some(r => r.includes('administrator') || r.includes('editor') || r.includes('author'));
      
      if (isStaff) {
        setUserTier('pro-plus');
      } else if (session.user.tier) {
        // Fix any lingering underscores from the old backend token
        setUserTier(session.user.tier.replace('_', '-'));
      } else {
        setUserTier('free');
      }
    }
  }, [status, session]);

  if (!session) return null;

  const tabs = [
    { id: 'Profile', icon: <User size={18} /> },
    { id: 'Synced Leagues', icon: <LinkIcon size={18} /> },
    { id: 'Subscription', icon: <CreditCard size={18} /> },
    { id: 'My Perks', icon: <Gift size={18} /> },
  ];

  if (isAdmin) {
    tabs.push({ id: 'Admin Tools', icon: <ShieldAlert size={18} /> });
  }

  const renderTabContent = () => {
    return (
      <div className="bg-[#111] rounded-3xl border border-gray-800 p-6 md:p-10 shadow-2xl relative overflow-hidden min-h-[400px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        {activeTab === 'Profile' && <ProfileTab />}
        {activeTab === 'Synced Leagues' && <SyncedLeaguesTab userTier={userTier} />}
        {activeTab === 'Subscription' && <SubscriptionTab userTier={userTier} />}
        {activeTab === 'My Perks' && <MyPerksTab userTier={userTier} />}
        
        {activeTab === 'Admin Tools' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-500 relative z-10">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">Admin Tools</h2>
            <div className="bg-gradient-to-br from-red-900/20 to-[#111] border border-red-900/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500 group-hover:scale-110 transition-transform pointer-events-none">
                <ShieldAlert size={120} />
              </div>
              <h3 className="text-xl font-black text-red-500 uppercase tracking-wider mb-2 relative z-10">Ad Manager</h3>
              <p className="text-sm text-gray-300 mb-8 max-w-lg relative z-10">Manage global advertisements and promotional banners across the entire network.</p>
              <button onClick={() => router.push('/admin/ads')} className="inline-block bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-3 px-8 rounded-xl transition-all text-sm shadow-lg relative z-10 text-center w-full md:w-auto">
                Launch Ad Manager
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
       {/* LEFT NAV BAR */}
       <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center justify-between px-5 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg' 
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
  );
}