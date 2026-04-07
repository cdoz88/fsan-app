"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { Trophy, Shirt, Mail, Play, Medal, ArrowRight, Star, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function JerseyLeaguesClient({ proToolsMenu, connectMenu, gfForm }) {
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated';
  
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  // Pre-fill the email address if they are logged into their Pro+ account
  useEffect(() => {
      if (session?.user?.email && gfForm?.fields) {
          const emailField = gfForm.fields.find(f => f.type === 'email');
          if (emailField) {
              setFormData(prev => ({ ...prev, [`input_${emailField.id}`]: session.user.email }));
          }
      } else if (session?.user?.email) {
          // Fallback if form schema didn't load
          setFormData(prev => ({ ...prev, ['input_1']: session.user.email }));
      }
  }, [session, gfForm]);

  const handleInputChange = (fieldId, value) => {
      setFormData(prev => ({ ...prev, [`input_${fieldId}`]: value }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitStatus(null);

      try {
          // IMPORTANT: We send the data to our secure internal proxy, and tell it which form to submit to
          const payload = {
             formId: 18,
             ...formData
          };

          const res = await fetch('/api/gravityforms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          
          const result = await res.json();
          
          // Gravity Forms returns is_valid = true if it passed validation and saved
          if (result.is_valid) {
              setSubmitStatus('success');
              setFormData({});
          } else {
              setSubmitStatus('error');
              console.error("GF Validation Error:", result);
          }
      } catch (error) {
          console.error("Submission Error:", error);
          setSubmitStatus('error');
      }
      setIsSubmitting(false);
  };

  const renderForm = () => {
      // IF WP REST API FOR GF IS UNAUTHORIZED OR FAILED, WE RENDER A FALLBACK SO THE UI DOESN'T BREAK
      const hasFields = gfForm && gfForm.fields && gfForm.fields.length > 0;
      
      if (!hasFields) {
          return (
              <form onSubmit={handleSubmit} className={`w-full flex flex-col gap-4 ${!isAuthed ? 'opacity-30 pointer-events-none blur-[2px]' : ''}`}>
                  <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="flex flex-col flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                          <input type="email" required onChange={(e) => handleInputChange('1', e.target.value)} value={formData['input_1'] || ''} className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-red-500 transition-colors text-sm shadow-inner" placeholder="Enter your email" />
                      </div>
                      <div className="flex flex-col flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sleeper Username</label>
                          <input type="text" required onChange={(e) => handleInputChange('2', e.target.value)} value={formData['input_2'] || ''} className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-red-500 transition-colors text-sm shadow-inner" placeholder="Your Sleeper ID" />
                      </div>
                  </div>
                  <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select League</label>
                      <select required onChange={(e) => handleInputChange('3', e.target.value)} value={formData['input_3'] || ''} className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-red-500 transition-colors appearance-none text-sm cursor-pointer shadow-inner">
                          <option value="">(Waiting for Gravity Forms Sync...)</option>
                          <option value="Tyreek Hill League">Tyreek Hill League</option>
                          <option value="James Cook League">James Cook League</option>
                          <option value="Garrett Wilson League">Garrett Wilson League</option>
                      </select>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="mt-2 w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                      {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit Entry Request'}
                  </button>
              </form>
          );
      }

      // DYNAMIC GRAVITY FORMS RENDERER (Maps directly to your live WP settings!)
      return (
          <form onSubmit={handleSubmit} className={`w-full flex flex-col gap-4 ${!isAuthed ? 'opacity-30 pointer-events-none blur-[2px] transition-all duration-300' : ''}`}>
              <div className="flex flex-col gap-4 sm:flex-row">
                  {gfForm.fields.filter(f => f.type === 'email' || f.type === 'text').map(field => (
                      <div key={field.id} className="flex flex-col flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{field.label}</label>
                          <input type={field.type} required={field.isRequired} onChange={(e) => handleInputChange(field.id, e.target.value)} value={formData[`input_${field.id}`] || ''} className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-red-500 transition-colors text-sm shadow-inner" placeholder={`Enter ${field.label}`} />
                      </div>
                  ))}
              </div>
              {gfForm.fields.filter(f => f.type === 'select').map(field => (
                  <div key={field.id} className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{field.label}</label>
                      <select required={field.isRequired} onChange={(e) => handleInputChange(field.id, e.target.value)} value={formData[`input_${field.id}`] || ''} className="w-full bg-[#111] border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-red-500 transition-colors appearance-none text-sm shadow-inner cursor-pointer">
                          <option value="">Select your preferred league...</option>
                          {field.choices.map((c, i) => (
                              <option key={i} value={c.value}>{c.text}</option>
                          ))}
                      </select>
                  </div>
              ))}
              <button type="submit" disabled={isSubmitting} className="mt-2 w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit Entry Request'}
              </button>
          </form>
      );
  };

  const steps = [
    {
      icon: <Star className="text-red-500" size={32} />,
      title: "Step 1: Sign Up",
      description: "Sign up for the Pro+ membership to gain exclusive entry into the tournament.",
      link: "/subscribe",
      linkText: "Get Pro+",
      colSpan: "col-span-1"
    },
    {
      isForm: true,
      icon: <Mail className="text-red-500" size={32} />,
      title: "Step 2: Submit Your Entry",
      description: "Select your preferred league below. We will email you the invite link!",
      colSpan: "col-span-1 md:col-span-2"
    },
    {
      icon: <Shirt className="text-red-500" size={32} />,
      title: "Step 3: Join Your League",
      description: "Join the league named after your favorite player (Tyreek Hill, James Cook, Garrett Wilson, etc).",
      colSpan: "col-span-1"
    },
    {
      icon: <Play className="text-red-500" size={32} />,
      title: "Step 4: Play All Season",
      description: "Draft your team, manage the waiver wire, and track your progress as you climb the standings.",
      colSpan: "col-span-1"
    },
    {
      icon: <Trophy className="text-red-500" size={32} />,
      title: "Step 5: Win a Jersey",
      description: "Dominate your league and win an autographed jersey of the player that your league is named after!",
      colSpan: "col-span-1 md:col-span-2 lg:col-span-1"
    },
    {
      icon: <Medal className="text-red-500" size={32} />,
      title: "Step 6: The Playoff Challenge",
      description: "See below for more details on how to qualify!",
      colSpan: "col-span-1 md:col-span-2 lg:col-span-3"
    }
  ];

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <main className="w-full animate-in fade-in duration-500">
            
            {/* HERO SECTION MATCHING TEAMS/RANKINGS */}
            <div className="relative w-full h-[220px] md:h-[260px] flex items-end overflow-hidden rounded-2xl mb-12 shadow-2xl">
              <div 
                className="absolute inset-0 opacity-80 z-0" 
                style={{ background: `linear-gradient(135deg, #e42d38 0%, #8a1a20 100%)` }}
              />
              <img 
                src="https://admin.fsan.com/wp-content/uploads/2025/08/Jersey-Leagues.webp" 
                alt="Jersey Leagues" 
                className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[150%] md:h-[200%] w-auto opacity-30 pointer-events-none z-0 mix-blend-overlay" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/50 to-transparent z-0" />
              
              <div className="relative z-10 w-full flex flex-col items-start justify-end h-full px-6 md:px-10 pb-8">
                <span className="inline-block py-1 px-3 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 font-bold text-[10px] uppercase tracking-widest mb-3 backdrop-blur-sm">
                  The Stakes Are Higher Than Ever
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
                  Jersey Leagues
                </h1>
                <p className="text-gray-300 font-medium md:text-lg leading-relaxed drop-shadow-md max-w-2xl">
                  Every matchup, every touchdown, every trade counts toward winning an autographed jersey of the player your league is named after.
                </p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              
              <div className="bg-[#111] rounded-3xl border border-gray-800 p-8 md:p-10 mb-12 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                 <p className="text-gray-300 text-lg md:text-xl leading-relaxed relative z-10">
                   The Jersey Leagues are back! We're talking <strong>Tyreek Hill, James Cook, Garrett Wilson, David Montgomery, Kenneth Walker, Kayvon Thibodeaux,</strong> and more. These aren't just jerseys – they're collector's items, conversation starters, and proof that your fantasy skills are elite.
                 </p>
              </div>

              {/* HOW IT WORKS DYNAMIC MASONRY GRID */}
              <div className="mb-16">
                <div className="flex items-center gap-6 mb-8">
                   <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Here's How It Works</h2>
                   <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {steps.map((step, idx) => (
                    <div key={idx} className={`${step.colSpan} ${step.isForm ? 'border-red-900/30 shadow-[0_0_20px_rgba(220,38,38,0.05)]' : 'border-gray-800'} bg-[#1a1a1a] rounded-3xl border p-8 flex flex-col items-start relative overflow-hidden group transition-colors shadow-lg`}>
                      <div className={`absolute -right-4 -top-4 text-[120px] font-black text-[#222] z-0 select-none transition-colors leading-none ${step.isForm ? 'hidden md:block opacity-30 text-red-900/10' : 'group-hover:text-[#2a2a2a]'}`}>
                        {idx + 1}
                      </div>
                      
                      <div className="relative z-10 flex w-full gap-4 items-start mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#111] border border-gray-700 flex items-center justify-center shrink-0 shadow-inner">
                          {step.icon}
                        </div>
                        <div className="flex flex-col justify-center h-16">
                          <h3 className="text-xl font-black text-white uppercase tracking-wide leading-none mb-2">{step.title}</h3>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      
                      {step.link && (
                        <Link href={step.link} className="relative z-10 text-red-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center w-full gap-2 hover:text-red-400 transition-colors bg-red-900/20 px-4 py-3 rounded-xl border border-red-900/30 mt-auto">
                          {step.linkText} <ArrowRight size={14} />
                        </Link>
                      )}

                      {/* THE GATED REGISTRATION FORM */}
                      {step.isForm && (
                        <div className="relative w-full flex-1 flex flex-col">
                           {!isAuthed && (
                               <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-xl border border-red-900/30">
                                   <Lock size={24} className="text-red-500 mb-2 drop-shadow-md" />
                                   <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">Pro+ Required</h4>
                                   <p className="text-[10px] text-gray-400 mb-4 max-w-[200px] leading-relaxed">Sign up to unlock the tournament registration form.</p>
                                   <Link href="/subscribe" className="bg-gradient-to-r from-red-600 to-red-800 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-lg shadow-lg hover:-translate-y-0.5 transition-all">
                                       Get Pro+
                                   </Link>
                               </div>
                           )}

                           {submitStatus === 'success' ? (
                               <div className="mt-2 bg-green-900/20 border border-green-500/30 rounded-xl p-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300 flex-1">
                                   <CheckCircle2 size={48} className="text-green-500 mb-4 drop-shadow-md" />
                                   <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">Entry Received!</h4>
                                   <p className="text-sm text-green-400 font-medium">Keep an eye on your inbox. We'll send your invite link shortly.</p>
                               </div>
                           ) : (
                               <>
                                   {submitStatus === 'error' && (
                                       <div className="mt-2 mb-2 bg-red-900/20 border border-red-500/30 rounded-xl p-3 flex items-center gap-3 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                                           <AlertCircle size={16} className="shrink-0" /> Error submitting entry. Please try again.
                                       </div>
                                   )}
                                   {renderForm()}
                               </>
                           )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* NEW THIS YEAR BLOCK */}
              <div className="bg-gradient-to-br from-[#1b1010] to-[#111] rounded-3xl border border-red-900/30 p-8 md:p-12 mb-12 shadow-[0_0_40px_rgba(220,38,38,0.1)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(220,38,38,0.4)] border-4 border-[#111]">
                  <Medal size={48} className="text-white drop-shadow-md" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-block py-1.5 px-4 rounded-full bg-red-600/20 text-red-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                    New This Year!
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">
                    The Playoff Challenge
                  </h2>
                  <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                    This year, all regular-season winners will face off in an ultimate showdown. The overall Jersey League champion will take home a <strong>championship ring or belt</strong>, proving them as the undisputed tournament champ!
                  </p>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}