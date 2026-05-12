# Debug: Edit User Not Updating

## Current Status
- API returns 200 (success)
- Toast shows "User berhasil diupdate"
- But data doesn't change in database

## Changes Made to Fix

### 1. Updated API Route to Use Service Role Key
**File:** `src/app/api/admin/update-user/route.ts`

**Key Changes:**
- Now uses service role key for ALL database operations
- Service role key bypasses RLS (Row Level Security)
- Added detailed console logging
- Returns updated data for verification

**Why:** The previous version used the authenticated user's session which might not have permission to update other users due to RLS policies.

### 2. Created RLS Policy Fix SQL
**File:** `fix-users-rls-policy.sql`

Run this SQL in Supabase SQL Editor to ensure proper policies are in place.

## Debugging Steps

### Step 1: Verify Service Role Key
Check that `.env` or `.env.local` has the service role key:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** After adding/changing `.env`, you MUST restart the dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 2: Check Server Console Logs
When you submit the edit form, check the terminal where `npm run dev` is running.

You should see:
```
Update user request: { userId: '...', name: 'New Name', email: '...', role: '...' }
User updated successfully: [ { id: '...', name: 'New Name', ... } ]
```

If you see:
```
Service role key not configured
```
→ The service role key is missing or not loaded. Restart server.

If you see:
```
Database update error: ...
```
→ There's a database/RLS issue. Run the SQL fix.

### Step 3: Check Browser Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Submit the edit form
4. Find the `update-user` request
5. Check the Response:

**Good Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "emailUpdated": false
}
```

**Bad Response:**
```json
{
  "error": "Service role key not configured"
}
```

### Step 4: Verify in Supabase Dashboard
1. Go to Supabase Dashboard
2. Table Editor → users table
3. Find the user you edited
4. Check if the name/role actually changed

If it changed in database but not in UI:
→ Caching issue, hard refresh (Ctrl+Shift+R)

If it didn't change in database:
→ RLS policy issue, run the SQL fix

### Step 5: Check RLS Policies
In Supabase Dashboard:
1. Go to Authentication → Policies
2. Find `users` table
3. Check if there's a policy for UPDATE
4. Make sure admins can update

Or run this SQL to check:
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';
```

## Common Issues & Solutions

### Issue 1: "Service role key not configured"
**Solution:**
1. Copy service role key from Supabase Dashboard → Settings → API
2. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   ```
3. Restart dev server

### Issue 2: Data changes in DB but not in UI
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check if `router.refresh()` is called in form

### Issue 3: "Row level security policy violation"
**Solution:**
1. Run `fix-users-rls-policy.sql` in Supabase SQL Editor
2. Or temporarily disable RLS on users table (not recommended for production)

### Issue 4: Update works but email doesn't change
**Solution:**
This is expected if service role key is not set. Email update is optional.
The name and role should still update.

## Testing Checklist

After making changes, test:

1. **Restart Server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Edit User Name:**
   - Go to `/admin/users`
   - Click Edit on a user
   - Change name from "Test User" to "Test User Updated"
   - Click Save
   - Check server console for logs
   - Check if name changed in list

3. **Edit User Role:**
   - Edit a user
   - Change role from "user" to "admin"
   - Click Save
   - Check if badge color changed (purple for admin)

4. **Verify in Database:**
   - Open Supabase Dashboard
   - Check users table
   - Confirm changes are there

## Expected Behavior

### Server Console:
```
Update user request: { 
  userId: 'aa0d93bd-2f94-4b6a-b212-96c3f2cfb6ee', 
  name: 'Test User Updated', 
  email: 'user@test.com', 
  role: 'user' 
}
User updated successfully: [ 
  { 
    id: 'aa0d93bd-2f94-4b6a-b212-96c3f2cfb6ee', 
    name: 'Test User Updated', 
    email: 'user@test.com', 
    role: 'user',
    created_at: '...'
  } 
]
```

### Browser:
- Toast: "User berhasil diupdate!"
- Redirects to `/admin/users`
- Name is updated in the list
- No errors in console

### Database:
- Row is updated with new values
- `updated_at` timestamp is changed (if you have that column)

## If Still Not Working

1. **Check Environment Variables:**
   ```bash
   # In your terminal
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```
   Should output your key. If empty, it's not loaded.

2. **Check API Route File:**
   Make sure `src/app/api/admin/update-user/route.ts` has the latest code with service role key.

3. **Check Supabase Connection:**
   ```bash
   # Test if Supabase is reachable
   curl https://blqzdvhveaqussbsaswg.supabase.co/rest/v1/
   ```

4. **Enable Verbose Logging:**
   Add more console.log in the API route to see exactly where it fails.

5. **Try Direct Database Update:**
   In Supabase SQL Editor:
   ```sql
   UPDATE users 
   SET name = 'Test Direct Update' 
   WHERE id = 'aa0d93bd-2f94-4b6a-b212-96c3f2cfb6ee';
   ```
   If this works, the issue is in the API route.
   If this fails, the issue is RLS policies.

## Next Steps

1. Restart dev server
2. Try editing a user
3. Check server console for the new logs
4. Share the console output if still not working

The new code should definitely work because:
- ✅ Uses service role key (bypasses RLS)
- ✅ Has detailed logging
- ✅ Returns updated data
- ✅ Proper error handling
