import React from 'react';

export default function PlaybookLoader({ className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg width="150" height="100" viewBox="0 0 150 100" className="opacity-90">
        <defs>
          <filter id="chalky-loader">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#chalky-loader)" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          
          {/* --- The Xs --- */}
          <path d="M 10,15 L 25,35 M 25,15 L 10,35" />
          <path d="M 45,55 L 60,75 M 60,55 L 45,75" />
          <path d="M 120,20 L 135,40 M 135,20 L 120,40" />

          {/* --- The Os --- */}
          <circle cx="85" cy="25" r="8" />
          <circle cx="30" cy="85" r="8" />
          <circle cx="110" cy="65" r="8" />
          
          {/* --- The Animated Play Routes (Arrows) --- */}
          
          {/* Route 1: Draws first */}
          <path d="M 35,25 Q 60,5 75,25" strokeDasharray="60" strokeDashoffset="60">
            <animate attributeName="stroke-dashoffset" values="60;0" dur="1.2s" begin="0s" fill="freeze" />
          </path>
          <path d="M 68,17 L 77,25 L 65,31" opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.1s" begin="1.2s" fill="freeze" />
          </path>

          {/* Route 2: Draws after Route 1 */}
          <path d="M 55,65 Q 80,85 100,70" strokeDasharray="60" strokeDashoffset="60">
            <animate attributeName="stroke-dashoffset" values="60;0" dur="1.2s" begin="1.3s" fill="freeze" />
          </path>
          <path d="M 92,62 L 100,70 L 90,78" opacity="0">
             <animate attributeName="opacity" values="0;1" dur="0.1s" begin="2.5s" fill="freeze" />
          </path>

          {/* Route 3: Draws after Route 2 */}
          <path d="M 120,50 Q 135,70 140,85" strokeDasharray="40" strokeDashoffset="40">
            <animate attributeName="stroke-dashoffset" values="40;0" dur="1s" begin="2.6s" fill="freeze" />
          </path>
          <path d="M 132,78 L 140,85 L 130,88" opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.1s" begin="3.6s" fill="freeze" />
          </path>

        </g>
      </svg>
    </div>
  );
}