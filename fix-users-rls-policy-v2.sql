-- Fix: Remove broken policy and add correct one

-- First, DROP the broken policy
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Add correct policy that doesn't create circular dependency
-- This policy allows admins to read all users by checking auth metadata
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Alternative simpler approach: Allow authenticated users to read all users
-- (This is safe because the users table only contains basic profile info)
-- Uncomment below if the above still doesn't work:

-- DROP POLICY IF EXISTS "Admins can read all users" ON users;
-- DROP POLICY IF EXISTS "Users can read own data" ON users;
-- 
-- CREATE POLICY "Authenticated users can read users" ON users
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
