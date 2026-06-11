import React from 'react';
import TradeCalculatorClient from './TradeCalculatorClient';

export const metadata = {
  title: 'Trade Calculator | FSAN',
  description: 'Evaluate dynasty trades using asymmetric strategy modeling and custom league scoring.',
};

export default function TradeCalculatorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TradeCalculatorClient />
      </div>
    </div>
  );
}