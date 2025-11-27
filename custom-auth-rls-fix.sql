-- Fix RLS policies for custom auth system

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own complaints" ON complaints;
DROP POLICY IF EXISTS "Users can insert own complaints" ON complaints;

-- Disable RLS temporarily for testing
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;

-- Or create new policies that work without Supabase auth
-- (Enable these if you want RLS with custom auth)
/*
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict later)
CREATE POLICY "Allow all operations on complaints" ON complaints
  FOR ALL USING (true);
*/