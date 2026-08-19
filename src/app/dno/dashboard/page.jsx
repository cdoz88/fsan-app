"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Trophy, Share2, Gift, UserCog, ArrowLeft, Loader2 } from 'lucide-react';

// Importing Modular Components
import DNOHeader from '../../../components/dno/DNOHeader';
import GraphicTab from '../../../components/dno/tabs/GraphicTab';
import MyLeaguesTab from '../../../components/dno/tabs/dashboard/MyLeaguesTab';
import PerksTab from '../../../components/dno/tabs/dashboard/PerksTab';
import AccountTab from '../../../components/dno/tabs/dashboard/AccountTab';
import PurchaseModal from '../../../components/dno/dashboard/PurchaseModal';
import StatsModal from '../../../components/dno/dashboard/StatsModal';
import DashboardHero from '../../../components/dno/dashboard/DashboardHero';

function DashboardContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get('tab') || 'my-leagues';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [ticketCount, setTicketCount] = useState(0);
  const [userJoinedCount, setUserJoinedCount] = useState(0);
  const [isLegacyDrafter, setIsLegacyDrafter] = useState(false);
  
  const [myLeagues, setMyLeagues] = useState([]);
  const [liveLeaderboard, setLiveLeaderboard] = useState({ teams: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLeagues, setLoadingLeagues] = useState(false);

  const hasPurchasedTicket = ticketCount > 0 || userJoinedCount > 0 || isLegacyDrafter;

  const [rookieGuideUrl, setRookieGuideUrl] = useState(null);
  const [guideLoading, setGuideLoading] = useState(true);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [donationAmount, setDonationAmount] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const [sleeperInput, setSleeperInput] = useState('');
  const [livePreviewUser, setLivePreviewUser] = useState(null); 
  const [syncedSleeperUser, setSyncedSleeperUser] = useState(null); 
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [isEditingSync, setIsEditingSync] = useState(false);

  const getDnoStorageKey = (userId) => `dno_dedicated_sleeper_${userId}`;

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus) {
      const tabParam = searchParams.get('tab') || activeTab;
      const leagueIdParam = searchParams.get('leagueId');
      
      let cleanUrl = `/dno/dashboard?tab=${tabParam}`;
      if (leagueIdParam) cleanUrl += `&leagueId=${leagueIdParam}`;
      
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [searchParams, activeTab]);

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
    router.push(`?tab=${tabId}`, { scroll: false });
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

      const userIdParam = session?.user?.id ? `&user_id=${session.user.id}` : '';
      const pRes = await fetch(`/api/scl?type=dno_pool${userIdParam}&t=${Date.now()}`, { cache: 'no-store' });
      
      let validDnoLeagueIds = new Set();
      let wpJoinedIds = new Set();
      let poolMap = {};

      let directWpLeagues = [];
      try {
          const wpRes = await fetch('https://admin.fsan.com/wp-admin/admin-ajax.php?action=dno_get_leagues_pool');
          const wpJson = await wpRes.json();
          if (wpJson.success && wpJson.data?.leagues) {
              directWpLeagues = wpJson.data.leagues;
          }
      } catch (wpErr) {
          console.warn("Direct WP fetch failed:", wpErr);
      }
      
      if (pRes.ok) {
        const pData = await pRes.json();
        const allLeagues = directWpLeagues.length > 0 ? directWpLeagues : (pData.leagues || []);
        
        allLeagues.forEach(l => {
          validDnoLeagueIds.add(String(l.id));
          poolMap[String(l.id)] = l;
        });
        
        if (pData.joined_leagues && Array.isArray(pData.joined_leagues)) {
          pData.joined_leagues.forEach(id => wpJoinedIds.add(String(id)));
        }
      }

      const slpLeaguesRes = await fetch(`https://api.sleeper.app/v1/user/${userId}/leagues/nfl/2026?t=${Date.now()}`, { cache: 'no-store' });
      let slpLeagues = [];
      if (slpLeaguesRes.ok) {
         slpLeagues = await slpLeaguesRes.json();
      }

      const mergedLeaguesMap = new Map();

      slpLeagues.forEach(l => {
        const inPool = poolMap[String(l.league_id)];
        const hasDnoName = l.name && (l.name.toUpperCase().includes('DNO') || l.name.toUpperCase().includes('DRAFT NIGHT OUT'));
        
        if (validDnoLeagueIds.has(String(l.league_id)) || hasDnoName) {
          mergedLeaguesMap.set(String(l.league_id), {
            id: l.league_id,
            sleeper_id: l.league_id,
            name: l.name,
            total_spots: l.total_rosters || inPool?.total_spots || 12,
            filled_spots: inPool?.filled_spots || l.total_rosters || 12,
            avatar: l.avatar,
            pending_join: false,
            invite_link: inPool?.invite_link || inPool?.inviteLink || inPool?.sleeper_invite_link || inPool?.invite
          });
        }
      });

      const cacheCheckPromises = [];
      wpJoinedIds.forEach(id => {
         if (!mergedLeaguesMap.has(id) && poolMap[id]) {
            cacheCheckPromises.push(
               fetch(`https://api.sleeper.app/v1/league/${id}/users`)
               .then(res => res.json())
               .then(users => {
                  if (Array.isArray(users)) {
                     const isStillInLeague = users.some(u => String(u.user_id) === String(userId));
                     const poolLeague = poolMap[id];
                     
                     if (isStillInLeague) {
                        mergedLeaguesMap.set(id, {
                           id: poolLeague.id,
                           sleeper_id: poolLeague.id,
                           name: poolLeague.name,
                           total_spots: poolLeague.total_spots || 12,
                           filled_spots: poolLeague.filled_spots || 1,
                           avatar: null,
                           pending_join: false,
                           invite_link: poolLeague.invite_link || poolLeague.inviteLink || poolLeague.sleeper_invite_link || poolLeague.invite
                        });
                     } else {
                        mergedLeaguesMap.set(id, {
                           id: poolLeague.id,
                           sleeper_id: poolLeague.id,
                           name: poolLeague.name,
                           total_spots: poolLeague.total_spots || 12,
                           filled_spots: poolLeague.filled_spots || 0,
                           avatar: null,
                           pending_join: true,
                           invite_link: poolLeague.invite_link || poolLeague.inviteLink || poolLeague.sleeper_invite_link || poolLeague.invite
                        });
                     }
                  }
               }).catch(e => console.warn("Cache check failed for", id))
            );
         }
      });

      if (cacheCheckPromises.length > 0) {
         await Promise.all(cacheCheckPromises);
      }

      setMyLeagues(Array.from(mergedLeaguesMap.values()));
    } catch (err) {
      console.warn("Failed fetching My Leagues from Sleeper:", err);
      setMyLeagues([]);
    } finally {
      setLoadingLeagues(false);
    }
  }, [session]);

  const loadAccountData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      let dnoSleeperId = null;

      try {
        const uRes = await fetch(`/api/scl?action=dno_get_user_data&user_id=${session.user.id}&t=${Date.now()}`, { cache: 'no-store' });
        if (uRes.ok) {
          const uDataRaw = await uRes.json();
          const uData = uDataRaw.data || uDataRaw;
          dnoSleeperId = uData.dno_sleeper_id || uData.dno_sleeper_user_id || uData.sleeper_id || null;
          
          setIsLegacyDrafter(uData.is_legacy || false);

          if (dnoSleeperId) {
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
  }, [session]);

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
      const saveRes = await fetch('/api/scl?action=dno_update_sleeper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dno_update_sleeper',
          user_id: session.user.id,
          dno_sleeper_id: sleeperIdToSave,
          dno_sleeper_username: sleeperUsernameToSave
        })
      });

      const saveJson = await saveRes.json();
      if (!saveRes.ok || !saveJson.success) {
        throw new Error(saveJson?.data?.message || "Failed saving DNO Sleeper connection");
      }

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
      console.warn("Server save error:", err);
      setSyncError("Unable to save to database. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const executeStripeCheckout = async () => {
    setIsProcessing(true);
    try {
      // Check if user is already a paid FSAN member via their session
      const isExistingMember = session?.user?.role === 'pro' || session?.user?.role === 'pro_plus';
      
      const isFirstTicket = ticketCount <= 0 && userJoinedCount === 0;
      
      // If they are already a member, DO NOT give them the bundle trial.
      // Force them to the standard 'extra ticket' checkout.
      const purchaseType = (isFirstTicket && !isExistingMember) ? 'dno_bundle' : 'dno_extra_ticket';

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

  const handleBillingPortal = async () => {
    setIsPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session.user.id, 
          email: session.user.email, 
          returnUrl: window.location.href 
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Billing portal is currently unavailable or you have no previous purchases.");
      }
    } catch (err) {
      console.error("Portal Error:", err);
      alert("Something went wrong accessing the billing portal.");
    } finally {
      setIsPortalLoading(false);
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

  const handleShareRoster = (leagueId) => {
    setActiveTab('share');
    router.push(`?tab=share&leagueId=${leagueId}`, { scroll: false });
  };

  const handleManualRefresh = async () => {
    setLoadingLeagues(true);
    if (session?.user?.id) {
      await loadAccountData();
    }
    if (syncedSleeperUser) {
      await hydrateSleeperUser(syncedSleeperUser.sleeper_id);
      await fetchMyDnoLeagues(syncedSleeperUser);
    } else {
      setLoadingLeagues(false);
    }
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

      {showPurchaseModal && (
        <PurchaseModal
          setShowPurchaseModal={setShowPurchaseModal}
          isProcessing={isProcessing}
          ticketCount={ticketCount}
          userJoinedCount={userJoinedCount}
          purchaseQuantity={purchaseQuantity}
          setPurchaseQuantity={setPurchaseQuantity}
          donationAmount={donationAmount}
          setDonationAmount={setDonationAmount}
          isAnonymous={isAnonymous}
          setIsAnonymous={setIsAnonymous}
          executeStripeCheckout={executeStripeCheckout}
        />
      )}

      {selectedTeam && (
        <StatsModal
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          modalLoading={modalLoading}
          modalData={modalData}
          liveLeaderboard={liveLeaderboard}
        />
      )}

      <DashboardHero
        session={session}
        ticketCount={ticketCount}
        setShowPurchaseModal={setShowPurchaseModal}
        syncedSleeperUser={syncedSleeperUser}
        isEditingSync={isEditingSync}
        setIsEditingSync={setIsEditingSync}
        setLivePreviewUser={setLivePreviewUser}
        sleeperInput={sleeperInput}
        setSleeperInput={setSleeperInput}
        isSearching={isSearching}
        syncError={syncError}
        livePreviewUser={livePreviewUser}
        handleConfirmSync={handleConfirmSync}
        isSaving={isSaving}
      />

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

        <button 
          onClick={() => handleTabClick('account')}
          className={`pb-4 px-2 font-black uppercase tracking-widest text-xs transition-colors whitespace-nowrap relative ${activeTab === 'account' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <div className="flex items-center gap-2"><UserCog size={16} /> Account</div>
          {activeTab === 'account' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 to-[#1b75bb] rounded-t-full"></div>}
        </button>
      </div>

      {/* Dynamic Tab Content */}
      <div className="bg-[#151515] border border-gray-800 rounded-3xl min-h-[400px]">
        {activeTab === 'my-leagues' && (
          <MyLeaguesTab
            syncedSleeperUser={syncedSleeperUser}
            handleManualRefresh={handleManualRefresh}
            loadingLeagues={loadingLeagues}
            isLoading={isLoading}
            myLeagues={myLeagues}
            liveLeaderboard={liveLeaderboard}
            handleShareRoster={handleShareRoster}
            handleViewStats={handleViewStats}
          />
        )}
        {activeTab === 'share' && (
          <GraphicTab syncedSleeperUser={syncedSleeperUser} />
        )}
        {activeTab === 'perks' && (
          <PerksTab
            hasPurchasedTicket={hasPurchasedTicket}
            guideLoading={guideLoading}
            rookieGuideUrl={rookieGuideUrl}
          />
        )}
        {activeTab === 'account' && (
          <AccountTab
            session={session}
            ticketCount={ticketCount}
            userJoinedCount={userJoinedCount}
            handleBillingPortal={handleBillingPortal}
            isPortalLoading={isPortalLoading}
          />
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