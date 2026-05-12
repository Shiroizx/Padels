# Fix: Login Gagal - Email atau Password Salah

## Kemungkinan Penyebab

### 1. User Belum Terdaftar
Anda harus **register** terlebih dahulu sebelum bisa login.

**Solusi:**
- Klik "Daftar Gratis" di halaman login
- Atau buka `/register`
- Isi form registrasi
- Setelah berhasil register, baru bisa login

### 2. Password Salah
Password yang Anda masukkan tidak sesuai dengan yang di database.

**Solusi:**
- Pastikan password yang dimasukkan benar
- Cek Caps Lock tidak aktif
- Jika lupa password, gunakan fitur reset password (belum ada, perlu dibuat)

### 3. Email Salah
Email yang dimasukkan tidak terdaftar di sistem.

**Solusi:**
- Pastikan email yang dimasukkan benar
- Cek typo di email
- Gunakan email yang sama saat register

### 4. User Ada di Auth Tapi Tidak di Tabel Users (Sync Issue)
Kadang trigger tidak jalan dan user ada di `auth.users` tapi tidak di tabel `users`.

**Solusi:**
Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Cek user yang ada di auth tapi tidak di users table
SELECT 
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- Jika ada user yang muncul, tambahkan manual ke users table:
INSERT INTO users (id, email, name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'User'),
  'user'
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;
```

## Cara Debug

### Step 1: Cek Apakah User Terdaftar

Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Ganti 'your@email.com' dengan email yang Anda coba login
SELECT * FROM users WHERE email = 'your@email.com';
```

**Hasil:**
- **Jika ada data** → User terdaftar, masalahnya di password
- **Jika kosong** → User belum terdaftar, harus register dulu

### Step 2: Cek di Auth.Users

```sql
SELECT * FROM auth.users WHERE email = 'your@email.com';
```

**Hasil:**
- **Jika ada data** → User ada di auth, cek apakah ada di tabel users
- **Jika kosong** → User belum register sama sekali

### Step 3: Test Login dengan Demo Account

Coba login dengan akun demo yang sudah pasti ada:

**Admin:**
- Email: `admin@padels.com`
- Password: `admin123`

**User:**
- Email: `user@padels.com`  
- Password: `user123`

**Jika demo account juga gagal:**
→ Berarti demo account belum dibuat, perlu dibuat manual

## Membuat Demo Account Manual

Jika demo account belum ada, jalankan SQL ini:

```sql
-- 1. Buat admin user di Supabase Dashboard
-- Authentication > Add User
-- Email: admin@padels.com
-- Password: admin123
-- Atau gunakan SQL (memerlukan extension)

-- 2. Setelah user dibuat di auth, tambahkan ke users table
-- Ganti 'user-id-from-auth' dengan ID yang muncul setelah create user
INSERT INTO users (id, email, name, role)
VALUES (
  'user-id-from-auth',  -- ID dari auth.users
  'admin@padels.com',
  'Admin Padels',
  'admin'
);

-- 3. Buat user biasa
-- Ulangi langkah yang sama untuk user@padels.com
```

## Cara Membuat User Baru yang Benar

### Opsi 1: Via Register Page (Recommended)
1. Buka `/register`
2. Isi form:
   - Nama: Test User
   - Email: test@example.com
   - Password: test123 (minimal 6 karakter)
3. Klik "Daftar Sekarang"
4. Jika berhasil, akan redirect ke dashboard
5. Sekarang bisa login dengan email dan password tersebut

### Opsi 2: Via Supabase Dashboard
1. Buka Supabase Dashboard
2. Authentication > Users
3. Klik "Add User"
4. Isi email dan password
5. Klik "Create User"
6. **PENTING:** Jalankan SQL untuk tambah ke users table:
   ```sql
   INSERT INTO users (id, email, name, role)
   VALUES (
     'id-dari-auth-users',
     'email@example.com',
     'Nama User',
     'user'
   );
   ```

## Troubleshooting Spesifik

### Error: "Email atau password salah"

**Cek 1: User ada di database?**
```sql
SELECT * FROM users WHERE email = 'your@email.com';
```

**Cek 2: Password benar?**
- Tidak ada cara cek password di database (encrypted)
- Coba reset password atau buat user baru

**Cek 3: Trigger jalan?**
```sql
-- Cek apakah trigger ada
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### Error: "User not found"

User belum register. Solusi:
1. Register via `/register`
2. Atau buat manual via Supabase Dashboard

### Login Berhasil Tapi Redirect Error

Cek apakah user punya role:
```sql
SELECT id, email, name, role FROM users WHERE email = 'your@email.com';
```

Jika role NULL, update:
```sql
UPDATE users SET role = 'user' WHERE email = 'your@email.com';
```

## Quick Fix: Buat Test User

Jalankan SQL ini untuk buat test user lengkap:

```sql
-- CATATAN: Ini hanya buat entry di users table
-- Anda tetap perlu buat user di Supabase Auth Dashboard dulu

-- Setelah buat user di Auth Dashboard, jalankan:
INSERT INTO users (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', 'Test User'),
  'user'
FROM auth.users
WHERE email = 'test@example.com'  -- Ganti dengan email yang baru dibuat
ON CONFLICT (id) DO NOTHING;
```

## Rekomendasi

1. **Gunakan Register Page** untuk buat user baru (paling aman)
2. **Jangan buat user manual** kecuali terpaksa
3. **Pastikan trigger aktif** agar auto-create users table entry
4. **Test dengan demo account** untuk pastikan login berfungsi

## Jika Masih Gagal

1. **Cek browser console** (F12) untuk error JavaScript
2. **Cek server terminal** untuk error API
3. **Cek Supabase logs** di Dashboard > Logs
4. **Share error message** yang muncul untuk debugging lebih lanjut

## File Terkait

- `src/app/(auth)/login/page.tsx` - Halaman login
- `src/app/(auth)/register/page.tsx` - Halaman register
- `supabase-setup.sql` - Setup database dan trigger
- `check-users-debug.sql` - SQL untuk debug users
