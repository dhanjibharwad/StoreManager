import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all brand slider entries
    const { data: brandSliders, error: fetchError } = await supabase
      .from('brand_slider')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching brand sliders:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch brand sliders' }, { status: 500 });
    }

    return NextResponse.json({ brandSliders });
  } catch (error) {
    console.error('Error in brand slider API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 