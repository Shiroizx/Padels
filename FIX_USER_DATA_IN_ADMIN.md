# Fix: User Data Not Showing in Admin Bookings

## Problem
User data (name and email) shows as `null` in admin bookings list and detail pages, even though the `user_id` exists in the database.

## Root Cause
The RLS (Row Level Security) policy on the `users` table only allows users to read their own data:
```sql
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

When an admin queries bookings with a join to the users table, the RLS policy blocks the admin from reading other users' data through the foreign key relationship.

## Solution
Add an RLS policy that allows admins to read all users:

```sql
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
```

## Steps to Fix

### 1. Run the SQL Fix
Execute the SQL in `fix-users-rls-policy.sql`:

```bash
# Option 1: Via Supabase Dashboard
# Go to SQL Editor and run the contents of fix-users-rls-policy.sql

# Option 2: Via psql (if you have direct database access)
psql -h your-db-host -U postgres -d postgres -f fix-users-rls-policy.sql
```

### 2. Verify the Policy Was Created
The SQL file includes a verification query. You should see two SELECT policies on the users table:
- `Users can read own data`
- `Admins can read all users`

### 3. Test the Fix
1. Log in as admin
2. Go to `/admin/bookings`
3. Verify that user names and emails now appear in the table
4. Click on a booking to view details
5. Verify that user information appears in the "Informasi Customer" section

## Files Updated

### 1. `supabase-setup.sql`
- Added the "Admins can read all users" policy
- This ensures new database setups will have the correct policy

### 2. `src/app/admin/bookings/page.tsx`
- Removed debug console.log statements
- Query already uses correct syntax: `users:user_id (name, email)`

### 3. `src/app/admin/bookings/[id]/page.tsx`
- Removed debug console.log statements
- Removed fallback user fetch logic (no longer needed)
- Query already uses correct syntax: `users:user_id (name, email)`

## Expected Result
After running the SQL fix:
- Admin bookings list will show user names and emails
- Admin booking detail page will show complete customer information
- No more `users: null` in the query results

## Why This Works
The new policy allows admins to read all users by checking if the current authenticated user has the 'admin' role. This works with Supabase's foreign key joins because:

1. Admin queries bookings with `users:user_id (name, email)`
2. Supabase applies RLS policies to the joined users table
3. The new policy checks if the requester is an admin
4. If yes, the policy allows reading all user records
5. The join succeeds and returns user data

## Notes
- The policy is secure because it verifies the admin role from the users table
- Regular users can still only read their own data
- The policy doesn't affect other operations (INSERT, UPDATE, DELETE)
