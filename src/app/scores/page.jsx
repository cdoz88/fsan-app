"use client";
import React, { Suspense } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

// FIX: Added curly brackets here because Scoreboard is a "named" export!
import { Scoreboard } from '../../components/Scoreboard'; 

// Initialize the React Query Client for the Scoreboard data fetching
const queryClient = new QueryClient();

export default function ScoresPage() {
  // Sets the active sport state for the Header/Sidebar
  const activeSport = 'All'; 

  return (
    <QueryClientProvider client={queryClient}>
      <Header activeSport={activeSport} />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport={activeSport} />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <div className="animate-in fade-in duration-500">
             
             {/* A clean fallback loader while the scoreboard initializes */}
             <Suspense fallback={
               <div className="flex items-center justify-center min-h-[50vh]">
                 <Loader2 className="animate-spin text-red-600" size={48} />
               </div>
             }>
                <Scoreboard />
             </Suspense>

          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}