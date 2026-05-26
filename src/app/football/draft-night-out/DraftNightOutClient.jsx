"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { Ticket, MonitorSmartphone, MapPin, Calendar, Lock, Loader2, CheckCircle2, AlertCircle, ExternalLink, Utensils, MessageSquare, Users, Trophy, Heart, Shield, Sparkles, Medal, Gift } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function DraftNightOutClient({ proToolsMenu, connectMenu, gfForm, formId }) {
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated';
  
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); 

  const [liveForm, setLiveForm] = useState(gfForm);

  useEffect(() => {
     if (!liveForm || !liveForm.fields) {
         fetch(`/api/gravityforms?formId=${formId}`)
             .then(res => {
                 if (res.ok) return res.json();
                 throw new Error('Sync endpoint failed');
             })
             .then(data => {
                 if (data && data.fields) {
                     setLiveForm(data);
                 }
             })
             .catch(err => console.error("Client-side GF sync failed:", err));
     }
  }, [liveForm, formId]);

  useEffect(() => {
      if (session?.user?.email && liveForm?.fields) {
          const emailField = liveForm.fields.find(f => f.type === 'email' || f.label.toLowerCase().includes('email'));
          if (emailField) {
              setFormData(prev => ({ ...prev, [emailField.id]: session.user.email }));
          }
      } else if (session?.user?.email) {
          setFormData(prev => ({ ...prev, ['1']: session.user.email }));
      }
  }, [session, liveForm]);

  const handleInputChange = (fieldId, value) => {
      setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitStatus(null);

      try {
          const payload = {
             formId: formId,
             ...formData
          };

          const res = await fetch('/api/gravityforms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          
          const result = await res.json();
          
          if (result.is_valid) {
              setSubmitStatus('success');
              setFormData({});
          } else {
              setSubmitStatus('error');
          }
      } catch (error) {
          setSubmitStatus('error');
      }
      setIsSubmitting(false);
  };

  const renderForm = () => {
      const hasFields = liveForm && liveForm.fields && liveForm.fields.length > 0;
      
      if (!hasFields) {
          return (
              <form onSubmit={handleSubmit} className={`w-full flex flex-col gap-4 ${!isAuthed ? 'opacity-30 pointer-events-none blur-[2px]' : ''}`}>
                  <div className="flex flex-col gap-4">
                      <div className="flex flex-col flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your Email</label>
                          <input type="email" required onChange={(e) => handleInputChange('1', e.target.value)} value={formData['1'] || ''} className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-red-500 transition-colors text-sm shadow-inner" placeholder="Enter your email" />
                      </div>
                      <div className="flex flex-col flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sleeper Username</label>
                          <input type="text" required onChange={(e) => handleInputChange('4', e.target.value)} value={formData['4'] || ''} className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-red-500 transition-colors text-sm shadow-inner" placeholder="Your Sleeper ID" />
                      </div>
                  </div>
                  <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select League</label>
                      <select required onChange={(e) => handleInputChange('5', e.target.value)} value={formData['5'] || ''} className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-red-500 transition-colors appearance-none text-sm cursor-pointer shadow-inner">
                          <option value="">(Waiting for Gravity Forms Sync...)</option>
                          <option value="Online Redraft">Online Redraft</option>
                          <option value="Online Superflex">Online Superflex</option>
                          <option value="Online Best Ball">Online Best Ball</option>
                      </select>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="mt-2 w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                      {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit Online Entry'}
                  </button>
              </form>
          );
      }

      return (
          <form onSubmit={handleSubmit} className={`w-full flex flex-col gap-4 ${!isAuthed ? 'opacity-30 pointer-events-none blur-[2px] transition-all duration-300' : ''}`}>
              <div className="flex flex-col gap-4">
                  {liveForm.fields.filter(f => f.type === 'email' || f.type === 'text').map(field => {
                      const isEmail = field.type === 'email' || field.label.toLowerCase().includes('email');
                      const displayLabel = isEmail ? 'Your Email' : field.label;

                      return (
                          <div key={field.id} className="flex flex-col flex-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{displayLabel}</label>
                              <input type={field.type} required={field.isRequired} onChange={(e) => handleInputChange(field.id, e.target.value)} value={formData[field.id] || ''} className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-red-500 transition-colors text-sm shadow-inner" placeholder={`Enter ${displayLabel.toLowerCase()}`} />
                          </div>
                      );
                  })}
              </div>
              {liveForm.fields.filter(f => f.type === 'select').map(field => (
                  <div key={field.id} className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{field.label}</label>
                      <select required={field.isRequired} onChange={(e) => handleInputChange(field.id, e.target.value)} value={formData[field.id] || ''} className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-red-500 transition-colors appearance-none text-sm shadow-inner cursor-pointer">
                          <option value="">Select your preferred league...</option>
                          {field.choices.map((c, i) => (
                              <option key={i} value={c.value}>{c.text}</option>
                          ))}
                      </select>
                  </div>
              ))}
              <button type="submit" disabled={isSubmitting} className="mt-2 w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit Online Entry'}
              </button>
          </form>
      );
  };

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <main className="w-full animate-in fade-in duration-500">
            
            {/* HERO BANNER */}
            <div className="relative w-full h-[260px] md:h-[300px] flex items-end overflow-hidden rounded-2xl mb-12 shadow-2xl bg-gray-900">
              <div 
                className="absolute inset-0 opacity-80 z-0" 
                style={{ background: `linear-gradient(135deg, #e42d38 0%, #8a1a20 100%)` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/50 to-transparent z-0" />
              
              <div className="relative z-10 w-full flex flex-col items-start justify-end h-full px-6 md:px-10 pb-8">
                <span className="inline-block py-1 px-3 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 font-bold text-[10px] uppercase tracking-widest mb-3 backdrop-blur-sm">
                  The Biggest Fantasy Hang of the Year
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
                  Draft Night Out
                </h1>
                <p className="text-gray-300 font-medium md:text-lg leading-relaxed drop-shadow-md max-w-2xl">
                  Join us live in Canton, Ohio for the ultimate draft party at the Fantasy Football Expo, or draft from home in our online divisions!
                </p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              
              {/* EVENT DETAILS SECTION */}
              <div className="bg-[#111] rounded-3xl border border-gray-800 p-8 md:p-10 mb-16 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                 
                 <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter mb-4 relative z-10">
                   What is Draft Night Out?
                 </h2>
                 <p className="text-gray-300 text-base leading-relaxed relative z-10 mb-8">
                   Get away for the day to one of the best and biggest fantasy football hangs of the year! Compete in a live draft party to kick off a new season-long league. Vibes will be high with music, raffles, and giveaways. It'll be a packed house full of fantasy football analysts and enthusiasts. Come chill, network, link up with online friends, and make some new ones!
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:border-gray-600 transition-colors">
                        <Calendar className="text-red-500 mb-3" size={28} />
                        <h4 className="font-black text-white uppercase tracking-wider mb-1 text-sm">When</h4>
                        <p className="text-xs text-gray-400 leading-snug">July 25, 2026<br/>12:00 p.m. – 4:00 p.m. ET</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:border-gray-600 transition-colors">
                        <MapPin className="text-red-500 mb-3" size={28} />
                        <h4 className="font-black text-white uppercase tracking-wider mb-1 text-sm">Where</h4>
                        <p className="text-xs text-gray-400 leading-snug">Jerzee's Sports Grille<br/>Canton, Ohio</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:border-gray-600 transition-colors">
                        <Utensils className="text-red-500 mb-3" size={28} />
                        <h4 className="font-black text-white uppercase tracking-wider mb-1 text-sm">Food & Drink</h4>
                        <p className="text-xs text-gray-400 leading-snug">Full menu and full bar available for purchase.</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:border-gray-600 transition-colors">
                        <MessageSquare className="text-red-500 mb-3" size={28} />
                        <h4 className="font-black text-white uppercase tracking-wider mb-1 text-sm">Community</h4>
                        <p className="text-xs text-gray-400 leading-snug">Chat with commissioners & leaguemates via Discord.</p>
                    </div>
                 </div>
              </div>

              {/* REGISTRATION CARDS */}
              <div className="mb-16">
                <div className="flex items-center gap-6 mb-8">
                   <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Choose Your Path</h2>
                   <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* OPTION 1: IN-PERSON */}
                  <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 p-8 flex flex-col relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <Ticket size={120} />
                    </div>
                    
                    <div className="relative z-10 flex items-center gap-4 w-full mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shrink-0 shadow-lg">
                        <Ticket className="text-white" size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-wide leading-tight italic">Draft Live in Canton</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">At the Fantasy Football Expo</p>
                      </div>
                    </div>
                    
                    <div className="relative z-10 mb-8 flex-1 flex flex-col justify-between">
                      <p className="text-sm text-gray-300 leading-relaxed mb-6">
                        Secure your spot to draft in person at Jerzee's Sports Grille. Choose your specific division (named after NFL legends like Larry Fitzgerald, Curtis Martin, etc.) right when you buy your ticket!
                      </p>
                      <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4 mt-auto">
                         <h5 className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Event Note</h5>
                         <p className="text-xs text-gray-400 leading-relaxed">
                           This is a private event. Everyone in attendance, drafting or not, must have a ticket. If you don't want to draft, "Just To Hang" cover-only tickets are available!
                         </p>
                      </div>
                    </div>
                    
                    <a href="https://in-betweenmedia.com/product/draft-night-out-2026-tickets/" target="_blank" rel="noopener noreferrer" className="relative z-10 w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-center">
                      Get Tickets for Canton <ExternalLink size={16} />
                    </a>
                    <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4 relative z-10">
                      *Tickets sold securely via In-Between Media
                    </p>
                  </div>

                  {/* OPTION 2: ONLINE */}
                  <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 p-8 flex flex-col relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <MonitorSmartphone size={120} />
                    </div>
                    
                    <div className="relative z-10 flex items-center gap-4 w-full mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-[#111] border border-gray-700 flex items-center justify-center shrink-0 shadow-inner">
                        <MonitorSmartphone className="text-red-500" size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-wide leading-tight italic">Draft Online</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">From the comfort of home</p>
                      </div>
                    </div>
                    
                    <div className="relative z-10 mb-6 flex-1">
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Can't make it to Ohio? No problem! Join an online division and draft remotely against other members of the FSAN community. Select your preferred format below to submit your entry request.
                      </p>
                    </div>
                    
                    <div className="relative z-10 w-full bg-[#111] border border-gray-800 rounded-2xl p-6">
                         
                         {!isAuthed && (
                             <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-red-900/30">
                                 <Lock size={24} className="text-red-500 mb-2 drop-shadow-md" />
                                 <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">Pro+ Required</h4>
                                 <p className="text-[10px] text-gray-400 mb-4 max-w-[200px] leading-relaxed">Sign up to unlock the online tournament registration.</p>
                                 <Link href="/subscribe" className="bg-gradient-to-r from-red-600 to-red-800 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-lg shadow-lg hover:-translate-y-0.5 transition-all">
                                     Get Pro+
                                 </Link>
                             </div>
                         )}

                         {submitStatus === 'success' ? (
                             <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                                 <CheckCircle2 size={40} className="text-green-500 mb-3 drop-shadow-md" />
                                 <h4 className="text-lg font-black text-white uppercase tracking-wider mb-2">Entry Received!</h4>
                                 <p className="text-xs text-green-400 font-medium">Keep an eye on your inbox. We'll send your invite link shortly.</p>
                             </div>
                         ) : (
                             <>
                                 {submitStatus === 'error' && (
                                     <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-xl p-3 flex items-center gap-3 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                                         <AlertCircle size={16} className="shrink-0" /> Error submitting entry. Please try again.
                                     </div>
                                 )}
                                 {renderForm()}
                             </>
                         )}
                    </div>
                  </div>

                </div>
              </div>

              {/* PRIZES & PLAYOFF CHALLENGE */}
              <div className="mb-16">
                <div className="flex items-center gap-6 mb-8">
                   <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">What's on the Line?</h2>
                   <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                   {/* Division Winner */}
                   <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                     <Medal className="text-gray-400 mb-4" size={40} />
                     <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">Division Winner</h4>
                     <p className="text-sm text-gray-400 leading-relaxed">Championship plaque provided by <strong className="text-white">Dynasty Decks</strong>.</p>
                   </div>

                   {/* Regular Season Winner */}
                   <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                     <Gift className="text-green-500 mb-4" size={40} />
                     <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">Regular Season Champ</h4>
                     <p className="text-sm text-gray-400 leading-relaxed">A <strong className="text-green-400">$75 Gift Card</strong> to the official FSAN Shop.</p>
                   </div>

                   {/* Playoff Challenge Champ */}
                   <div className="bg-gradient-to-b from-[#1a0f0f] to-[#111] p-8 rounded-3xl border border-red-500/30 flex flex-col items-center text-center shadow-[0_0_30px_rgba(220,38,38,0.15)] hover:-translate-y-1 transition-transform relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-2xl rounded-full"></div>
                     <Trophy className="text-yellow-500 mb-4 relative z-10" size={40} />
                     <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2 relative z-10">Playoff Champion</h4>
                     <p className="text-sm text-gray-300 leading-relaxed relative z-10">Championship plaque by <strong className="text-white">Dynasty Decks</strong> & Champ Chain by <strong className="text-white">TrophySmack</strong>!</p>
                   </div>
                </div>

                <div className="bg-gradient-to-br from-[#1b1010] to-[#111] rounded-3xl border border-red-900/30 p-8 md:p-12 mb-12 shadow-[0_0_40px_rgba(220,38,38,0.1)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  
                  <div className="absolute -right-4 -top-4 text-[120px] md:text-[180px] font-black text-red-900/10 z-0 select-none transition-colors leading-none pointer-events-none">
                      🏆
                  </div>

                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(220,38,38,0.4)] border-4 border-[#111] relative z-10">
                    <Shield size={48} className="text-white drop-shadow-md" />
                  </div>
                  <div className="flex-1 text-center md:text-left relative z-10">
                    <div className="inline-block px-3 py-1 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-full mb-3 shadow-md">New in 2026!</div>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">
                      The Playoff Challenge
                    </h2>
                    
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                      We are hosting a massive playoff challenge for the <strong>top 200 teams</strong> from the regular season. Qualify for the playoffs to compete for the ultimate prize package and prove you are the undisputed champion!
                    </p>
                  </div>
                </div>

              </div>

              {/* FORMATS SECTION */}
              <div className="mb-16">
                <div className="flex items-center gap-6 mb-8">
                   <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">League Formats</h2>
                   <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 flex flex-col hover:-translate-y-1 transition-transform shadow-lg">
                    <Users className="text-red-500 mb-4" size={28} />
                    <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">Traditional Redraft</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">The classic format you know and love. Standard roster requirements and scoring to kick off your season-long leagues right.</p>
                  </div>
                  
                  <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 flex flex-col hover:-translate-y-1 transition-transform shadow-lg">
                    <Sparkles className="text-red-500 mb-4" size={28} />
                    <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">Superflex Redraft</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">Change the value of the quarterback position with the option of adding another QB to your starting lineup! The new standard for many managers.</p>
                  </div>
                  
                  <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 flex flex-col hover:-translate-y-1 transition-transform shadow-lg">
                    <Trophy className="text-red-500 mb-4" size={28} />
                    <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">Best Ball</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">Pick your players and work the waivers, but don't stress about setting a weekly lineup. Your highest scorers automatically start!</p>
                  </div>
                  
                  <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 flex flex-col hover:-translate-y-1 transition-transform shadow-lg">
                    <Calendar className="text-red-500 mb-4" size={28} />
                    <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">Dynasty (Superflex)</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">For those where fantasy is a year-round affair. We offer both Startup drafts and Rookie-only drafts for returning attendees.</p>
                  </div>
                  
                  <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 flex flex-col hover:-translate-y-1 transition-transform shadow-lg">
                    <Shield className="text-red-500 mb-4" size={28} />
                    <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">IDP Redraft</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">Test your luck incorporating the other side of the ball! Run in partnership with IDP+, this league brings defensive players into the mix.</p>
                  </div>
                  
                  <div className="bg-[#111] p-6 rounded-3xl border border-red-900/30 shadow-[0_0_20px_rgba(220,38,38,0.05)] flex flex-col hover:-translate-y-1 transition-transform">
                    <Heart className="text-red-500 mb-4" size={28} />
                    <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">Charity League</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">Industry veterans Jason Watson and George Reed host select leagues where 100% of all league donations go directly to Toys for Tots!</p>
                  </div>

                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}