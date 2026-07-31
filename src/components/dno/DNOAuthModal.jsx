"use client";
import React, { useState } from 'react';
import { X, Mail, Lock, User, ShieldCheck } from 'lucide-react';

export default function DNOAuthModal({ initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Wire this up to your NextAuth / WordPress backend
    console.log(`Submitting ${mode}:`, { email, password, username });
  };

  const handleFSANLogin = () => {
    // TODO: Wire this up to the SSO flow
    console.log('Initiating FSAN SSO Login...');
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
          <h3 className="text-3xl font-black text-white uppercase tracking-tight italic mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Claim Your Spot'}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {mode === 'login' ? 'Log in to access your Draft Night Out dashboard.' : 'Create your account to secure your draft ticket.'}
          </p>

          {/* The FSAN SSO Button */}
          <button 
            onClick={handleFSANLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#111] hover:bg-gray-800 border border-[#1b75bb]/30 hover:border-[#1b75bb] transition-all px-4 py-3.5 rounded-xl text-white text-xs font-bold uppercase tracking-widest shadow-md mb-6 group"
          >
            <ShieldCheck size={18} className="text-[#1b75bb] group-hover:scale-110 transition-transform" />
            Log in with FSAN Account
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-gray-800 flex-1"></div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Or use email</span>
            <div className="h-px bg-gray-800 flex-1"></div>
          </div>

          {/* Form */}
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
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-gray-800 text-white text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#1b75bb] transition-colors"
                required 
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-500" />
              </div>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-gray-800 text-white text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#1b75bb] transition-colors"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full mt-2 relative group p-[2px] rounded-xl bg-gradient-to-r from-teal-400 to-[#1b75bb] shadow-[0_0_15px_rgba(27,117,187,0.2)] transition-transform hover:-translate-y-0.5"
            >
              <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-3.5 flex items-center justify-center w-full h-full text-white font-black uppercase tracking-widest text-xs">
                {mode === 'login' ? 'Log In' : 'Register & Draft'}
              </div>
            </button>
          </form>

        </div>

        {/* Toggle Mode Footer */}
        <div className="bg-[#111] border-t border-gray-800 p-6 text-center">
          <p className="text-xs text-gray-400 font-medium">
            {mode === 'login' ? "Don't have a spot yet? " : "Already have an account? "}
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[#1b75bb] font-bold hover:underline"
            >
              {mode === 'login' ? 'Register Here' : 'Log In Here'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}