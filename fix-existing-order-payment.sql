-- Fix existing order #1 that has payment proof in storage but NULL in database
-- Run this AFTER running fix-order-payment-proof-rls.sql

-- Update order #1 with the correct payment_proof filename
UPDATE orders 
SET payment_proof = 'order-1-1778509619931.PNG'
WHERE id = 1 AND payment_proof IS NULL;

-- Verify the update
SELECT id, payment_proof, status, created_at 
FROM orders 
WHERE id = 1;
