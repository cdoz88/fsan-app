"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { Loader2, ShieldAlert, ChevronRight, Save, LayoutTemplate, Plus, Edit2, Trash2, ArrowLeft, Image as ImageIcon, Shirt } from 'lucide-react';

const defaultAdState = {
  id: '',
  headline: 'Dominate Your Draft',
  subtext: 'Get the ultimate rookie breakdown!',
  buttonText: 'Get Access',
  buttonLink: 'https://fsan.shop',
  bgColor: '#7f1d1d', 
  bgColor2: '#000000',
  bgGradientType: 'radial', 
  btnColor: '#dc2626',
  borderColor: '#991b1b',
  pattern: 'dots', 
  bgImage: '',
  fgImage: '',
  sport: ['All'],
  pages: ['home', 'articles', 'videos', 'podcasts'],
  startDate: '',
  endDate: ''
};

export default function AdsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [view, setView] = useState('list'); 
  const [adsList, setAdsList] = useState([]);
  const [adData, setAdData] = useState(defaultAdState);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/all/home');
    if (status === 'authenticated' && session?.user?.token) {
      verifyAdminAndFetchAds();
    }
  }, [status, session, router]);

  const verifyAdminAndFetchAds = async () => {
    try {
      const roleQuery = `query GetViewerRole { viewer { roles { nodes { name } } } }`;
      const roleRes = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.user.token}` },
        body: JSON.stringify({ query: roleQuery }),
      });
      const roleJson = await roleRes.json();
      const roles = roleJson?.data?.viewer?.roles?.nodes?.map(r => r.name.toLowerCase()) || [];
      
      if (!roles.includes('administrator')) {
        router.push('/account'); 
        return;
      }
      setIsAdmin(true);
      await fetchAds();
    } catch (error) {
      console.error('Failed verification', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchAds = async () => {
    const adQuery = `
      query GetGlobalAds {
        globalAds {
          id headline subtext buttonText buttonLink bgColor bgColor2 bgGradientType btnColor borderColor pattern bgImage fgImage sport pages startDate endDate
        }
      }
    `;
    const adRes = await fetch('https://admin.fsan.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: adQuery }),
      cache: 'no-store'
    });
    const adJson = await adRes.json();
    if (adJson?.data?.globalAds) {
      setAdsList(adJson.data.globalAds);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdData(prev => ({ ...prev, [name]: value }));
  };

  const handlePageToggle = (page) => {
    setAdData(prev => ({
      ...prev,
      pages: prev.pages.includes(page) ? prev.pages.filter(p => p !== page) : [...prev.pages, page]
    }));
  };

  const handleSportToggle = (sport) => {
    setAdData(prev => ({
      ...prev,
      sport: prev.sport.includes(sport) ? prev.sport.filter(s => s !== sport) : [...prev.sport, sport]
    }));
  };

  const handleSaveAd = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const query = `
      mutation SaveGlobalAd(
        $id: String, $headline: String, $subtext: String, $buttonText: String, 
        $buttonLink: String, $bgColor: String, $bgColor2: String, $bgGradientType: String,
        $btnColor: String, $borderColor: String, $pattern: String, $bgImage: String, 
        $fgImage: String, $sport: [String], $pages: [String], $startDate: String, $endDate: String
      ) {
        saveGlobalAd(input: {
          id: $id, headline: $headline, subtext: $subtext, buttonText: $buttonText, buttonLink: $buttonLink, bgColor: $bgColor, bgColor2: $bgColor2, bgGradientType: $bgGradientType, btnColor: $btnColor, borderColor: $borderColor, pattern: $pattern, bgImage: $bgImage, fgImage: $fgImage, sport: $sport, pages: $pages, startDate: $startDate, endDate: $endDate
        }) { success }
      }
    `;

    try {
      await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.user.token}` },
        body: JSON.stringify({ query, variables: adData }),
      });
      await fetchAds();
      setView('list');
    } catch(e) {
        alert('Network error saving ad.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteAd = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this ad?")) return;
    setIsDeleting(true);
    const query = `mutation DeleteAd($id: String!) { deleteGlobalAd(input: { id: $id }) { success } }`;
    try {
      await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.user.token}` },
        body: JSON.stringify({ query, variables: { id } }),
      });
      await fetchAds();
    } catch(e) {
      alert('Error deleting ad.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditor = (ad = null) => {
    const safeAd = ad ? { 
      ...defaultAdState, 
      ...ad, 
      sport: Array.isArray(ad.sport) ? ad.sport : (ad.sport ? [ad.sport] : ['All']),
      pages: Array.isArray(ad.pages) ? ad.pages : ['home', 'articles', 'videos', 'podcasts']
    } : { ...defaultAdState };
    
    setAdData(safeAd);
    setView('form');
  };

  const LivePreviewAd = ({ ad }) => {
    let patternOverlay = '';
    if (ad.pattern === 'dots') {
        patternOverlay = "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20\\' xmlns=\\'http://www.w3.org/2000%2Fsvg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.4\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')";
    } else if (ad.pattern === 'lines') {
        patternOverlay = "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)";
    } else if (ad.pattern === 'grid') {
        patternOverlay = "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)";
    } else if (ad.pattern === 'crosshatch') {
        patternOverlay = "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px)";
    }

    const bgStyles = {};
    if (ad.bgGradientType === 'solid') {
        bgStyles.backgroundColor = ad.bgColor;
    } else if (ad.bgGradientType === 'linear') {
        bgStyles.backgroundImage = `linear-gradient(to right, ${ad.bgColor}, ${ad.bgColor2 || '#000000'})`;
    } else if (ad.bgGradientType === 'radial') {
        bgStyles.backgroundImage = `radial-gradient(ellipse at top, ${ad.bgColor}80, ${ad.bgColor2 || '#111'}, #000000)`;
    }

    return (
      // Added @container so we can use smart breakpoints based on the ad's available width
      <div className="@container w-full h-full rounded-2xl p-4 @2xl:p-6 flex flex-row items-center justify-between text-left relative overflow-hidden shadow-2xl group min-h-[120px] transition-all border-2 gap-3 @2xl:gap-6" style={{ ...bgStyles, borderColor: ad.borderColor || ad.bgColor }}>
         {ad.bgImage && <img src={ad.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" alt="Background" />}
         {ad.pattern !== 'none' && <div className="absolute inset-0" style={{ backgroundImage: patternOverlay, mixBlendMode: 'overlay', backgroundSize: ad.pattern === 'grid' ? '20px 20px' : 'auto' }}></div>}
         
         {/* 1. TEXT (Always flex-1 so it takes all available slack to avoid squishing) */}
         <div className="relative z-10 flex flex-col justify-center flex-1 min-w-0 pr-2">
           <h2 className="text-lg @md:text-2xl @2xl:text-3xl font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform origin-left line-clamp-2 leading-tight">
             {ad.headline || 'Headline'}
           </h2>
           <p className="text-gray-300 font-bold text-[10px] @md:text-xs uppercase tracking-widest relative z-10 line-clamp-2 mt-1">
             {ad.subtext || 'Subtext goes here'}
           </p>
         </div>

         {/* 2. IMAGE (Slides right when the button container drops flex-1 on smaller screens) */}
         {ad.fgImage && (
            <div className="relative z-10 hidden @sm:flex justify-center items-center shrink-0">
               <img src={ad.fgImage} className="max-h-16 @2xl:max-h-24 w-auto max-w-[80px] @2xl:max-w-[160px] object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300" alt="Foreground" />
            </div>
         )}

         {/* 3. BUTTON (Only demands 50% centering space when the container is super wide [@3xl]) */}
         <div className="relative z-10 flex justify-end items-center shrink-0 @3xl:flex-1 min-w-0">
            <div className="text-white px-3 py-2 @2xl:px-5 @2xl:py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1 @2xl:gap-2 shrink-0 whitespace-nowrap" style={{ backgroundColor: ad.btnColor }}>
               {ad.buttonText || 'Click Here'} <ChevronRight size={14} className="hidden @md:block" />
            </div>
         </div>
      </div>
    );
  };

  if (isVerifying) return <div className="min-h-screen bg-[#121212] flex items-center justify-center"><Loader2 size={48} className="animate-spin text-gray-600" /></div>;
  if (!isAdmin) return null;

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
              <p className="text-gray-400 mt-2 text-sm">Manage global promotional banners across the network.</p>
            </div>
            {view === 'list' && (
              <button onClick={() => openEditor()} className="bg-red-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-red-500 transition-colors shadow-lg">
                  <Plus size={18} /> Create New Ad
              </button>
            )}
          </div>

          {view === 'list' ? (
             <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
               {adsList.length === 0 ? (
                 <div className="py-12 text-center text-gray-500 font-bold uppercase tracking-widest bg-[#1a1a1a] rounded-2xl border border-gray-800">No ads created yet.</div>
               ) : (
                 adsList.map(ad => (
                   <div key={ad.id} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                      <div className="p-4">
                        <LivePreviewAd ad={{...defaultAdState, ...ad}} />
                      </div>
                      <div className="px-6 py-4 bg-[#111] border-t border-gray-800 flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                           <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sport: {Array.isArray(ad.sport) ? ad.sport.join(', ') : (ad.sport || 'None')}</span>
                           <span className="text-[10px] text-gray-600">Pages: {Array.isArray(ad.pages) ? ad.pages.join(', ') : (ad.pages || 'None')}</span>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => openEditor(ad)} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"><Edit2 size={16} /></button>
                           <button onClick={() => handleDeleteAd(ad.id)} disabled={isDeleting} className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                   </div>
                 ))
               )}
             </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in slide-in-from-right-8 duration-300">
              
              {/* FORM EDITOR */}
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
                 <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                   <h3 className="font-bold text-lg flex items-center gap-2"><LayoutTemplate size={20}/> Edit Ad Content</h3>
                   <button onClick={() => setView('list')} className="text-gray-500 hover:text-white flex items-center gap-1 text-xs uppercase tracking-widest font-bold"><ArrowLeft size={14}/> Back to List</button>
                 </div>
                 
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
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                     <div>
                       <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Gradient Type</label>
                       <select name="bgGradientType" value={adData.bgGradientType} onChange={handleChange} className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm outline-none">
                         <option value="solid">Solid Color</option>
                         <option value="linear">Linear Gradient (Left to Right)</option>
                         <option value="radial">Radial Gradient (Glow)</option>
                       </select>
                     </div>
                     <div className="flex gap-4">
                       <div className="flex-1">
                         <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Color 1</label>
                         <div className="flex items-center gap-2 bg-[#111] border border-gray-700 rounded-lg p-1">
                           <input type="color" name="bgColor" value={adData.bgColor} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                           <input type="text" name="bgColor" value={adData.bgColor} onChange={handleChange} className="w-full bg-transparent text-white text-xs outline-none" />
                         </div>
                       </div>
                       {adData.bgGradientType !== 'solid' && (
                         <div className="flex-1">
                           <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Color 2</label>
                           <div className="flex items-center gap-2 bg-[#111] border border-gray-700 rounded-lg p-1">
                             <input type="color" name="bgColor2" value={adData.bgColor2} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                             <input type="text" name="bgColor2" value={adData.bgColor2} onChange={handleChange} className="w-full bg-transparent text-white text-xs outline-none" />
                           </div>
                         </div>
                       )}
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Outer Border Color</label>
                       <div className="flex items-center gap-2 bg-[#111] border border-gray-700 rounded-lg p-1">
                         <input type="color" name="borderColor" value={adData.borderColor} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                         <input type="text" name="borderColor" value={adData.borderColor} onChange={handleChange} className="w-full bg-transparent text-white text-xs outline-none" />
                       </div>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <div>
                       <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Pattern Overlay</label>
                       <select name="pattern" value={adData.pattern} onChange={handleChange} className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm outline-none">
                         <option value="none">None</option>
                         <option value="dots">Dots</option>
                         <option value="lines">Diagonal Lines</option>
                         <option value="grid">Grid Pattern</option>
                         <option value="crosshatch">Crosshatch</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Button Color</label>
                       <div className="flex items-center gap-2 bg-[#111] border border-gray-700 rounded-lg p-1">
                         <input type="color" name="btnColor" value={adData.btnColor} onChange={handleChange} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                         <input type="text" name="btnColor" value={adData.btnColor} onChange={handleChange} className="w-full bg-transparent text-white text-xs outline-none" />
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-4 pt-2">
                   <div>
                     <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">Background Image URL (Optional) <ImageIcon size={12}/></label>
                     <input type="text" name="bgImage" value={adData.bgImage} onChange={handleChange} placeholder="Paste WP Media Library URL (https://...)" className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm focus:border-gray-400 outline-none" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">Center Foreground / Merch Image URL (Optional) <Shirt size={12}/></label>
                     <input type="text" name="fgImage" value={adData.fgImage} onChange={handleChange} placeholder="Paste WP Media Library URL (https://...)" className="w-full bg-[#111] border border-gray-700 text-white rounded-lg py-2.5 px-4 text-sm focus:border-gray-400 outline-none" />
                   </div>
                 </div>

                 <h3 className="font-bold text-lg border-b border-gray-800 pb-3 pt-4">Targeting & Schedule</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Display Sport</label>
                     <div className="flex flex-col gap-3 mb-6">
                       {['All', 'Football', 'Basketball', 'Baseball'].map(s => (
                         <label key={s} className="flex items-center gap-3 cursor-pointer">
                           <input 
                              type="checkbox" 
                              checked={adData.sport.includes(s)} 
                              onChange={() => handleSportToggle(s)}
                              className="w-4 h-4 rounded bg-[#111] border-gray-700 text-red-500 focus:ring-red-500 focus:ring-offset-gray-900"
                           />
                           <span className="text-sm font-bold uppercase tracking-widest text-gray-300">{s}</span>
                         </label>
                       ))}
                     </div>

                     <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Display Pages</label>
                     <div className="flex flex-col gap-3">
                       {['home', 'articles', 'videos', 'podcasts'].map(page => (
                         <label key={page} className="flex items-center gap-3 cursor-pointer">
                           <input 
                              type="checkbox" 
                              checked={adData.pages.includes(page)} 
                              onChange={() => handlePageToggle(page)}
                              className="w-4 h-4 rounded bg-[#111] border-gray-700 text-red-500 focus:ring-red-500 focus:ring-offset-gray-900"
                           />
                           <span className="text-sm font-bold uppercase tracking-widest text-gray-300">{page}</span>
                         </label>
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
                 
                 <div className="pt-6 border-t border-gray-800">
                    <button onClick={handleSaveAd} disabled={isSaving} className="w-full bg-white text-black px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex justify-center items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save & Deploy Ad
                    </button>
                 </div>
              </div>

              {/* LIVE PREVIEW COLUMN */}
              <div className="flex flex-col gap-6">
                <div className="sticky top-24">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-4">Live Preview</h3>
                  <LivePreviewAd ad={adData} />
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}