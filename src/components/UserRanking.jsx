"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, Loader2, AlertCircle, MinusCircle, ArrowLeft, RotateCcw, Upload, Archive, Eye, Users } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const restrictToVerticalAxis = ({ transform }) => {
  return { ...transform, x: 0 };
};

const SortableItem = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Translate.toString(transform), transition: transition || undefined, zIndex: isDragging ? 50 : 1 };

  if (item.type === 'stop-tier') {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`bg-red-900/20 rounded-xl shadow-sm border border-red-500/50 p-3 cursor-grab hover:bg-red-900/30 transition-colors flex items-center justify-between my-4 ${isDragging ? 'opacity-80 ring-2 ring-red-500 scale-[1.01]' : ''}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-900/50 text-red-500 border border-red-500/50 rounded-full flex items-center justify-center shrink-0">
            <MinusCircle size={16} />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-xs font-black text-red-400 uppercase tracking-widest leading-none">{item.name}</h3>
            <p className="text-[10px] text-red-500/70 font-bold mt-1 leading-none">{item.details}</p>
          </div>
        </div>
        <GripVertical className="text-red-500/50 hover:text-red-400 transition-colors" size={18} />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`bg-[#1a1a1a] rounded-xl shadow-sm border p-2 cursor-grab flex items-center justify-between ${isDragging ? 'opacity-90 ring-2 ring-red-500 scale-[1.01] border-red-500 z-10 relative shadow-2xl' : 'border-gray-800 hover:border-gray-600'} ${item.isBelowStopTier ? 'bg-[#151515] opacity-70 grayscale-[0.3]' : ''}`}>
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${item.isBelowStopTier ? 'bg-gray-800 text-gray-500 border border-gray-700' : 'bg-red-600/20 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(220,38,38,0.2)]'}`}>
          {item.displayRank}
        </div>
        <div className="flex flex-col justify-center">
          <h3 className={`text-sm font-black tracking-tight leading-none ${item.isBelowStopTier ? 'text-gray-400' : 'text-gray-100'}`}>{item.name}</h3>
          <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 leading-none ${item.isBelowStopTier ? 'text-gray-600' : 'text-gray-400'}`}>{item.team} <span className="text-gray-600 mx-0.5">vs</span> {item.opponent}</p>
        </div>
      </div>
      <GripVertical className="text-gray-600 hover:text-gray-400 transition-colors mr-2" size={16} />
    </div>
  );
};

const UserRanking = () => {
  const { data: session } = useSession();
  const { players, rankings, consensusRanking, loading, currentPosition, setCurrentPosition, currentWeek, submitRanking } = usePlayer();
  const [rankedPlayers, setRankedPlayers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (players && players.length > 0) {
        if (session?.user?.id && rankings && rankings.length > 0) {
            const userSavedRanking = rankings.find(r => String(r.user_id) === String(session.user.id));
            
            if (userSavedRanking) {
                try {
                    const savedData = JSON.parse(userSavedRanking.ranking_data);
                    
                    // Filter out the meta tag so it doesn't render as a draggable object!
                    const visibleData = savedData.filter(item => item.type !== 'meta');
                    
                    const savedPlayerIds = new Set(visibleData.map(item => String(item.id)));
                    const newPlayers = players
                        .filter(p => !savedPlayerIds.has(String(p.id)))
                        .map(p => ({ ...p, type: 'player' }));

                    setRankedPlayers([...visibleData, ...newPlayers]);
                    return; 
                } catch (e) {
                    console.error("Failed to parse user's saved ranking data.", e);
                }
            }
        }

        const formattedPlayers = players.map(p => ({ ...p, type: 'player' }));
        const stopTier = { type: 'stop-tier', id: 'stop-tier', name: 'Stop my rankings here', details: 'Drag players above this line to rank them.' };
        setRankedPlayers([stopTier, ...formattedPlayers]);
    } else {
        setRankedPlayers([]);
    }
  }, [players, rankings, session]);

  const handleResetToDefault = () => {
      if (confirm("Are you sure you want to reset your rankings to the default order? This will wipe your current progress.")) {
          const formattedPlayers = players.map(p => ({ ...p, type: 'player' }));
          const stopTier = { type: 'stop-tier', id: 'stop-tier', name: 'Stop my rankings here', details: 'Drag players above this line to rank them.' };
          setRankedPlayers([stopTier, ...formattedPlayers]);
      }
  };

  const handlePrefillConsensus = () => {
      if (confirm("Are you sure you want to replace your current order with the consensus rankings?")) {
          const consensusOrder = consensusRanking.map(c => String(c.id));
          const sortedPlayers = [...players].sort((a, b) => {
              const idxA = consensusOrder.indexOf(String(a.id));
              const idxB = consensusOrder.indexOf(String(b.id));
              if (idxA === -1 && idxB === -1) return 0;
              if (idxA === -1) return 1;
              if (idxB === -1) return -1;
              return idxA - idxB;
          }).map(p => ({ ...p, type: 'player' }));

          const stopTier = { type: 'stop-tier', id: 'stop-tier', name: 'Stop my rankings here', details: 'Drag players above this line to rank them.' };
          
          // Insert the stop tier right after the players that have a consensus rank!
          const rankedCount = consensusRanking.length;
          const newOrder = [
              ...sortedPlayers.slice(0, rankedCount),
              stopTier,
              ...sortedPlayers.slice(rankedCount)
          ];

          setRankedPlayers(newOrder);
      }
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split(/\r\n|\n/);
        const playerNamesFromCSV = [];

        lines.forEach(line => {
            line.split(',').forEach(cell => {
                const cleanCell = cell.replace(/"/g, '').trim();
                if (cleanCell.length > 2 && isNaN(cleanCell)) {
                    playerNamesFromCSV.push(cleanCell);
                }
            });
        });

        const allAvailablePlayers = players.map(p => ({ ...p, type: 'player' }));
        const sortedPlayers = [];
        const foundPlayerIds = new Set();

        playerNamesFromCSV.forEach(name => {
            const foundIndex = allAvailablePlayers.findIndex(p => p.name.toLowerCase() === name.toLowerCase() && !foundPlayerIds.has(String(p.id)));
            if (foundIndex !== -1) {
                const [foundPlayer] = allAvailablePlayers.splice(foundIndex, 1);
                sortedPlayers.push(foundPlayer);
                foundPlayerIds.add(String(foundPlayer.id));
            }
        });
        
        const stopTier = { type: 'stop-tier', id: 'stop-tier', name: 'Stop my rankings here', details: 'Drag players above this line to rank them.' };
        
        setRankedPlayers([
            ...sortedPlayers,
            stopTier,
            ...allAvailablePlayers
        ]);

        setMessage({ type: 'success', text: `Successfully imported and sorted ${sortedPlayers.length} players from CSV!` });
        setTimeout(() => setMessage(null), 5000);
    };

    reader.readAsText(file);
    event.target.value = ''; 
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setRankedPlayers((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async (status = 'published') => {
    if (rankedPlayers.length === 0) return;
    setIsSubmitting(status);
    setMessage(null);
    try {
      // Inject the invisible meta tag directly into the payload array!
      const payload = [{ type: 'meta', status }, ...rankedPlayers];
      
      const res = await submitRanking(payload);
      
      if (res.success) { 
          let successText = 'Rankings officially submitted to the consensus!';
          if (status === 'draft') successText = 'Rankings saved for later (Not Public).';
          if (status === 'withdrawn') successText = 'Rankings successfully withdrawn from consensus.';
          setMessage({ type: 'success', text: successText }); 
      } 
      else { setMessage({ type: 'error', text: res.message }); }
    } catch (error) { setMessage({ type: 'error', text: 'Critical submission error.' }); } 
    finally { setIsSubmitting(false); setTimeout(() => setMessage(null), 5000); }
  };

  let currentRank = 1;
  let foundStopTier = false;
  const itemsToRender = rankedPlayers.map(item => {
      if (item.type === 'stop-tier') { foundStopTier = true; return { ...item, displayRank: '-' }; }
      const isBelowStopTier = foundStopTier;
      const displayRank = isBelowStopTier ? '-' : currentRank++;
      return { ...item, displayRank, isBelowStopTier };
  });

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
            <Link href="/football/rankings" className="flex items-center gap-2 text-gray-500 hover:text-white font-bold uppercase tracking-widest text-xs mb-4 transition-colors">
                <ArrowLeft size={16} /> Back to Consensus
            </Link>

            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 pl-1">Rankings Status</h2>
            
            <button 
                onClick={() => handleSubmit('published')} 
                disabled={isSubmitting}
                className="flex items-center gap-3 px-5 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting === 'published' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSubmitting === 'published' ? 'Saving...' : 'Submit Rankings'}
            </button>

            <button 
                onClick={() => handleSubmit('draft')} 
                disabled={isSubmitting}
                className="flex items-center gap-3 px-5 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all bg-[#111] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting === 'draft' ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
                Save for Later
            </button>

            <button 
                onClick={() => handleSubmit('withdrawn')} 
                disabled={isSubmitting}
                className="flex items-center gap-3 px-5 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all bg-[#111] border border-red-900/30 text-red-500/70 hover:text-red-400 hover:border-red-500/50 hover:bg-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting === 'withdrawn' ? <Loader2 size={18} className="animate-spin" /> : <MinusCircle size={18} />}
                Withdraw Rankings
            </button>

            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 pl-1 mt-6">Power Tools</h2>

            <button 
                onClick={() => fileInputRef.current.click()} 
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all bg-[#111] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
            >
                <Upload size={16} className="text-blue-500" />
                Upload CSV
            </button>
            <input type="file" accept=".csv" onChange={handleCsvUpload} ref={fileInputRef} className="hidden" />

            <button 
                onClick={handlePrefillConsensus} 
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all bg-[#111] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
            >
                <Users size={16} className="text-orange-500" />
                Pre-fill Consensus
            </button>

            <button 
                onClick={handleResetToDefault} 
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all bg-[#111] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
            >
                <RotateCcw size={16} className="text-gray-500" />
                Reset to Default
            </button>

            <Link 
                href="/football/rankings" 
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all bg-[#111] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 mt-2"
            >
                <Eye size={16} className="text-green-500" />
                View Consensus
            </Link>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 w-full min-w-0">
          <div className="mb-6 flex flex-col gap-4">
            <div>
               <h1 className="text-3xl sm:text-4xl font-black italic text-white uppercase tracking-tighter drop-shadow-md mb-2">Submit {currentWeek} Rankings</h1>
               <p className="text-sm text-gray-400 max-w-2xl">Drag and drop players above the stop line to set your official ranks for <span className="text-red-500 font-bold">{currentPosition}</span>. Your submitted rankings directly impact the global FSAN consensus.</p>
            </div>
            
            {/* Position Tabs */}
            <div className="flex flex-wrap gap-2 bg-[#111] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit mt-2">
               {['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map(pos => (
                  <button key={pos} onClick={() => setCurrentPosition(pos)} className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${currentPosition === pos ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'}`}>
                     {pos}
                  </button>
               ))}
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-red-900/30 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.1)]'}`}>
               <AlertCircle size={20} /> {message.text}
            </div>
          )}

          {loading ? (
             <div className="flex flex-col items-center justify-center py-32 bg-[#111] rounded-3xl border border-gray-800 shadow-2xl">
                <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Loading Players...</p>
             </div>
          ) : itemsToRender.length > 0 ? (
              <div className="bg-[#111] rounded-3xl p-4 md:p-6 border border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800 relative z-10">
                   <h2 className="text-lg font-black text-white uppercase tracking-wider">Your {currentPosition} Order</h2>
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                       {itemsToRender.filter(i => !i.isBelowStopTier && i.type === 'player').length} Ranked
                   </span>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                   <SortableContext items={itemsToRender} strategy={verticalListSortingStrategy}>
                       <div className="space-y-2 relative z-10">
                       {itemsToRender.map((item) => (
                           <SortableItem key={item.id} item={item} />
                       ))}
                       </div>
                   </SortableContext>
                </DndContext>
              </div>
          ) : (
              <div className="text-center py-32 bg-[#111] rounded-3xl border border-dashed border-gray-700 shadow-inner">
                 <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2">No players found for {currentPosition}.</p>
                 <p className="text-gray-600 text-xs">Switch positions or check back later.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRanking;