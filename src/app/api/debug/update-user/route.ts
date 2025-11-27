/* eslint-disable */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, company_id } = await request.json();
    
    if (!email || !company_id) {
      return NextResponse.json({ error: 'Email and company_id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ company_id })
      .eq('email', email)
      .select(`
        *,
        companies(
          id,
          company_name
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}