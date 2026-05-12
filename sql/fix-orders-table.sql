-- Fix orders table - ensure all required columns exist

-- Check if payment_method_id exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_method_id'
    ) THEN
        ALTER TABLE orders 
        ADD COLUMN payment_method_id BIGINT REFERENCES payment_methods(id);
        
        CREATE INDEX idx_orders_payment_method_id ON orders(payment_method_id);
    END IF;
END $$;

-- Verify orders table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Expected columns:
-- id (integer/serial)
-- user_id (uuid)
-- total_amount (numeric/decimal)
-- status (text)
-- customer_name (text)
-- customer_phone (text)
-- customer_address (text)
-- payment_method_id (bigint)
-- notes (text)
-- created_at (timestamp)
-- updated_at (timestamp)
