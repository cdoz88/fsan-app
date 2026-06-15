"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Book, Loader2, Download, Ticket, ChevronRight, ShoppingCart, Tag, CheckCircle2 } from 'lucide-react';

const PremiumCommunityIcon = ({ className = "", size = 24, monochrome = false }) => {
  const mainColor = monochrome ? "currentColor" : "#9df01c";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 362.85 305.65" width={size} height={size} className={className}>
      <g>
        <path d="m321.31,285.9l-17.52-1.66c-2.92-.25-5.84-.61-8.76-.77l-8.77-.55-8.77-.55c-2.92-.19-5.85-.39-8.77-.46l-17.54-.63c-2.92-.13-5.85-.17-8.77-.2l-8.77-.11-8.77-.11c-2.92-.05-5.84.03-8.77.03l-17.53.15-17.52.46c-23.35.76-46.66,2.03-69.94,3.85-5.82.49-11.64.93-17.45,1.46-5.81.56-11.63,1.04-17.43,1.67l-8.71.9-8.71.97c-5.82.66-11.59,1.36-17.46,2.15l1.83,13.13c5.64-.75,11.41-1.46,17.15-2.11l8.62-.96,8.63-.89c5.75-.62,11.52-1.1,17.28-1.65,5.76-.52,11.53-.96,17.3-1.45,23.08-1.8,46.2-3.06,69.32-3.82l17.34-.46,17.34-.15c2.89,0,5.78-.08,8.67-.03l8.66.11,8.66.11c2.89.03,5.78.06,8.66.19l17.31.62c2.89.07,5.76.27,8.64.45l8.63.54,8.63.54c2.88.16,5.74.51,8.61.76l17.2,1.62,1.48-13.17Z" fill="none" />
        <path d="m99.19,298.5c-.15.06-.41.09-.72.12.07-.08.47-.17.72-.12Z" fill={mainColor} fillRule="evenodd" />
        <path d="m87.32,290.56c-.22.06-.91.2-.85.04.39-.05.56-.03.85-.04Z" fill={mainColor} fillRule="evenodd" />
        <path d="m86.1,290.47c-.05.08-.6.06-.85.11,0-.09.69-.14.85-.11Z" fill={mainColor} fillRule="evenodd" />
        <path d="m82.83,292.15c-.17.06-.63.15-.85.11.05-.08.6-.06.85-.11Z" fill={mainColor} fillRule="evenodd" />
        <path d="m81.14,290.86c-.28.11-.78.19-1.45.23.23-.12.93-.17,1.45-.23Z" fill={mainColor} fillRule="evenodd" />
        <path d="m77.63,298.32c-.74.08-2.23.36-2.77.27.91,0,1.93-.26,2.77-.27Z" fill={mainColor} fillRule="evenodd" />
        <path d="m75.33,295.45c-.9.28-2.58.24-3.74.49-.18-.14,1.73-.2,2.05-.36.28-.02.5,0,.72,0,.33-.05.62-.18.97-.13Z" fill={mainColor} fillRule="evenodd" />
        <path d="m63.97,296.18c.03.08-.04.14-.36.17-.09-.02-.13-.06-.12-.12l.48-.05Z" fill={mainColor} fillRule="evenodd" />
        <path d="m59.4,297.8c-.73.23-2.43.42-3.38.43-.12.04-.12.09-.36.11-.56.09-1.82.18-.6.04,1.49-.29,2.69-.32,4.34-.57Z" fill={mainColor} fillRule="evenodd" />
        <path d="m58.65,296.25c-.17.07-.47.12-.84.15.08-.09.7-.17.84-.15Z" fill={mainColor} fillRule="evenodd" />
        <path d="m58,300.59c-.13.09-.76.09-1.08.15.23-.07.81-.19,1.08-.15Z" fill={mainColor} fillRule="evenodd" />
        <path d="m57.82,296.9c-.29.12-.96.17-1.32.27-.34-.09.87-.21,1.32-.27Z" fill={mainColor} fillRule="evenodd" />
        <path d="m57.21,296.5c-.23.12-.93.18-1.45.26.3-.11.98-.18,1.45-.26Z" fill={mainColor} fillRule="evenodd" />
        <path d="m56.93,301.49c-.03.11-.5.16-.84.23.06-.11.55-.15.84-.23Z" fill={mainColor} fillRule="evenodd" />
        <path d="m56.31,300.78c-.38.14-1.73.27-2.4.34.84-.18,1.48-.25,2.4-.34Z" fill={mainColor} fillRule="evenodd" />
        <path d="m55.52,296.79c-.6.22-1.53.22-2.05.26.56-.15,1.41-.1,2.05-.26Z" fill={mainColor} fillRule="evenodd" />
        <path d="m54.1,298.48c-.23.08-.63.14-.96.21-.08-.13.56-.15.96-.21Z" fill={mainColor} fillRule="evenodd" />
        <path d="m53.01,298.28c-.28.11-.54.11-.96.14.09-.08.68-.09.96-.14Z" fill={mainColor} fillRule="evenodd" />
        <path d="m51.92,298.01c-.12.1-1.03.23-.85.03.26-.04.23.02.24.07.29-.02.26-.09.6-.1Z" fill={mainColor} fillRule="evenodd" />
        <path d="m49.68,300.78c.58-.2,1.62-.13,0,0h0Z" fill={mainColor} fillRule="evenodd" />
        <path d="m48.51,302.12c-.49.13-.97.17-1.56.22.36-.09,1.31-.22,1.56-.22Z" fill={mainColor} fillRule="evenodd" />
        <path d="m48.16,302.36c.19.08-.78.19-.6.07l.6-.07Z" fill={mainColor} fillRule="evenodd" />
        <path d="m47.25,304.2c-.16.09-.54.15-.83.17.08-.09.69-.18.83-.17Z" fill={mainColor} fillRule="evenodd" />
        <path d="m43.91,304.48c-.96.28-1.33.17,0,0h0Z" fill={mainColor} fillRule="evenodd" />
        <path d="m70.89,301.38c-.2.06-.47.11-.6.19-.39-.09-1.05.09-1.56.09.6-.21,1.28-.09,2.17-.27Z" fill={mainColor} fillRule="evenodd" />
        <path d="m57.14,300.1c-.29.05-.26-.03-.6.04-.04-.05.11-.07.12-.11-.6.05-.93.14-1.44.2.06-.03.12-.07.12-.11-.66.25-1.48.08-2.89.33,1.33-.34,4.35-.58,5.53-.75-.16.14-1.21.15-1.32.31-.02.1.67-.06.48.11Z" fill={mainColor} fillRule="evenodd" />
        <path d="m55.53,297.21c-.14.02-.07.04,0,.03-.03.08-.53.08-.6.07.14-.11,1.74-.25.6-.1Z" fill={mainColor} fillRule="evenodd" />
        <path d="m46.61,298.67v-.13c-.77.11-2,.29-2.54.24.9-.21,2.86-.23,3.49-.52.16.01.45-.02.6,0,2.1-.47,4.44-.52,6.63-.92-.95.46-3.25.26-4.34.75-.19,0,0-.03.12-.05-.98.12-2.74.26-3.97.63Z" fill={mainColor} fillRule="evenodd" />
        <path d="m47.93,302.65c-.18.08-.51.14-.71.22-.11,0-.46-.27.71-.22Z" fill={mainColor} fillRule="evenodd" />
        <path d="m289.44,296.4c.54.04,1.14-.05,1.7-.01,1.32.08,2.5.28,3.84.3,1.18,0,2.3-.03,3.53.04.91.06,1.21.04,1.82.05,1.78.05,3.23.25,4.03-.01,1.26-.1,2.84-.08,3.95-.18.17-.02.54.03.61.03,2.82-.25,4.61-.93,7.92-.99.31-.16.53-.42,1.11-.6.26-.08.83-.1,1.02-.19.71-.34.18-.9,1.46-1.09.08-.09-.14-.14-.2-.22.13-.8-.3-1.52.08-2.11-.82-.45-.58-.85-1.21-1.26-.39-.25-1.18-.53-1.69-.79-.58-.29-1.2-.54-1.69-.82.03-.24-.74-.36-.87-.58-.93-.24-1.63-.51-2.57-.75-.08-.09-.31-.16-.32-.26-1.98-.6-3.97-1.31-6.73-1.73-.25-.04-.78-.12-1.09-.14-2.06-.19-5.22-.57-6.27-.99-.37-.06-.37.02-.74-.04-.22-.19-1.29-.53-2.24-.59-.33-.02-.91.15-1.63.15-1.07-.01-2.06-.36-3.02-.37-.44,0-.92.15-1.39.16-1.21.04-3.63-.2-4.63-.33-.79-.1-1.08-.27-1.68-.28-.55,0-.97.14-.93.39-1.59.45-5.58-.23-7.99-.14-1.75-.33-3.45-.02-5.14-.13-.34-.02-.74-.1-1.09-.11-.58-.02-1.35.06-2.1.07-1.27.02-2.39-.03-3.43.01-1.6-.38-2.8-.05-4.15-.11-.51-.02-1-.15-1.57-.16-.48-.02-.95.06-1.47.03-.52-.03-1.07-.15-1.57-.16-.38-.01-.68.04-.98.02-.4-.02-.66-.11-1.09-.11-.45,0-.91.11-1.36.1-1.66-.02-3.45-.18-5.02.05-2.83-.24-5.3.06-8.65-.2-.84.05-1.45.09-2.32.02-.19.02-.19.1-.5.09-1.74-.12-3.58.13-5.37,0-.06.04-.14.07-.25.09-2.48-.2-5.62-.24-7.56-.02-1.51-.15-3.27.05-5.12.07-.87,0-1.74-.07-2.56-.03-1.6.08-3.7.02-5.25.07-.46.02-.9.11-1.35.13-.81.03-1.69-.05-2.56,0-3.35.18-7.19.18-10.12.25-.91.02-1.68.15-2.69.21-1.68.11-3.43-.02-5.11.07-.42.02-.83.1-1.22.12-1.01.06-1.98.02-3.04.06-2.61.08-5.22.32-7.68.29-3.12.35-7.69.47-11.33.66-.81.21-1.59.09-2.44.15-2.6.18-5.92.51-8.65.55-5.72.48-11.56.86-17.38,1.25-5.82.45-11.63.92-17.27,1.49-.89-.07-2.26.1-3.03.27-.17-.07-.69-.02-1.09-.02-1.4.33-3.19.3-4.98.5-.44.25-1.53.18-2.19.39-.3-.09.38-.13-.12-.15-1.13.48-5.05.62-6.8.87.12,0,.15.05,0,.07-.43-.06-.62.15-1.09.18-3.18.33-5.42.92-8.12,1.31-.35-.02-1.27-.1-1.57.07-.49-.02,1.11-.09,1.09.07-.82.02-1.89.2-2.42.37-1.01.11-1.53.07-2.42.27-.22.02.23.14-.24.18-1.42.05-2.12.25-3.39.3-.35.19-1.83.38-2.3.35-.41.11.47.08.12.15-1.14.16-2.2.34-3.27.35-.25.1-.42.21-.85.28-.29.04.07-.15-.36-.06-.4.13.33.12.24.24-.57.11-.45.18-.72.3-.81,0-1.34.23-2.06.36-.74.13-1.58.16-2.3.29-.62.1-.87.24-1.57.32-.57.06-1.06,0-1.69.08-.33.06.24.09-.24.16-2.21.29-4.42.57-6.04.96,2.48-.53,4.34-.47,6.52-.95.35.11.98-.2,1.33-.04.14-.1-.38-.1.12-.14.16,0,.23.02.48-.02-.29.21.17.16.37.25,1.87-.23,3.34-.41,4.95-.61.3-.07-.22-.08.12-.14.61-.09,1.09-.12,1.81-.24.23.11.73.12.48.31-2.19.22-5.13.77-7.73,1.07-.79.1-1.62.06-2.05.31,1.16-.19,2.12-.08,3.14-.16,1.32-.11,2.7-.46,3.99-.55.36-.02.52.02.84-.02.26-.03.68-.17.97-.19.31-.03.34.04.6,0,.55-.07.96-.22,1.57-.28,1.02-.1,2.03-.08,3.14-.24.21.04.13.19-.12.24-1.32.14-1.55.17-2.9.31.15,0,.25.02.24.07-.42.03-.57,0-.85.11,1-.11.94.15.61.3-2.5.21-5.55.64-7.61.76-.22.09-.35.2-.72.26-2.3.34-4.89.55-7.36.9,2.84-.12,5.78-.59,9.05-1,.13.02.04.12.36.06,1.39-.24,3.02-.38,4.1-.52.5.09.98.18,1.45.28,3.43-.47,6-.17,9.29-.46,0,.1.25.1.36.16-.26.1-.42.23-.72.32-.54.06-1.09.16-1.57.14-2.75.54-6.7.77-10.13,1.28-.4.2-.06.29.24.4,1.67-.08,3.16-.46,4.94-.44.67.32.03.65-1.32.81-2.25.27-6.13.63-7.59.73-6.57.94-13.12,1.59-19.84,2.6,3.76-.37,7.19-1.02,10.57-1.24-.02-.07.1-.11.36-.14,3.31-.32,6.98-.77,9.87-1.18,1.24.11,3.56-.41,4.82-.3-.27.4-1.26.67-2.53.89,1.3-.16,2.52-.16,3.61-.25.9-.07,2.43-.34,2.89-.31.11,0-.09.1.12.09-.37.03.65-.09.72-.1.48-.09.39-.11.96-.16.74-.06.73-.06,1.2-.01,2.56-.18,5.04-.53,7.59-.69.27-.02.8-.07.84-.07.24,0,.04.08.36.07.18,0,.09-.08.36-.1,1-.06,2.14-.14,3.13-.24,2.49-.27,5.45-.41,7.48-.59.45-.01-.13.15.48.09,3.51-.21,7.22-.45,10.97-.73.28-.01.07.15.48.09.52-.02.38-.17.85-.19.29.02.56.05.72.12,4.31-.18,8.73-.63,13.16-1,4.13-.36,8.28-.6,12.2-.84,3.09-.2,6.05-.51,8.82-.57,1.85-.16,3.59-.29,5.29-.39,1.7-.08,3.38-.16,5.11-.24,2.51-.12,5.27-.16,7.38-.33.36-.03.79-.12,1.22-.14.64-.03,1.29.05,1.93.03,1.73-.07,3.49-.28,5.21-.35,1.93-.07,3.79-.08,5.68-.12,1.07-.02,2.09-.15,3.15-.19.7-.02,1.44.04,2.17.02,2.04-.06,4.12-.26,6.06-.28,2.59-.02,5.24.02,7.86-.16,2.9.06,6.42.04,9.19-.04,2.25.24,4.59-.05,7.13,0,.27,0,.45.05.72.06,1.92.08,3.96.02,5.9-.03,1.94-.02,3.79-.04,5.35.07,1.17-.15,2.17.04,3.26.1,1.17.06,2.26-.04,3.39-.03.37,0,.71.07,1.08.09,1.14.04,2.26-.05,3.52-.06,1.88,0,3.88.3,6.03.15,1.66.12,4.12.39,6.03.3,3.21.36,6.47.19,9.77.42,1.11.08,2.12.29,3.25.17,1.16.22,2.55.16,3.97.24,1.4.07,2.86.22,4.32.36,2.08.19,4.68.21,6.22.66.67.78,2.11-.21,3.76.04.87.2.74.4,1.1.69.78.16,1.52.14,2.29.13.89.13,1.51.5,2.7.58Zm-211.93-2.69s-.03-.06-.12-.05c.24-.18.84-.01.12.05Zm-.24.09c-1,.12-2.4.41-3.14.37-.2.02.19.17-.12.24-.44-.04-.95-.04-1.69.03-.08-.26,1.41-.25,1.45-.5.57-.04.85-.05,1.09-.2,1.17-.03,1.41-.22,2.3-.22-.22.18.17.1.12.28Z" fill="currentColor" fillRule="evenodd" />
      </g>
    </svg>
  );
};

export default function MyPerksTab({ userTier }) {
  const router = useRouter();
  const [perksLoading, setPerksLoading] = useState(true);
  const [rookieGuideUrl, setRookieGuideUrl] = useState(null);
  const [merchCodes, setMerchCodes] = useState({ pro: '', proPlus: '' });
  const [spaceLinks, setSpaceLinks] = useState({ football: '', baseball: '', basketball: '' });
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => { fetchDynamicPerks(); }, []);

  const fetchDynamicPerks = async () => {
    try {
      const res = await fetch(`https://admin.fsan.com/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `
          query GetDynamicPerks {
            guideByLocation: menuItems(where: {location: ROOKIE_GUIDE}) { nodes { url path uri } }
            guideBySlug: menu(id: "rookie-guide", idType: SLUG) { menuItems { nodes { url path uri } } }
            proMerch: menu(id: "pro-merch-discount", idType: SLUG) { menuItems { nodes { label } } }
            proPlusMerch: menu(id: "pro-plus-merch-discount", idType: SLUG) { menuItems { nodes { label } } }
            spaceFootball: menu(id: "pro-plus-space-football", idType: SLUG) { menuItems { nodes { url } } }
            spaceBaseball: menu(id: "pro-plus-space-baseball", idType: SLUG) { menuItems { nodes { url } } }
            spaceBasketball: menu(id: "pro-plus-space-basketball", idType: SLUG) { menuItems { nodes { url } } }
          }
        `}),
        cache: 'no-store'
      });
      const json = await res.json();
      
      let guideNodes = json?.data?.guideByLocation?.nodes || json?.data?.guideBySlug?.menuItems?.nodes;
      if (guideNodes && guideNodes.length > 0) setRookieGuideUrl(guideNodes[0].url || guideNodes[0].path || guideNodes[0].uri);

      setMerchCodes({ 
        pro: json?.data?.proMerch?.menuItems?.nodes?.[0]?.label || 'PRO10', 
        proPlus: json?.data?.proPlusMerch?.menuItems?.nodes?.[0]?.label || 'PROPLUS20' 
      });

      setSpaceLinks({
        football: json?.data?.spaceFootball?.menuItems?.nodes?.[0]?.url || '',
        baseball: json?.data?.spaceBaseball?.menuItems?.nodes?.[0]?.url || '',
        basketball: json?.data?.spaceBasketball?.menuItems?.nodes?.[0]?.url || ''
      });
    } catch (error) {
      console.warn("Could not fetch perks.");
    } finally {
      setPerksLoading(false);
    }
  };

  const copyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative z-10">
      <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">Your Exclusive Perks</h2>
      
      {userTier === 'free' && (
        <div className="p-[3px] rounded-3xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_10px_40px_rgba(195,11,22,0.15)] mb-10">
          <div className="bg-[#111] rounded-[21px] p-8 md:p-12 text-center flex flex-col items-center justify-center">
            <Lock className="text-red-500 mb-4" size={40} />
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-2">Upgrade to Unlock Perks</h3>
            <p className="text-gray-400 mb-6 font-medium max-w-2xl">Get instant access to the Draft Night Out app, rookie guides, merch discounts, and our exclusive community spaces!</p>
            <Link href="/subscribe" className="px-10 py-4 bg-gradient-to-r from-[#e42d38] to-[#8a1a20] hover:from-[#f03a45] hover:to-[#a3222a] text-white font-black text-lg uppercase tracking-widest rounded-xl transition-transform hover:scale-105 shadow-[0_10px_20px_rgba(228,45,56,0.3)] border border-[#e42d38]/50">
              Upgrade to Pro+
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Guide Card */}
        <div className="bg-gradient-to-br from-[#301012] to-[#111] border border-red-900/50 rounded-2xl p-6 relative overflow-hidden group hover:border-red-700 transition-all shadow-lg flex flex-col h-full">
            <div className="absolute -right-4 -top-4 text-red-500/20 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500"><Book size={120} /></div>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-900/20 text-red-500 border border-red-500/30 rounded-xl flex items-center justify-center shadow-inner shrink-0"><Book size={20} /></div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide leading-tight">Football Rookie Draft Guide</h3>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-6 flex-1 pr-4">Download the official FSAN Rookie Guide to dominate your dynasty rookie drafts with exclusive player grades and tape breakdowns.</p>
                {userTier === 'pro-plus' ? (
                    perksLoading ? (
                        <button disabled className="w-full mt-auto bg-[#1a1a1a] border border-gray-700 text-gray-500 font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-inner"><Loader2 size={16} className="animate-spin" /> Syncing File...</button>
                    ) : rookieGuideUrl ? (
                        <a href={rookieGuideUrl} target="_blank" rel="noopener noreferrer" className="w-full mt-auto bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"><Download size={14} /> Download PDF</a>
                    ) : (
                        <button disabled className="w-full mt-auto bg-[#1a1a1a] border border-gray-700 text-gray-500 font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-inner">Not Available</button>
                    )
                ) : (
                    <button onClick={() => router.push('/subscribe')} className="w-full mt-auto bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 font-bold uppercase tracking-widest py-3 px-6 rounded-xl text-xs relative z-10 shadow-inner transition-colors flex items-center justify-center gap-2"><Lock size={14} /> Pro+ Required</button>
                )}
            </div>
        </div>

        {/* Draft Night Out */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-600 transition-all shadow-lg flex flex-col h-full">
            <div className="absolute -right-4 -top-4 text-gray-700/30 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500"><Ticket size={120} /></div>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-800 text-gray-400 border border-gray-700 rounded-xl flex items-center justify-center shadow-inner shrink-0"><Ticket size={20} /></div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide leading-tight">Draft Night Out</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-1 pr-4">Join us at one of our live locations for the ultimate draft party, or draft remotely from home against other members of the FSAN community.</p>
                {userTier === 'pro-plus' ? (
                    <Link href="/football/draft-night-out" className="w-full mt-auto bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">Submit Your Entry <ChevronRight size={14} /></Link>
                ) : (
                    <button onClick={() => router.push('/subscribe')} className="w-full mt-auto bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 font-bold uppercase tracking-widest py-3 px-6 rounded-xl text-xs relative z-10 shadow-inner transition-colors flex items-center justify-center gap-2"><Lock size={14} /> Pro+ Required</button>
                )}
            </div>
        </div>

        {/* Community */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-600 transition-all shadow-lg flex flex-col h-full">
            <div className="absolute -right-4 -top-4 text-gray-700/30 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500"><PremiumCommunityIcon size={120} monochrome={true} /></div>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-12 h-12 bg-gray-800 text-white border border-gray-700 rounded-xl flex items-center justify-center shadow-inner shrink-0"><PremiumCommunityIcon size={24} monochrome={false} /></div>
                   <h3 className="text-lg font-black text-white uppercase tracking-wide leading-tight">Exclusive Community</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-1 pr-4">
                    {userTier === 'pro' ? <>Get direct access to our analysts and chat with other pro members in our exclusive Sellout Crowds community. <Link href="/subscribe" className="text-white hover:text-gray-300 underline font-bold transition-colors">Upgrade to Pro+</Link> to join our premium Space and get first priority!</> : 'Get direct access to our analysts and chat with other premium members in our exclusive Sellout Crowds community boards.'}
                </p>
                {userTier === 'pro-plus' || userTier === 'pro' ? (
                    <a href="https://www.selloutcrowds.com/crowd/fsan" target="_blank" rel="noopener noreferrer" className="w-full mt-auto bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">Join the Conversation <ChevronRight size={14} /></a>
                ) : (
                    <button onClick={() => router.push('/subscribe')} className="w-full mt-auto bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 font-bold uppercase tracking-widest py-3 px-6 rounded-xl text-xs relative z-10 shadow-inner transition-colors flex items-center justify-center gap-2"><Lock size={14} /> Pro / Pro+ Required</button>
                )}
            </div>
        </div>
        
        {/* Space Access */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-600 transition-all shadow-lg flex flex-col h-full md:col-span-2">
            <div className="absolute -right-4 -top-4 text-gray-700/30 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500"><PremiumCommunityIcon size={120} monochrome={true} /></div>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-12 h-12 bg-gray-800 text-white border border-gray-700 rounded-xl flex items-center justify-center shadow-inner shrink-0"><PremiumCommunityIcon size={24} monochrome={false} /></div>
                   <h3 className="text-lg font-black text-white uppercase tracking-wide leading-tight">Pro+ Space Access</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-1 pr-4 max-w-3xl">Jump into our dedicated sport-specific Spaces. Get first priority answers from our experts, exclusive content, and advanced strategy discussions.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto">
                    {userTier === 'pro-plus' ? (
                        <>
                            <a href={spaceLinks.football || "#"} target={spaceLinks.football ? "_blank" : "_self"} className={`w-full bg-[#1a1a1a] hover:bg-red-900/20 border border-red-500/50 hover:border-red-500 text-red-500 font-bold uppercase tracking-widest text-[10px] py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${!spaceLinks.football && 'opacity-50 cursor-not-allowed'}`}>Football Space <ChevronRight size={14} /></a>
                            <a href={spaceLinks.baseball || "#"} target={spaceLinks.baseball ? "_blank" : "_self"} className={`w-full bg-[#1a1a1a] hover:bg-blue-900/20 border border-blue-500/50 hover:border-blue-500 text-blue-500 font-bold uppercase tracking-widest text-[10px] py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${!spaceLinks.baseball && 'opacity-50 cursor-not-allowed'}`}>Baseball Space <ChevronRight size={14} /></a>
                            <a href={spaceLinks.basketball || "#"} target={spaceLinks.basketball ? "_blank" : "_self"} className={`w-full bg-[#1a1a1a] hover:bg-orange-900/20 border border-orange-500/50 hover:border-orange-500 text-orange-500 font-bold uppercase tracking-widest text-[10px] py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${!spaceLinks.basketball && 'opacity-50 cursor-not-allowed'}`}>Basketball Space <ChevronRight size={14} /></a>
                        </>
                    ) : (
                        <>
                            <button onClick={() => router.push('/subscribe')} className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-[10px] py-3 rounded-xl transition-colors shadow-inner flex items-center justify-center gap-2"><Lock size={12} /> Football (Pro+ Only)</button>
                            <button onClick={() => router.push('/subscribe')} className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-[10px] py-3 rounded-xl transition-colors shadow-inner flex items-center justify-center gap-2"><Lock size={12} /> Baseball (Pro+ Only)</button>
                            <button onClick={() => router.push('/subscribe')} className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-[10px] py-3 rounded-xl transition-colors shadow-inner flex items-center justify-center gap-2"><Lock size={12} /> Basketball (Pro+ Only)</button>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Merch */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl shadow-xl p-6 relative overflow-hidden group transition-all flex flex-col h-full">
          <div className="absolute -right-4 -top-4 transition-transform duration-500 pointer-events-none text-gray-700/30 group-hover:scale-110"><ShoppingCart size={120} /></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 bg-gray-800 text-gray-400 border border-gray-700 rounded-xl flex items-center justify-center shadow-inner shrink-0"><ShoppingCart size={20} /></div>
               <h3 className="text-lg font-black uppercase tracking-wide leading-tight text-white">Merch Shop Discount</h3>
            </div>
            <p className="text-xs leading-relaxed mb-6 flex-1 pr-4 text-gray-400">
                {userTier === 'pro-plus' ? 'Get 20% off all apparel and free shipping in the FSAN shop. Exclusive for Pro+ members.' : userTier === 'pro' ? <>Get 10% off all apparel in the <a href="https://fsan.shop" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 underline transition-colors">FSAN shop</a>. <Link href="/subscribe" className="text-white hover:text-gray-300 underline font-bold transition-colors">Upgrade to Pro+</Link> to add free shipping.</> : 'Get up to 20% off all apparel and free shipping in the FSAN shop. Exclusive for Pro and Pro+ members.'}
            </p>
            {userTier === 'pro-plus' || userTier === 'pro' ? (
                <button onClick={() => copyCode(userTier === 'pro-plus' ? merchCodes.proPlus : merchCodes.pro)} disabled={perksLoading} className="w-full mt-auto bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white font-mono py-3 px-6 rounded-xl text-lg font-bold tracking-widest relative z-10 shadow-sm transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                  {perksLoading ? <span className="flex items-center gap-2 text-sm text-gray-500 font-sans tracking-widest uppercase m-auto"><Loader2 size={16} className="animate-spin" /> Syncing...</span> : <>{userTier === 'pro-plus' ? merchCodes.proPlus : merchCodes.pro} {isCopied ? <CheckCircle2 size={18} className="text-green-500"/> : <Tag size={18} className="text-gray-500"/>}</>}
                </button>
            ) : (
                <button onClick={() => router.push('/subscribe')} className="w-full mt-auto bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 font-bold uppercase tracking-widest py-3 px-6 rounded-xl text-xs relative z-10 shadow-inner transition-colors flex items-center justify-center gap-2"><Lock size={14} /> Pro / Pro+ Required</button>
            )}
          </div>
        </div>

     </div>
    </div>
  );
}