import React, { useState, useEffect } from 'react';
import { HeartHandshake, ExternalLink, Users, DollarSign, Loader2, Lock, Unlock } from 'lucide-react';

export default function CharityTab() {
  const [charityData, setCharityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the live charity calculation from the WordPress API
  useEffect(() => {
    fetch('/api/scl?action=dno_get_charity_total', { cache: 'no-store' })
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setCharityData(json.data);
        }
      })
      .catch(err => console.error("Failed to fetch charity data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const goals = charityData?.goals || [];
  const raised = charityData?.total_raised || 0;
  
  // Calculate maximum goal dynamically from the backend data
  const maxGoal = goals.length > 0 ? Math.max(...goals.map(g => parseFloat(g.amount))) : 5000;
  const progressPercent = Math.min(100, (raised / maxGoal) * 100);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
      <div className="flex items-center gap-6 mb-8">
          <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Charity</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
      </div>

      {/* CHARITY PROGRESS FOOTBALL FIELD */}
      {goals.length > 0 && (
          <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 md:p-10 shadow-xl mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
              <div>
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Grand Prize Fundraiser</h3>
                <p className="text-sm text-gray-400 mt-1">Help us reach our goals! Every target hit adds a new item to the regular season overall grand prize package.</p>
              </div>
              <div className="text-right shrink-0 bg-[#1a1a1a] px-4 py-2 rounded-xl border border-gray-700 w-full md:w-auto flex justify-between md:flex-col items-center md:items-end">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest md:mb-0.5">Current Progress</p>
                <p className="text-xl font-black text-[#f5a623]">{progressPercent.toFixed(1)}%</p>
              </div>
            </div>

            {/* Football Field */}
            <div className="relative w-full h-24 md:h-32 bg-green-700 rounded-xl border-4 border-white shadow-2xl overflow-hidden flex mb-8">
                {/* Field Hashmarks Background */}
                <div className="absolute inset-0 w-full opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent calc(10% - 2px), white calc(10% - 2px), white 10%)' }}></div>
                
                {/* Progress Bar Fill */}
                <div 
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#1b75bb] to-[#1b75bb]/80 transition-all duration-1000 ease-out z-10 border-r-4 border-white shadow-[10px_0_20px_rgba(27,117,187,0.5)]" 
                    style={{ width: `${progressPercent}%` }}
                ></div>

                {/* Goal Line Markers (Generated dynamically from your WP settings!) */}
                {goals.map((goal, idx) => {
                    const leftPercent = (goal.amount / maxGoal) * 100;
                    const isEndzone = idx === goals.length - 1;
                    
                    if (isEndzone) {
                        return (
                            <div key={idx} className="absolute right-0 top-0 bottom-0 w-[15%] md:w-[12%] bg-[#f5a623] border-l-4 border-white z-0 flex items-center justify-center shadow-inner">
                               <span className="text-black font-black text-xs md:text-lg tracking-widest uppercase opacity-90 -rotate-90 md:rotate-0">Endzone</span>
                            </div>
                        )
                    }

                    return (
                        <div 
                            key={idx} 
                            className="absolute top-0 bottom-0 border-l-2 border-white/60 z-20 flex flex-col justify-between py-1"
                            style={{ left: `${leftPercent}%` }}
                        >
                            <span className="text-white font-black text-[8px] md:text-[10px] -translate-x-1/2 mt-1 bg-green-900/50 px-1 rounded">${goal.amount}</span>
                            <span className="text-white font-black text-[8px] md:text-[10px] -translate-x-1/2 mb-1 bg-green-900/50 px-1 rounded">${goal.amount}</span>
                        </div>
                    );
                })}
            </div>

            {/* Prize Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {goals.map((goal, idx) => {
                  const isUnlocked = raised >= goal.amount;
                  return (
                      <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${isUnlocked ? 'bg-[#1b75bb]/10 border-[#1b75bb] shadow-[0_0_15px_rgba(27,117,187,0.2)]' : 'bg-[#151515] border-gray-800 opacity-60'}`}>
                         <div className="mb-2">
                           {isUnlocked ? <Unlock size={24} className="text-[#f5a623]" /> : <Lock size={24} className="text-gray-600" />}
                         </div>
                         <h5 className={`font-black text-[11px] uppercase tracking-widest mb-1 leading-tight ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{goal.name}</h5>
                         <span className={`text-[10px] font-bold ${isUnlocked ? 'text-emerald-500' : 'text-gray-600'}`}>
                           {isUnlocked ? 'UNLOCKED' : `Unlocks at $${goal.amount}`}
                         </span>
                      </div>
                  )
              })}
            </div>
          </div>
      )}

      {/* LIVE COUNTER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
         <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-inner">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Online Players</p>
              <div className="text-3xl font-black text-white">
                {isLoading ? <Loader2 size={24} className="animate-spin text-gray-600 mt-1" /> : charityData?.total_players || 0}
              </div>
            </div>
            <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center shrink-0">
              <Users size={20} className="text-gray-400" />
            </div>
         </div>

         <div className="bg-gradient-to-br from-emerald-900/20 to-[#111] border border-emerald-900/50 rounded-2xl p-6 flex items-center justify-between shadow-inner">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Cash Raised</p>
              <div className="text-3xl font-black text-emerald-500">
                {isLoading ? <Loader2 size={24} className="animate-spin text-emerald-900 mt-1" /> : `$${(charityData?.total_raised || 0).toFixed(2)}`}
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-900/30 border border-emerald-500/30 rounded-full flex items-center justify-center shrink-0">
              <DollarSign size={20} className="text-emerald-500" />
            </div>
         </div>
      </div>

      <div className="bg-[#1b75bb]/10 border border-[#1b75bb]/30 rounded-xl p-4 mb-8 flex items-start gap-3">
        <HeartHandshake size={20} className="text-[#f5a623] shrink-0 mt-0.5" />
        <div>
          <h5 className="text-xs font-black text-[#1b75bb] uppercase tracking-widest mb-1">Playing for a Purpose</h5>
          <p className="text-sm text-gray-300 leading-relaxed">
            Draft Night Out isn't just about winning a championship—it's about giving back. A portion of every online draft entry will be directly donated to Mission 22 to support Veterans and their families.
          </p>
        </div>
      </div>
      
      {/* MISSION 22 BLURB */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-3xl p-8 md:p-10 border border-gray-800 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#f5a623]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

         <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
           {/* Left Col: Logo & Action */}
           <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left shrink-0">
             <div className="w-full max-w-[240px] flex items-center justify-center mb-6">
                <img src="https://admin.fsan.com/wp-content/uploads/2026/04/Mission-22-Logo.webp" alt="Mission 22 Logo" className="w-full h-auto drop-shadow-md" />
             </div>
             <a href="https://mission22.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#111] border border-gray-700 text-gray-300 hover:text-white hover:border-[#1b75bb] font-black uppercase tracking-widest text-xs transition-colors w-full md:w-auto shadow-md hover:-translate-y-0.5">
                Visit Mission 22 <ExternalLink size={14}/>
             </a>
           </div>

           {/* Right Col: Provided Text */}
           <div className="w-full md:w-2/3 flex flex-col gap-5 text-sm text-gray-300 leading-relaxed">
             <p><strong className="text-white text-base">At Mission 22, our commitment could not be more personal.</strong> Mission 22 was founded by Veterans. Most of our staff are Veterans, spouses of Veterans, or have immediate family members who have served in the US military.</p>
             <p>We provide extensive, personalized support and resources to help Veterans and their families thrive. Mission 22’s programs for Veterans and military spouses offer everything from biometric monitoring of stress, sleep, and activity levels; to meditation and coaching; to exercise programs and a wellness supplement regimen; to books and learning resources to help Veterans put their experience in context.</p>
             <p>Mission 22 recognizes that a Veteran’s experience is a family’s experience – families live through all of the ups and downs that soldiers returning home do. We’ve developed a support program exclusively for spouses to take positive steps that renew their identities as individuals and the strengths they bring to their household.</p>
             <p>Our Ambassador program further supports Veterans and military families – a network of more than 3,500 Veterans and civilians in all 50 states and around the world. We work to advance society’s collective understanding of the issues faced by active service members, Veterans, and their families.</p>
             <p>At Mission 22, we know firsthand that Veterans and service members bring extensive skills and assets to any situation. Their leadership capabilities, experiences, and sense of teamwork and integrity are unmatched. Veterans know how to rise to a challenge.</p>
             <p>America’s Veterans make our society stronger. They deserve a community worthy of all they have given, and all they will yet achieve. We are proud to continue designing programs for Veterans and their families, and to welcome them into our community.</p>
           </div>
         </div>
      </div>

    </div>
  );
}