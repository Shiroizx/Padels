-- ============================================
-- REQUIRED SQL UPDATES FOR CHECKOUT
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add payment_method_id column to orders table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_method_id'
    ) THEN
        ALTER TABLE orders 
        ADD COLUMN payment_method_id BIGINT REFERENCES payment_methods(id);
        
        CREATE INDEX idx_orders_payment_method_id ON orders(payment_method_id);
        
        RAISE NOTICE 'Column payment_method_id added to orders table';
    ELSE
        RAISE NOTICE 'Column payment_method_id already exists in orders table';
    END IF;
END $$;

-- 2. Rename total_price to total_amount (if needed)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'total_price'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE orders 
        RENAME COLUMN total_price TO total_amount;
        
        RAISE NOTICE 'Column total_price renamed to total_amount';
    ELSE
        RAISE NOTICE 'Column total_amount already exists or total_price does not exist';
    END IF;
END $$;

-- 3. Verify orders table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Expected output should include:
-- id, user_id, order_number, total_amount, payment_method, payment_proof, 
-- status, customer_name, customer_phone, customer_address, 
-- payment_method_id, notes, created_at, updated_at

-- 4. Check if payment_methods table exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'payment_methods'
) AS payment_methods_exists;

-- 5. Check if qr-codes storage bucket exists
SELECT 
    id, 
    name, 
    public 
FROM storage.buckets 
WHERE name = 'qr-codes';

-- If qr-codes bucket doesn't exist, create it:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Verify storage policies for qr-codes
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%qr-codes%';

-- If no policies exist, create them:
DO $$
BEGIN
    -- Policy: Anyone can view QR codes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Anyone can view QR codes'
    ) THEN
        CREATE POLICY "Anyone can view QR codes"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'qr-codes');
    END IF;

    -- Policy: Admins can upload QR codes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Admins can upload QR codes'
    ) THEN
        CREATE POLICY "Admins can upload QR codes"
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = 'qr-codes' AND
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        );
    END IF;
END $$;

-- 7. Check payment-proofs bucket
SELECT 
    id, 
    name, 
    public 
FROM storage.buckets 
WHERE name = 'payment-proofs';

-- If payment-proofs bucket doesn't exist, create it:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Create storage policy for payment-proofs (if not exists)
DO $$
BEGIN
    -- Policy: Users can upload their own payment proofs
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload payment proofs'
    ) THEN
        CREATE POLICY "Users can upload payment proofs"
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = 'payment-proofs' AND
            auth.uid() IS NOT NULL
        );
    END IF;

    -- Policy: Anyone can view payment proofs
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Anyone can view payment proofs'
    ) THEN
        CREATE POLICY "Anyone can view payment proofs"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'payment-proofs');
    END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check orders table columns
SELECT 'Orders Table Columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Check payment_methods table
SELECT 'Payment Methods:' as info;
SELECT id, name, type, is_active 
FROM payment_methods 
ORDER BY display_order;

-- Check storage buckets
SELECT 'Storage Buckets:' as info;
SELECT id, name, public 
FROM storage.buckets 
WHERE name IN ('qr-codes', 'payment-proofs');

-- ============================================
-- SUMMARY
-- ============================================
-- After running this script, you should have:
-- ✅ payment_method_id column in orders table
-- ✅ total_amount column (renamed from total_price if needed)
-- ✅ qr-codes storage bucket (public)
-- ✅ payment-proofs storage bucket (public)
-- ✅ Storage policies for both buckets
-- ============================================
