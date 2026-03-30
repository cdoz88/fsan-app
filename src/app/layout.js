import "./globals.css";

export const metadata = {
  title: "Fantasy Sports Advice Network",
  description: "Win your league with real-time advice.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#121212] text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}