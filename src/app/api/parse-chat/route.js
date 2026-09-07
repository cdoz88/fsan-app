import { NextResponse } from 'next/server';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
CRITICAL RULE 3: For defenses, you MUST output the team abbreviation followed by the word "Defense" (e.g., "DAL Defense", "BUF Defense", "SF Defense").

For draft picks, format them strictly as "YYYY [1st/2nd/3rd] Round Pick" (e.g., "2027 1st Round Pick").

Return your response STRICTLY in JSON format matching this exact schema:
{
  "type": "trade",
  "sideA": ["Patrick Mahomes", "DAL Defense"],
  "sideB": ["Josh Allen", "2026 1st Round Pick"]
}`;

    // Endpoint locked to gemini-3.6-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${API_KEY}`;
    
    let data;
    let success = false;
    let retries = 3;
    let delay = 2000; 

    for (let i = 0; i < retries; i++) {
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

      data = await response.json();

      if (response.ok && !data.error) {
        success = true;
        break; 
      }

      const errorMessage = data.error?.message || "";
      
      if (response.status === 429 || response.status === 503 || errorMessage.toLowerCase().includes("high demand") || errorMessage.toLowerCase().includes("overloaded")) {
        console.warn(`Gemini API high demand. Retrying in ${delay/1000}s... (Attempt ${i + 1} of ${retries})`);
        await sleep(delay);
        delay *= 2; 
      } else {
        break; 
      }
    }

    if (!success) {
       console.error("Gemini API Error Detail:", data.error || data);
       return NextResponse.json({ error: data.error?.message || "Gemini API error after retries" }, { status: 400 });
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