"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Book, Loader2, Download, Ticket, ChevronRight, ShoppingCart, Tag, CheckCircle2 } from 'lucide-react';

const PremiumCommunityIcon = ({ className = "", size = 24, monochrome = false }) => {
  // If monochrome is true, everything uses the inherited text color (allowing opacity/fades).
  // If false, it uses the brand green and solid white.
  const fill1 = monochrome ? "currentColor" : "#9df01c";
  const fill2 = monochrome ? "currentColor" : "#ffffff";
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 362.9 305.6" width={size} height={size} className={className}>
      <g>
        <path fill={fill1} fillRule="evenodd" d="M99.2,298.5c-.2,0-.4,0-.7.1,0,0,.5-.2.7-.1Z"/>
        <path fill={fill1} fillRule="evenodd" d="M87.3,290.6c-.2,0-.9.2-.8,0,.4,0,.6,0,.8,0Z"/>
        <path fill={fill1} fillRule="evenodd" d="M86.1,290.5c0,0-.6,0-.8.1,0,0,.7-.1.8-.1Z"/>
        <path fill={fill1} fillRule="evenodd" d="M82.8,292.1c-.2,0-.6.1-.8.1,0,0,.6,0,.8-.1Z"/>
        <path fill={fill1} fillRule="evenodd" d="M81.1,290.9c-.3.1-.8.2-1.4.2.2-.1.9-.2,1.4-.2Z"/>
        <path fill={fill1} fillRule="evenodd" d="M77.6,298.3c-.7,0-2.2.4-2.8.3.9,0,1.9-.3,2.8-.3Z"/>
        <path fill={fill1} fillRule="evenodd" d="M75.3,295.5c-.9.3-2.6.2-3.7.5-.2-.1,1.7-.2,2.1-.4.3,0,.5,0,.7,0,.3,0,.6-.2,1-.1Z"/>
        <path fill={fill1} fillRule="evenodd" d="M64,296.2c0,0,0,.1-.4.2,0,0-.1,0-.1-.1h.5Z"/>
        <path fill={fill1} fillRule="evenodd" d="M59.4,297.8c-.7.2-2.4.4-3.4.4-.1,0-.1,0-.4.1-.6,0-1.8.2-.6,0,1.5-.3,2.7-.3,4.3-.6h0Z"/>
        <path fill={fill1} fillRule="evenodd" d="M58.7,296.2c-.2,0-.5.1-.8.1,0,0,.7-.2.8-.1Z"/>
        <path fill={fill1} fillRule="evenodd" d="M58,300.6c-.1,0-.8,0-1.1.1.2,0,.8-.2,1.1-.1Z"/>
        <path fill={fill1} fillRule="evenodd" d="M57.8,296.9c-.3.1-1,.2-1.3.3-.3,0,.9-.2,1.3-.3Z"/>
        <path fill={fill1} fillRule="evenodd" d="M57.2,296.5c-.2.1-.9.2-1.5.3.3-.1,1-.2,1.5-.3Z"/>
        <path fill={fill1} fillRule="evenodd" d="M56.9,301.5c0,.1-.5.2-.8.2,0-.1.5-.1.8-.2Z"/>
        <path fill={fill1} fillRule="evenodd" d="M56.3,300.8c-.4.1-1.7.3-2.4.3.8-.2,1.5-.2,2.4-.3Z"/>
        <path fill={fill1} fillRule="evenodd" d="M55.5,296.8c-.6.2-1.5.2-2,.3.6-.1,1.4-.1,2-.3Z"/>
        <path fill={fill1} fillRule="evenodd" d="M54.1,298.5c-.2,0-.6.1-1,.2,0-.1.6-.1,1-.2Z"/>
        <path fill={fill1} fillRule="evenodd" d="M53,298.3c-.3.1-.5.1-1,.1,0,0,.7,0,1-.1Z"/>
        <path fill={fill1} fillRule="evenodd" d="M51.9,298c-.1.1-1,.2-.8,0,.3,0,.2,0,.2,0,.3,0,.3,0,.6-.1h0Z"/>
        <path fill={fill1} fillRule="evenodd" d="M49.7,300.8c.6-.2,1.6-.1,0,0h0Z"/>
        <path fill={fill1} fillRule="evenodd" d="M48.5,302.1c-.5.1-1,.2-1.6.2.4,0,1.3-.2,1.6-.2Z"/>
        <path fill={fill1} fillRule="evenodd" d="M48.2,302.4c.2,0-.8.2-.6,0h.6Z"/>
        <path fill={fill1} fillRule="evenodd" d="M47.2,304.2c-.2,0-.5.1-.8.2,0,0,.7-.2.8-.2Z"/>
        <path fill={fill1} fillRule="evenodd" d="M43.9,304.5c-1,.3-1.3.2,0,0h0Z"/>
        <path fill={fill1} fillRule="evenodd" d="M70.9,301.4c-.2,0-.5.1-.6.2-.4,0-1.1,0-1.6,0,.6-.2,1.3,0,2.2-.3h0Z"/>
        <path fill={fill1} fillRule="evenodd" d="M57.1,300.1c-.3,0-.3,0-.6,0,0,0,.1,0,.1-.1-.6,0-.9.1-1.4.2,0,0,.1,0,.1-.1-.7.2-1.5,0-2.9.3,1.3-.3,4.3-.6,5.5-.8-.2.1-1.2.1-1.3.3,0,.1.7,0,.5.1h0Z"/>
        <path fill={fill1} fillRule="evenodd" d="M55.5,297.2c-.1,0,0,0,0,0,0,0-.5,0-.6,0,.1-.1,1.7-.2.6-.1Z"/>
        <path fill={fill1} fillRule="evenodd" d="M46.6,298.7h0c-.8,0-2,.2-2.5.1.9-.2,2.9-.2,3.5-.5.2,0,.5,0,.6,0,2.1-.5,4.4-.5,6.6-.9-1,.5-3.2.3-4.3.8-.2,0,0,0,.1,0-1,.1-2.7.3-4,.6h0Z"/>
        <path fill={fill1} fillRule="evenodd" d="M47.9,302.6c-.2,0-.5.1-.7.2-.1,0,.5-.3.7-.2Z"/>
        <path fill={fill1} fillRule="evenodd" d="M289.4,296.4c.5,0,1.1,0,1.7,0,1.3,0,2.5.3,3.8.3,1.2,0,2.3,0,3.5,0,.9,0,1.2,0,1.8,0,1.8,0,3.2.2,4,0,1.3-.1,2.8,0,4-.2.2,0,.5,0,.6,0,2.8-.2,4.6-.9,7.9-1,.3-.2.5-.4,1.1-.6.3,0,.8-.1,1-.2.7-.3.2-.9,1.5-1.1,0,0-.1-.1-.2-.2.1-.8-.3-1.5,0-2.1-.8-.5-.6-.9-1.2-1.3-.4-.2-1.2-.5-1.7-.8-.6-.3-1.2-.5-1.7-.8,0-.2-.7-.4-.9-.6-.9-.2-1.6-.5-2.6-.8,0,0-.3-.2-.3-.3-2-.6-4-1.3-6.7-1.7-.2,0-.8-.1-1.1-.1-2.1-.2-5.2-.6-6.3-1-.4,0-.4,0-.7,0-.2-.2-1.3-.5-2.2-.6-.3,0-.9.1-1.6.1-1.1,0-2.1-.4-3-.4-.4,0-.9.1-1.4.2-1.2,0-3.6-.2-4.6-.3-.8-.1-1.1-.3-1.7-.3-.5,0-1,.1-.9.4-1.6.5-5.6-.2-8-.1-1.8-.3-3.5,0-5.1-.1-.3,0-.7-.1-1.1-.1-.6,0-1.4,0-2.1,0-1.3,0-2.4,0-3.4,0-1.6-.4-2.8,0-4.2-.1-.5,0-1-.1-1.6-.2-.5,0-.9,0-1.5,0s-1.1-.1-1.6-.2c-.4,0-.7,0-1,0-.4,0-.7-.1-1.1-.1s-.9.1-1.4.1c-1.7,0-3.4-.2-5,0-2.8-.2-5.3,0-8.6-.2-.8,0-1.4,0-2.3,0-.2,0-.2.1-.5,0-1.7-.1-3.6.1-5.4,0,0,0-.1,0-.2,0-2.5-.2-5.6-.2-7.6,0-1.5-.1-3.3,0-5.1,0-.9,0-1.7,0-2.6,0-1.6,0-3.7,0-5.2,0-.5,0-.9.1-1.4.1-.8,0-1.7,0-2.6,0-3.4.2-7.2.2-10.1.2-.9,0-1.7.1-2.7.2-1.7.1-3.4,0-5.1,0-.4,0-.8.1-1.2.1-1,0-2,0-3,0-2.6,0-5.2.3-7.7.3-3.1.4-7.7.5-11.3.7-.8.2-1.6,0-2.4.1-2.6.2-5.9.5-8.6.5-5.7.5-11.6.9-17.4,1.2-5.8.5-11.6.9-17.3,1.5-.9,0-2.3.1-3,.3-.2,0-.7,0-1.1,0-1.4.3-3.2.3-5,.5-.4.2-1.5.2-2.2.4-.3,0,.4-.1-.1-.1-1.1.5-5.1.6-6.8.9.1,0,.2,0,0,0-.4,0-.6.1-1.1.2-3.2.3-5.4.9-8.1,1.3-.3,0-1.3-.1-1.6,0,.5,0,1.1,0,1.1,0-.8,0-1.9.2-2.4.4-1,.1-1.5,0-2.4.3-.2,0,.2.1-.2.2-1.4,0-2.1.2-3.4.3-.3.2-1.8.4-2.3.4-.4.1.5,0,.1.1-1.1.2-2.2.3-3.3.4-.2.1-.4.2-.8.3-.3,0,0-.1-.4,0-.4.1.3.1.2.2-.6.1-.4.2-.7.3-.8,0-1.3.2-2.1.4-.7.1-1.6.2-2.3.3-.6.1-.9.2-1.6.3-.6,0-1.1,0-1.7,0-.3,0,.2,0-.2.2-2.2.3-4.4.6-6,1,2.5-.5,4.3-.5,6.5-1,.3.1,1-.2,1.3,0,.1-.1-.4-.1.1-.1.2,0,.2,0,.5,0-.3.2.2.2.4.2,1.9-.2,3.3-.4,4.9-.6.3,0-.2,0,.1-.1.6,0,1.1-.1,1.8-.2.2.1.7.1.5.3-2.2.2-5.1.8-7.7,1.1-.8.1-1.6,0-2.1.3,1.2-.2,2.1,0,3.1-.2,1.3-.1,2.7-.5,4-.5.4,0,.5,0,.8,0,.3,0,.7-.2,1-.2.3,0,.3,0,.6,0,.6,0,1-.2,1.6-.3,1-.1,2,0,3.1-.2.2,0,.1.2-.1.2-1.3.1-1.6.2-2.9.3.2,0,.2,0,.2,0-.4,0-.6,0-.8.1,1-.1.9.1.6.3-2.5.2-5.6.6-7.6.8-.2,0-.3.2-.7.3-2.3.3-4.9.5-7.4.9,2.8-.1,5.8-.6,9.1-1,.1,0,0,.1.4,0,1.4-.2,3-.4,4.1-.5.5,0,1,.2,1.4.3,3.4-.5,6-.2,9.3-.5,0,.1.2.1.4.2-.3.1-.4.2-.7.3-.5,0-1.1.2-1.6.1-2.8.5-6.7.8-10.1,1.3-.4.2,0,.3.2.4,1.7,0,3.2-.5,4.9-.4.7.3,0,.6-1.3.8-2.2.3-6.1.6-7.6.7-6.6.9-13.1,1.6-19.8,2.6,3.8-.4,7.2-1,10.6-1.2,0,0,0-.1.4-.1,3.3-.3,7-.8,9.9-1.2,1.2.1,3.6-.4,4.8-.3-.3.4-1.3.7-2.5.9,1.3-.2,2.5-.2,3.6-.2.9,0,2.4-.3,2.9-.3.1,0,0,.1.1,0-.4,0,.7,0,.7-.1.5,0,.4-.1,1-.2.7,0,.7,0,1.2,0,2.6-.2,5-.5,7.6-.7.3,0,.8,0,.8,0,.2,0,0,0,.4,0,.2,0,0,0,.4-.1,1,0,2.1-.1,3.1-.2,2.5-.3,5.4-.4,7.5-.6.5,0-.1.1.5,0,3.5-.2,7.2-.5,11-.7.3,0,0,.1.5,0,.5,0,.4-.2.8-.2.3,0,.6,0,.7.1,4.3-.2,8.7-.6,13.2-1,4.1-.4,8.3-.6,12.2-.8,3.1-.2,6.1-.5,8.8-.6,1.9-.2,3.6-.3,5.3-.4,1.7,0,3.4-.2,5.1-.2,2.5-.1,5.3-.2,7.4-.3.4,0,.8-.1,1.2-.1.6,0,1.3,0,1.9,0,1.7,0,3.5-.3,5.2-.4,1.9,0,3.8,0,5.7-.1,1.1,0,2.1-.1,3.1-.2.7,0,1.4,0,2.2,0,2,0,4.1-.3,6.1-.3,2.6,0,5.2,0,7.9-.2,2.9,0,6.4,0,9.2,0,2.2.2,4.6,0,7.1,0,.3,0,.4,0,.7,0,1.9,0,4,0,5.9,0,1.9,0,3.8,0,5.4,0,1.2-.1,2.2,0,3.3.1,1.2,0,2.3,0,3.4,0,.4,0,.7,0,1.1,0,1.1,0,2.3,0,3.5,0,1.9,0,3.9.3,6,.1,1.7.1,4.1.4,6,.3,3.2.4,6.5.2,9.8.4,1.1,0,2.1.3,3.2.2,1.2.2,2.5.2,4,.2,1.4,0,2.9.2,4.3.4,2.1.2,4.7.2,6.2.7.7.8,2.1-.2,3.8,0,.9.2.7.4,1.1.7.8.2,1.5.1,2.3.1.9.1,1.5.5,2.7.6h0ZM77.5,293.7s0,0-.1,0c.2-.2.8,0,.1,0ZM77.3,293.8c-1,.1-2.4.4-3.1.4-.2,0,.2.2-.1.2-.4,0-.9,0-1.7,0,0-.3,1.4-.2,1.4-.5.6,0,.8,0,1.1-.2,1.2,0,1.4-.2,2.3-.2-.2.2.2.1.1.3h0Z"/>
        <path fill={fill2} d="M148.8,143.2c-9.1-8.9-15-21.5-17.4-34.2-2.7-12.6-4-25.8-3.7-38.7-1.2-30.2,23.9-54.7,54.1-53.1,22.3-1.5,46.4,14.5,52.1,39.4,1.6,7.3,1.3,14.8,1.2,22.3-1.1,21.9-4.1,46.2-19.8,62.8,3.2-5.3,5.7-11.1,7.5-17,4.6-17.9,4.2-36.6,2.8-54.9-.2-2.8-.6-5.8-1.3-8.5-4.3-19.2-23.5-33.4-43.1-31.7-18.1-1.2-36,10.9-41.4,28.4-1.4,3.9-1.9,8.6-2.3,12.8-.6,6.2-.8,12.4-.9,18.6,0,18.6,1.5,38,12.3,53.8h0Z"/>
        <path fill={fill2} d="M100.2,272.5L2.2,43.5c-3-6.9-2.9-14.8,0-21.7,3-6.9,8.7-12.3,15.8-14.9l14.5-5.3c13.8-5,29,1.6,34.7,15.2l43.7,100.5c.8,1.9,1.2,3.9,1.2,6l-8.6,12.9L52.5,23c-2.4-5.7-8.8-8.5-14.5-6.4l-14.5,5.3c-3,1.1-5.4,3.3-6.6,6.2-1.3,2.9-1.3,6.2,0,9.1l82.7,198.4c.8,1.9,1.2,3.9,1.2,6,0,0-.5,30.9-.5,30.9Z"/>
        <path fill={fill2} d="M262.6,272.5l98.1-228.9c3-6.9,2.9-14.8,0-21.7-3-6.9-8.7-12.3-15.8-14.9l-14.5-5.3c-13.8-5-29,1.6-34.7,15.2l-43.7,100.5c-.8,1.9-1.2,3.9-1.2,6l8.6,12.9,51.1-113.3c2.4-5.7,8.8-8.5,14.5-6.4l14.5,5.3c3,1.1,5.4,3.3,6.6,6.2,1.3,2.9,1.3,6.2,0,9.1l-82.7,198.4c-.8,1.9-1.2,3.9-1.1,6l.5,30.9h0Z"/>
        <path fill={fill2} d="M155.4,190.4h-18.9v15.9c0,4.3,3.1,6.5,9.5,6.5s15.1,2.2,20.6,6.6c5.9,4.7,8.8,10.9,8.8,18.6v20.8c0,3.8-1.5,7.1-4.4,9.8-2.9,2.7-6.4,4-10.4,4h-29.4c-4,0-7.5-1.3-10.3-4-2.9-2.7-4.4-6-4.4-9.8v-20.3h20v15.4h18.9v-15.9c0-4.3-3.1-6.5-9.5-6.5s-15.1-2.2-20.6-6.6c-5.9-4.7-8.8-10.9-8.8-18.6v-20.8c0-3.8,1.5-7.1,4.4-9.8,2.9-2.7,6.3-4,10.3-4h29.4c4,0,7.5,1.3,10.4,4,2.9,2.7,4.4,5.9,4.4,9.8v20.2h-20v-15.4h0Z"/>
        <path fill={fill2} d="M226.4,190.4h-18.9v63.4h18.9v-15.4h20v20.3c0,3.8-1.5,7.1-4.4,9.8-2.9,2.7-6.4,4-10.4,4h-29.4c-4,0-7.5-1.3-10.4-4-2.9-2.7-4.4-6-4.4-9.8v-73.2c0-3.8,1.5-7.1,4.4-9.8,2.9-2.7,6.4-4,10.4-4h29.4c4,0,7.5,1.3,10.4,4,2.9,2.7,4.4,5.9,4.4,9.8v20.2h-20v-15.4h0Z"/>
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
                <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-1 pr-4">Join an online league and compete to win your league, enter the playoff challenge, and win the grand prize!</p>
                {userTier === 'pro-plus' ? (
                    <Link href="https://draftnightout.com" target="_blank" className="w-full mt-auto bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">JOIN A LEAGUE <ChevronRight size={14} /></Link>
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