import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://esscthuidflieorlhtgr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzc2N0aHVpZGZsaWVvcmxodGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjI3NjcsImV4cCI6MjA2NjMzODc2N30.sSrclH1XmMCvo7t6FDtHvkyx--SbSdUtv2eq7TBrwLo';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzc2N0aHVpZGZsaWVvcmxodGdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2Mjc2NywiZXhwIjoyMDY2MzM4NzY3fQ.rNv_pZD5lLaOSGEX-httgthwtz6-qhea4RC9JEiUN8E';

// Validate required environment variables
if (!supabaseUrl || supabaseUrl === 'undefined') {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
}

// Create a Supabase client with the anon key for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create admin client only if service role key is available
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null; 