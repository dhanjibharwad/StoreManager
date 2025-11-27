/* eslint-disable */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { invite_token } = await request.json();

    // Get invitation details
    const { data: invitation, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('invite_token', invite_token)
      .eq('status', 'pending')
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    // Check if invitation expired
    if (new Date() > new Date(invitation.expires_at)) {
      return NextResponse.json(
        { success: false, message: 'Invitation has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      invitation: {
        email: invitation.email,
        role: invitation.role,
        company_id: invitation.company_id
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}