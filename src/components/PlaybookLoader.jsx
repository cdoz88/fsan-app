import React from 'react';

export default function PlaybookLoader({ className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg width="100" height="50" viewBox="0 0 100 50" className="opacity-80">
        <defs>
          <filter id="chalky-loader">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#chalky-loader)" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* The X */}
          <path d="M 10,15 L 25,35 M 25,15 L 10,35" className="text-white" />
          
          {/* The O */}
          <circle cx="85" cy="25" r="8" className="text-white" />
          
          {/* The Animated Play Route (Arrow) */}
          <path d="M 35,25 Q 60,5 75,25" className="text-red-500" strokeDasharray="60" strokeDashoffset="60">
            <animate attributeName="stroke-dashoffset" values="60;0" dur="1.2s" repeatCount="indefinite" />
          </path>
          
          {/* Arrow Head */}
          <path d="M 68,17 L 77,25 L 65,31" className="text-red-500" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    </div>
  );
}