"use client";
import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// FIX: Dynamically import the Scoreboard and disable Server-Side Rendering (SSR).
// This prevents "Invalid time value" and browser-specific errors during the Vercel build!
const Scoreboard = dynamic(
  () => import('../../components/Scoreboard').then((mod) => mod.Scoreboard),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    )
  }
);

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
             <Scoreboard />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}