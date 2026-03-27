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
          
          {/* --- STATIC FORMATION: The Xs --- */}
          <path d="M 10,15 L 25,35 M 25,15 L 10,35" />
          <path d="M 45,55 L 60,75 M 60,55 L 45,75" />
          <path d="M 120,20 L 135,40 M 135,20 L 120,40" />

          {/* --- STATIC FORMATION: The Os --- */}
          <circle cx="85" cy="25" r="8" />
          <circle cx="30" cy="85" r="8" />
          <circle cx="110" cy="65" r="8" />
          
          {/* --- THE ANIMATED PLAY ROUTES --- */}
          {/* Arrowheads are now baked directly into the path string so they draw fluidly! */}
          
          {/* Route 1: Draws 0s-1s */}
          <path d="M 35,25 Q 55,5 75,25 L 65,17 M 75,25 L 65,28" strokeDasharray="72" strokeDashoffset="72">
            <animate attributeName="stroke-dashoffset" values="72;0;0;72" keyTimes="0;0.25;0.75;1" dur="4s" repeatCount="indefinite" />
          </path>

          {/* Route 2: Draws 1s-2s */}
          <path d="M 55,65 Q 80,85 100,70 L 90,75 M 100,70 L 92,60" strokeDasharray="77" strokeDashoffset="77">
            <animate attributeName="stroke-dashoffset" values="77;77;0;0;77" keyTimes="0;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite" />
          </path>

          {/* Route 3: Draws 2s-3s */}
          <path d="M 120,50 Q 135,70 140,85 L 132,75 M 140,85 L 145,76" strokeDasharray="64" strokeDashoffset="64">
            <animate attributeName="stroke-dashoffset" values="64;64;0;64" keyTimes="0;0.5;0.75;1" dur="4s" repeatCount="indefinite" />
          </path>

        </g>
      </svg>
    </div>
  );
}