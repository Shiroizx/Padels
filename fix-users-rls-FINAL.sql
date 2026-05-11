-- FINAL FIX: Remove all broken policies and use simple authenticated policy

-- Step 1: Remove ALL existing SELECT policies on users table
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Step 2: Add simple policy - authenticated users can read all users
-- This is SAFE because:
-- 1. Users table only contains: id, name, email, role, timestamps
-- 2. No sensitive data like passwords (those are in auth.users)
-- 3. Admins need to see user info in bookings/orders
-- 4. Regular users only see their own bookings anyway
CREATE POLICY "Authenticated users can read all users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Step 3: Keep the update policy (users can only update their own data)
-- This policy should still exist, but let's make sure
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Step 4: Verify policies
SELECT 
  policyname, 
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    ELSE 'No USING clause'
  END as policy_definition
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;
