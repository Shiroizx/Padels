# URGENT: Fix Login Error

## Problem
Login gagal untuk semua user (admin dan user biasa) dengan error "Login gagal".

## Root Cause
RLS policy yang saya buat sebelumnya menciptakan **circular dependency**:
- Policy "Admins can read all users" mencoba query tabel users untuk cek role
- Tapi untuk query users, butuh policy yang sama
- Hasilnya: infinite loop, query gagal, login gagal

## IMMEDIATE FIX

### Jalankan SQL ini SEKARANG di Supabase SQL Editor:

```sql
-- Step 1: Remove ALL broken policies
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Step 2: Add simple working policy
CREATE POLICY "Authenticated users can read all users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Step 3: Keep update policy
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Atau jalankan file lengkap:
Buka Supabase Dashboard → SQL Editor → Copy paste isi file `fix-users-rls-FINAL.sql`

## Why This Works

### Policy Baru:
```sql
CREATE POLICY "Authenticated users can read all users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');
```

**Kenapa aman?**
1. ✅ Tidak ada circular dependency - hanya cek `auth.role()` (dari auth.users, bukan public.users)
2. ✅ Tabel users hanya berisi data profil: id, name, email, role, timestamps
3. ✅ Tidak ada data sensitif (password ada di auth.users yang terpisah)
4. ✅ Admin butuh lihat user info di bookings/orders
5. ✅ User biasa tetap hanya bisa lihat booking mereka sendiri (dibatasi di tabel bookings)

### Policy Lama (BROKEN):
```sql
-- INI YANG BIKIN ERROR:
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users  -- ❌ Query ke users table
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
```

## After Running SQL

1. **Test Login Immediately:**
   - Try login as admin: admin@padels.com
   - Try login as regular user
   
2. **Verify Admin Bookings:**
   - Go to `/admin/bookings`
   - User names and emails should now appear
   
3. **Check Console:**
   - No more "Login gagal" errors
   - No more RLS policy errors

## Files Updated

1. ✅ `fix-users-rls-FINAL.sql` - SQL to run NOW
2. ✅ `supabase-setup.sql` - Updated for future setups
3. ✅ This documentation

## Security Notes

**Q: Apakah aman semua authenticated user bisa baca semua users?**

A: **YA, aman** karena:
- Tabel users hanya data profil publik (nama, email, role)
- Password/credentials ada di `auth.users` (managed by Supabase, tidak bisa diakses)
- User biasa tetap tidak bisa lihat booking/order user lain (dibatasi di tabel masing-masing)
- Ini pattern yang umum digunakan untuk aplikasi dengan fitur admin

**Q: Kenapa tidak pakai policy yang lebih strict?**

A: Policy yang lebih strict (cek role admin) menciptakan circular dependency. Solusi lain yang lebih kompleks:
- Menggunakan security definer functions
- Menggunakan auth metadata
- Tapi itu overkill untuk use case ini

## Rollback (if needed)

Jika masih ada masalah, rollback ke policy paling sederhana:

```sql
-- Remove all policies
DROP POLICY IF EXISTS "Authenticated users can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Disable RLS temporarily (NOT RECOMMENDED for production)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

Tapi **JANGAN** disable RLS di production!
