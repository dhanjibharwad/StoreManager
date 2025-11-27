import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySession } from '@/lib/auth';

export async function DELETE(request: Request) {
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
    
    // Verify the session
    const { data: sessionData, error: sessionError } = await verifySession(token);
    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Delete user's sessions
    const { error: sessionDeleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('user_id', sessionData.user.id);

    if (sessionDeleteError) {
      console.error('Error deleting user sessions:', sessionDeleteError);
    }

    // Delete user's rental properties
    const { error: rentalDeleteError } = await supabase
      .from('rental_properties')
      .delete()
      .eq('user_id', sessionData.user.id);

    if (rentalDeleteError) {
      console.error('Error deleting rental properties:', rentalDeleteError);
    }

    // Delete user's buy/sell products
    const { error: buysellDeleteError } = await supabase
      .from('buysell_products')
      .delete()
      .eq('user_id', sessionData.user.id);

    if (buysellDeleteError) {
      console.error('Error deleting buy/sell products:', buysellDeleteError);
    }

    // Delete user's events
    const { error: eventDeleteError } = await supabase
      .from('event_details')
      .delete()
      .eq('user_id', sessionData.user.id);

    if (eventDeleteError) {
      console.error('Error deleting events:', eventDeleteError);
    }

    // Delete user's drafts
    const { error: draftDeleteError } = await supabase
      .from('rental_property_drafts')
      .delete()
      .eq('user_id', sessionData.user.id);

    if (draftDeleteError) {
      console.error('Error deleting rental drafts:', draftDeleteError);
    }

    const { error: buysellDraftDeleteError } = await supabase
      .from('buysell_product_drafts')
      .delete()
      .eq('user_id', sessionData.user.id);

    if (buysellDraftDeleteError) {
      console.error('Error deleting buy/sell drafts:', buysellDraftDeleteError);
    }

    const { error: eventDraftDeleteError } = await supabase
      .from('event_details_drafts')
      .delete()
      .eq('user_id', sessionData.user.id);

    if (eventDraftDeleteError) {
      console.error('Error deleting event drafts:', eventDraftDeleteError);
    }

    // Delete the user
    const { error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', sessionData.user.id);

    if (userDeleteError) {
      console.error('Error deleting user:', userDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error in account deletion:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 