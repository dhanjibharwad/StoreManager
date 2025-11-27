/* eslint-disable */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { adminPassword } = await request.json();
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password is required' },
        { status: 400 }
      );
    }
    
    // Find admin by password across all admin tables
    let adminUser = null;
    let adminRole = null;
    
    // Helper function to check password against a table
    async function checkAdminTable(tableName: string, role: string) {
      // Get all records from the table instead of just one
      const { data, error } = await supabase
        .from(tableName)
        .select('*, users(*)');
      
      if (data && data.length > 0) {
        // Check each record for password match
        for (const record of data) {
          try {
            const passwordMatches = await bcrypt.compare(adminPassword, record.admin_password);
        if (passwordMatches) {
              return { user: record.users, role };
            }
          } catch (err) {
            console.error(`Error comparing passwords for ${tableName}:`, err);
          }
        }
      }
      return null;
    }
    
    // Check superadmin credentials
    const superadminResult = await checkAdminTable('superadmin_credentials', 'superadmin');
    if (superadminResult) {
      adminUser = superadminResult.user;
      adminRole = superadminResult.role;
    } else {
      // Check rentaladmin credentials
      const rentaladminResult = await checkAdminTable('rentaladmin_credentials', 'rentaladmin');
      if (rentaladminResult) {
        adminUser = rentaladminResult.user;
        adminRole = rentaladminResult.role;
      } else {
        // Check eventadmin credentials
        const eventadminResult = await checkAdminTable('eventadmin_credentials', 'eventadmin');
        if (eventadminResult) {
          adminUser = eventadminResult.user;
          adminRole = eventadminResult.role;
        } else {
          // Check ecomadmin credentials
          const ecomadminResult = await checkAdminTable('ecomadmin_credentials', 'ecomadmin');
          if (ecomadminResult) {
            adminUser = ecomadminResult.user;
            adminRole = ecomadminResult.role;
          }
        }
      }
    }
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Invalid admin password' },
        { status: 401 }
      );
    }
    
    // Verify that user role matches the credential table
    if (adminUser.role !== adminRole) {
      // Update user role to match credential table
      const { error: roleUpdateError } = await supabase
        .from('users')
        .update({ role: adminRole })
        .eq('id', adminUser.id);
      
      if (roleUpdateError) {
        console.error('Error updating user role:', roleUpdateError);
      }
    }
    
    // Create session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Create session
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([
        {
          user_id: adminUser.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
        }
      ]);
    
    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }
    
    // Return user data and session token
    return NextResponse.json({
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: adminRole
      },
      session: {
        token: sessionToken,
        expires_at: expiresAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error during direct admin login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Function to generate a session token
function generateSessionToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
} 