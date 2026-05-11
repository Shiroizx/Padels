-- Fix: Create missing users from auth.users

-- Step 1: Check which users are missing
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'name' as name,
  CASE 
    WHEN u.id IS NULL THEN 'MISSING IN users TABLE'
    ELSE 'EXISTS'
  END as status
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
WHERE u.id IS NULL;

-- Step 2: Insert missing users into users table
INSERT INTO users (id, name, email, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'User') as name,
  au.email,
  'user' as role
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify all users now exist
SELECT 
  b.id as booking_id,
  b.user_id,
  u.name as user_name,
  u.email as user_email
FROM bookings b
LEFT JOIN users u ON u.id = b.user_id
ORDER BY b.id;
