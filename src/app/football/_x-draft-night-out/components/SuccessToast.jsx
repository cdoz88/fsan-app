"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, X } from 'lucide-react';

export default function SuccessToast({ setActiveTab, setDraftView, loadDnoPool, isAuthed }) {
  const searchParams = useSearchParams();
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (searchParams?.get('checkout') === 'success') {
      setShowSuccessToast(true);
      
      setActiveTab('drafts');
      setDraftView('online');
      
      window.history.replaceState(null, '', window.location.pathname + '#drafts');
      
      setTimeout(() => { if (isAuthed) loadDnoPool(); }, 3000);
      setTimeout(() => { if (isAuthed) loadDnoPool(); }, 7000);
    }
  }, [searchParams, setActiveTab, setDraftView, loadDnoPool, isAuthed]);

  if (!showSuccessToast) return null;

  return (
    <div className="fixed top-24 right-4 z-[100] max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-xl shadow-2xl flex items-start gap-4 border border-emerald-500/30">
        <CheckCircle2 size={24} className="text-emerald-200 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-black uppercase tracking-widest text-sm mb-1">Payment Successful!</h4>
          <p className="text-sm text-emerald-100 leading-relaxed">Your extra draft ticket has been added to your account.</p>
          <div className="mt-3 bg-teal-900/40 p-3 rounded-lg border border-teal-500/30">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-50 leading-snug">
              Please Note: This ticket must be used for the current season and will not be usable for the next season.
            </p>
          </div>
        </div>
        <button onClick={() => setShowSuccessToast(false)} className="text-emerald-200 hover:text-white shrink-0"><X size={20} /></button>
      </div>
    </div>
  );
}