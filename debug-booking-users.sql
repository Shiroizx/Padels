-- Debug: Check if booking users exist in users table

-- Check all bookings and their user_id
SELECT 
  b.id as booking_id,
  b.user_id,
  b.booking_name,
  b.booking_date,
  u.name as user_name,
  u.email as user_email,
  CASE 
    WHEN u.id IS NULL THEN 'USER NOT FOUND'
    ELSE 'OK'
  END as status
FROM bookings b
LEFT JOIN users u ON u.id = b.user_id
ORDER BY b.id;

-- Check if there are orphaned bookings (user_id not in users table)
SELECT 
  b.id,
  b.user_id,
  b.booking_name
FROM bookings b
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = b.user_id
);

-- Check all users
SELECT id, name, email, role FROM users;
