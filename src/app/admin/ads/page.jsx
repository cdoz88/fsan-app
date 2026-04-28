"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { 
  Loader2, 
  ShieldAlert, 
  ChevronRight, 
  Save, 
  LayoutTemplate, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  Image as ImageIcon, 
  Shirt, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';

const defaultAdState = {
  id: '',
  headline: 'Dominate Your Draft',
  subtext: 'Get the ultimate rookie breakdown!',
  buttonText: 'Get Yours Now!',
  buttonLink: 'https://fsan.shop',
  bgColor: '#7f1d1d', 
  bgColor2: '#000000',
  bgGradientType: 'radial', 
  btnColor: '#dc2626',
  btnTextColor: '#ffffff',
  borderColor: '#991b1b',
  pattern: 'dots', 
  bgImage: '',
  fgImage: '',
  sport: ['All'],
  pages: ['home', 'articles', 'videos', 'podcasts'],
  placements: ['inline'],
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
  const [isReordering, setIsReordering] = useState(false);

  const [view, setView] = useState('list'); 
  const [adsList, setAdsList] = useState([]);
  const [adData, setAdData] = useState(defaultAdState);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/home');
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
          id headline subtext buttonText buttonLink bgColor bgColor2 bgGradientType btnColor btnTextColor borderColor pattern bgImage fgImage sport pages placements startDate endDate
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

  const handlePlacementToggle = (placement) => {
    setAdData(prev => ({
      ...prev,
      placements: prev.placements?.includes(placement) ? prev.placements.filter(p => p !== placement) : [...(prev.placements || []), placement]
    }));
  };

  const handleSaveAd = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // FIX: Using ID for the id field to match WPGraphQL
    const query = `
      mutation SaveGlobalAd(
        $id: ID, $headline: String, $subtext: String, $buttonText: String, 
        $buttonLink: String, $bgColor: String, $bgColor2: String, $bgGradientType: String,
        $btnColor: String, $btnTextColor: String, $borderColor: String, $pattern: String, $bgImage: String, 
        $fgImage: String, $sport: [String], $pages: [String], $placements: [String], $startDate: String, $endDate: String
      ) {
        saveGlobalAd(input: {
          clientMutationId: "save_ad",
          id: $id, headline: $headline, subtext: $subtext, buttonText: $buttonText, buttonLink: $buttonLink, bgColor: $bgColor, bgColor2: $bgColor2, bgGradientType: $bgGradientType, btnColor: $btnColor, btnTextColor: $btnTextColor, borderColor: $borderColor, pattern: $pattern, bgImage: $bgImage, fgImage: $fgImage, sport: $sport, pages: $pages, placements: $placements, startDate: $startDate, endDate: $endDate
        }) { success }
      }
    `;

    // FIX: Remove __typename to prevent 400 Bad Request error from GraphQL
    // FIX: Delete empty IDs so WP knows it's a new ad
    const { __typename, ...cleanAdData } = adData;
    if (!cleanAdData.id) {
      delete cleanAdData.id;
    }

    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.user.token}` },
        body: JSON.stringify({ query, variables: cleanAdData }),
      });
      const data = await res.json();
      
      if (data.errors) {
        console.error("Save Error:", data.errors);
        alert(`Error saving ad: ${data.errors[0].message}`);
      } else {
        await fetchAds();
        setView('list');
      }
    } catch(e) {
      alert('Network error saving ad.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAd = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this ad?")) return;
    setIsDeleting(true);
    
    // FIX: Changed $id to ID! and added clientMutationId
    const query = `mutation DeleteAd($id: ID!) { deleteGlobalAd(input: { clientMutationId: "delete_ad", id: $id }) { success } }`;
    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.user.token}` },
        body: JSON.stringify({ query, variables: { id } }),
      });
      const data = await res.json();
      
      if (data.errors) {
        console.error("Delete Error:", data.errors);
        alert(`Error deleting ad: ${data.errors[0].message}`);
      } else {
        await fetchAds();
      }
    } catch(e) {
      alert('Error deleting ad.');
    } finally {
      setIsDeleting(false);
    }
  };

  const moveAd = async (index, direction) => {
    if (isReordering) return;
    setIsReordering(true);

    const newAdsList = [...adsList];
    const temp = newAdsList[index];
    newAdsList[index] = newAdsList[index + direction];
    newAdsList[index + direction] = temp;
    
    setAdsList(newAdsList); 

    const newIds = newAdsList.map(ad => ad.id);
    
    // FIX: Changed to [ID] and added clientMutationId
    const query = `mutation ReorderAds($ids: [ID]) { reorderGlobalAds(input: { clientMutationId: "reorder_ads", ids: $ids }) { success } }`;
    
    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.user.token}` },
        body: JSON.stringify({ query, variables: { ids: newIds } }),
      });
      const data = await res.json();
      if (data.errors) {
        console.error("Reorder Error:", data.errors);
        alert(`Error reordering ads: ${data.errors[0].message}`);
        fetchAds();
      }
    } catch(e) {
      alert('Error reordering ads.');
      fetchAds(); 
    } finally {
      setIsReordering(false);
    }
  };

  const openEditor = (ad = null) => {
    const safeAd = ad ? { 
      ...defaultAdState, 
      ...ad, 
      sport: Array.isArray(ad.sport) ? ad.sport : (ad.sport ? [ad.sport] : ['All']),
      pages: Array.isArray(ad.pages) ? ad.pages : ['home', 'articles', 'videos', 'podcasts'],
      placements: Array.isArray(ad.placements) ? ad.placements : ['inline']
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

    const renderButton = (extraClass) => (
      <div className={`px-3 py-2 @2xl:px-5 @2xl:py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1 @2xl:gap-2 shrink-0 whitespace-nowrap ${extraClass}`} style={{ backgroundColor: ad.btnColor, color: ad.btnTextColor || '#ffffff' }}>
         {ad.buttonText || 'Click Here'} <ChevronRight size={14} className="hidden @md:block" />
      </div>
    );

    const textAlignment = ad.fgImage
      ? "text-left items-start" 
      : "text-center @4xl:text-left items-center @4xl:items-start";

    return (
      <div className={`@container w-full h-full rounded-2xl p-4 @2xl:p-6 flex relative overflow-hidden shadow-2xl group min-h-[120px] transition-all border-2 gap-3 @2xl:gap-6 ${ad.fgImage ? 'flex-row items-center justify-between' : 'flex-col @4xl:flex-row items-center justify-center @4xl:justify-between'}`} style={{ ...bgStyles, borderColor: ad.borderColor || ad.bgColor }}>
         {ad.bgImage && <img src={ad.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" alt="Background" />}
         {ad.pattern !== 'none' && <div className="absolute inset-0" style={{ backgroundImage: patternOverlay, mixBlendMode: 'overlay', backgroundSize: ad.pattern === 'grid' ? '20px 20px' : 'auto' }}></div>}
         
         <div className={`relative z-10 flex flex-col justify-center shrink min-w-0 pr-2 ${textAlignment} ${!ad.fgImage ? 'flex-1' : ''}`}>
           <h2 className={`text-lg @md:text-2xl @2xl:text-3xl font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform line-clamp-2 leading-tight ${ad.fgImage ? 'origin-left' : 'origin-center @4xl:origin-left'}`}>
             {ad.headline || 'Headline'}
           </h2>
           <p className="text-gray-300 font-bold text-[10px] @md:text-xs uppercase tracking-widest relative z-10 line-clamp-2 mt-1">
             {ad.subtext || 'Subtext goes here'}
           </p>
           {ad.fgImage && renderButton("mt-4 flex @4xl:hidden w-max")}
         </div>

         {ad.fgImage && (
            <div className="relative z-10 hidden @xs:flex justify-end @4xl:justify-center items-center shrink-0 pl-2 @4xl:pl-0 @4xl:flex-1">
               <img src={ad.fgImage} className="max-h-24 @2xl:max-h-32 w-auto max-w-[100px] @2xl:max-w-[160px] object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300" alt="Foreground" />
            </div>
         )}

         <div className={`relative z-10 justify-end items-center shrink-0 @5xl:flex-1 min-w-0 ${ad.fgImage ? 'hidden @4xl:flex' : 'flex'}`}>
            {renderButton("")}
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
              <button onClick={() => { setAdData(defaultAdState); setView('form'); }} className="bg-red-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-red-500 transition-colors shadow-lg">
                  <Plus size={18} /> Create New Ad
              </button>
            )}
          </div>

          {view === 'list' ? (
             <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
               {adsList.length === 0 ? (
                 <div className="py-12 text-center text-gray-500 font-bold uppercase tracking-widest bg-[#1a1a1a] rounded-2xl border border-gray-800">No ads created yet.</div>
               ) : (
                 adsList.map((ad, index) => (
                   <div key={ad.id} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                      <div className="p-4">
                        <LivePreviewAd ad={{...defaultAdState, ...ad}} />
                      </div>
                      <div className="px-6 py-4 bg-[#111] border-t border-gray-800 flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                           <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sport: {Array.isArray(ad.sport) ? ad.sport.join(', ') : (ad.sport || 'None')}</span>
                           <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Pages: {Array.isArray(ad.pages) ? ad.pages.join(', ') : (ad.pages || 'None')}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           {/* REORDER ARROWS */}
                           <div className="flex gap-1 bg-gray-900 border border-gray-700 rounded-lg p-1">
                             <button onClick={() => moveAd(index, -1)} disabled={index === 0 || isReordering} className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"><ArrowUp size={16} /></button>
                             <button onClick={() => moveAd(index, 1)} disabled={index === adsList.length - 1 || isReordering} className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"><ArrowDown size={16} /></button>
                           </div>
                           <div className="w-