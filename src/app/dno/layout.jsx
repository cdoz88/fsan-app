import { headers } from 'next/headers';
import { AlertTriangle } from 'lucide-react';
import DNOFooter from '../../components/dno/DNOFooter';

// This explicitly overrides the root FSAN metadata for all DNO pages
export const metadata = {
  title: 'Draft Night Out | The Biggest Fantasy Hang of the Year',
  description: 'Secure your seat at one of our live Draft Night Out events, or build your championship roster from home in our exclusive online divisions.',
  icons: {
    // This overrides the FSAN favicon with the DNO logo
    icon: 'https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp',
    apple: 'https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp',
  },
};

export default async function DNOLayout({ children }) {
  // Await the headers to prevent Next.js dynamic rendering crashes
  const headersList = await headers();
  const isRestricted = headersList.get('x-dno-restricted-state') === 'true';

  return (
    <div className="relative min-h-screen flex flex-col bg-[#09090b]">
      {/* Conditionally Render the Restricted State Banner */}
      {isRestricted && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-center text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 z-[100] shadow-md">
          <AlertTriangle size={16} className="shrink-0" />
          <span>Viewing Only: Real-money play and registration are not available in your region.</span>
        </div>
      )}
      
      {/* The rest of the DNO application */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Global Footer */}
      <DNOFooter />
    </div>
  );
}