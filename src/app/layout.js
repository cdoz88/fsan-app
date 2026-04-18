import "./globals.css";
import AuthProvider from "../components/AuthProvider";
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
          {children}
        </AuthProvider>
        
        {/* Global Cookie Consent Banner */}
        <Script 
          src="https://gettermscmp.com/cookie-consent/embed/93026241-b406-4893-89b5-fc79b921911f/en-us?auto=true"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}