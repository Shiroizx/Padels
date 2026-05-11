-- Simple Migration: Only add images column and storage policies
-- Run this SQL in Supabase SQL Editor

-- 1. Add images column to courts table
ALTER TABLE courts ADD COLUMN IF NOT EXISTS images TEXT[];

-- 2. Storage RLS Policies for court-images bucket
-- First, drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can upload court images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read court images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete court images" ON storage.objects;

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

-- 3. Storage RLS Policies for product-images bucket
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

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

-- 4. Storage RLS Policies for payment-proofs bucket
DROP POLICY IF EXISTS "Authenticated users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can read payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete payment proofs" ON storage.objects;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

-- Allow authenticated users to read payment proofs
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

-- Done! 
SELECT 'Migration completed successfully!' as status;
