import { NextResponse } from 'next/server';

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
    return NextResponse.json({ error: "Missing videoId parameter." }, { status: 400 });
  }

  try {
    if (!liveChatId) {
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}&key=${API_KEY}`;
      const videoRes = await fetch(videoUrl);
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

    let chatUrl = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&maxResults=200&key=${API_KEY}`;
    
    if (pageToken) {
      chatUrl += `&pageToken=${pageToken}`;
    }

    const chatRes = await fetch(chatUrl);
    const chatData = await chatRes.json();

    if (chatData.error) {
       return NextResponse.json({ error: `Chat Fetch Error: ${chatData.error.message}` }, { status: chatData.error.code || 500 });
    }

    const formattedMessages = chatData.items.map(item => {
      const snippet = item.snippet;
      const author = item.authorDetails;
      
      const isSuperChat = snippet.type === 'superChatEvent';
      let amount = null;
      let color = null;

      if (isSuperChat) {
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

    return NextResponse.json({
      messages: formattedMessages,
      nextPageToken: chatData.nextPageToken,
      pollingIntervalMillis: chatData.pollingIntervalMillis,
      liveChatId: liveChatId
    });

  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json({ error: "Failed to fetch chat data." }, { status: 500 });
  }
}