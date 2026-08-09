import { NextResponse } from 'next/server';

export async function POST(request) {
  const { text } = await request.json();
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
  if (!text) return NextResponse.json({ error: "Missing text to parse" }, { status: 400 });

  const prompt = `You are a fantasy football data extraction assistant. Analyze the following chat message.
Determine the type of question: 
- "trade" (if they are exchanging players/picks)
- "start" (if asking who to start/bench/sit)
- "chat" (if it is just a general comment without player strategy).

For players, extract their full real names (e.g., "Patrick Mahomes", "Christian McCaffrey"). 
For draft picks, format them strictly as "YYYY [1st/2nd/3rd] Round Pick" (e.g., "2027 1st Round Pick").

Return your response strictly in JSON format matching this schema:
{
  "type": "trade" | "start" | "chat",
  "sideA": ["Player 1", "Player 2"],
  "sideB": ["Player 3", "Pick 1"]
}

Message to parse: "${text}"`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" } // Forces strict JSON output
      })
    });

    const data = await response.json();
    
    if (data.error) {
       console.error("Gemini Error:", data.error);
       return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const resultText = data.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(resultText);

    return NextResponse.json(parsedData);
    
  } catch (error) {
    console.error("Failed to parse chat via Gemini:", error);
    return NextResponse.json({ error: "Failed to parse chat." }, { status: 500 });
  }
}