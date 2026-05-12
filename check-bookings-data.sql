-- Check bookings data to debug why revenue is 0

-- 1. Check all bookings with their total_price
SELECT 
  id,
  customer_name,
  total_price,
  status,
  created_at,
  payment_proof
FROM bookings
ORDER BY created_at DESC;

-- 2. Check if total_price column exists and its type
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings' 
  AND column_name = 'total_price';

-- 3. Count bookings with null total_price
SELECT 
  COUNT(*) as total_bookings,
  COUNT(total_price) as bookings_with_price,
  COUNT(*) - COUNT(total_price) as bookings_without_price
FROM bookings;

-- 4. Sum of all booking revenue
SELECT 
  SUM(total_price) as total_booking_revenue,
  AVG(total_price) as avg_booking_price,
  MIN(total_price) as min_price,
  MAX(total_price) as max_price
FROM bookings
WHERE total_price IS NOT NULL;

-- 5. Check bookings by status
SELECT 
  status,
  COUNT(*) as count,
  SUM(total_price) as revenue
FROM bookings
GROUP BY status;
