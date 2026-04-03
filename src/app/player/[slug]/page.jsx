import React from 'react';
import Link from 'next/link';
import { ChevronLeft, PlayCircle, FileText, Mic, Video, User } from 'lucide-react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';

// --- DATA FETCHING ---

// 1. Fetch from ESPN APIs
async function getESPNPlayerData(playerName) {
  try {
    // A. Use ESPN's search API to find the exact player ID based on their name
    const searchRes = await fetch(`https://site.web.api.espn.com/apis/search/v2?query=${encodeURIComponent(playerName)}&limit=1`, { next: { revalidate: 3600 } });
    const searchData = await searchRes.json();
    
    const athleteResult = searchData?.results?.[0]?.contents?.find(c => c.url.includes('/player/'));
    if (!athleteResult) return null;

    // The URL looks like: ".../nfl/player/_/id/4332011/jalen-hurts" -> We extract "4332011"
    const urlParts = athleteResult.url.split('/');
    const idIndex = urlParts.indexOf('id') + 1;
    const playerId = urlParts[idIndex];

    if (!playerId) return null;

    // B. Fetch the massive payload of bio, stats, and team colors from ESPN Core API
    const playerRes = await fetch(`https://site.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${playerId}`, { next: { revalidate: 3600 } });
    const playerData = await playerRes.json();
    
    return playerData.athlete;
  } catch (error) {
    console.error("ESPN API Error:", error);
    return null;
  }
}

// 2. Fetch from your WordPress GraphQL
async function getPlayerContent(playerName) {
  const query = `
    query GetPlayerPosts {
      posts(where: {search: "${playerName}"}, first: 50) {
        nodes {
          id
          title
          excerpt
          date
          slug
          featuredImage { node { sourceUrl } }
          categories { nodes { name } }
          tags { nodes { name } }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://admin.fsan.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      next: { revalidate: 60 }
    });
    
    const json = await res.json();
    const posts = json?.data?.posts?.nodes || [];

    // Filter and map to match your existing app data structure
    return posts.map(post => {
      const cats = post.categories?.nodes?.map(c => c.name.toLowerCase()) || [];
      let type = 'article';
      if (cats.includes('video') || cats.includes('videos')) type = 'video';
      else if (cats.includes('short') || cats.includes('shorts')) type = 'short';
      else if (cats.includes('podcast') || cats.includes('podcasts')) type = 'podcast';

      let sport = 'All';
      if (cats.includes('football')) sport = 'Football';
      if (cats.includes('basketball')) sport = 'Basketball';
      if (cats.includes('baseball')) sport = 'Baseball';

      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        imageUrl: post.featuredImage?.node?.sourceUrl || null,
        type,
        sport,
        slug: post.slug
      };
    });
  } catch (error) {
    console.error("WP GraphQL Error:", error);
    return [];
  }
}

// --- SERVER COMPONENT ---

export default async function PlayerPage({ params }) {
  // Await the params object (Required in Next.js 15+)
  const { slug: rawSlug } = await params;
  
  // Convert "jalen-hurts" back into "Jalen Hurts"
  const playerName = rawSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Fetch data concurrently for speed
  const [espnData, content] = await Promise.all([
    getESPNPlayerData(playerName),
    getPlayerContent(playerName)
  ]);

  // Determine team colors (fallback to dark gray if ESPN fetch fails or player is a free agent)
  const primaryColor = espnData?.team?.color ? `#${espnData.team.color}` : '#374151';
  const secondaryColor = espnData?.team?.alternateColor ? `#${espnData.team.alternateColor}` : '#1f2937';
  const headshot = espnData?.headshot?.href || null;
  const teamLogo = espnData?.team?.logos?.[0]?.href || null;

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      <Sidebar currentPath={`/player/${rawSlug}`} activeSport="Football" />
      
      <div className="flex-1 flex flex-col relative min-w-0">
        <Header activeSport="Football" />
        
        <main className="flex-1 overflow-y-auto relative z-0 scrollbar-hide pb-24">
          
          {/* THE HERO HEADER */}
          <div className="relative w-full h-80 sm:h-96 md:h-[450px] flex items-end overflow-hidden">
            {/* Dynamic Background Gradient based on ESPN Team Colors */}
            <div 
              className="absolute inset-0 opacity-80" 
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            />
            {/* Dark fade overlay so text stays readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
            
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-8 flex items-end justify-between">
              
              {/* Left Side: Name and Info */}
              <div className="flex flex-col gap-4 max-w-3xl">
                <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-max mb-2">
                  <ChevronLeft size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Back to Hub</span>
                </Link>
                
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black italic tracking-tighter leading-none drop-shadow-2xl">
                  {playerName}
                </h1>
                
                {espnData && (
                  <div className="flex items-center gap-4 mt-2">
                    {teamLogo && <img src={teamLogo} alt={espnData.team.displayName} className="h-8 md:h-12 w-auto object-contain drop-shadow-lg" />}
                    <div className="flex items-center gap-3 font-bold text-sm md:text-base text-white/90">
                      <span className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">{espnData.position?.displayName || 'NFL'}</span>
                      {espnData.displayExperience && <span className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">Year {espnData.displayExperience}</span>}
                      {espnData.height && <span className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 hidden sm:block">{espnData.height}, {espnData.weight}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: High-Res Headshot */}
              {headshot ? (
                <img 
                  src={headshot} 
                  alt={playerName} 
                  className="hidden md:block absolute right-8 bottom-0 h-[110%] w-auto object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] z-10" 
                />
              ) : (
                <div className="hidden md:flex absolute right-8 bottom-0 h-64 w-64 bg-black/20 rounded-full items-center justify-center border-4 border-white/10 backdrop-blur-sm mb-8">
                  <User size={64} className="text-white/40" />
                </div>
              )}
            </div>
          </div>

          {/* THE CONTENT GRID */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
              <h2 className="text-2xl font-black uppercase tracking-wider">Latest on {playerName.split(' ')[0]}</h2>
            </div>

            {content.length === 0 ? (
              <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest border border-dashed border-gray-800 rounded-2xl">
                No recent coverage found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {content.map(item => (
                  <div key={item.id} className="group cursor-pointer bg-[#111] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-colors shadow-xl flex flex-col h-full">
                    <div className="w-full aspect-video bg-gray-900 relative overflow-hidden shrink-0">
                      {item.imageUrl && <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                      
                      <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                        {item.type === 'video' || item.type === 'short' ? <Video size={12} className="text-white" /> : item.type === 'podcast' ? <Mic size={12} className="text-white" /> : <FileText size={12} className="text-white" />}
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white">{item.type}</span>
                      </div>
                      
                      {(item.type === 'video' || item.type === 'podcast') && (
                        <PlayCircle size={32} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10" />
                      )}
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{item.date}</span>
                      <h3 className="font-black text-base text-gray-200 group-hover:text-white transition-colors leading-tight line-clamp-3 mb-2" dangerouslySetInnerHTML={{ __html: item.title }} />
                      <p className="text-xs text-gray-400 line-clamp-2 mt-auto" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}