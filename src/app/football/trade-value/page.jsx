import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout'; // Adjust path if needed
import TradeValueClient from './TradeValueClient';

export const metadata = {
  title: 'Trade Value Charts | FSAN',
  description: 'Dynasty and Redraft fantasy football trade value charts.',
};

export default function TradeValuePage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TradeValueClient />
        </div>
      </div>
    </DashboardLayout>
  );
}