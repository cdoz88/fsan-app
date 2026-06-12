import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import { LeagueProvider } from "../context/LeagueContext"; // 🚀 NEW: Import LeagueProvider
import Script from "next/script";

export const metadata = {
  title: "FSAN",
  description: "Win your league with real-time advice.",
  icons: {
    icon: "https://admin.fsan.com/wp-content/uploads/2025/05/App-Icons-Border.webp",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#121212] text-gray-200 antialiased">
        <AuthProvider>
          <LeagueProvider> {/* 🚀 NEW: Wrap children inside the LeagueProvider */}
            {children}
          </LeagueProvider>
        </AuthProvider>
        
        {/* Global Cookie Consent Banner */}
        <Script 
          src="https://gettermscmp.com/cookie-consent/embed/93026241-b406-4893-89b5-fc79b921911f/en-us?auto=true"
          strategy="afterInteractive"
        />

        {/* Google Analytics Tracking */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-JGTB7799SM" 
          strategy="afterInteractive" 
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-JGTB7799SM', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </body>
    </html>
  );
}