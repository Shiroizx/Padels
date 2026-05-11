# 🚨 CRITICAL: Database Setup Required

## Problem
Your application is showing 404 errors because **the database tables don't exist yet**. The error message confirms this:
```
relation "public.bookings" does not exist
```

## Solution: Run SQL Setup in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Main Database Setup
1. Open the file `supabase-setup.sql` in your code editor
2. Copy **ALL** the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** button (or press Ctrl+Enter)
5. Wait for success message: "Success. No rows returned"

### Step 3: Fix Booking Status Values
The SQL file is missing the 'completed' status. Run this additional SQL:

```sql
-- Update bookings table to include 'completed' status
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
```

### Step 4: Verify Tables Were Created
Run this query to check all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these tables:
- ✅ users
- ✅ courts
- ✅ bookings
- ✅ products
- ✅ orders
- ✅ order_items

### Step 5: Create Storage Buckets (If Not Already Done)
1. Go to **Storage** in Supabase Dashboard
2. Create these buckets if they don't exist:
   - `court-images` (Public bucket)
   - `product-images` (Public bucket)
   - `payment-proofs` (Public bucket)

### Step 6: Run Image Migration (Optional - For Image Upload Feature)
After the main setup, if you want image upload functionality:

1. Open `supabase-migration-simple.sql`
2. Copy all the SQL code
3. Paste into Supabase SQL Editor
4. Click **Run**

This adds:
- `images` column to courts table (for multiple images)
- Storage RLS policies for all buckets

### Step 7: Test the Application
1. Restart your Next.js dev server (Ctrl+C, then `npm run dev`)
2. Login as admin
3. Go to Admin Dashboard → Bookings
4. The page should now work without 404 errors

## Why This Happened
The application code was built assuming the database structure exists, but the SQL setup file was never executed in your Supabase project. This is a **one-time setup** that must be done before the application can work.

## Next Steps After Setup
Once the database is set up:
1. ✅ Create some test courts (Admin → Courts → Create)
2. ✅ Create some test products (Admin → Products → Create)
3. ✅ Make a test booking as a regular user
4. ✅ View the booking in Admin → Bookings
5. ✅ Test the booking detail page (should work now!)

## Troubleshooting
If you still get errors after running the SQL:
1. Check the SQL Editor for any error messages
2. Make sure you're logged in as the project owner
3. Verify your Supabase project is active (not paused)
4. Check browser console for any new error messages
