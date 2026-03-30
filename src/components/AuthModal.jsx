"use client";
import React, { useState, useEffect } from 'react';
import { X, Loader2, Mail, Lock, User } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
  const [view, setView] = useState(initialView); // 'login' or 'subscribe'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError('');
      setUsername('');
      setPassword('');
      setEmail('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // WordPress accepts emails in the username field, so we just pass the email state!
    const res = await signIn('credentials', {
      redirect: false,
      username: email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onClose(); 
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

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
        const loginRes = await signIn('credentials', {
          redirect: false,
          username,
          password,
        });

        if (loginRes?.error) {
          setError('Account created, but automatic login failed. Please log in.');
          setIsLoading(false);
        } else {
          setIsLoading(false);
          onClose(); 
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div className="fixed inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-gray-900 rounded-full text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 transition-colors z-10">
          <X size={18} />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
              {view === 'login' ? 'TIME TO WIN' : 'Join The Network'}
            </h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              {view === 'login' ? 'Log in to your account' : 'Create your account'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-300 text-sm text-center font-bold">
              {error}
            </div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Log In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Choose a Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                />
              </div>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="Create Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
              </button>
            </form>
          )}

          {/* Toggle View Button */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            {view === 'login' ? (
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Don't have an account?{' '}
                <button onClick={() => { setView('subscribe'); setError(''); }} className="text-white hover:text-gray-300 font-black transition-colors ml-1">
                  SUBSCRIBE NOW!
                </button>
              </p>
            ) : (
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Already have an account?{' '}
                <button onClick={() => { setView('login'); setError(''); }} className="text-white hover:text-gray-300 font-black transition-colors ml-1">
                  LOG IN
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}