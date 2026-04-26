"use client";
import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ChevronDown } from 'lucide-react';

export default function MeteredArticle({ articleId, isUserLoggedIn, openAuth, children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [readsRemaining, setReadsRemaining] = useState(2);
  const [hasHitLimit, setHasHitLimit] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // 1. Fetch tracking data from local storage
    const storedData = localStorage.getItem('fsan_metered_wall');
    const now = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    let tracker = storedData ? JSON.parse(storedData) : { 
      reads: 0, 
      resetTime: now + oneWeek, 
      unlockedArticles: [] 
    };

    // 2. Check if a week has passed. If so, reset their quota!
    if (now > tracker.resetTime) {
      tracker = { reads: 0, resetTime: now + oneWeek, unlockedArticles: [] };
      localStorage.setItem('fsan_metered_wall', JSON.stringify(tracker));
    }

    // 3. If they already unlocked THIS specific article, let them keep reading it on refresh
    if (tracker.unlockedArticles.includes(articleId)) {
      setIsExpanded(true);
    } 
    
    // 4. Only calculate strict limits if the user is NOT logged in
    if (!isUserLoggedIn) {
      const remaining = Math.max(0, 2 - tracker.reads);
      setReadsRemaining(remaining);
      if (remaining === 0 && !tracker.unlockedArticles.includes(articleId)) {
        setHasHitLimit(true);
      }
    }

  }, [articleId, isUserLoggedIn]);

  const handleReadMore = () => {
    const storedData = localStorage.getItem('fsan_metered_wall');
    let tracker = storedData ? JSON.parse(storedData) : { reads: 0, resetTime: new Date().getTime() + (7 * 24 * 60 * 60 * 1000), unlockedArticles: [] };

    // Only deduct a read from their quota if they are a guest
    if (!isUserLoggedIn) {
      tracker.reads += 1;
      setReadsRemaining(Math.max(0, 2 - tracker.reads));
    }
    
    // Always save that they clicked this specific article so it stays open on refresh
    tracker.unlockedArticles.push(articleId);
    localStorage.setItem('fsan_metered_wall', JSON.stringify(tracker));

    setIsExpanded(true);

    // --- QUALITY VIEW TRACKING PING (Now fires for ALL users!) ---
    try {
      fetch('https://admin.fsan.com/wp-json/fsan/v1/quality-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article_id: articleId }),
      });
    } catch (error) {
      console.warn("Failed to log quality view tracking");
    }
  };

  // Don't render the wall until the client has checked local storage (prevents layout shift)
  if (!isClient) return <div className="animate-pulse h-96 bg-gray-900 rounded-xl mt-8 w-full"></div>;

  return (
    <div className="relative w-full flex-1 flex flex-col mt-4">
      
      <div className={`relative transition-all duration-700 overflow-hidden ${isExpanded ? 'max-h-none' : 'max-h-[1200px]'}`}>
        {children}
        
        {/* CSS Fade Out Gradient */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent z-10 pointer-events-none"></div>
        )}
      </div>

      {/* METERED PAYWALL UI (Shown to everyone until clicked) */}
      {!isExpanded && !hasHitLimit && (
        <div className="relative z-20 -mt-8 flex flex-col items-center justify-center p-6 bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl max-w-2xl mx-auto w-full text-center">
          
          <div className="p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] mb-4 w-full sm:w-auto hover:scale-[1.02] transition-transform shadow-lg cursor-pointer" onClick={handleReadMore}>
            <button 
              className="w-full px-8 py-4 bg-[#111] hover:bg-black text-white font-black uppercase tracking-widest rounded-[10px] flex items-center justify-center gap-2 transition-colors"
            >
              Continue Reading <ChevronDown size={18} />
            </button>
          </div>
          
          {/* Show sales pitch to guests, show a thank you to logged-in users */}
          {!isUserLoggedIn ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-400 font-bold mb-2">
                <Unlock size={16} className="text-green-500" />
                <span>You have {readsRemaining} free {readsRemaining === 1 ? 'article' : 'articles'} remaining this week.</span>
              </div>
              <p className="text-xs text-gray-500 font-bold">
                Want to read without limits? <button onClick={() => openAuth('subscribe')} className="text-red-500 hover:text-red-400 underline transition-colors uppercase tracking-widest ml-1">Create a free account</button>
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-400 font-bold">
              <Unlock size={16} className="text-[#1b75bb]" />
              <span>Thank you for being a registered member!</span>
            </div>
          )}
        </div>
      )}

      {/* HARD PAYWALL UI (0 Reads Remaining - Only guests will ever see this) */}
      {!isExpanded && hasHitLimit && !isUserLoggedIn && (
        <div className="relative z-20 -mt-10 flex flex-col items-center justify-center p-[2px] rounded-[24px] bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] max-w-2xl mx-auto w-full shadow-2xl">
          <div className="bg-[#1a1a1a] p-8 rounded-[22px] text-center w-full h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
              <Lock size={28} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-2">Weekly Limit Reached</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-md">
              You've read your 2 free articles for the week! Create a free account today to instantly unlock unlimited access to all of our standard content.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-4">
              <button onClick={() => openAuth('subscribe')} className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg text-sm flex-1">
                Create Free Account
              </button>
              <button onClick={() => openAuth('login')} className="px-8 py-3.5 bg-[#111] border border-gray-700 hover:bg-gray-800 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-inner text-sm flex-1">
                Log In
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}