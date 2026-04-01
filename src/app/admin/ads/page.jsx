"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { Loader2, ShieldAlert, ChevronRight, Save, LayoutTemplate } from 'lucide-react';

export default function AdsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [adData, setAdData] = useState({
    headline: 'Dominate Your Draft',
    subtext: 'Get the ultimate rookie breakdown!',
    buttonText: 'Get Access',
    buttonLink: 'https://fsan.shop',
    bgColor: '#7f1d1d', 
    btnColor: '#dc2626', 
    pattern: 'dots', 
    bgImage: '',
    sport: 'All',
    pages: ['home', 'articles', 'videos', 'podcasts'],
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/all/home');
      return;
    }

    if (status === 'authenticated' && session?.user?.token) {
      const verifyAdminAndFetchAd = async () => {
        try {
          // 1. Verify they are an admin
          const roleQuery = `
            query GetViewerRole {
              viewer {
                roles { nodes { name } }
              }
            }
          `;
          const roleRes = await fetch('https://admin.fsan.com/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.user.token}`,
            },
            body: JSON.stringify({ query: roleQuery }),
          });
          const roleJson = await roleRes.json();
          const roles = roleJson?.data?.viewer?.roles?.nodes?.map(r => r.name.toLowerCase()) || [];
          
          if (!roles.includes('administrator')) {
            router.push('/account'); 
            return;
          }
          
          setIsAdmin(true);

          // 2. Since they are an admin, fetch the currently saved Ad Data from WordPress
          const adQuery = `
            query GetGlobalAd {
              globalAd {
                headline subtext buttonText buttonLink bgColor btnColor 
                pattern bgImage sport pages startDate endDate
              }
            }
          `;
          const adRes = await fetch('https://admin.fsan.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: adQuery }),
          });
          const adJson = await adRes.json();
          
          if (adJson?.data?.globalAd) {
            // Merge the saved data with our defaults to prevent null errors
            setAdData(prev => ({ ...prev, ...adJson.data.globalAd }));
          }

        } catch (error) {
          console.error('Failed to verify role or fetch ad', error);
        } finally {
          setIsVerifying(false);
        }
      };
      verifyAdminAndFetchAd();
    }
  }, [status, session, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdData(prev => ({ ...prev, [name]: value }));
  };

  const handlePageToggle = (page) => {
    setAdData(prev => ({
      ...prev,
      pages: prev.pages.includes(page) 
        ? prev.pages.filter(p => p !== page) 
        : [...prev.pages, page]
    }));
  };

  const handleSaveAd = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const query = `
      mutation SaveGlobalAd(
        $headline: String, $subtext: String, $buttonText: String, 
        $buttonLink: String, $bgColor: String, $btnColor: String, 
        $pattern: String, $bgImage: String, $sport: String, 
        $pages: [String], $startDate: String, $endDate: String
      ) {
        updateGlobalAd(input: {
          headline: $headline,
          subtext: $subtext,
          buttonText: $buttonText,
          buttonLink: $buttonLink,
          bgColor: $bgColor,
          btnColor: $btnColor,
          pattern: $pattern,
          bgImage: $bgImage,
          sport: $sport,
          pages: $pages,
          startDate: $startDate,
          endDate: $endDate
        }) {
          success
        }
      }
    `;

    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`, // Must pass token to prove admin status
        },
        body: JSON.stringify({ query, variables: adData }),
      });
      
      const json = await res.json();
      if (json.errors) {
          alert('Error saving ad: ' + json.errors[0].message);
      } else {
          alert("Success! The Ad is now live.");
      }
    } catch(e) {
        console.error(e);
        alert('A network error occurred while trying to save.');
    } finally {
        setIsSaving(false);
    }
  };

  // LIVE PREVIEW COMPONENT
  const LivePreviewAd = () => {
    let patternOverlay = '';
    if (adData.pattern === 'dots') {
        patternOverlay = "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20\\' xmlns=\\'http://www.w3.org/2000%2Fsvg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.4\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')";
    } else if (adData.pattern === 'lines') {
        patternOverlay = "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)";
    }

    return (
      <div 
        className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] to-black border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between text-left relative overflow-hidden shadow-2xl cursor-pointer group min-h-[120px] transition-all"
        style={{ 
            '--tw-gradient-from': `${adData.bgColor}80`,
            '--tw-gradient-stops': `var(--tw-gradient-from), #111, to-black`,
            borderColor: adData.bgColor 
        }}
      >
         {adData.bgImage && (
            <img src={adData.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" alt="Background" />
         )}
         {adData.pattern !== 'none' && (
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: patternOverlay, mixBlendMode: 'overlay' }}></div>
         )}
         
         <div className="relative z-10 flex flex-col justify-center">
           <h2 className="text-2xl font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform origin-center">{adData.headline || 'Headline'}</h2>
           <p className="text-gray-300 font-bold text-xs tracking-wide relative z-10">{adData.subtext || 'Subtext goes here'}</p>
         </div>
         <div 
            className="text-white px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg relative z-10 flex items-center justify-center gap-2 shrink-0 whitespace-nowrap mt-3 sm:mt-0"
            style={{ backgroundColor: adData.btnColor }}
         >
            {adData.buttonText || 'Click Here'} <ChevronRight size={14} />
         </div>
      </div>
    );
  };

  if (isVerifying) {
    return <div className="min-h-screen bg-[#121212] flex items-center justify-center"><Loader2 size={48} className="animate-spin text-gray-600" /></div>;
  }

  if (!isAdmin) return null; // Failsafe

  return (
    <>
      <Header activeSport="All" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-16">
        <Sidebar activeSport="All" />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-wider text-white flex items-center gap-3">
                <ShieldAlert className="text-red-500" size={36} /> Ad Manager
              </h1>
              <p className="text-gray-400 mt-2 text-sm">Create and deploy global promo ads across the network.</p>
            </div>
            <button onClick={handleSaveAd} disabled={isSaving} className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save & Deploy
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: THE FORM */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
               <h3 className="font-bold text-lg border-b border-gray-800 pb-3 flex items-center gap-2"><LayoutTemplate size={20}/> Ad Content</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Headline</label>
                   <input type="text" name="headline" value={adData.headline} onChange={handleChange} className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm focus:border-gray-400 outline-none" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Subtext</label>
                   <input type="text" name="subtext" value={adData.subtext} onChange={handleChange} className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm focus:border-gray-400 outline-none" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Button Text</label>
                   <input type="text" name="buttonText" value={adData.buttonText} onChange={handleChange} className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm focus:border-gray-400 outline-none" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Button Link URL</label>
                   <input type="text" name="buttonLink" value={adData.buttonLink} onChange={handleChange} className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm focus:border-gray-400 outline-none" />
                 </div>
               </div>

               <h3 className="font-bold text-lg border-b border-gray-800 pb-3 pt-4">Design & Media</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Background Color</label>
                   <div className="flex items-center gap-3">
                     <input type="color" name="bgColor" value={adData.bgColor} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                     <input type="text" name="bgColor" value={adData.bgColor} onChange={handleChange} className="flex-1 bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-3 text-sm outline-none" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Button Color</label>
                   <div className="flex items-center gap-3">
                     <input type="color" name="btnColor" value={adData.btnColor} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                     <input type="text" name="btnColor" value={adData.btnColor} onChange={handleChange} className="flex-1 bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-3 text-sm outline-none" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Pattern Overlay</label>
                   <select name="pattern" value={adData.pattern} onChange={handleChange} className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm outline-none">
                     <option value="none">None</option>
                     <option value="dots">Dots</option>
                     <option value="lines">Diagonal Lines</option>
                   </select>
                 </div>
               </div>
               <div>
                 <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Background Image URL (Optional)</label>
                 <input type="text" name="bgImage" value={adData.bgImage} onChange={handleChange} placeholder="https://..." className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm focus:border-gray-400 outline-none" />
               </div>

               <h3 className="font-bold text-lg border-b border-gray-800 pb-3 pt-4">Targeting & Schedule</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Display Sport</label>
                   <select name="sport" value={adData.sport} onChange={handleChange} className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm outline-none mb-4">
                     <option value="All">All Networks</option>
                     <option value="Football">Football</option>
                     <option value="Basketball">Basketball</option>
                     <option value="Baseball">Baseball</option>
                   </select>

                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Display Pages</label>
                   <div className="flex flex-wrap gap-2">
                     {['home', 'articles', 'videos', 'podcasts'].map(page => (
                       <button 
                         key={page} 
                         onClick={() => handlePageToggle(page)}
                         className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${adData.pages.includes(page) ? 'bg-gray-200 text-black border-gray-200' : 'bg-[#111] text-gray-500 border-gray-700 hover:border-gray-500'}`}
                       >
                         {page}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="flex flex-col gap-4">
                   <div>
                     <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Start Date</label>
                     <input type="date" name="startDate" value={adData.startDate} onChange={handleChange} className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm outline-none" style={{ colorScheme: 'dark' }} />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">End Date</label>
                     <input type="date" name="endDate" value={adData.endDate} onChange={handleChange} className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm outline-none" style={{ colorScheme: 'dark' }} />
                   </div>
                 </div>
               </div>
            </div>

            {/* RIGHT COLUMN: LIVE PREVIEW */}
            <div className="flex flex-col gap-6">
              <div className="sticky top-24">
                <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-4">Live Preview</h3>
                <LivePreviewAd />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}