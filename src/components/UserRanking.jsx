"use client";
import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, Loader2, AlertCircle, MinusCircle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const SortableItem = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  // Unique UI for the "Stop My Rankings" Bar (Dark Mode + Red Accent)
  if (item.type === 'stop-tier') {
    return (
      <div
        ref={setNodeRef} style={style} {...attributes} {...listeners}
        className={`bg-red-900/20 rounded-2xl shadow-sm border border-red-500/50 p-4 md:p-5 cursor-grab hover:bg-red-900/30 transition-colors flex items-center justify-between my-6 ${isDragging ? 'opacity-50 ring-2 ring-red-500 scale-[1.02]' : ''}`}
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-red-900/50 text-red-500 border border-red-500/50 rounded-full flex items-center justify-center shrink-0">
            <MinusCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-red-400 uppercase tracking-widest">{item.name}</h3>
            <p className="text-xs text-red-500/70 font-bold mt-0.5">{item.details}</p>
          </div>
        </div>
        <GripVertical className="text-red-500/50 hover:text-red-400 transition-colors" size={24} />
      </div>
    );
  }

  // Standard Player UI (Dark Mode)
  return (
    <div
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`bg-[#1a1a1a] rounded-2xl shadow-sm border p-4 cursor-grab transition-all flex items-center justify-between 
      ${isDragging ? 'opacity-90 ring-2 ring-red-500 scale-[1.02] border-red-500 z-10 relative shadow-2xl' : 'border-gray-800 hover:border-gray-600'} 
      ${item.isBelowStopTier ? 'opacity-40 bg-[#111] grayscale-[0.8]' : ''}`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${item.isBelowStopTier ? 'bg-gray-800 text-gray-500 border border-gray-700' : 'bg-red-600/20 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(220,38,38,0.2)]'}`}>
          {item.displayRank}
        </div>
        <div>
          <h3 className={`text-base font-black tracking-tight ${item.isBelowStopTier ? 'text-gray-500 line-through' : 'text-gray-100'}`}>{item.name}</h3>
          <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${item.isBelowStopTier ? 'text-gray-600' : 'text-gray-400'}`}>{item.team} <span className="text-gray-600 mx-1">vs</span> {item.opponent}</p>
        </div>
      </div>
      <GripVertical className="text-gray-600 hover:text-gray-400 transition-colors" size={20} />
    </div>
  );
};

const UserRanking = () => {
  const { players, loading, currentPosition, setCurrentPosition, submitRanking } = usePlayer();
  const [rankedPlayers, setRankedPlayers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Initialize players and prepend the Stop Tier to the TOP
  useEffect(() => {
    if (players && players.length > 0) {
        const formattedPlayers = players.map(p => ({ ...p, type: 'player' }));
        const stopTier = { 
            type: 'stop-tier', 
            id: 'stop-tier', 
            name: 'Stop my rankings here', 
            details: 'Drag players above this line to rank them.' 
        };
        // The Stop Tier is now the FIRST element in the array
        setRankedPlayers([stopTier, ...formattedPlayers]);
    } else {
        setRankedPlayers([]);
    }
  }, [players]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setRankedPlayers((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async () => {
    if (rankedPlayers.length === 0) return;
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const res = await submitRanking(rankedPlayers);
      if (res.success) {
          setMessage({ type: 'success', text: 'Rankings securely saved to the database!' });
      } else {
          setMessage({ type: 'error', text: res.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Critical submission error.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) {
     return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-red-600" size={40} /></div>;
  }

  // Pre-calculate display ranks before rendering
  // Because the stop tier is at the top, everything below it automatically gets a "-"
  let currentRank = 1;
  let foundStopTier = false;
  
  const itemsToRender = rankedPlayers.map(item => {
      if (item.type === 'stop-tier') {
          foundStopTier = true;
          return { ...item, displayRank: '-' };
      }
      
      const isBelowStopTier = foundStopTier;
      const displayRank = isBelowStopTier ? '-' : currentRank++;
      
      return { ...item, displayRank, isBelowStopTier };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Header and Position Filters */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black italic text-white mb-2 uppercase tracking-tighter drop-shadow-md">Submit Rankings</h1>
           <p className="text-gray-400">Drag and drop players above the stop line to set your official ranks for <span className="text-red-500 font-bold">{currentPosition}</span>.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-[#111] p-2 rounded-2xl shadow-inner border border-gray-800 w-fit h-fit">
           {['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map(pos => (
              <button 
                 key={pos} 
                 onClick={() => setCurrentPosition(pos)} 
                 className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${currentPosition === pos ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'}`}
              >
                 {pos}
              </button>
           ))}
        </div>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-500/50' : 'bg-red-900/30 text-red-400 border border-red-500/50'}`}>
           <AlertCircle size={20} /> {message.text}
        </div>
      )}

      {/* Drag and Drop Container */}
      {itemsToRender.length > 0 ? (
          <div className="bg-[#111] rounded-3xl p-6 md:p-10 border border-gray-800 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-800 gap-4">
               <h2 className="text-xl font-black text-white uppercase tracking-wider">Your {currentPosition} Order</h2>
               <button
                   onClick={handleSubmit}
                   disabled={isSubmitting}
                   className="px-8 py-3.5 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:-translate-y-0.5 transition-all"
               >
                   {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                   {isSubmitting ? 'Saving...' : 'Save Rankings'}
               </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
               <SortableContext items={itemsToRender} strategy={verticalListSortingStrategy}>
                   <div className="space-y-3 pb-24">
                   {itemsToRender.map((item) => (
                       <SortableItem key={item.id} item={item} />
                   ))}
                   </div>
               </SortableContext>
            </DndContext>
          </div>
      ) : (
          <div className="text-center py-20 bg-[#111] rounded-3xl border border-dashed border-gray-700">
             <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No players found for {currentPosition}. Ask an admin to import them.</p>
          </div>
      )}
    </div>
  );
};

export default UserRanking;