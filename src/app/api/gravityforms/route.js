import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const formId = searchParams.get('formId');

  if (!formId) {
    return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
  }

  const consumerKey = process.env.GF_CONSUMER_KEY;
  const consumerSecret = process.env.GF_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
      console.warn("Gravity Forms API Keys are missing from environment variables.");
      return NextResponse.json({ error: 'Missing API Keys' }, { status: 500 });
  }

  try {
    // FIX: Pass keys as query parameters to bypass WordPress Core's Application Passwords interceptor
    const res = await fetch(`https://admin.fsan.com/wp-json/gf/v2/forms/${formId}?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 } // Cache the form structure for 60 seconds
    });

    if (!res.ok) {
       const errText = await res.text();
       console.error("GF GET Error:", errText);
       throw new Error('Failed to fetch form from WordPress');
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Gravity Forms Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { formId, ...formData } = body;

    if (!formId) {
      return NextResponse.json({ is_valid: false, message: 'Form ID is required' }, { status: 400 });
    }

    const consumerKey = process.env.GF_CONSUMER_KEY;
    const consumerSecret = process.env.GF_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        return NextResponse.json({ is_valid: false, message: 'Missing API Keys' }, { status: 500 });
    }

    // FIX: Pass keys as query parameters to bypass WordPress Core's Application Passwords interceptor
    const res = await fetch(`https://admin.fsan.com/wp-json/gf/v2/forms/${formId}/submissions?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Gravity Forms Submission Error:', error);
    return NextResponse.json({ is_valid: false, message: 'Internal Server Error' }, { status: 500 });
  }
}