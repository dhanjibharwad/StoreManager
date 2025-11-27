/* eslint-disable */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { invite_token, user_id } = await request.json();
    console.log('Accept invite request:', { invite_token, user_id });

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('invite_token', invite_token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      console.log('Invitation not found:', { inviteError, invitation });
      return NextResponse.json(
        { success: false, message: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }
    console.log('Found invitation:', invitation);

    // Check if invitation expired
    if (new Date() > new Date(invitation.expires_at)) {
      return NextResponse.json(
        { success: false, message: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Update user with company details
    const { error: updateError } = await supabase
      .from('users')
      .update({
        role: invitation.role,
        company_id: invitation.company_id,
        phone: invitation.phone || null
      })
      .eq('id', user_id);

    if (updateError) {
      console.log('User update error:', updateError);
      throw updateError;
    }
    console.log('User updated successfully');

    // Mark invitation as accepted
    await supabase
      .from('user_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    // Get updated user data with company info
    const { data: updatedUser } = await supabase
      .from('users')
      .select(`
        *,
        companies(
          id,
          company_name
        )
      `)
      .eq('id', user_id)
      .single();

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation accepted successfully',
      user: updatedUser
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}