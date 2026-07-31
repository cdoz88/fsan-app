"use client";
import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User, LayoutGrid } from 'lucide-react';

export default function DNOHeader({ onOpenAuthModal }) {
  const { data: session, status } = useSession();

  return (
    <header className="absolute top-0 left-0 right-0 w-full z-50 flex items-center justify-between px-6 py-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
      {/* Logo & Main Page Navigation */}
      <div className="flex items-center gap-3 sm:gap-5">
        <Link href="/dno" className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0">
          <img 
            src="/images/dno/DNO-Logo_Logo.webp" 
            alt="Draft Night Out" 
            className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]"
          />
        </Link>

        {/* Link back to Main Lobby / Rules / Prizes */}
        <Link 
          href="/dno" 
          className="px-3.5 py-1.5 rounded-full border border-gray-700/80 bg-black/50 hover:bg-black/80 hover:border-gray-500 text-gray-300 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 backdrop-blur-md shadow-md"
        >
          <LayoutGrid size={13} className="text-[#1b75bb]" />
          <span>Draft Lobby</span>
        </Link>
      </div>

      {/* Auth & Navigation Actions */}
      <div className="flex items-center gap-3 sm:gap-6">
        {status === 'loading' ? (
          <div className="w-24 h-8 animate-pulse bg-gray-800 rounded-full"></div>
        ) : status === 'authenticated' ? (
          <>
            {/* Styled Locker Room Button */}
            <Link 
              href="/dno/dashboard"
              className="px-5 py-2 rounded-full border border-[#1b75bb] bg-[#151515]/70 hover:bg-[#1b75bb]/20 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(27,117,187,0.2)] backdrop-blur-md hover:scale-105"
            >
              <User size={14} className="text-[#1b75bb]" /> Locker Room
            </Link>
            
            {/* Log Out Button */}
            <button 
              onClick={() => signOut({ callbackUrl: '/dno' })}
              className="px-4 sm:px-5 py-2 rounded-full border border-gray-700 bg-black/40 text-gray-300 text-xs font-bold uppercase tracking-widest hover:text-white hover:border-gray-500 hover:bg-black/60 transition-colors flex items-center gap-2 backdrop-blur-sm"
            >
              <LogOut size={14} /> Log Out
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => onOpenAuthModal('login')}
              className="text-xs font-bold uppercase tracking-widest text-gray-200 hover:text-white transition-colors drop-shadow-md px-2"
            >
              Log In
            </button>
            <button 
              onClick={() => onOpenAuthModal('register')}
              className="px-5 py-2 rounded-full border border-[#1b75bb] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#1b75bb]/20 transition-colors shadow-[0_0_15px_rgba(27,117,187,0.4)] backdrop-blur-md bg-black/30"
            >
              Register
            </button>
          </>
        )}
      </div>
    </header>
  );
}