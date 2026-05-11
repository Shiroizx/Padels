# 🔧 Fix Missing Users in Bookings

## Problem
Booking menunjukkan user data kosong karena **user tidak ada di tabel `users`**.

Error log:
```
user_id: 'aa0d93bd-2f94-4b6a-b212-96c3f2cfb6ee'
users: null
Failed to fetch user: Cannot coerce the result to a single JSON object (0 rows)
```

## Root Cause
User ada di `auth.users` (Supabase Auth) tapi **tidak ada di tabel `users`** (aplikasi).

Ini terjadi karena:
1. ❌ Trigger `handle_new_user()` gagal saat user register
2. ❌ User register sebelum trigger dibuat
3. ❌ User dihapus dari tabel `users` tapi booking masih ada

## Solution

### Step 1: Check Missing Users
Jalankan query ini di Supabase SQL Editor:

```sql
-- Check which users are missing
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'name' as name,
  CASE 
    WHEN u.id IS NULL THEN 'MISSING'
    ELSE 'EXISTS'
  END as status
FROM auth.users au
LEFT JOIN users u ON u.id = au.id;
```

### Step 2: Fix Missing Users
Jalankan SQL ini untuk create missing users:

```sql
-- Insert missing users into users table
INSERT INTO users (id, name, email, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'User') as name,
  au.email,
  'user' as role
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

### Step 3: Verify Fix
```sql
-- Check if all bookings now have user data
SELECT 
  b.id as booking_id,
  b.booking_name,
  u.name as user_name,
  u.email as user_email,
  CASE 
    WHEN u.id IS NULL THEN '❌ STILL MISSING'
    ELSE '✅ OK'
  END as status
FROM bookings b
LEFT JOIN users u ON u.id = b.user_id
ORDER BY b.id;
```

### Step 4: Test
1. Refresh halaman `/admin/bookings`
2. User name dan email seharusnya muncul ✅
3. Refresh `/admin/bookings/2`
4. Email seharusnya tampil di "Informasi Customer" ✅

## Prevention
Pastikan trigger `handle_new_user()` berfungsi dengan benar:

```sql
-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Jika trigger tidak ada, jalankan ulang `supabase-setup.sql`.

## Quick Fix (Alternative)
Jika tidak bisa akses SQL Editor, bisa juga:
1. User yang bermasalah **logout**
2. **Delete account** (jika perlu)
3. **Register ulang** dengan email yang sama
4. Trigger akan otomatis create user di tabel `users`

## Files
- 📄 `fix-missing-users.sql` - SQL untuk fix missing users
- 📄 `debug-booking-users.sql` - SQL untuk debug

---

**IMPORTANT:** Jalankan Step 2 SQL di Supabase SQL Editor untuk fix masalah ini!
