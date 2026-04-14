import { NextResponse } from 'next/server';

// Helper function to safely encode the API keys for Basic Auth
const getAuthHeaders = () => {
  const consumerKey = process.env.GF_CONSUMER_KEY;
  const consumerSecret = process.env.GF_CONSUMER_SECRET;
  
  if (!consumerKey || !consumerSecret) {
      console.warn("Gravity Forms API Keys are missing from environment variables.");
      return {};
  }
  
  const token = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  return {
    'Authorization': `Basic ${token}`,
    'Content-Type': 'application/json'
  };
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const formId = searchParams.get('formId');

  if (!formId) {
    return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://admin.fsan.com/wp-json/gf/v2/forms/${formId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      next: { revalidate: 60 } // Cache the form structure for 60 seconds
    });

    if (!res.ok) throw new Error('Failed to fetch form from WordPress');
    
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

    const res = await fetch(`https://admin.fsan.com/wp-json/gf/v2/forms/${formId}/submissions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Gravity Forms Submission Error:', error);
    return NextResponse.json({ is_valid: false, message: 'Internal Server Error' }, { status: 500 });
  }
}