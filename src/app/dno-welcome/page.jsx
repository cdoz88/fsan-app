"use client";
import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, Lock, ArrowRight } from 'lucide-react';

export default function DnoWelcomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pass both username and email to ensure NextAuth / WordPress gets the required field
    const res = await signIn('credentials', {
      redirect: false,
      username: email,
      email: email,
      password: password,
    });

    if (res?.error) {
      setError('Invalid email/username or password. Please try again.');
      setLoading(false);
    } else {
      // 🚀 SILENT LEGACY TRIAL CHECK
      // If login is successful, grab the new session to get the User ID
      try {
        const session = await getSession();
        if (session?.user?.id) {
          const query = `
            mutation ClaimLegacyTrial {
              claimLegacyTrial(
                input: {
                  userId: ${session.user.id},
                  secret: "fsan_super_secret_webhook_key_2026"
                }
              ) {
                success
                message
              }
            }
          `;

          // Fire the mutation to our secure WordPress endpoint
          await fetch('https://admin.fsan.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });
        }
      } catch (err) {
        console.warn('Silent legacy trial check failed:', err);
      }

      // Redirect to the account dashboard after the check is complete
      window.location.href = res?.url ? res.url : '/account#subscription';
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#1b75bb] selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#1b75bb]/10 to-transparent pointer-events-none" />
      
      <div className="bg-[#151515] border border-gray-800 rounded-3xl p-8 md:p-12 w-full max-w-lg relative z-10 shadow-2xl">
        
        {/* Dual Branding Header */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <img 
            src="https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp" 
            alt="Draft Night Out" 
            className="h-16 md:h-20 object-contain drop-shadow-lg" 
          />
          <div className="w-px h-12 bg-gray-700"></div>
          <img 
            src="/images/dno/FSAN_Logo.png" 
            alt="FSAN" 
            className="h-12 md:h-16 object-contain drop-shadow-lg" 
            onError={(e) => e.target.src = 'https://admin.fsan.com/wp-content/uploads/2023/07/FSAN-Logo-White.png'}
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-4">
            Welcome to FSAN Pro+
          </h1>
          
          {/* Explicit Instruction Box */}
          <div className="bg-[#1b75bb]/10 border border-[#1b75bb]/30 rounded-2xl p-5 text-left shadow-inner">
            <span className="text-[#27d7ff] text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Lock size={14} /> Account Linked
            </span>
            <p className="text-sm text-gray-300 leading-relaxed">
              As a Draft Night Out participant, your account is already active! Simply log in below using the <strong>exact same email/username and password</strong> you used on Draft Night Out.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && (
             <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-[11px] font-black p-4 rounded-xl text-center uppercase tracking-widest flex items-center justify-center gap-2 animate-in fade-in">
                {error}
             </div>
          )}
          
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
              Email or Username
            </label>
            <input 
              type="text" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#1b75bb] focus:ring-1 focus:ring-[#1b75bb] transition-all shadow-inner"
              placeholder="Your email or username..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#1b75bb] focus:ring-1 focus:ring-[#1b75bb] transition-all shadow-inner"
              placeholder="Your password..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 relative group p-[2px] rounded-xl bg-gradient-to-r from-teal-400 to-[#1b75bb] shadow-[0_0_20px_rgba(27,117,187,0.3)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-4 flex items-center justify-center w-full text-white font-black uppercase tracking-widest text-xs gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Log In & Access Pro+'}
              {!loading && <ArrowRight size={16} />}
            </div>
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/reset-password" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
            Forgot your password?
          </Link>
        </div>
      </div>
    </main>
  );
}