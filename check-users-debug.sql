-- Check Users in Database
-- Run this in Supabase SQL Editor to debug login issues

-- 1. Check all users in users table
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM users
ORDER BY created_at DESC;

-- 2. Check if specific email exists
-- Replace 'your@email.com' with the email you're trying to login with
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM users
WHERE email = 'user@test.com';  -- Change this to your email

-- 3. Check auth.users (requires service role or run in Supabase Dashboard)
-- This shows users in Supabase Auth
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 4. Check if user exists in auth but not in users table (sync issue)
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  u.id as user_table_id,
  u.name,
  u.role
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;  -- Shows users in auth but not in users table

-- 5. If you need to manually add a user to users table
-- (Only if user exists in auth.users but not in users table)
/*
INSERT INTO users (id, email, name, role)
VALUES (
  'user-id-from-auth-users',  -- Get this from auth.users
  'user@test.com',
  'Test User',
  'user'
);
*/

-- 6. If you need to create a test user completely
-- This creates both auth user and users table entry
/*
-- First, register via the app's register page, OR
-- Use Supabase Dashboard > Authentication > Add User
-- Then the trigger should automatically create the users table entry
*/

-- 7. Check if there's a trigger to auto-create users table entry
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
   OR trigger_name LIKE '%user%';
