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

  // Unique UI for the "Stop My Rankings" Bar
  if (item.type === 'stop-tier') {
    return (
      <div
        ref={setNodeRef} style={style} {...attributes} {...listeners}
        className={`bg-red-50 rounded-xl shadow-sm border-2 border-red-300 p-4 cursor-grab hover:shadow-md transition-shadow flex items-center justify-between my-6 ${isDragging ? 'opacity-50 ring-2 ring-red-500 scale-[1.02]' : ''}`}
      >
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-red-100 text-red-600 border border-red-300 rounded-full flex items-center justify-center shrink-0">
            <MinusCircle size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-red-900 uppercase tracking-widest">{item.name}</h3>
            <p className="text-xs text-red-700 font-bold mt-0.5">{item.details}</p>
          </div>
        </div>
        <GripVertical className="text-red-400" size={20} />
      </div>
    );
  }

  // Standard Player UI
  return (
    <div
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-grab hover:shadow-md transition-all flex items-center justify-between 
      ${isDragging ? 'opacity-50 ring-2 ring-blue-500 scale-[1.02]' : ''} 
      ${item.isBelowStopTier ? 'opacity-50 bg-gray-100 grayscale-[0.5]' : ''}`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${item.isBelowStopTier ? 'bg-gray-300 text-gray-500 border border-gray-400' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}>
          {item.displayRank}
        </div>
        <div>
          <h3 className={`text-sm font-bold ${item.isBelowStopTier ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{item.name}</h3>
          <p className={`text-xs font-medium ${item.isBelowStopTier ? 'text-gray-400' : 'text-gray-500'}`}>{item.team} vs {item.opponent}</p>
        </div>
      </div>
      <GripVertical className="text-gray-400" size={20} />
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

  // Initialize players and append the Stop Tier
  useEffect(() => {
    if (players && players.length > 0) {
        const formattedPlayers = players.map(p => ({ ...p, type: 'player' }));
        const stopTier = { 
            type: 'stop-tier', 
            id: 'stop-tier', 
            name: 'Stop my rankings here', 
            details: 'All players below this point will not be given any points.' 
        };
        setRankedPlayers([...formattedPlayers, stopTier]);
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
      // Send the exact array (which now dynamically includes the stop-tier wherever they dragged it)
      const res = await submitRanking(rankedPlayers);
      
      if (res.success) {
          setMessage({ type: 'success', text: 'Ranking saved successfully!' });
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
     return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  // Pre-calculate display ranks before rendering so the UI updates instantly while dragging
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Rankings</h1>
           <p className="text-gray-600">Drag and drop players to set your official ranks for {currentPosition}.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-fit h-fit">
           {['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map(pos => (
              <button key={pos} onClick={() => setCurrentPosition(pos)} className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${currentPosition === pos ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                 {pos}
              </button>
           ))}
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
           <AlertCircle size={20} /> {message.text}
        </div>
      )}

      {itemsToRender.length > 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Your Current {currentPosition} Order</h2>
              <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md transition-all"
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
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
             <p className="text-gray-500 font-bold">No players found for {currentPosition}. Ask an admin to import them.</p>
          </div>
      )}
    </div>
  );
};

export default UserRanking;