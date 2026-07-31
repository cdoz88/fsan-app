"use client";
import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

export default function DNOHeader({ onOpenAuthModal }) {
  const { data: session, status } = useSession();

  return (
    // Changed to absolute positioning, transparent background, and added a subtle top gradient for readability
    <header className="absolute top-0 left-0 right-0 w-full z-50 flex items-center justify-between px-6 py-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
      {/* Logo */}
      <Link href="/dno" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <img 
          src="https://admin.fsan.com/wp-content/uploads/2025/05/App-Icons-Border.webp" 
          alt="Draft Night Out" 
          className="h-10 w-10 object-contain rounded-full border border-gray-600 shadow-xl"
        />
      </Link>

      {/* Auth & Navigation Actions */}
      <div className="flex items-center gap-6">
        {status === 'loading' ? (
          // Simple loading skeleton to prevent UI jumping
          <div className="w-24 h-8 animate-pulse bg-gray-800 rounded-full"></div>
        ) : status === 'authenticated' ? (
          <>
            <Link 
              href="/dno/dashboard"
              className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors flex items-center gap-2 drop-shadow-md"
            >
              <User size={14} /> Locker Room
            </Link>
            <button 
              onClick={() => signOut({ callbackUrl: '/dno' })}
              className="px-5 py-2 rounded-full border border-gray-500 text-gray-300 text-xs font-bold uppercase tracking-widest hover:text-white hover:border-gray-400 hover:bg-black/20 transition-colors flex items-center gap-2 backdrop-blur-sm"
            >
              <LogOut size={14} /> Log Out
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => onOpenAuthModal('login')}
              className="text-xs font-bold uppercase tracking-widest text-gray-200 hover:text-white transition-colors drop-shadow-md"
            >
              Log In
            </button>
            <button 
              onClick={() => onOpenAuthModal('register')}
              className="px-5 py-2 rounded-full border border-[#1b75bb] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#1b75bb]/20 transition-colors shadow-[0_0_15px_rgba(27,117,187,0.4)] backdrop-blur-sm bg-black/20"
            >
              Register
            </button>
          </>
        )}
      </div>
    </header>
  );
}