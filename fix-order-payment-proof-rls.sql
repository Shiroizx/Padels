-- Fix: Allow users to update their own orders (for payment proof upload)
-- This policy allows users to update payment_proof field in their own orders

-- Add policy for users to update their own orders
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: This allows users to update ANY field in their orders.
-- If you want to restrict to only payment_proof field, you would need
-- to use a more complex policy or handle it at application level.
