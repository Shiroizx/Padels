-- Debug: Check storage files and database records

-- Check orders table payment_proof values
SELECT 
  id,
  payment_proof,
  status,
  created_at
FROM orders
WHERE payment_proof IS NOT NULL
ORDER BY id;

-- Check if files exist in storage.objects table
SELECT 
  name,
  bucket_id,
  created_at
FROM storage.objects
WHERE bucket_id = 'payment-proofs'
  AND name LIKE 'order-%'
ORDER BY created_at DESC;

-- Compare database vs storage
SELECT 
  o.id as order_id,
  o.payment_proof as db_path,
  so.name as storage_path,
  CASE 
    WHEN so.name IS NULL THEN 'FILE MISSING IN STORAGE'
    WHEN o.payment_proof != so.name THEN 'PATH MISMATCH'
    ELSE 'OK'
  END as status
FROM orders o
LEFT JOIN storage.objects so ON so.name = o.payment_proof AND so.bucket_id = 'payment-proofs'
WHERE o.payment_proof IS NOT NULL;
