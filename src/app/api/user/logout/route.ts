/* eslint-disable */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the session exists
    const { data: sessionData, error: sessionError } = await verifySession(token);
    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Delete the session from database
    const { error: deleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('token', token);

    if (deleteError) {
      console.error('Error deleting session:', deleteError);
      return NextResponse.json(
        { error: 'Failed to logout' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error in logout:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}