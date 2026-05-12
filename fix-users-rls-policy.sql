-- Fix Users Table RLS Policy for Admin Updates
-- Run this in Supabase SQL Editor

-- First, check if RLS is enabled on users table
-- If you see policies that might block admin updates, we need to fix them

-- Drop existing policies that might conflict (if any)
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;

-- Create new policies that allow admin to update any user

-- Policy 1: Allow all authenticated users to read all users
-- This is needed for login to work (to check role after auth)
CREATE POLICY "Enable read access for authenticated users"
ON users
FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to read

-- Policy 2: Users can update their own data
CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Admins can update all users
-- Using a simpler check that doesn't cause circular dependency
CREATE POLICY "Admins can update all users"
ON users
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- Note: The key change is Policy 1 now allows all authenticated users
-- to read the users table. This is necessary for the login flow to work
-- because after authentication, the app needs to read the user's role.

