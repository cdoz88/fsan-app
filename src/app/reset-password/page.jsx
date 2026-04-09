"use client";
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import { Lock, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const resetKey = searchParams.get('key');
  const login = searchParams.get('login');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setIsLoading(false);
      return;
    }

    if (!resetKey || !login) {
      setMessage({ type: 'error', text: 'Invalid or missing reset token. Please request a new password reset.' });
      setIsLoading(false);
      return;
    }

    const query = `
      mutation ResetUserPassword($key: String!, $login: String!, $password: String!) {
        resetUserPassword(input: {
          key: $key,
          login: $login,
          password: $password
        }) {
          user {
            id
          }
        }
      }
    `;

    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { key: resetKey, login, password }
        })
      });

      const json = await res.json();

      if (json.errors) {
        setMessage({ type: 'error', text: json.errors[0].message });
      } else {
        setMessage({ type: 'success', text: 'Password has been successfully reset! You can now log in.' });
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header activeSport="All" />
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Create New Password</h1>
            <p className="text-xs text-gray-400 font-medium">Please enter your new password below.</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'error' ? 'bg-red-900/30 border border-red-900 text-red-400' : 'bg-green-900/30 border border-green-900 text-green-400'}`}>
              {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              {message.text}
            </div>
          )}

          {message.type === 'success' ? (
             <Link href="/home" className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg text-sm flex items-center justify-center gap-2">
                 Return to Login <ArrowRight size={16} />
             </Link>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#121212]"><Loader2 size={48} className="animate-spin text-red-600" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}