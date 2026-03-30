import "./globals.css";

export const metadata = {
  title: "FSAN",
  description: "Win your league with real-time advice.",
  icons: {
    icon: "https://fsan.com/wp-content/uploads/2025/05/App-Icons-Border.webp",
  },
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