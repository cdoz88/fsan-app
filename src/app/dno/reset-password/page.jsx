"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Grab the tokens passed from the email URL
  const resetKey = searchParams.get('key');
  const login = searchParams.get('login');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setStatus('error');
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // WPGraphQL Mutation to securely change the password
    const query = `
      mutation ResetPassword($key: String!, $login: String!, $password: String!) {
        resetUserPassword(input: {
          key: $key,
          login: $login,
          password: $password
        }) {
          user {
            databaseId
            username
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
          variables: { key: resetKey, login, password: newPassword }
        })
      });

      const json = await res.json();

      if (json.errors) {
        setStatus('error');
        setErrorMessage(json.errors[0].message || 'Invalid or expired password reset link. Please request a new one.');
      } else {
        setStatus('success');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('An unexpected error occurred connecting to the server. Please try again.');
    }
  };

  // If the user lands here without a key from an email, show an error state
  if (!resetKey || !login) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] p-4 text-center selection:bg-[#1b75bb] selection:text-white">
        <AlertCircle size={64} className="text-red-500/80 mb-6 drop-shadow-lg" />
        <h1 className="text-3xl font-black italic uppercase text-white mb-2 tracking-tight">Invalid Reset Link</h1>
        <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
          This password reset link is missing required security tokens or has expired. Please request a new link from the login screen.
        </p>
        <button 
          onClick={() => router.push('/dno')} 
          className="px-8 py-4 rounded-xl bg-[#1b75bb] text-white font-black uppercase tracking-widest text-xs hover:bg-teal-500 transition-colors shadow-lg"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] p-4 relative overflow-hidden selection:bg-[#1b75bb] selection:text-white">
      
      {/* Background Glow Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-[#1b75bb]/10 blur-[150px] rounded-full"></div>
         <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#f5a623]/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="bg-[#151515] border border-gray-800 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 text-center">
        
        <img 
          src="/images/dno/DNO-Logo_Logo.webp" 
          alt="Draft Night Out" 
          className="w-48 mx-auto mb-8 object-contain drop-shadow-xl" 
        />
        
        {status === 'success' ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
            <h2 className="text-2xl font-black uppercase italic text-white mb-3 tracking-tight">Password Updated</h2>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Your password has been successfully changed. You can now log in using your new credentials.
            </p>
            <button 
              onClick={() => router.push('/dno?tab=drafts')}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-teal-400 to-[#1b75bb] text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(27,117,187,0.3)]"
            >
              Go to Login <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-black uppercase italic text-white mb-2 tracking-tight">Reset Password</h2>
            <p className="text-sm text-gray-400 mb-8">
              Enter a new secure password for <strong className="text-white">@{login}</strong>.
            </p>
            
            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold flex items-start gap-3 text-left shadow-inner">
                <AlertCircle size={16} className="shrink-0 mt-0.5" /> 
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-500" />
                </div>
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#111] border border-gray-800 text-white text-sm rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#1b75bb] transition-colors font-bold"
                  required 
                />
              </div>
              
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-500" />
                </div>
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#111] border border-gray-800 text-white text-sm rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#1b75bb] transition-colors font-bold"
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full relative group p-[2px] rounded-xl bg-gradient-to-r from-teal-400 to-[#1b75bb] shadow-[0_0_20px_rgba(27,117,187,0.2)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 mt-2"
              >
                <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-4 flex items-center justify-center w-full h-full text-white font-black uppercase tracking-widest text-xs">
                  {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                </div>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap in Suspense boundary because useSearchParams() requires it in Next.js App Router
export default function DNOResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1b75bb] animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}