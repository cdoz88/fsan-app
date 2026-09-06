import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text } = await request.json();
    
    const API_KEY = process.env.GEMINI_API_KEY?.trim();

    if (!API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key in .env.local" }, { status: 500 });
    }
    if (!text) {
      return NextResponse.json({ error: "Missing text to parse" }, { status: 400 });
    }

    const prompt = `You are a fantasy football data extraction assistant. Analyze the following chat message.
Determine the type of question: 
- "trade" (if they are exchanging players/picks)
- "start" (if asking who to start/bench/sit/pick/choose)
- "chat" (if it is just a general comment).

CRITICAL RULE 1: If the user mentions ANY NFL player names, you MUST extract them into the "sideA" or "sideB" arrays. Do this even if you classify the type as "chat".
CRITICAL RULE 2: You MUST output the player's FULL real-world NFL name (First and Last). If the user types a nickname or last name like "Mahomes", "CMC", "Sun God", or "Allen", you MUST convert it to "Patrick Mahomes", "Christian McCaffrey", "Amon-Ra St. Brown", or "Josh Allen".

For draft picks, format them strictly as "YYYY [1st/2nd/3rd] Round Pick" (e.g., "2027 1st Round Pick").

Return your response STRICTLY in JSON format matching this exact schema:
{
  "type": "trade",
  "sideA": ["Patrick Mahomes"],
  "sideB": ["Josh Allen"]
}`;

    // Updated to the correct active model: gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { text: `Message to parse: "${text}"` } 
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok || data.error) {
       console.error("Gemini API Error Detail:", data.error || data);
       return NextResponse.json({ error: data.error?.message || "Gemini API error" }, { status: 400 });
    }

    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return NextResponse.json({ type: "chat", sideA: [], sideB: [] });
    }

    let cleanedText = candidateText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({
      type: parsedData.type || "chat",
      sideA: Array.isArray(parsedData.sideA) ? parsedData.sideA : (Array.isArray(parsedData.sidea) ? parsedData.sidea : []),
      sideB: Array.isArray(parsedData.sideB) ? parsedData.sideB : (Array.isArray(parsedData.sideb) ? parsedData.sideb : [])
    });
    
  } catch (error) {
    console.error("Failed to parse chat via Gemini Route:", error);
    return NextResponse.json({ error: error.message || "Failed to parse chat." }, { status: 500 });
  }
}