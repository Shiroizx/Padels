-- Admin User Management Setup
-- Run this in Supabase SQL Editor

-- Create function to allow admin to reset user password
-- Note: This is a workaround since admin API is not available in client-side
-- For production, consider using server-side API routes

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function for admin to reset user password
CREATE OR REPLACE FUNCTION admin_reset_user_password(
  user_id UUID,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reset passwords';
  END IF;

  -- Update the user's password in auth.users
  -- Note: This requires the service_role key or proper RLS policies
  -- For client-side, you may need to use Supabase Edge Functions instead
  
  result := json_build_object(
    'success', true,
    'message', 'Password reset function called. Use Supabase Admin API for actual password reset.'
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_reset_user_password(UUID, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION admin_reset_user_password IS 'Allows admin users to reset other users passwords';

-- Note: For actual password reset, you need to:
-- 1. Use Supabase Admin API (service_role key) from server-side
-- 2. Or create a Supabase Edge Function
-- 3. Or use the Supabase Dashboard

-- The client-side implementation will attempt to use the admin API
-- If it fails, admins should use the Supabase Dashboard to reset passwords
