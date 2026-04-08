"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import AuthModal from '../../components/AuthModal';
import { Loader2, CheckCircle2, Flame, Shield, Trophy, Sparkles, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SubscribePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const activeSport = 'All'; 
  
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(null); 
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [userTier, setUserTier] = useState('free'); 
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  
  const [perks, setPerks] = useState({
    free: ["Ad Free Experience", "Unmetered Access to Articles"],
    pro: ["Save 33%", "Everything in FREE", "Access to our general Sellout Crowds community", "10% off all orders from fsan.shop"],
    proPlus: ["Save 38%", "Everything in PRO", "Access to our Pro+ group on Sellout Crowds", "Entry into Jersey League", "Free Rookie Guide", "Free shipping on all orders from fsan.shop"]
  });

  useEffect(() => {
    fetchPerks();
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.token) {
      fetchUserRole();
    }
  }, [status, session]);

  const fetchUserRole = async () => {
    const query = `
      query GetViewerRole {
        viewer {
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
        const roles = json.data.viewer.roles?.nodes?.map(r => r.name.toLowerCase()) || [];
        if (roles.some(r => r.includes('pro+') || r.includes('pro+ member') || r.includes('fsan_pro_plus'))) {
          setUserTier('pro-plus');
        } else if (roles.some(r => r.includes('pro') || r.includes('pro member') || r.includes('fsan_pro'))) {
          setUserTier('pro');
        } else {
          setUserTier('free');
        }
      }
    } catch (error) {
      console.error("Failed to fetch user role on subscribe page.");
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user && pendingPlan) {
      setIsAuthModalOpen(false); 
      const planToProcess = pendingPlan;
      setPendingPlan(null); 
      
      if (planToProcess !== 'free') {
        handleCheckout(planToProcess); 
      }
    }
  }, [status, session, pendingPlan]);

  const fetchPerks = async () => {
    const query = `
      query GetPricingPerks {
        free: menu(id: "free-perks", idType: SLUG) { menuItems { nodes { label } } }
        pro: menu(id: "pro-perks", idType: SLUG) { menuItems { nodes { label } } }
        proPlus: menu(id: "pro-plus-perks", idType: SLUG) { menuItems { nodes { label } } }
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
      
      if (json?.data) {
        setPerks({
          free: json.data.free?.menuItems?.nodes?.map(n => n.label) || perks.free,
          pro: json.data.pro?.menuItems?.nodes?.map(n => n.label) || perks.pro,
          proPlus: json.data.proPlus?.menuItems?.nodes?.map(n => n.label) || perks.proPlus,
        });
      }
    } catch (error) {
      console.error("Failed to load WP menus for perks, using defaults.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (plan) => {
    if (status === 'unauthenticated' || !session) {
      setPendingPlan(plan);
      setIsAuthModalOpen(true);
      return;
    }

    if (plan === 'free') return; 

    setIsCheckingOut(plan);

    const priceIds = {
      yearly: {
        pro: 'price_1TH5H5BaSOn1la2fRtfzRPpp',
        'pro-plus': 'price_1TH5IaBaSOn1la2fS8s0HMPv'
      },
      monthly: {
        pro: 'price_1TH5HsBaSOn1la2fuOcXj2nq',
        'pro-plus': 'price_1TH5J9BaSOn1la2f861yf4yB'
      }
    };

    const priceId = priceIds[billingCycle][plan];

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId,
          userId: session.user.id,
          userEmail: session.user.email
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; 
      } else {
        alert('Error connecting to Stripe.');
        setIsCheckingOut(null);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert('An unexpected error occurred.');
      setIsCheckingOut(null);
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

  return (
    <>
      <Header activeSport={activeSport} />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport={activeSport} />
        
        <div className="flex-1 w-full min-w-0 pt-6 relative">
          
          <button 
            onClick={() => router.back()} 
            className="hidden md:flex absolute left-0 top-6 items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest z-10"
          >
            <ArrowLeft size={14} /> Go Back
          </button>

          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => router.back()} 
              className="md:hidden flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-6 w-full"
            >
              <ArrowLeft size={14} /> Go Back
            </button>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-gray-300 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} className="text-yellow-400" /> Upgrade Your Game
            </div>
            
            {/* UPDATED: Network 3-Color Gradient applied to the main title */}
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#1b75bb] via-[#c30b16] to-[#f5a623] mb-2 drop-shadow-2xl">
              Dominate Your League
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              Stop guessing and start winning. Join thousands of fantasy champions who rely on FSAN for real-time advice, elite tools, and an exclusive community.
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-4 mb-16 animate-in fade-in duration-700 delay-150">
            <span className={`text-sm font-black uppercase tracking-widest transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-600'}`}>Yearly <span className="text-green-500 lowercase tracking-normal font-bold ml-1">(Save over 30%)</span></span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'yearly' ? 'monthly' : 'yearly')}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 shadow-inner ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-[#1b75bb] via-[#c30b16] to-[#f5a623]' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${billingCycle === 'yearly' ? 'left-1' : 'translate-x-9'}`}></div>
            </button>
            <span className={`text-sm font-black uppercase tracking-widest transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-600'}`}>Monthly</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 max-w-6xl mx-auto items-center">
            
            {/* FREE PLAN */}
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 hover:border-gray-600 rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:shadow-2xl group animate-in fade-in slide-in-from-left-8">
              <div className="text-center mb-8 pb-8 border-b border-gray-800">
                <div className="w-12 h-12 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield size={24} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-black italic text-white mb-2 tracking-wider">FREE</h3>
                <div className="h-5 flex items-center justify-center">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Zero Cost Perks</p>
                </div>
                <div className="mt-6 flex justify-center items-start gap-1">
                  <span className="text-5xl font-black text-white">$0</span>
                </div>
                <span className="text-gray-600 text-xs font-bold uppercase tracking-widest block mt-2">/ Forever</span>
              </div>
              
              <div className="flex flex-col gap-4 mb-8 flex-1">
                {isLoading ? <Loader2 size={24} className="animate-spin text-gray-600 mx-auto my-auto" /> : perks.free.map((perk, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-blue-500 shrink-0" />
                    <span className="text-sm font-medium text-gray-300 leading-snug">{perk}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  if (status === 'authenticated' && userTier !== 'free') {
                    handleManageBilling();
                  } else {
                    handleCheckout('free');
                  }
                }}
                disabled={(status === 'authenticated' && userTier === 'free') || isPortalLoading}
                className="w-full bg-gray-800 hover:bg-gray-700 disabled:hover:bg-gray-800 border border-gray-600 disabled:border-gray-700 text-white disabled:text-gray-500 font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg text-sm flex items-center justify-center gap-2"
              >
                {isPortalLoading ? <Loader2 size={18} className="animate-spin text-white" /> : (status === 'authenticated' ? (userTier === 'free' ? 'Current Plan' : 'Downgrade via Stripe') : 'Create Free Account')}
              </button>
            </div>

            {/* PRO+ PLAN (FAN FAVORITE HIGHLIGHT) */}
            <div className="relative bg-[#1a1a1a] rounded-3xl p-[2px] flex flex-col h-full shadow-[0_0_40px_rgba(195,11,22,0.3)] transform lg:-translate-y-6 z-10 animate-in fade-in slide-in-from-bottom-8 bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#1b75bb] via-[#c30b16] to-[#f5a623] text-white text-[11px] font-black uppercase tracking-widest py-1.5 px-6 rounded-full flex items-center gap-1.5 shadow-xl whitespace-nowrap z-20">
                 <Flame size={14} className="fill-white" /> Fan Favorite
              </div>

              <div className="bg-gradient-to-b from-[#151515] to-[#0a0a0a] rounded-[22px] p-8 flex flex-col h-full relative z-10">
                <div className="text-center mb-8 pb-8 border-b border-gray-800">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#1b75bb]/20 via-[#c30b16]/20 to-[#f5a623]/20 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                    <Flame size={32} className="text-red-500 fill-red-500/20" />
                  </div>
                  <h3 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#1b75bb] via-[#c30b16] to-[#f5a623] mb-2 tracking-wider drop-shadow-md">PRO+</h3>
                  
                  {/* SAVINGS BADGE INTEGRATED */}
                  <div className="h-5 flex items-center justify-center gap-2">
                    <p className="text-gray-300 text-xs font-bold uppercase tracking-widest">{billingCycle === 'yearly' ? 'Billed $59.88 Annually' : 'Billed Monthly'}</p>
                    {billingCycle === 'yearly' && <span className="bg-green-500/20 text-green-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-500/30 shrink-0">Save 38%</span>}
                  </div>
                  
                  <div className="mt-6 flex justify-center items-start gap-1">
                    <span className="text-6xl font-black text-white drop-shadow-lg">{billingCycle === 'yearly' ? '$4.99' : '$7.99'}</span>
                  </div>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest block mt-2">/ Month</span>
                </div>

                <div className="flex flex-col gap-4 mb-8 flex-1">
                  {isLoading ? <Loader2 size={24} className="animate-spin text-red-500 mx-auto my-auto" /> : perks.proPlus.map((perk, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-red-500 shrink-0" />
                      <span className="text-sm font-bold text-gray-200 leading-snug">{perk}</span>
                    </div>
                  ))}
                </div>

                {/* UPDATED: Network Gradient applied to the PRO+ button */}
                <button 
                  onClick={() => handleCheckout('pro-plus')}
                  disabled={isCheckingOut === 'pro-plus' || userTier === 'pro-plus'}
                  className="w-full bg-gradient-to-r from-[#1b75bb] via-[#c30b16] to-[#f5a623] hover:opacity-90 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(195,11,22,0.4)] text-sm flex items-center justify-center gap-2 disabled:opacity-75 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:shadow-none"
                >
                  {isCheckingOut === 'pro-plus' ? <Loader2 size={18} className="animate-spin text-white" /> : userTier === 'pro-plus' ? 'Current Plan' : 'Get Pro+ Now'}
                </button>
              </div>
            </div>

            {/* PRO PLAN */}
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 hover:border-gray-600 rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:shadow-2xl group animate-in fade-in slide-in-from-right-8">
              <div className="text-center mb-8 pb-8 border-b border-gray-800">
                <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Trophy size={24} className="text-[#f87171]" />
                </div>
                <h3 className="text-2xl font-black italic text-white mb-2 tracking-wider">PRO</h3>
                
                {/* SAVINGS BADGE INTEGRATED */}
                <div className="h-5 flex items-center justify-center gap-2">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{billingCycle === 'yearly' ? 'Billed $23.88 Annually' : 'Billed Monthly'}</p>
                  {billingCycle === 'yearly' && <span className="bg-green-500/20 text-green-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-500/30 shrink-0">Save 33%</span>}
                </div>
                
                <div className="mt-6 flex justify-center items-start gap-1">
                  <span className="text-5xl font-black text-white">{billingCycle === 'yearly' ? '$1.99' : '$2.99'}</span>
                </div>
                <span className="text-gray-600 text-xs font-bold uppercase tracking-widest block mt-2">/ Month</span>
              </div>
              
              <div className="flex flex-col gap-4 mb-8 flex-1">
                {isLoading ? <Loader2 size={24} className="animate-spin text-gray-600 mx-auto my-auto" /> : perks.pro.map((perk, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-[#f87171] shrink-0" />
                    <span className="text-sm font-medium text-gray-300 leading-snug">{perk}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleCheckout('pro')}
                disabled={isCheckingOut === 'pro' || userTier === 'pro' || userTier === 'pro-plus'}
                className="w-full bg-[#111] border border-[#f87171] hover:bg-[#f87171]/10 text-[#f87171] font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:border-gray-700 disabled:text-gray-500"
              >
                {isCheckingOut === 'pro' ? <Loader2 size={18} className="animate-spin text-[#f87171]" /> : userTier === 'pro' ? 'Current Plan' : userTier === 'pro-plus' ? 'Included in Pro+' : 'Get Pro'}
              </button>
            </div>

          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={(isSuccess) => {
          setIsAuthModalOpen(false);
          if (!isSuccess) {
            setPendingPlan(null); 
          }
        }} 
        initialView="subscribe" 
      />
    </>
  );
}