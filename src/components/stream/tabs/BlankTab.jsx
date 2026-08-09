"use client";
import React from 'react';

export default function BlankTab({ title }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-black text-zinc-700 uppercase tracking-widest italic">{title}</h2>
        <p className="text-zinc-500 mt-2 font-bold tracking-widest text-sm uppercase">Camera Feed Area</p>
      </div>
    </div>
  );
}