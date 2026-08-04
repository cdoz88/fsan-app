// src/app/dno/layout.jsx

export const metadata = {
    title: 'Draft Night Out | The Ultimate Fantasy Football Event',
    icons: {
      icon: 'https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp?v=dno2026',
      shortcut: 'https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp?v=dno2026',
      apple: 'https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp?v=dno2026',
    },
  };
  
  export default function DNOLayout({ children }) {
    // This simply wraps all /dno pages and applies the metadata above
    return <>{children}</>;
  }