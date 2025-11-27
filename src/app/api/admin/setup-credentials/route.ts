/* eslint-disable */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { userId, role, adminPassword } = await request.json();
    
    if (!userId || !adminPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Hash the admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Get user information
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Determine which table to use and whether we need to update user role
    let tableName: string;
    let updateRole = false;
    let newRole = role;
    
    if (!role || !['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(userData.role)) {
      // If no role specified or user doesn't have a valid admin role, set default
      newRole = role || 'rentaladmin'; // Default to rentaladmin if no role specified
      updateRole = true;
    } else {
      newRole = userData.role; // Use existing valid role
    }
    
    tableName = `${newRole}_credentials`;
    
    // Update user role if needed
    if (updateRole) {
      const { error: roleUpdateError } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (roleUpdateError) {
        console.error('Error updating user role:', roleUpdateError);
        return NextResponse.json(
          { error: 'Failed to update user role' },
          { status: 500 }
        );
      }
    }
    
    // Check if credentials already exist
    const { data: existingCreds, error: existingError } = await supabase
      .from(tableName)
      .select('id')
      .eq('user_id', userId);
    
    if (existingCreds && existingCreds.length > 0) {
      // Update existing credentials with hashed password
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ admin_password: hashedPassword, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating admin credentials:', updateError);
        return NextResponse.json(
          { error: 'Failed to update admin credentials' },
          { status: 500 }
        );
      }
    } else {
      // Insert new credentials with hashed password
      const { error: insertError } = await supabase
        .from(tableName)
        .insert([
          { 
            user_id: userId,
            admin_password: hashedPassword
          }
        ]);
      
      if (insertError) {
        console.error('Error creating admin credentials:', insertError);
        return NextResponse.json(
          { error: 'Failed to create admin credentials' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: true,
        role: newRole
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error setting up admin credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 