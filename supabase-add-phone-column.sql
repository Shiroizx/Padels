-- Add phone column to users table
-- Run this ONLY if you want to store user phone numbers

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Optional: Add index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Note: After running this, you can update the booking detail page
-- to include phone in the query again:
-- users:user_id (name, email, phone)
