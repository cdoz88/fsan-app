import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  const pageToken = searchParams.get('pageToken');

  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: "YouTube API key is missing from environment variables." }, { status: 500 });
  }

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId parameter." }, { status: 400 });
  }

  try {
    // Step 1: Look up the video to find its active live chat ID
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${API_KEY}`;
    const videoRes = await fetch(videoUrl);
    const videoData = await videoRes.json();

    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json({ error: "Video not found or is not a live stream." }, { status: 404 });
    }

    const liveChatId = videoData.items[0].liveStreamingDetails?.activeLiveChatId;
    
    if (!liveChatId) {
      return NextResponse.json({ error: "No active live chat found for this video." }, { status: 404 });
    }

    // Step 2: Fetch the actual chat messages using the live chat ID
    let chatUrl = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&maxResults=200&key=${API_KEY}`;
    
    // If we have a pageToken from a previous request, append it so we only get NEW messages
    if (pageToken) {
      chatUrl += `&pageToken=${pageToken}`;
    }

    const chatRes = await fetch(chatUrl);
    const chatData = await chatRes.json();

    if (chatData.error) {
       return NextResponse.json({ error: chatData.error.message }, { status: chatData.error.code });
    }

    // Step 3: Clean up the data before sending it to our frontend
    const formattedMessages = chatData.items.map(item => {
      const snippet = item.snippet;
      const author = item.authorDetails;
      
      // Determine if this is a Super Chat
      const isSuperChat = snippet.type === 'superChatEvent';
      let amount = null;
      let color = null;

      if (isSuperChat) {
        amount = snippet.superChatDetails.displayString;
        // YouTube assigns a tier (1-7) based on donation amount, we can map this to Tailwind colors later
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

    return NextResponse.json({
      messages: formattedMessages,
      nextPageToken: chatData.nextPageToken,
      pollingIntervalMillis: chatData.pollingIntervalMillis // YouTube tells us how long to wait before asking again
    });

  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json({ error: "Failed to fetch chat data." }, { status: 500 });
  }
}