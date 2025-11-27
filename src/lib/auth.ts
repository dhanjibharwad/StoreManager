import { supabase } from './supabase';

// Interface for user data
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  role?: string; // Optional field for user role
  company_id?: string;
  company_name?: string;
}

// Check if user with email or phone already exists
export async function checkUserExists(email: string, phone: string | null) {
  try {
    let query = supabase
      .from('users')
      .select('email, phone');
    
    // Build query based on provided parameters
    if (phone) {
      query = query.or(`email.eq.${email},phone.eq.${phone}`);
    } else {
      query = query.eq('email', email);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error checking existing user:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return { exists: false };
    }
    
    // Determine which field(s) already exist
    const emailExists = data.some(user => user.email === email);
    const phoneExists = phone ? data.some(user => user.phone === phone) : false;
    
    let existingField = '';
    if (emailExists && phoneExists) {
      existingField = 'both';
    } else if (emailExists) {
      existingField = 'email';
    } else if (phoneExists) {
      existingField = 'phone';
    }
    
    return { 
      exists: true,
      existingField
    };
  } catch (error) {
    console.error('Error checking user existence:', error);
    return { exists: false }; // Default to not existing in case of error
  }
}

// Custom sign up function
export async function signUp(name: string, email: string, phone: string | null, password: string, companyId?: string | null, role?: string, inviteToken?: string | null) {
  try {
    // Make API call to server-side register endpoint
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        phone: phone || null,
        password,
        verified: true, // Flag to indicate verification is already complete
        company_id: companyId,
        role: role || 'user',
        invite_token: inviteToken
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error };
    }

    return result;
  } catch (error) {
    console.error('Error signing up:', error);
    return { error };
  }
}

// Sign in function
export async function signIn(email: string, password: string) {
  try {
    // Make API call to server-side login endpoint
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error };
    }

    return result;
  } catch (error) {
    console.error('Error signing in:', error);
    return { error };
  }
}

// Verify OTP
export async function verifyOTP(userId: string, type: 'email' | 'phone', otp: string) {
  try {
    // Make API call to server-side verification endpoint
    const endpoint = type === 'email' ? '/api/auth/verify-email' : '/api/auth/verify-phone';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        otp,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error };
    }

    return result;
  } catch (error) {
    console.error(`Error verifying ${type} OTP:`, error);
    return { error };
  }
}

// Verify session directly using Supabase
export async function verifySession(token: string) {
  try {
    // First, check if token is empty or undefined
    if (!token) {
      return { error: { message: 'No token provided' } };
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .select(`
        *,
        users(
          *,
          companies(
            id,
            company_name
          )
        )
      `)
      .eq('token', token)
      .single();
    
    if (error || !session) {
      return { error: { message: 'Invalid session' } };
    }
    
    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Optional: Delete expired session
      await supabase
        .from('sessions')
        .delete()
        .eq('token', token);

      return { error: { message: 'Session expired' } };
    }
    
    // Prepare user data, excluding sensitive information
    const userData: User = {
      id: session.users.id,
      name: session.users.name,
      email: session.users.email,
      phone: session.users.phone,
      is_email_verified: session.users.is_email_verified,
      is_phone_verified: session.users.is_phone_verified,
      role: session.users.role,
      company_id: session.users.company_id,
      company_name: session.users.companies?.company_name
    };

    return { data: { user: userData, session } };
  } catch (error) {
    console.error('Error verifying session:', error);
    return { error: { message: 'An unexpected error occurred during session verification' } };
  }
}

// Sign out
export async function signOut(token: string) {
  try {
    await supabase
      .from('sessions')
      .delete()
      .eq('token', token);
    
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
} 