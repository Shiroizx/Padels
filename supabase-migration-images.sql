-- Migration: Add images column and storage policies
-- Run this SQL in Supabase SQL Editor

-- 1. Add images column to courts table (array of text for multiple images)
ALTER TABLE courts ADD COLUMN IF NOT EXISTS images TEXT[];

-- 2. Check if orders table needs column updates
DO $$ 
BEGIN
  -- Drop order_number column if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'orders' AND column_name = 'order_number') THEN
    ALTER TABLE orders DROP COLUMN order_number;
  END IF;
  
  -- Rename total_price to total_amount if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'orders' AND column_name = 'total_price') THEN
    ALTER TABLE orders RENAME COLUMN total_price TO total_amount;
  END IF;
  
  -- Add total_amount if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
    ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 3. Update order_items table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'order_items' AND column_name = 'subtotal') THEN
    ALTER TABLE order_items DROP COLUMN subtotal;
  END IF;
END $$;

-- 4. Create storage buckets (if not exists)
-- Note: You need to create these buckets manually in Supabase Dashboard > Storage
-- Bucket names: court-images, product-images, payment-proofs
-- All should be PUBLIC buckets

-- 5. Storage RLS Policies for court-images bucket
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload court images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'court-images');

-- Allow public to read court images
CREATE POLICY "Public can read court images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'court-images');

-- Allow admins to delete court images
CREATE POLICY "Admins can delete court images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'court-images' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 6. Storage RLS Policies for product-images bucket
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow public to read product images
CREATE POLICY "Public can read product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 7. Storage RLS Policies for payment-proofs bucket
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

-- Allow authenticated users to read their own payment proofs
CREATE POLICY "Users can read payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-proofs');

-- Allow admins to delete payment proofs
CREATE POLICY "Admins can delete payment proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 8. Update bookings status check constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

-- 9. Update orders status check constraint (already correct in original)
-- No changes needed

-- Done! Now you can:
-- 1. Upload images to court-images bucket
-- 2. Upload images to product-images bucket
-- 3. Upload payment proofs to payment-proofs bucket
