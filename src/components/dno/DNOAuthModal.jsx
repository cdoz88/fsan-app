"use client";
import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { X, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function DNOAuthModal({ initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'forgotPassword', or 'fsanLogin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Lock scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setIsLoading(true);

    if (mode === 'login' || mode === 'fsanLogin') {
      // Standard NextAuth credentials login (Works for both DNO and FSAN accounts)
      const res = await signIn('credentials', {
        redirect: false,
        username: email, // WP accepts email in the username field
        password: password,
      });

      if (res?.error) {
        setError(mode === 'fsanLogin' ? 'Invalid FSAN email or password. Please try again.' : 'Invalid email or password. Please try again.');
        setIsLoading(false);
      } else {
        // Success! Send them straight to the Dashboard
        window.location.href = '/dno/dashboard';
      }
    } else if (mode === 'register') {
      // WordPress GraphQL Registration
      const query = `
        mutation RegisterUser($username: String!, $email: String!, $password: String!) {
          registerUser(
            input: {username: $username, email: $email, password: $password}
          ) {
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
            variables: { username, email, password }
          })
        });

        const json = await res.json();

        if (json.errors) {
          setError(json.errors[0].message);
          setIsLoading(false);
          return;
        }

        if (json?.data?.registerUser?.user?.databaseId) {
          // Automatically log them in after a successful registration
          const loginRes = await signIn('credentials', {
            redirect: false,
            username,
            password,
          });

          if (loginRes?.error) {
            setError('Account created, but automatic login failed. Please log in.');
            setIsLoading(false);
          } else {
            window.location.href = '/dno/dashboard';
          }
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        setIsLoading(false);
      }
    } else if (mode === 'forgotPassword') {
      // WordPress GraphQL Password Reset
      const query = `
        mutation SendPasswordResetEmail($username: String!) {
          sendPasswordResetEmail(input: { username: $username }) {
            user {
              databaseId
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
            variables: { username: email } // WP accepts email in the username field
          })
        });

        const json = await res.json();

        if (json.errors) {
          setError(json.errors[0].message);
        } else {
          setResetMessage('If an account exists, a password reset link has been sent to your email.');
          setEmail(''); 
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const switchToFSANMode = () => {
    setMode('fsanLogin');
    setError('');
    setResetMessage('');
    setEmail('');
    setPassword('');
  };

  const switchToDNOMode = () => {
    setMode('login');
    setError('');
    setResetMessage('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#151515] border border-gray-800 rounded-3xl max-w-md w-full shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#111] hover:bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-8 pt-10 text-center">
          
          {/* Header Title & Subtitle */}
          <h3 className="text-3xl font-black text-white uppercase tracking-tight italic mb-2">
            {mode === 'fsanLogin' 
              ? 'FSAN Network Login' 
              : mode === 'login' 
              ? 'Welcome Back' 
              : mode === 'forgotPassword' 
              ? 'Reset Password' 
              : 'Claim Your Spot'}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {mode === 'fsanLogin'
              ? 'Enter your Fantasy Sports Advantage Network credentials to log in.'
              : mode === 'login' 
              ? 'Log in to access your Draft Night Out dashboard.' 
              : mode === 'forgotPassword' 
              ? 'Enter your email to receive a secure reset link.' 
              : 'Create your account to secure your draft ticket.'}
          </p>

          {/* FSAN SSO EXPLANATION BANNER (Only in FSAN Mode) */}
          {mode === 'fsanLogin' && (
            <div className="mb-6 p-4 rounded-2xl bg-[#111] border border-slate-500/40 text-left relative overflow-hidden shadow-inner">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-400/30 flex items-center justify-center shrink-0 shadow-md">
                  <img src="/images/dno/App Icons.png" alt="FSAN App Icon" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-slate-300" />
                    Central FSAN Account
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Log in with your primary FSAN credentials. Your subscription perks and DNO tickets will be automatically linked.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
              <AlertCircle size={16} /> <span className="text-left">{error}</span>
            </div>
          )}

          {resetMessage && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} /> <span className="text-left">{resetMessage}</span>
            </div>
          )}

          {/* Form - Primary DNO Login / Register / Reset Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {mode === 'register' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-500" />
                </div>
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#111] border border-gray-800 text-white text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#1b75bb] transition-colors"
                  required 
                />
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-500" />
              </div>
              <input 
                id="email-input"
                type="text" 
                placeholder={mode === 'fsanLogin' ? 'FSAN Email or Username' : mode === 'login' ? 'Email or Username' : 'Account Email Address'} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-gray-800 text-white text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#1b75bb] transition-colors"
                required 
              />
            </div>

            {mode !== 'forgotPassword' && (
              <div className="relative flex flex-col gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-500" />
                  </div>
                  <input 
                    type="password" 
                    placeholder={mode === 'fsanLogin' ? 'FSAN Password' : 'Password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#111] border border-gray-800 text-white text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#1b75bb] transition-colors"
                    required 
                  />
                </div>
                {(mode === 'login' || mode === 'fsanLogin') && (
                  <div className="flex justify-end mt-1">
                    <button 
                      type="button" 
                      onClick={() => { setMode('forgotPassword'); setError(''); setResetMessage(''); }} 
                      className="text-[10px] text-gray-500 hover:text-gray-300 font-bold uppercase tracking-widest transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Primary Submit Button */}
            {mode === 'fsanLogin' ? (
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 relative group p-[1.5px] rounded-xl bg-gradient-to-r from-slate-400 via-gray-100 to-slate-500 shadow-[0_0_15px_rgba(203,213,225,0.2)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <div className="bg-[#111] group-hover:bg-slate-200 group-hover:text-black transition-colors rounded-[10.5px] px-4 py-3.5 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-xs">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In with FSAN Credentials'}
                </div>
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 relative group p-[2px] rounded-xl bg-gradient-to-r from-teal-400 to-[#1b75bb] shadow-[0_0_15px_rgba(27,117,187,0.2)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-3.5 flex items-center justify-center w-full h-full text-white font-black uppercase tracking-widest text-xs">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Log In' : mode === 'forgotPassword' ? 'Send Reset Link' : 'Register & Draft'}
                </div>
              </button>
            )}
          </form>

          {/* Secondary FSAN Option (Placed UNDERNEATH the primary credentials form) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="mt-6 pt-2">
              <div className="flex items-center gap-4 mb-5">
                <div className="h-px bg-gray-800 flex-1"></div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {mode === 'login' ? 'Or log in with your FSAN account' : 'Or register with your FSAN account'}
                </span>
                <div className="h-px bg-gray-800 flex-1"></div>
              </div>

              <button 
                type="button"
                onClick={switchToFSANMode}
                className="w-full relative group p-[1.5px] rounded-xl bg-gradient-to-r from-slate-400 via-gray-100 to-slate-500 shadow-[0_0_15px_rgba(203,213,225,0.15)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="bg-[#111] group-hover:bg-slate-200 group-hover:text-black transition-colors rounded-[10.5px] px-4 py-3.5 flex items-center justify-center gap-3 w-full h-full text-white font-black uppercase tracking-widest text-xs">
                  <img 
                    src="/images/dno/FSAN_Logo.png" 
                    alt="FSAN Logo" 
                    className="w-5 h-5 object-contain" 
                  />
                  <span>
                    {mode === 'login' ? 'Log In with FSAN Account' : 'Register with FSAN Account'}
                  </span>
                </div>
              </button>
            </div>
          )}

        </div>

        {/* Toggle Mode Footer */}
        <div className="bg-[#111] border-t border-gray-800 p-6 text-center">
          {mode === 'fsanLogin' ? (
            <button 
              type="button"
              onClick={switchToDNOMode}
              className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <ArrowLeft size={14} className="text-[#1b75bb]" />
              <span>Use Draft Night Out Login Instead</span>
            </button>
          ) : (
            <p className="text-xs text-gray-400 font-medium">
              {mode === 'login' ? "Don't have a spot yet? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                  setResetMessage('');
                }}
                className="text-[#1b75bb] font-bold hover:underline ml-1"
              >
                {mode === 'login' ? 'Register Here' : 'Log In Here'}
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}