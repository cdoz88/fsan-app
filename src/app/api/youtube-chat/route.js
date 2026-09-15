import { NextResponse } from 'next/server';

// --- IN-MEMORY CACHE SHIELD ---
// This acts as our server-side shield to protect our YouTube API Quota.
// Because it is defined outside the GET function, it persists across requests.
let chatCache = {
  lastFetchTime: 0,
  data: [],
  activeVideoId: null,
  nextPageToken: null,
  liveChatId: null
};

// YouTube enforces a strict minimum polling interval. 
// We set our shield to strictly prevent any external calls faster than 5 seconds.
const MIN_POLLING_INTERVAL_MS = 5000;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  const pageToken = searchParams.get('pageToken');
  let liveChatId = searchParams.get('liveChatId');

  const API_KEY = process.env.YOUTUBE_API_KEY?.trim();

  if (!API_KEY) {
    return NextResponse.json({ error: "YouTube API key is missing from environment variables." }, { status: 500 });
  }

  if (!videoId && !liveChatId) {
    return NextResponse.json({ error: "Missing videoId or liveChatId parameter." }, { status: 400 });
  }

  const now = Date.now();

  // CACHE INTERCEPTION: If requested within 5 seconds for the same video, intercept it!
  if (
    chatCache.activeVideoId === videoId &&
    chatCache.data &&
    (now - chatCache.lastFetchTime < MIN_POLLING_INTERVAL_MS)
  ) {
    // Return an empty messages array so the frontend doesn't process duplicates, 
    // but return the valid nextPageToken to keep the loop healthy.
    return NextResponse.json({
      messages: [], 
      nextPageToken: chatCache.nextPageToken || pageToken,
      pollingIntervalMillis: MIN_POLLING_INTERVAL_MS,
      liveChatId: chatCache.liveChatId || liveChatId,
      cached: true // Flag to let us know the shield worked
    });
  }

  try {
    // 1. Resolve liveChatId if not provided by the client
    if (!liveChatId || liveChatId === 'null') {
      
      // Check our cache first to save a network request
      if (chatCache.activeVideoId === videoId && chatCache.liveChatId) {
        liveChatId = chatCache.liveChatId;
      } else {
        // Only request 'liveStreamingDetails' (cuts API unit cost in half)
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${API_KEY}`;
        
        // Cache the video-to-chatId resolution for 30 minutes (1800s) across serverless function invocations
        const videoRes = await fetch(videoUrl, { next: { revalidate: 1800 } });
        const videoData = await videoRes.json();

        if (videoData.error) {
           return NextResponse.json({ error: `Google API Error: ${videoData.error.message}` }, { status: 500 });
        }

        if (!videoData.items || videoData.items.length === 0) {
          return NextResponse.json({ error: "Video not found or is not a live stream." }, { status: 404 });
        }

        liveChatId = videoData.items[0].liveStreamingDetails?.activeLiveChatId;
        
        if (!liveChatId) {
          return NextResponse.json({ error: "No active live chat found for this video. Stream may have ended or chat is disabled." }, { status: 404 });
        }
      }
    }

    // 2. Fetch Chat Messages (1 quota unit)
    let chatUrl = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&maxResults=200&key=${API_KEY}`;
    
    // Use the token passed from the client, or fallback to our cached token
    const tokenToUse = (pageToken && pageToken !== 'null') ? pageToken : chatCache.nextPageToken;
    if (tokenToUse) {
      chatUrl += `&pageToken=${tokenToUse}`;
    }

    // Bypasses caching for live chat messages so we actually hit YouTube
    const chatRes = await fetch(chatUrl, { cache: 'no-store' });
    const chatData = await chatRes.json();

    if (chatData.error) {
       return NextResponse.json({ error: `Chat Fetch Error: ${chatData.error.message}` }, { status: chatData.error.code || 500 });
    }

    const formattedMessages = (chatData.items || []).map(item => {
      const snippet = item.snippet;
      const author = item.authorDetails;
      
      const isSuperChat = snippet.type === 'superChatEvent';
      let amount = null;
      let color = null;

      if (isSuperChat && snippet.superChatDetails) {
        amount = snippet.superChatDetails.displayString;
        const tier = snippet.superChatDetails.tier; 
        color = `tier-${tier}`; 
      }

      return {
        id: item.id,
        user: author.displayName,
        avatar: author.profileImageUrl,
        text: snippet.displayMessage,
        isSuperChat: isSuperChat,
        amount: amount,
        youtubeColorTier: color,
        publishedAt: snippet.publishedAt
      };
    });

    // 3. Update the Server Cache Shield
    chatCache = {
      lastFetchTime: Date.now(),
      data: formattedMessages,
      activeVideoId: videoId,
      nextPageToken: chatData.nextPageToken,
      liveChatId: liveChatId
    };

    return NextResponse.json({
      messages: formattedMessages,
      nextPageToken: chatData.nextPageToken,
      pollingIntervalMillis: chatData.pollingIntervalMillis || MIN_POLLING_INTERVAL_MS,
      liveChatId: liveChatId,
      cached: false
    });

  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json({ error: "Failed to fetch chat data." }, { status: 500 });
  }
}