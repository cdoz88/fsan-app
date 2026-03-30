"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Loader2, CheckCircle2, Flame, Shield, Trophy, Sparkles, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SubscribePage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const activeSport = 'All'; 
  
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [isLoading, setIsLoading] = useState(true);
  
  const [perks, setPerks] = useState({
    free: ["Ad Free Experience", "Unmetered Access to Articles"],
    pro: ["Save 33%", "Everything in FREE", "Access to our general Sellout Crowds community", "10% off all orders from fsan.shop"],
    proPlus: ["Save 38%", "Everything in PRO", "Access to our Pro+ group on Sellout Crowds", "Entry into Jersey League", "Free Rookie Guide", "Free shipping on all orders from fsan.shop"]
  });

  useEffect(() => {
    fetchPerks();
  }, []);

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

  const handleCheckout = (plan) => {
    alert(`Initiating checkout for ${plan} on ${billingCycle} billing...`);
  };

  return (
    <>
      <Header activeSport={activeSport} />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport={activeSport} />
        
        <div className="flex-1 w-full min-w-0 pt-6 relative">
          
          {/* GO BACK BUTTON */}
          <button 
            onClick={() => router.back()} 
            className="hidden md:flex absolute left-0 top-6 items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest z-10"
          >
            <ArrowLeft size={14} /> Go Back
          </button>

          {/* HERO SECTION */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Mobile Go Back (shows above the badge on small screens) */}
            <button 
              onClick={() => router.back()} 
              className="md:hidden flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-6 w-full"
            >
              <ArrowLeft size={14} /> Go Back
            </button>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-gray-300 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} className="text-yellow-400" /> Upgrade Your Game
            </div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 mb-2 drop-shadow-2xl">
              Dominate Your League
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              Stop guessing and start winning. Join thousands of fantasy champions who rely on FSAN for real-time advice, elite tools, and an exclusive community.
            </p>
          </div>
          
          {/* TOGGLE SWITCH */}
          <div className="flex justify-center items-center gap-4 mb-16 animate-in fade-in duration-700 delay-150">
            <span className={`text-sm font-black uppercase tracking-widest transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-600'}`}>Yearly <span className="text-green-500 lowercase tracking-normal font-bold ml-1">(Save 33%)</span></span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'yearly' ? 'monthly' : 'yearly')}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 shadow-inner ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-red-600 to-orange-500' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${billingCycle === 'yearly' ? 'left-1' : 'translate-x-9'}`}></div>
            </button>
            <span className={`text-sm font-black uppercase tracking-widest transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-600'}`}>Monthly</span>
          </div>

          {/* PRICING CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 max-w-6xl mx-auto items-center">
            
            {/* FREE PLAN */}
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 hover:border-gray-600 rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:shadow-2xl group animate-in fade-in slide-in-from-left-8">
              <div className="text-center mb-8 pb-8 border-b border-gray-800">
                <div className="w-12 h-12 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield size={24} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-black italic text-white mb-2 tracking-wider">FREE</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest h-5">Zero Cost Perks</p>
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
                onClick={() => handleCheckout('free')}
                className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg text-sm"
              >
                Current Plan
              </button>
            </div>

            {/* PRO+ PLAN (FAN FAVORITE HIGHLIGHT) */}
            <div className="relative bg-gradient-to-b from-[#2a1c11] to-[#111] border-2 border-[#f5a623] rounded-3xl p-8 flex flex-col h-full shadow-[0_0_40px_rgba(245,166,35,0.15)] transform lg:-translate-y-6 z-10 animate-in fade-in slide-in-from-bottom-8">
              {/* Floating Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-[#f5a623] text-black text-[11px] font-black uppercase tracking-widest py-1.5 px-6 rounded-full flex items-center gap-1.5 shadow-xl whitespace-nowrap">
                 <Flame size={14} className="fill-black" /> Fan Favorite
              </div>

              <div className="text-center mb-8 pb-8 border-b border-[#f5a623]/20">
                <div className="w-16 h-16 bg-[#f5a623]/20 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                  <Flame size={32} className="text-[#f5a623] fill-[#f5a623]/20" />
                </div>
                <h3 className="text-3xl font-black italic text-white mb-2 tracking-wider drop-shadow-md">PRO+</h3>
                <p className="text-[#f5a623] text-xs font-bold uppercase tracking-widest h-5">{billingCycle === 'yearly' ? 'Billed $59.88 Annually' : 'Billed Monthly'}</p>
                <div className="mt-6 flex justify-center items-start gap-1">
                  <span className="text-6xl font-black text-white drop-shadow-lg">{billingCycle === 'yearly' ? '$4.99' : '$7.99'}</span>
                </div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest block mt-2">/ Month</span>
              </div>

              <div className="flex flex-col gap-4 mb-8 flex-1">
                {isLoading ? <Loader2 size={24} className="animate-spin text-[#f5a623] mx-auto my-auto" /> : perks.proPlus.map((perk, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-[#f5a623] shrink-0" />
                    <span className="text-sm font-bold text-gray-200 leading-snug">{perk}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleCheckout('pro-plus')}
                className="w-full bg-gradient-to-r from-orange-500 to-[#f5a623] hover:from-orange-400 hover:to-[#ffb732] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,166,35,0.4)] hover:shadow-[0_0_25px_rgba(245,166,35,0.6)] text-sm"
              >
                Get Pro+ Now
              </button>
            </div>

            {/* PRO PLAN */}
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 hover:border-gray-600 rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:shadow-2xl group animate-in fade-in slide-in-from-right-8">
              <div className="text-center mb-8 pb-8 border-b border-gray-800">
                <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Trophy size={24} className="text-[#f87171]" />
                </div>
                <h3 className="text-2xl font-black italic text-white mb-2 tracking-wider">PRO</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest h-5">{billingCycle === 'yearly' ? 'Billed $23.88 Annually' : 'Billed Monthly'}</p>
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
                className="w-full bg-[#111] border border-[#f87171] hover:bg-[#f87171]/10 text-[#f87171] font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg text-sm"
              >
                Get Pro
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}