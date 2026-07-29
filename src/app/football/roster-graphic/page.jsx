import React from 'react';
import RosterGraphicClient from './RosterGraphicClient';

export const metadata = {
  title: 'Roster Graphic Generator | FSAN',
  description: 'Generate and share your custom fantasy football roster graphic.',
};

export default function RosterGraphicPage() {
  return <RosterGraphicClient />;
}