import { headers } from 'next/headers';
import { AlertTriangle } from 'lucide-react';

export default function DNOLayout({ children }) {
  // Read the custom header injected by our middleware
  const headersList = headers();
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
    </div>
  );
}