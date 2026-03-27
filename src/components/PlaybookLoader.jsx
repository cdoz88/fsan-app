import React from 'react';

export default function PlaybookLoader({ className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg width="150" height="120" viewBox="0 0 150 120" className="opacity-90">
        <defs>
          <filter id="chalky-loader">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        
        {/* Master Group: Sets the Chalky texture and hollow shapes */}
        <g filter="url(#chalky-loader)" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          
          {/* --- STATIC FORMATION: The Defense (Xs) --- */}
          <path d="
            M 61,66 L 69,74 M 69,66 L 61,74
            M 81,66 L 89,74 M 89,66 L 81,74
            M 36,66 L 44,74 M 44,66 L 36,74
            M 106,66 L 114,74 M 114,66 L 106,74
            M 71,51 L 79,59 M 79,51 L 71,59
            M 16,61 L 24,69 M 24,61 L 16,69
            M 126,61 L 134,69 M 134,61 L 126,69
            M 71,21 L 79,29 M 79,21 L 71,29
          " />

          {/* --- STATIC FORMATION: The Offense (Os) --- */}
          <circle cx="75" cy="80" r="4" />
          <circle cx="55" cy="80" r="4" />
          <circle cx="95" cy="80" r="4" />
          <circle cx="20" cy="80" r="4" />
          <circle cx="130" cy="80" r="4" />
          <circle cx="75" cy="95" r="4" />
          
          {/* --- THE ANIMATED PLAY ROUTES --- */}
          {/* Wrapped in a group so they gracefully fade away together before looping */}
          <g>
            <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.8;0.95;1" dur="4s" repeatCount="indefinite" />

            {/* Route 1: Left WR In (Draws 0s-1s) */}
            {/* The line traces down the arrow wing, then back UP the wing to the tip, guaranteeing perfect joints! */}
            <path d="M 20,75 Q 25,50 60,40 L 52,43 L 60,40 L 58,48" strokeDasharray="150" strokeDashoffset="150">
              <animate attributeName="stroke-dashoffset" values="150;0;0;150" keyTimes="0;0.25;0.99;1" dur="4s" repeatCount="indefinite" />
            </path>

            {/* Route 2: Right WR Post (Draws 1s-2s) */}
            <path d="M 130,75 Q 125,45 90,20 L 98,23 L 90,20 L 93,28" strokeDasharray="150" strokeDashoffset="150">
              <animate attributeName="stroke-dashoffset" values="150;150;0;0;150" keyTimes="0;0.25;0.5;0.99;1" dur="4s" repeatCount="indefinite" />
            </path>

            {/* Route 3: Left Guard Wheel (Draws 2s-3s) */}
            <path d="M 55,75 Q 40,65 30,30 L 37,36 L 30,30 L 28,39" strokeDasharray="150" strokeDashoffset="150">
              <animate attributeName="stroke-dashoffset" values="150;150;0;0;150" keyTimes="0;0.5;0.75;0.99;1" dur="4s" repeatCount="indefinite" />
            </path>
          </g>

        </g>
      </svg>
    </div>
  );
}