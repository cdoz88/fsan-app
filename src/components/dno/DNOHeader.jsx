"use client";
import React from 'react';
import Link from 'next/link';

export default function DNOHeader({ onOpenAuthModal }) {
  return (
    <header className="w-full bg-[#0a0a0a] border-b border-zinc-800/80 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 h-20 flex items-center justify-between">
        
        {/* DNO Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp" 
            alt="Draft Night Out" 
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105" 
          />
        </Link>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onOpenAuthModal('login')}
            className="text-xs font-bold text-gray-300 hover:text-white uppercase tracking-widest transition-colors hidden sm:block"
          >
            Log In
          </button>
          
          <button 
            onClick={() => onOpenAuthModal('register')}
            className="relative group p-[2px] rounded-xl bg-gradient-to-r from-teal-400 to-[#1b75bb] shadow-lg transition-transform hover:-translate-y-0.5"
          >
            <div className="bg-[#1a1a1a] group-hover:bg-[#222] transition-colors rounded-[10px] px-6 py-2.5 flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">
              Register
            </div>
          </button>
        </div>

      </div>
    </header>
  );
}