-- Add payment_method_id column to orders table
ALTER TABLE orders 
ADD COLUMN payment_method_id BIGINT REFERENCES payment_methods(id);

-- Add payment_method_id column to bookings table
ALTER TABLE bookings 
ADD COLUMN payment_method_id BIGINT REFERENCES payment_methods(id);

-- Add index for better query performance
CREATE INDEX idx_orders_payment_method_id ON orders(payment_method_id);
CREATE INDEX idx_bookings_payment_method_id ON bookings(payment_method_id);

-- Add comment
COMMENT ON COLUMN orders.payment_method_id IS 'Reference to specific payment method chosen by user';
COMMENT ON COLUMN bookings.payment_method_id IS 'Reference to specific payment method chosen by user';
