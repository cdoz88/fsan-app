"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Ticket, ShieldCheck, Share2, Trophy, ExternalLink, Loader2, Link2, CheckCircle2, Gift, Edit3, X, ArrowLeft, ShoppingCart, Plus, Minus, HeartHandshake, Book, Download, Lock } from 'lucide-react';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

import DNOHeader from '../../../components/dno/DNOHeader';
import GraphicTab from '../../../components/dno/tabs/GraphicTab';

// --- AWARD SVGS ---
const WeeklyScorerSVG = () => (
  <svg viewBox="0 0 100 100" className="w-5 h-5 shrink-0 drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
    <linearGradient id="grad1" gradientUnits="userSpaceOnUse" x1="50" x2="50" y1="38.457" y2="98.241"><stop offset="0" stopColor="#27d7ff"/><stop offset=".044" stopColor="#29d2ff"/><stop offset=".437" stopColor="#3db3ff"/><stop offset=".769" stopColor="#49a0ff"/><stop offset="1" stopColor="#4e9aff"/></linearGradient>
    <linearGradient id="grad2" x1="50" x2="50" href="#grad1" y1=".76" y2="43.088"/>
    <path d="m50 38.457c-16.482 0-29.892 13.409-29.892 29.892s13.41 29.893 29.892 29.893 29.893-13.41 29.893-29.893-13.41-29.892-29.893-29.892zm17.707 29.892c0 9.764-7.943 17.707-17.707 17.707s-17.707-7.943-17.707-17.707 7.943-17.706 17.707-17.706 17.707 7.943 17.707 17.706zm-11.057 6.827v2.333c0 .442-.358.8-.8.8h-11.237c-.442 0-.8-.358-.8-.8v-2.333c0-.442.358-.8.8-.8h2.715c.442 0 .8-.358-.8-.8v-9.954c0-.442-.358-.8-.8-.8h-2.142c-.442 0-.8-.358-.8-.8v-1.551c0-.38.273-.703.645-.783 1.74-.375 2.979-.864 4.194-1.587.122-.073.262-.113.404-.113h2.561c.442 0 .8.358.8.8v14.788c0 .442.358.8.8.8h2.06c.442 0 .8.358.8.8z" fill="url(#grad1)"/>
    <path d="m59.73 20.01h-19.459c-3.503-5.383-12.524-19.25-12.524-19.25h44.507s-9.726 14.949-12.524 19.25zm-12.009 16.036c-6.659-10.235-22.513-34.605-22.513-34.605-.247-.379-.651-.626-1.101-.674-.455-.045-.897.111-1.217.432l-11.491 11.49c-.501.501-.583 1.284-.197 1.879 3.301 5.074 10.932 16.803 18.555 28.52 4.994-4.01 11.194-6.568 17.963-7.042zm29.389-34.847c-.319-.32-.766-.473-1.217-.432-.45.048-.854.295-1.101.674 0 0-16.617 25.541-22.513 34.605 6.769.473 12.97 3.032 17.963 7.042 7.584-11.657 15.178-23.329 18.555-28.519.387-.595.305-1.378-.197-1.879z" fill="url(#grad2)"/>
  </svg>
);
const LitchSVG = () => (
  <svg viewBox="0 0 512 512" className="w-5 h-5 shrink-0 drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="litchGrad"><stop stopOpacity="1" stopColor="#b89905" offset="0.02"/><stop stopOpacity="1" stopColor="#e6d604" offset="1"/></linearGradient></defs>
    <path d="m434.6 30.2h-76.4c-6.9 50.2-50.1 89.1-102.2 89.1s-95.3-38.8-102.2-89.1h-76.4c-26 0-47.2 21.2-47.2 47.2v115h51.7v-49.4c0-7.8 6.3-14.1 14.1-14.1s14.1 6.3 14.1 14.1v338.8h291.7v-338.8c0-7.8 6.3-14.1 14.1-14.1s14.1 6.3 14.1 14.1v49.4h51.7v-115c.1-26-21.1-47.2-47.1-47.2z" fill="url(#litchGrad)"/>
    <path d="m434.6 2h-89.5c-7.8 0-14.1 6.3-14.1 14.1 0 41.3-33.6 75-75 75-41.3 0-75-33.6-75-75 0-7.8-6.3-14.1-14.1-14.1h-89.5c-41.6 0-75.4 33.8-75.4 75.4v129.1c0 7.8 6.3 14.1 14.1 14.1h65.8v275.3c0 7.8 6.3 14.1 14.1 14.1h319.9c7.8 0 14.1-6.3 14.1-14.1v-275.3h65.8c7.8 0 14.1-6.3 14.1-14.1v-129.1c.1-41.6-33.7-75.4-75.3-75.4zm47.2 190.4h-51.7v-49.4c0-7.8-6.3-14.1-14.1-14.1s-14.1 6.3-14.1 14.1v338.8h-291.7v-338.8c0-7.8-6.3-14.1-14.1-14.1s-14.1 6.3-14.1 14.1v49.4h-51.8v-115c0-26 21.2-47.2 47.2-47.2h76.4c6.9 50.2 50.1 89.1 102.2 89.1s95.3-38.8 102.2-89.1h76.4c26 0 47.2 21.2 47.2 47.2z" fill="#000000"/>
    <g fill="#194f82"><path d="m216.3 218c5.5 5.5 4.6 12.8-.6 21.3-6.5 9.2-27.6 29.1-47.7 50.5v18.8h80.1v-22.7h-44.8c15.4-16 30.1-30.1 37-41.8 7.9-15.8 5.2-32.2-6.7-42.2-19.8-17.3-53.4-10.5-67.5 15.7l20.3 12c5.9-10.2 18.9-21.6 29.9-11.6z" fill="#000000"/><path d="m278.2 274.3-13.3 18.5c23.9 28.5 80.1 21.1 81.1-21.7 0-26.6-25.5-41.3-51.7-35.2v-19h44.8v-21.9h-68.6v55.4l10.6 11.4c21.6-11.8 39.6-5.1 39.5 9.7-.3 16.9-21.6 22.7-42.4 2.8z" fill="#000000"/><path d="m339.1 349.1h-166.3c-7.8 0-14.1 6.3-14.1 14.1s6.3 14.1 14.1 14.1h166.3c7.8 0 14.1-6.3 14.1-14.1.1-7.8-6.3-14.1-14.1-14.1z" fill="#000000"/><path d="m339.1 405.5h-166.3c-7.8 0-14.1 6.3-14.1 14.1s6.3 14.1 14.1 14.1h166.3c7.8 0 14.1-6.3 14.1-14.1.1-7.8-6.3-14.1-14.1-14.1z" fill="#000000"/></g>
  </svg>
);
const Club200SVG = () => (
  <svg viewBox="0 0 4183.08 3651.57" className="w-5 h-5 shrink-0 drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
    <path d="m1185.2,2637.54c-20.07,22.98-1022.68,270.18-1074.5,246.53s-97.39-94.54-104.6-154.26c-11.07-26.04-3.69-85.66-3.69-85.66,23.68-48.92,44.28-87.41,61.82-115.41,3.47-5.04,57.86-94.71,163.19-268.99,71.7-119.89,136.79-218.48,195.25-295.72,24.96-38.98,66.46-116.78,124.54-233.43,80.65-197.01,132.39-329.89,155.23-398.61,44.07-133.99,71.52-262.29,82.32-384.9,5.55-63.08,2.59-105.42-8.85-127.02-11.44-21.6-38.24-35.12-80.38-40.63,0,0-93.63,12.05-129.38,61.11s-285.69,311.06-310.93,311.07-77.96-52.76-91.88-105.02c-25.18-73.94,26.77-167.96,27.24-173.3,25.23-27.32,53.12-62.91,83.68-106.77,49.59-54.73,101.66-108.33,156.24-160.81,83.21-79.51,146.25-130.38,189.11-152.57,36.12-19.18,82.61-26.28,139.44-21.28,51.27,4.51,99.59,40.12,144.97,106.75,54.53,80,78.71,172.1,72.56,276.31,1.48,46.72,2.95,71.45,4.44,74.26.49-.83.83-2.13.99-3.92l-8.91,101.26c-1.53,12.43-4.24,30.98-8.13,55.7-3.94,20.24-8,44.52-12.21,72.79-20.76,157.53-70.09,341.19-147.97,550.99-15.23,40.77-63.89,158.25-145.99,352.43-35.97,51.45-126.53,246.25-147.53,289.16-31.64,46.48-70.11,109.34-115.42,188.61l9.32,11.55,490.85-95.1s153.05,3.95,221.33,61.09c33.96,28.43,66.45,49.73,79.01,92.92-1.17,13.33,8.9,47.93-11.17,70.91Z" style={{fill:"#e00511"}}/>
    <path d="m1661.57,2589.62c310.82,50.68,555.49-198.56,676.61-458.09,79.93-175.31,140.06-358.93,183.43-546.74,73.14-330.32,102.07-679.13-6.47-1008.5-73.65-189.64-346.56-91.44-283.51,101.09,147.18,449.47,52.24,1017.33-170.28,1428.28-41.23,76.15-90.11,150.7-159.8,202.09-103.26,76.13-247.86,77.72-349.98-1.44-84.86-65.87-136.97-165.43-160.55-269.47-21.09-89.1-25.51-186.58-23.15-287.03,7.12-265.97,41.59-529.63,141.31-774.79,124.01-304.54,363.94-585.63,692.34-668.92,58.74-14.52,41.94-99.47-17.87-90.37,0,0-40.73,7.76-40.73,7.76-27.68,4.19-63.65,15.9-90.64,23.07-22.26,8.46-46.46,15.89-68.38,25.14-102.37,42.34-197.06,104.01-280.77,176.15-283.13,245.75-430.45,609.62-489.88,972.48-38.61,268.44-81.66,572.51,32.17,831.19,75.6,169.33,227.75,311.78,416.14,338.1Z" style={{fill:"#e00511"}}/>
    <path d="m3257.87,2374.59c310.82,50.68,555.49-198.56,676.61-458.09,79.93-175.31,140.06-358.93,183.43-546.74,73.14-330.32,102.07-679.13-6.47-1008.5-73.65-189.64-346.56-91.44-283.51,101.09,147.18,449.47,52.24,1017.33-170.28,1428.28-41.23,76.15-90.11,150.7-159.8,202.09-103.26,76.13-247.86,77.72-349.98-1.44-84.86-65.87-136.97-165.43-160.55-269.47-21.09-89.1-25.51-186.58-23.15-287.03,7.12-265.97,41.59-529.63,141.31-774.79,124.01-304.54,363.94-585.63,692.34-668.92,58.74-14.52,41.94-99.47-17.87-90.37,0,0-40.73,7.76-40.73,7.76-27.68,4.19-63.65,15.9-90.64,23.07-22.26,8.46-46.46,15.89-68.38,25.14-102.37,42.34-197.06,104.01-280.77,176.15-283.13,245.75-430.45,609.62-489.88,972.48-38.61,268.44-81.66,572.51,32.17,831.19,75.6,169.33,227.75,311.78,416.14,338.1Z" style={{fill:"#e00511"}}/>
    <path d="m2275.73,2797.71c-489.76,46.4-964.56,123.96-1466.41,272.78-41.45,12.43-66.62,50.42-57.29,89.52,10.19,42.72,57.67,70.65,106.05,62.39,0,0,340.17-58.1,340.17-58.1,339.32-57.22,680.38-107.5,1023.18-147.14,169.38-19.43,345.25-37.18,515.59-50.73,287.32-24.03,576.23-38.67,865.35-50.63,40.99-1.57,74.56-30.04,76.88-66.97,2.51-39.78-32.15-74.35-77.4-77.22-441.56-27.13-887.21-14.66-1326.12,26.1Z" style={{fill:"#e00511"}}/>
    <path d="m4141.71,3103.05c-601.42-44.65-1206.83-3.61-1805,60.73-599.22,65.62-1197.37,170.71-1768.92,366.37-70.48,26.84-44.92,128.49,28.24,121.03,148.96-18.11,296.56-40.13,444.11-61.54,425.46-62.72,901.39-132.51,1325.74-189.04,591.76-80.42,1181.76-154.97,1776.6-213.33,19.94-1.96,36.27-17.94,37.96-38.62,1.91-23.29-15.45-43.71-38.73-45.59Z" style={{fill:"#e00511"}}/>
  </svg>
);

function DashboardContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get('tab') || 'my-leagues';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [ticketCount, setTicketCount] = useState(0);
  const [userJoinedCount, setUserJoinedCount] = useState(0);
  const [myLeagues, setMyLeagues] = useState([]);
  const [liveLeaderboard, setLiveLeaderboard] = useState({ teams: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLeagues, setLoadingLeagues] = useState(false);

  // Determine if they've ever purchased/received a ticket
  const hasPurchasedTicket = ticketCount > 0 || userJoinedCount > 0;

  // Perks State
  const [rookieGuideUrl, setRookieGuideUrl] = useState(null);
  const [guideLoading, setGuideLoading] = useState(true);

  // Stats Modal State
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Purchasing State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [donationAmount, setDonationAmount] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dedicated DNO Sleeper Sync State
  const [sleeperInput, setSleeperInput] = useState('');
  const [livePreviewUser, setLivePreviewUser] = useState(null); 
  const [syncedSleeperUser, setSyncedSleeperUser] = useState(null); 
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [isEditingSync, setIsEditingSync] = useState(false);

  const getDnoStorageKey = (userId) => `dno_dedicated_sleeper_${userId}`;

  // Fetch the Rookie Draft Guide PDF URL from GraphQL
  const fetchRookieGuide = useCallback(async () => {
    setGuideLoading(true);
    try {
      const res = await fetch(`https://admin.fsan.com/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `
          query GetRookieGuide {
            guideByLocation: menuItems(where: {location: ROOKIE_GUIDE}) { nodes { url path uri } }
            guideBySlug: menu(id: "rookie-guide", idType: SLUG) { menuItems { nodes { url path uri } } }
          }
        `}),
        cache: 'no-store'
      });
      const json = await res.json();
      let guideNodes = json?.data?.guideByLocation?.nodes || json?.data?.guideBySlug?.menuItems?.nodes;
      if (guideNodes && guideNodes.length > 0) {
        setRookieGuideUrl(guideNodes[0].url || guideNodes[0].path || guideNodes[0].uri);
      }
    } catch (err) {
      console.warn("Could not fetch Rookie Draft Guide URL:", err);
    } finally {
      setGuideLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRookieGuide();
  }, [fetchRookieGuide]);

  useEffect(() => {
    if (session?.user?.id) {
      const cached = localStorage.getItem(getDnoStorageKey(session.user.id));
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.sleeper_id || parsed.sleeper_username)) {
            setSyncedSleeperUser(parsed);
            setSleeperInput(parsed.sleeper_username || parsed.displayName || '');
          }
        } catch (e) {
          console.warn("Failed reading cached DNO Sleeper user:", e);
        }
      }
    }
  }, [session]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tabId);
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  const hydrateSleeperUser = async (identifier) => {
    try {
      const slpRes = await fetch(`https://api.sleeper.app/v1/user/${identifier}`);
      if (slpRes.ok) {
        const slpData = await slpRes.json();
        const userObj = {
          sleeper_id: slpData.user_id,
          sleeper_username: slpData.username || slpData.display_name,
          displayName: slpData.display_name,
          avatar: slpData.avatar
        };
        setSyncedSleeperUser(userObj);
        setSleeperInput(userObj.sleeper_username);
        if (session?.user?.id) {
          localStorage.setItem(getDnoStorageKey(session.user.id), JSON.stringify(userObj));
        }
        return userObj;
      }
    } catch (e) {
      console.warn("Could not hydrate Sleeper details:", e);
    }
    return null;
  };

  const fetchMyDnoLeagues = useCallback(async (targetUser) => {
    const sleeperIdentifier = targetUser?.sleeper_id || targetUser?.user_id || targetUser?.sleeper_username;
    if (!sleeperIdentifier) {
      setMyLeagues([]);
      return;
    }

    setLoadingLeagues(true);
    try {
      let userId = targetUser?.sleeper_id || targetUser?.user_id;
      if (!userId) {
        const uRes = await fetch(`https://api.sleeper.app/v1/user/${sleeperIdentifier}`);
        if (uRes.ok) {
          const uData = await uRes.json();
          userId = uData.user_id;
        }
      }

      if (!userId) {
        setMyLeagues([]);
        setLoadingLeagues(false);
        return;
      }

      const pRes = await fetch(`/api/scl?type=dno_pool&t=${Date.now()}`);
      let validDnoLeagueIds = new Set();
      let poolMap = {};
      if (pRes.ok) {
        const pData = await pRes.json();
        (pData.leagues || []).forEach(l => {
          validDnoLeagueIds.add(String(l.id));
          poolMap[String(l.id)] = l;
        });
      }

      const slpLeaguesRes = await fetch(`https://api.sleeper.app/v1/user/${userId}/leagues/nfl/2026`);
      if (!slpLeaguesRes.ok) {
        setMyLeagues([]);
        setLoadingLeagues(false);
        return;
      }
      const slpLeagues = await slpLeaguesRes.json();

      const matchedDnoLeagues = slpLeagues.filter(l => {
        const inPool = validDnoLeagueIds.has(String(l.league_id));
        const hasDnoName = l.name && (l.name.toUpperCase().includes('DNO') || l.name.toUpperCase().includes('DRAFT NIGHT OUT'));
        return inPool || hasDnoName;
      }).map(l => {
        const poolMatch = poolMap[String(l.league_id)];
        return {
          id: l.league_id,
          sleeper_id: l.league_id,
          name: l.name,
          total_spots: l.total_rosters || poolMatch?.total_spots || 12,
          filled_spots: poolMatch?.filled_spots || l.total_rosters || 12,
          avatar: l.avatar
        };
      });

      setMyLeagues(matchedDnoLeagues);
    } catch (err) {
      console.warn("Failed fetching My Leagues from Sleeper:", err);
      setMyLeagues([]);
    } finally {
      setLoadingLeagues(false);
    }
  }, []);

  const loadAccountData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      let dnoSleeperId = null;

      try {
        const uRes = await fetch(`/api/scl?action=dno_get_user_data&user_id=${session.user.id}&t=${Date.now()}`);
        if (uRes.ok) {
          const uDataRaw = await uRes.json();
          const uData = uDataRaw.data || uDataRaw;
          dnoSleeperId = uData.dno_sleeper_id || uData.dno_sleeper_user_id || uData.sleeper_id || null;
          
          if (dnoSleeperId && !syncedSleeperUser) {
            await hydrateSleeperUser(dnoSleeperId);
          }
        }
      } catch (e) {
        console.warn("DNO User data fetch warning", e);
      }

      try {
        const poolRes = await fetch(`/api/scl?type=dno_pool&user_id=${session.user.id}&t=${Date.now()}`, { cache: 'no-store' });
        if (poolRes.ok) {
          const poolData = await poolRes.json();
          const allotted = poolData.allotted_entries !== undefined ? poolData.allotted_entries : 0;
          const joined = poolData.user_joined_count || 0;
          setTicketCount(Math.max(0, allotted - joined));
          setUserJoinedCount(joined);
        }
      } catch (e) {
        console.warn("DNO Ticket fetch warning", e);
      }

      try {
        const lbRes = await fetch(`/api/scl?action=dno_get_leaderboard_data&t=${Date.now()}`);
        const lbJson = await lbRes.json();
        if (lbJson.success && lbJson.data) {
          setLiveLeaderboard(lbJson.data);
        }
      } catch (e) {
        console.warn("Failed to load global leaderboard data:", e);
      }

    } catch (err) {
      console.error("Failed loading account data", err);
    } finally {
      setIsLoading(false);
    }
  }, [session, syncedSleeperUser]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadAccountData();
    } else if (status === 'unauthenticated') {
      window.location.href = '/dno'; 
    }
  }, [status, loadAccountData]);

  useEffect(() => {
    if (syncedSleeperUser) {
      fetchMyDnoLeagues(syncedSleeperUser);
    } else {
      setMyLeagues([]);
    }
  }, [syncedSleeperUser, fetchMyDnoLeagues]);

  useEffect(() => {
    if (!sleeperInput || sleeperInput.trim().length < 3 || (syncedSleeperUser && !isEditingSync)) {
      setLivePreviewUser(null);
      setSyncError('');
      return;
    }

    setIsSearching(true);
    setSyncError('');

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.sleeper.app/v1/user/${sleeperInput.trim()}`);
        if (!res.ok) throw new Error("Sleeper account not found");
        const data = await res.json();
        
        if (!data || !data.user_id) throw new Error("Sleeper account not found");

        setLivePreviewUser({
          user_id: data.user_id,
          username: data.username || data.display_name,
          displayName: data.display_name,
          avatar: data.avatar
        });
      } catch (err) {
        setLivePreviewUser(null);
        setSyncError("Username not found on Sleeper");
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [sleeperInput, syncedSleeperUser, isEditingSync]);

  const handleConfirmSync = async (userToSync) => {
    if (!userToSync || !session?.user?.id) return;
    setIsSaving(true);
    setSyncError('');

    const sleeperIdToSave = userToSync.user_id || userToSync.sleeper_id;
    const sleeperUsernameToSave = userToSync.username || userToSync.sleeper_username;

    try {
      const saveRes = await fetch('/api/scl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dno_update_sleeper',
          user_id: session.user.id,
          dno_sleeper_id: sleeperIdToSave,
          dno_sleeper_username: sleeperUsernameToSave
        })
      });

      if (!saveRes.ok) throw new Error("Failed saving DNO Sleeper connection");

      const finalUser = {
        sleeper_id: sleeperIdToSave,
        sleeper_username: sleeperUsernameToSave,
        displayName: userToSync.displayName || userToSync.display_name,
        avatar: userToSync.avatar
      };

      setSyncedSleeperUser(finalUser);
      localStorage.setItem(getDnoStorageKey(session.user.id), JSON.stringify(finalUser));
      setLivePreviewUser(null);
      setIsEditingSync(false);

      fetchMyDnoLeagues(finalUser);
    } catch (err) {
      console.warn("Server save warning, applying locally:", err);
      const finalUser = {
        sleeper_id: sleeperIdToSave,
        sleeper_username: sleeperUsernameToSave,
        displayName: userToSync.displayName || userToSync.display_name,
        avatar: userToSync.avatar
      };
      setSyncedSleeperUser(finalUser);
      localStorage.setItem(getDnoStorageKey(session.user.id), JSON.stringify(finalUser));
      setIsEditingSync(false);
      fetchMyDnoLeagues(finalUser);
    } finally {
      setIsSaving(false);
    }
  };

  const executeStripeCheckout = async () => {
    setIsProcessing(true);
    try {
      const isFirstTicket = ticketCount <= 0 && userJoinedCount === 0;
      const purchaseType = isFirstTicket ? 'dno_bundle' : 'dno_extra_ticket';

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: purchaseType,
          quantity: purchaseQuantity,
          donationAmount: donationAmount,
          isAnonymous: isAnonymous,
          userId: session.user.id,
          email: session.user.email,
          returnUrl: `${window.location.origin}/dno/dashboard`
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      alert("Unable to initiate checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleViewStats = async (team) => {
    setSelectedTeam(team);
    setModalLoading(true);
    setModalData(null);
    try {
      const res = await fetch(`/api/scl?action=dno_get_user_details&user_id=${team.ownerId}&league_id=${team.leagueId}&t=${Date.now()}`);
      const json = await res.json();
      if (json.success) setModalData(json.data);
    } catch (err) {
      console.error('Manager lookup failed', err);
    } finally {
      setModalLoading(false);
    }
  };

  const getBadges = (team) => {
    let badges = [];
    if (!team || !team.badges) return badges;
    if (team.badges.litchAward) badges.push({ icon: <LitchSVG />, count: team.badges.litchAward });
    if (team.badges.weeklyTopScorer) badges.push({ icon: <WeeklyScorerSVG />, count: team.badges.weeklyTopScorer });
    if (team.badges.twoHundredClub) badges.push({ icon: <Club200SVG />, count: team.badges.twoHundredClub });
    return badges;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1b75bb] animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-28 pb-24 z-10 relative">
      
      <Link 
        href="/dno" 
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors mb-4 group"
      >
        <ArrowLeft size={16} className="text-[#1b75bb] group-hover:-translate-x-1 transition-transform" />
        <span>Back to Draft Lobby</span>
      </Link>

      {/* Dedicated Ticket Purchase Modal with Charity Options */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
           <div className="bg-[#151515] p-8 rounded-3xl border border-gray-800 text-center text-white shadow-2xl w-full max-w-md relative overflow-hidden my-auto">
              <button 
                onClick={() => { setShowPurchaseModal(false); setPurchaseQuantity(1); setDonationAmount(0); setIsAnonymous(false); }} 
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2"
                disabled={isProcessing}
              >
                 <X size={20} />
              </button>
              
              <div className="mx-auto w-12 h-12 bg-[#1b75bb]/20 text-[#1b75bb] rounded-full flex items-center justify-center mb-4">
                 <ShoppingCart size={24} />
              </div>

              <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">Get Draft Tickets</h3>
              
              <div className="flex flex-col gap-3 mt-4">
                <div className="bg-[#111] border border-[#1b75bb]/30 p-4 rounded-xl text-left mb-2 shadow-inner">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <strong className="text-white block mb-1">Standard Entry</strong> 
                    Each ticket is $22 ($2 goes directly to charity).
                  </p>
                  {ticketCount <= 0 && userJoinedCount === 0 && (
                    <p className="text-xs text-[#f5a623] font-bold mt-3 bg-[#f5a623]/10 p-2 rounded-lg inline-block border border-[#f5a623]/20">
                      🎁 First-time buyers get a free 1-month trial of FSAN Pro+ automatically applied at checkout!
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Quantity:</span>
                    <div className="flex items-center gap-3 bg-[#181818] border border-gray-700 rounded-xl px-3 py-1.5">
                      <button 
                        onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                        disabled={isProcessing}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-black text-white text-base min-w-[20px] text-center">{purchaseQuantity}</span>
                      <button 
                        onClick={() => setPurchaseQuantity(Math.min(25, purchaseQuantity + 1))}
                        disabled={isProcessing}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-800 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
                      <HeartHandshake size={14} className="text-[#f5a623]" /> Optional Charity Donation:
                    </span>
                    <div className="flex gap-2 mb-3">
                      {[0, 5, 10, 25].map(amt => (
                        <button 
                          key={amt} 
                          onClick={() => setDonationAmount(amt)}
                          disabled={isProcessing}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors border ${donationAmount === amt ? 'bg-gradient-to-r from-teal-400 to-[#1b75bb] border-transparent text-white' : 'bg-[#181818] border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
                        >
                          {amt === 0 ? 'None' : `+$${amt}`}
                        </button>
                      ))}
                    </div>
                    {donationAmount > 0 && (
                      <label className="flex items-center gap-2 cursor-pointer mt-1 group">
                        <input 
                          type="checkbox" 
                          checked={isAnonymous} 
                          onChange={(e) => setIsAnonymous(e.target.checked)} 
                          className="rounded border-gray-700 bg-[#181818] text-[#1b75bb] focus:ring-[#1b75bb] focus:ring-offset-gray-900"
                        />
                        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors">Keep my donation anonymous on the Wall of Fame</span>
                      </label>
                    )}
                  </div>

                </div>

                <button 
                  onClick={executeStripeCheckout}
                  disabled={isProcessing}
                  className="w-full relative group p-[2px] rounded-xl bg-gradient-to-r from-[#f5a623] to-[#c30b16] shadow-[0_0_15px_rgba(245,166,35,0.2)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-3.5 flex items-center justify-center w-full text-white font-black uppercase tracking-widest text-xs">
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Checkout ($${(22 * purchaseQuantity) + donationAmount})`}
                  </div>
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Global Leaderboard Stats Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="absolute inset-0" onClick={() => setSelectedTeam(null)}></div>
           <div className="relative bg-[#1a1a1a] border border-gray-700 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col animate-in fade-in duration-200 overflow-hidden">
              <button onClick={() => setSelectedTeam(null)} className="absolute top-4 right-4 p-2 bg-gray-900 rounded-full text-gray-400 z-10 hover:text-white"><X size={20} /></button>
              <div className="p-6 border-b border-gray-800 bg-[#111] flex items-center gap-6">
                <img src={selectedTeam.ownerAvatar} className="w-16 h-16 rounded-full border-2 border-gray-600 shadow-xl" alt="" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white italic">{selectedTeam.ownerUsername}</h2>
                  <span className="text-xs font-bold text-gray-500 uppercase">{selectedTeam.leagueName}</span>
                </div>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-hide">
                 {modalLoading ? ( 
                   <div className="flex flex-col items-center justify-center py-20">
                     <Loader2 size={40} className="animate-spin text-gray-600 mb-4" />
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Compiling Stats...</span>
                   </div>
                 ) : modalData ? (
                    <div className="flex flex-col gap-8">
                       <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
                            <span className="text-[10px] font-black uppercase text-gray-500 mb-1">Rank</span>
                            <span className="text-xl font-black text-white">{selectedTeam.rank}</span>
                          </div>
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
                            <span className="text-[10px] font-black uppercase text-gray-500 mb-1">Points</span>
                            <span className="text-xl font-black text-white">{parseFloat(selectedTeam.totalPoints).toFixed(2)}</span>
                          </div>
                          
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
                             <span className="text-[10px] font-black uppercase text-gray-500 mb-2">Awards</span>
                             <div className="flex gap-4 items-center justify-center">
                               {getBadges(selectedTeam).length > 0 ? getBadges(selectedTeam).map((b, i) => (
                                 <div key={i} className="flex items-center gap-1.5">
                                   {b.icon}
                                   {b.count && <span className="text-white font-bold text-sm">{b.count}</span>}
                                 </div>
                               )) : <span className="text-gray-700 font-bold">-</span>}
                             </div>
                          </div>

                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
                            <span className="text-[10px] font-black uppercase text-gray-500 mb-1">H2H Wins</span>
                            <span className="text-xl font-black text-white">{Object.values(modalData.weekly_results).filter(w => w.h2h === 'W').length}</span>
                          </div>
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
                            <span className="text-[10px] font-black uppercase text-gray-500 mb-1">Med Wins</span>
                            <span className="text-xl font-black text-white">{Object.values(modalData.weekly_results).filter(w => w.median === 'W').length}</span>
                          </div>
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
                            <span className="text-[10px] font-black uppercase text-gray-500 mb-1">Total Wins</span>
                            <span className="text-xl font-black text-white">{Object.values(modalData.weekly_results).filter(w => w.h2h === 'W').length + Object.values(modalData.weekly_results).filter(w => w.median === 'W').length}</span>
                          </div>
                       </div>
                       
                       <div className="w-full h-[300px] bg-[#111] border border-gray-800 rounded-2xl p-4 shadow-inner">
                         <Line 
                           data={{ 
                             labels: Array.from({length: 17}, (_, i) => `Wk ${i + 1}`), 
                             datasets: [
                               { label: 'Points', data: Array.from({length: 17}, (_, i) => modalData.weekly_results[i+1]?.points || null), borderColor: '#48bb78', backgroundColor: 'rgba(72, 187, 120, 0.1)', yAxisID: 'yPoints', fill: true, tension: 0.4 }, 
                               { label: 'Rank', data: Array.from({length: 17}, (_, i) => modalData.weekly_results[i+1]?.rank || null), borderColor: '#27d7ff', backgroundColor: 'rgba(39, 215, 255, 0.1)', yAxisID: 'yRank', fill: true, tension: 0.4 }
                             ] 
                           }} 
                           options={{ 
                             responsive: true, 
                             maintainAspectRatio: false, 
                             scales: { 
                               yPoints: { type: 'linear', position: 'left', grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a0aec0' } }, 
                               yRank: { type: 'linear', position: 'right', reverse: true, min: 1, max: liveLeaderboard?.teams?.length || 100, grid: { drawOnChartArea: false }, ticks: { color: '#a0aec0' } }, 
                               x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a0aec0' } } 
                             }, 
                             plugins: { legend: { labels: { color: '#e2e8f0', usePointStyle: true, boxWidth: 8 } } } 
                           }} 
                         />
                       </div>

                       <div className="w-full overflow-x-auto bg-[#111] border border-gray-800 rounded-2xl shadow-inner">
                         <table className="w-full text-center whitespace-nowrap">
                           <thead>
                             <tr className="border-b border-gray-800 bg-[#0a0a0a]">
                               <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase text-left">Week</th>
                               {Array.from({length: 17}, (_, i) => <th key={i} className="px-3 py-3 text-[10px] font-black text-gray-500">{i + 1}</th>)}
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-800/50 text-xs font-bold text-gray-300">
                             <tr className="hover:bg-[#151515]">
                               <td className="px-4 py-3 text-left text-gray-500">PTS</td>
                               {Array.from({length: 17}, (_, i) => <td key={i} className="px-3 py-3">{modalData.weekly_results[i+1] ? Math.round(modalData.weekly_results[i+1].points) : '-'}</td>)}
                             </tr>
                             <tr className="hover:bg-[#151515]">
                               <td className="px-4 py-3 text-left text-gray-500">H2H</td>
                               {Array.from({length: 17}, (_, i) => { const res = modalData.weekly_results[i+1]?.h2h; return <td key={i} className={`px-3 py-3 ${res === 'W' ? 'text-green-500' : res === 'L' ? 'text-red-500' : ''}`}>{res || '-'}</td> })}
                             </tr>
                             <tr className="hover:bg-[#151515]">
                               <td className="px-4 py-3 text-left text-gray-500">MED</td>
                               {Array.from({length: 17}, (_, i) => { const res = modalData.weekly_results[i+1]?.median; return <td key={i} className={`px-3 py-3 ${res === 'W' ? 'text-green-500' : res === 'L' ? 'text-red-500' : ''}`}>{res || '-'}</td> })}
                             </tr>
                             <tr className="hover:bg-[#151515]">
                               <td className="px-4 py-3 text-left text-gray-500 font-black">RNK</td>
                               {Array.from({length: 17}, (_, i) => <td key={i} className="px-3 py-3 text-white">{modalData.weekly_results[i+1]?.rank || '-'}</td>)}
                             </tr>
                           </tbody>
                         </table>
                       </div>
                    </div>
                 ) : <div className="text-center py-20 text-gray-500 uppercase font-black tracking-widest text-sm border border-dashed border-gray-800 rounded-2xl">No manager data recorded.</div>}
              </div>
           </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
          Welcome to Your Dashboard, <span className="text-[#1b75bb]">{session?.user?.name || 'Manager'}</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Ticket Balance Card */}
          <div className="bg-[#151515] border border-gray-800 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-lg relative overflow-hidden min-h-[160px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1b75bb] opacity-5 blur-[50px] rounded-full pointer-events-none"></div>
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Available Draft Tickets</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-white leading-none">{ticketCount}</span>
                <span className="text-gray-500 font-medium mb-1">Tickets</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3 relative z-10">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#111] border border-gray-800 flex items-center justify-center shadow-inner">
                <Ticket className="w-6 h-6 md:w-8 md:h-8 text-[#f5a623]" />
              </div>
              <button 
                onClick={() => setShowPurchaseModal(true)}
                className="relative group p-[2px] rounded-xl bg-gradient-to-r from-[#f5a623] to-[#c30b16] shadow-[0_0_15px_rgba(245,166,35,0.2)] transition-transform hover:-translate-y-0.5"
              >
                <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-2 flex items-center justify-center text-white font-black uppercase tracking-widest text-[10px] md:text-xs whitespace-nowrap">
                  Buy More Tickets
                </div>
              </button>
            </div>
          </div>

          {/* Connect Sleeper Account Card */}
          <div className="bg-[#151515] border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden min-h-[160px]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#1b75bb] font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <Link2 size={14} /> Connect Sleeper Account
              </p>
              {syncedSleeperUser && !isEditingSync && (
                <button 
                  onClick={() => { setIsEditingSync(true); setLivePreviewUser(null); }}
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Edit3 size={12} /> Change
                </button>
              )}
            </div>

            {syncedSleeperUser && !isEditingSync ? (
              <div className="flex items-center justify-between bg-[#111] border border-gray-800 rounded-2xl p-3.5 mt-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-zinc-900 border-2 border-[#1b75bb] overflow-hidden shrink-0 shadow-md">
                    <img 
                      src={syncedSleeperUser.avatar ? `https://sleepercdn.com/avatars/thumbs/${syncedSleeperUser.avatar}` : 'https://sleepercdn.com/images/v2/icons/player_default.webp'} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-black text-sm uppercase tracking-tight truncate">
                      {syncedSleeperUser.displayName || syncedSleeperUser.sleeper_username}
                    </h4>
                    <p className="text-[11px] font-bold text-gray-500 tracking-wider">@{syncedSleeperUser.sleeper_username}</p>
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 size={13} className="text-emerald-400" /> Connected
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                <div className="relative flex items-center gap-2">
                  <input 
                    type="text"
                    placeholder="Enter Sleeper Username..."
                    value={sleeperInput}
                    onChange={(e) => setSleeperInput(e.target.value)}
                    className="w-full bg-[#111] border border-gray-800 text-white text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:border-[#1b75bb] transition-colors"
                  />
                  {isSearching && (
                    <Loader2 size={16} className="absolute right-3 text-gray-400 animate-spin" />
                  )}
                  {isEditingSync && (
                    <button 
                      onClick={() => setIsEditingSync(false)}
                      className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {syncError && (
                  <p className="text-red-400 text-[11px] font-bold uppercase tracking-wider px-1">{syncError}</p>
                )}

                {livePreviewUser && (
                  <div className="flex items-center justify-between bg-[#111] border border-[#1b75bb]/50 rounded-xl p-3 mt-1 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#1b75bb] overflow-hidden shrink-0">
                        <img 
                          src={livePreviewUser.avatar ? `https://sleepercdn.com/avatars/thumbs/${livePreviewUser.avatar}` : 'https://sleepercdn.com/images/v2/icons/player_default.webp'} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-black text-xs uppercase truncate">{livePreviewUser.displayName}</p>
                        <p className="text-[10px] text-gray-400">@{livePreviewUser.username}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleConfirmSync(livePreviewUser)}
                      disabled={isSaving}
                      className="bg-[#1b75bb] hover:bg-teal-500 text-white font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      {isSaving ? <Loader2 size={12} className="animate-spin" /> : 'Sync & Lock'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-px overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => handleTabClick('my-leagues')}
          className={`pb-4 px-2 font-black uppercase tracking-widest text-xs transition-colors whitespace-nowrap relative ${activeTab === 'my-leagues' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <div className="flex items-center gap-2"><Trophy size={16} /> My Leagues</div>
          {activeTab === 'my-leagues' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 to-[#1b75bb] rounded-t-full"></div>}
        </button>

        <button 
          onClick={() => handleTabClick('share')}
          className={`pb-4 px-2 font-black uppercase tracking-widest text-xs transition-colors whitespace-nowrap relative ${activeTab === 'share' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <div className="flex items-center gap-2"><Share2 size={16} /> Share Roster</div>
          {activeTab === 'share' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 to-[#1b75bb] rounded-t-full"></div>}
        </button>

        <button 
          onClick={() => handleTabClick('perks')}
          className={`pb-4 px-2 font-black uppercase tracking-widest text-xs transition-colors whitespace-nowrap relative ${activeTab === 'perks' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <div className="flex items-center gap-2"><Gift size={16} /> Perks</div>
          {activeTab === 'perks' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 to-[#1b75bb] rounded-t-full"></div>}
        </button>
      </div>

      {/* Dynamic Tab Content */}
      <div className="bg-[#151515] border border-gray-800 rounded-3xl min-h-[400px]">
        
        {/* TAB 1: MY LEAGUES */}
        {activeTab === 'my-leagues' && (
          <div className="p-8">
            {!syncedSleeperUser ? (
              <div className="text-center py-20">
                <Link2 className="w-16 h-16 text-gray-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Connect Sleeper Account</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">Enter your Sleeper username in the card above to automatically pull and display your Draft Night Out leagues here!</p>
              </div>
            ) : loadingLeagues ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-10 h-10 text-[#1b75bb] animate-spin mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">Searching Sleeper for your DNO Leagues...</p>
              </div>
            ) : myLeagues.length === 0 ? (
              <div className="text-center py-20">
                <Trophy className="w-16 h-16 text-gray-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Leagues Yet</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">You haven't secured a spot in any Draft Night Out leagues yet. Head over to the draft lobby to claim your seat!</p>
                <a href="/dno" className="inline-block bg-[#1b75bb] hover:bg-teal-500 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-colors">
                  View Available Drafts
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myLeagues.map((league) => {
                  
                  // Try to find this user's stats for this specific league in the global leaderboard array
                  const teamStats = liveLeaderboard?.teams?.find(
                    t => String(t.leagueId) === String(league.id) && String(t.ownerId) === String(syncedSleeperUser?.sleeper_id)
                  );

                  return (
                    <div key={league.id} className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-700 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#f5a623] text-[10px] font-bold uppercase tracking-widest bg-[#f5a623]/10 px-2 py-1 rounded-md">Draft Night Out 2026</span>
                          {league.filled_spots >= league.total_spots ? (
                            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={14}/> Filled</span>
                          ) : (
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{league.filled_spots} / {league.total_spots} Spots</span>
                          )}
                        </div>
                        <h4 className="text-lg font-black italic uppercase text-white mb-1">{league.name}</h4>
                        <p className="text-sm text-gray-400 mb-6">PPR • 12 Team • 17 Rounds</p>
                        
                        {/* Injected Leaderboard Stats Banner */}
                        {teamStats && (
                          <div className="flex items-center justify-between bg-[#151515] p-4 rounded-xl border border-gray-800 mb-6 shadow-inner">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Global Rank</span>
                              <span className="text-white font-black text-xl leading-none">#{teamStats.rank}</span>
                            </div>
                            <div className="w-px h-8 bg-gray-800"></div>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Points</span>
                              <span className="text-[#27d7ff] font-black text-xl leading-none">{parseFloat(teamStats.totalPoints).toFixed(2)}</span>
                            </div>
                            <div className="w-px h-8 bg-gray-800"></div>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Record</span>
                              <span className="text-white font-black text-xl leading-none">{teamStats.wins}-{teamStats.losses}</span>
                            </div>
                          </div>
                        )}

                      </div>
                      
                      <div className="flex gap-2 w-full mt-auto">
                        <a 
                          href={`https://sleeper.com/leagues/${league.sleeper_id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase tracking-widest text-[10px] md:text-xs py-3 rounded-xl transition-colors"
                        >
                          Go To Draft Room
                        </a>
                        
                        {teamStats && (
                          <button 
                            onClick={() => handleViewStats(teamStats)} 
                            className="w-full text-center bg-[#1b75bb]/10 border border-[#1b75bb]/30 hover:bg-[#1b75bb]/20 text-[#27d7ff] font-bold uppercase tracking-widest text-[10px] md:text-xs py-3 rounded-xl transition-colors"
                          >
                            Detailed Stats
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHARE ROSTER */}
        {activeTab === 'share' && (
          <GraphicTab syncedSleeperUser={syncedSleeperUser} />
        )}

        {/* TAB 3: PERKS (UPDATED SWAP WITH ROOKIE GUIDE & 1 MONTH TEXT) */}
        {activeTab === 'perks' && (
          <div className="p-6 md:p-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* Card 1: 1 Free Month of FSAN Pro+ */}
              <div className="bg-gradient-to-br from-[#111] to-[#151515] border border-[#1b75bb]/40 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(27,117,187,0.15)] text-center relative overflow-hidden flex flex-col justify-between">
                <div className="relative z-10 flex flex-col h-full justify-between items-center">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#1b75bb]/10 border border-[#1b75bb]/30 flex items-center justify-center mx-auto mb-6 shadow-inner overflow-hidden p-1.5">
                      <img src="/images/dno/FSAN_Logo.png" alt="FSAN" className="w-full h-full object-contain" />
                    </div>
                    
                    <span className="text-[#1b75bb] font-bold uppercase tracking-widest text-xs mb-2 block">
                      Exclusive DNO Perk
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-3">
                      1 Free Month of FSAN Pro+
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8">
                      As a Draft Night Out participant, your entry includes 1 free month of access to FSAN’s premium rankings, trade calculator, trade value charts, and real-time draft advice.
                    </p>
                  </div>

                  {!hasPurchasedTicket ? (
                    <button disabled className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-500 font-bold uppercase tracking-widest text-xs py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-inner">
                      <Lock size={14} /> Ticket Required
                    </button>
                  ) : (
                    <a 
                      href="https://fsan.com/subscribe" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#1b75bb] hover:bg-teal-500 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02]"
                    >
                      Claim Subscription <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Card 2: Football Rookie Draft Guide */}
              <div className="bg-gradient-to-br from-[#301012] to-[#111] border border-red-900/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-red-700 transition-all shadow-xl flex flex-col justify-between">
                <div className="absolute -right-4 -top-4 text-red-500/10 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                  <Book size={140} />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-red-900/20 border border-red-500/30 flex items-center justify-center mb-6 shadow-inner text-red-500">
                      <Book className="w-7 h-7" />
                    </div>
                    <span className="text-red-400 font-bold uppercase tracking-widest text-xs mb-2 block">
                      Exclusive DNO Perk
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-3">
                      Football Rookie Draft Guide
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-8">
                      Download the official FSAN Rookie Guide to dominate your dynasty rookie drafts with exclusive player grades and tape breakdowns.
                    </p>
                  </div>

                  {!hasPurchasedTicket ? (
                    <button disabled className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-500 font-bold uppercase tracking-widest text-xs py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-inner">
                      <Lock size={14} /> Ticket Required
                    </button>
                  ) : guideLoading ? (
                    <button disabled className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-500 font-bold uppercase tracking-widest text-xs py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-inner">
                      <Loader2 size={16} className="animate-spin" /> Syncing File...
                    </button>
                  ) : rookieGuideUrl ? (
                    <a 
                      href={rookieGuideUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Download size={16} /> Download PDF
                    </a>
                  ) : (
                    <button disabled className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-500 font-bold uppercase tracking-widest text-xs py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-inner">
                      Not Available
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </main>
  );
}

export default function DNODashboard() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans selection:bg-[#1b75bb] selection:text-white relative">
      <DNOHeader onOpenAuthModal={() => {}} />
      <Suspense fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#1b75bb] animate-spin" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}