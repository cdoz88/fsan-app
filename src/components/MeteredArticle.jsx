"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Unlock, ChevronDown } from 'lucide-react';

export default function MeteredArticle({ content, articleId, isUserLoggedIn }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [readsRemaining, setReadsRemaining] = useState(2);
  const [hasHitLimit, setHasHitLimit] = useState(false);
  const [isClient, setIsClient] = useState(false); // Prevents Next.js hydration mismatch

  useEffect(() => {
    setIsClient(true);
    
    // If they are logged in, bypass everything
    if (isUserLoggedIn) {
      setIsExpanded(true);
      return;
    }

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

    // 3. Evaluate their status
    const remaining = Math.max(0, 2 - tracker.reads);
    setReadsRemaining(remaining);

    // If they already unlocked THIS specific article, let them keep reading it
    if (tracker.unlockedArticles.includes(articleId)) {
      setIsExpanded(true);
    } else if (remaining === 0) {
      setHasHitLimit(true);
    }

  }, [articleId, isUserLoggedIn]);

  const handleReadMore = () => {
    const storedData = localStorage.getItem('fsan_metered_wall');
    let tracker = storedData ? JSON.parse(storedData) : { reads: 0, resetTime: new Date().getTime() + (7 * 24 * 60 * 60 * 1000), unlockedArticles: [] };

    // Deduct a read and save the article ID so they aren't charged twice if they refresh
    tracker.reads += 1;
    tracker.unlockedArticles.push(articleId);
    localStorage.setItem('fsan_metered_wall', JSON.stringify(tracker));

    setReadsRemaining(Math.max(0, 2 - tracker.reads));
    setIsExpanded(true);
  };

  // Don't render the wall until the client has checked local storage (prevents layout shift)
  if (!isClient) return <div className="animate-pulse h-96 bg-gray-900 rounded-xl mt-8"></div>;

  return (
    <div className="relative w-full">
      
      {/* ARTICLE CONTENT */}
      <div 
        className={`relative transition-all duration-700 overflow-hidden ${isExpanded ? 'max-h-none' : 'max-h-[400px]'}`}
      >
        <div 
          className="article-body text-gray-300 leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
        
        {/* CSS Fade Out Gradient */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent z-10 pointer-events-none"></div>
        )}
      </div>

      {/* METERED PAYWALL UI */}
      {!isExpanded && !hasHitLimit && (
        <div className="relative z-20 -mt-16 flex flex-col items-center justify-center p-6 bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl max-w-2xl mx-auto text-center">
          <button 
            onClick={handleReadMore}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mb-4"
          >
            Read Full Article <ChevronDown size={18} />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-400 font-bold mb-2">
            <Unlock size={16} className="text-green-500" />
            <span>You have {readsRemaining} free {readsRemaining === 1 ? 'article' : 'articles'} remaining this week.</span>
          </div>
          
          <p className="text-xs text-gray-500">
            Want to read without limits? <Link href="/login" className="text-red-500 hover:text-red-400 underline transition-colors">Create a free account</Link> to unlock all standard articles.
          </p>
        </div>
      )}

      {/* HARD PAYWALL UI (0 Reads Remaining) */}
      {!isExpanded && hasHitLimit && (
        <div className="relative z-20 -mt-16 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-red-900/50 rounded-2xl shadow-2xl max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
            <Lock size={28} />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-2">Weekly Limit Reached</h3>
          <p className="text-gray-400 text-sm mb-8 max-w-md">
            You've read your 2 free articles for the week! Create a free account today to instantly unlock unlimited access to all of our standard content.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/login" className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg text-sm">
              Create Free Account
            </Link>
            <Link href="/login" className="px-8 py-3.5 bg-[#111] border border-gray-700 hover:bg-gray-800 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-inner text-sm">
              Log In
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}