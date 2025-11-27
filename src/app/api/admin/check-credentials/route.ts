import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
        // Get the token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('authToken')?.value;
    
        if (!token) {
            return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
    }
    
        // Verify the session and get user data
        const { data, error } = await verifySession(token);
    
        if (error || !data?.user) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    // Check if user has admin role
        const isAdmin = data.user.role && ['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(data.user.role);
    
    if (!isAdmin) {
            return NextResponse.json({ error: 'User is not an admin' }, { status: 403 });
    }
    
        // Return the token and user data for admin
    return NextResponse.json({
            token,
      user: {
                id: data.user.id,
                role: data.user.role,
                name: data.user.name,
                email: data.user.email
      }
    });
  } catch (error) {
    console.error('Error checking admin credentials:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 