"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { HeartHandshake, ShieldCheck, Mail } from 'lucide-react';
import DonationModal from './DonationModal';

export default function DNOFooter() {
  const [showDonationModal, setShowDonationModal] = useState(false);

  return (
    <>
      <footer className="bg-[#0a0a0a] border-t border-gray-800/60 pt-12 pb-8 mt-auto z-10 relative">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-white font-black italic uppercase tracking-tighter text-xl">Draft Night Out</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Powered by Fantasy Sports Advice Network
            </span>
            <p className="text-[10px] text-gray-600 mt-2">
              &copy; {new Date().getFullYear()} FSAN LLC. All rights reserved.
            </p>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setShowDonationModal(true)}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-900/10 px-4 py-2 rounded-full border border-emerald-500/20 hover:border-emerald-500/40"
            >
              <HeartHandshake size={14} /> Donate to Mission 22
            </button>

            <Link href="/dno/agreement" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
              <ShieldCheck size={14} /> Terms of Service
            </Link>

            <a href="mailto:support@draftnightout.com" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
              <Mail size={14} /> Support
            </a>
          </div>

        </div>
      </footer>

      {showDonationModal && <DonationModal onClose={() => setShowDonationModal(false)} />}
    </>
  );
}