import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // FIX: Await the headers() function
    const headersList = await headers();
    
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Insert into Supabase
    const { error } = await supabase
      .from('reports')
      .insert({
        report_type: body.type,       // Matches frontend 'type'
        category: body.category,      // Matches frontend 'category'
        location: body.location,      // Matches frontend 'location'
        description: body.details,    // Matches frontend 'details'
        media_urls: body.mediaUrls,
        ip_address: ip,
        device_info: userAgent,
        status: 'pending'
      });

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}