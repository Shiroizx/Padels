# Supabase Authentication Setup

## 🔧 Error: "invalid_request" saat Register

Error ini terjadi karena Supabase Auth settings belum dikonfigurasi dengan benar.

---

## ✅ Fix: Konfigurasi Supabase Auth

### 1. Disable Email Confirmation (Untuk Development)

**Langkah:**
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik **Authentication** di sidebar kiri
4. Klik **Providers** tab
5. Klik **Email** provider
6. Scroll ke bawah, cari **"Confirm email"**
7. **UNCHECK/DISABLE** opsi "Confirm email"
8. Klik **Save**

**Kenapa?**
- Untuk development, kita tidak perlu email confirmation
- User bisa langsung login setelah register
- Lebih cepat untuk testing

---

### 2. Configure Site URL

**Langkah:**
1. Masih di **Authentication** → klik **URL Configuration**
2. Set **Site URL**: `http://localhost:3000`
3. Set **Redirect URLs**: 
   - `http://localhost:3000/**`
   - `http://localhost:3000/login`
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/admin/dashboard`
4. Klik **Save**

**Kenapa?**
- Supabase perlu tahu URL aplikasi kita
- Untuk redirect setelah authentication

---

### 3. Enable Auto Confirm Users (Optional)

**Langkah:**
1. Klik **Settings** di sidebar
2. Klik **Authentication**
3. Scroll ke **Email Auth**
4. Enable **"Enable email confirmations"** → **OFF**
5. Klik **Save**

---

### 4. Check Auth Settings

**Langkah:**
1. Klik **Authentication** → **Settings**
2. Pastikan:
   - **Enable email provider**: ✅ ON
   - **Enable email confirmations**: ❌ OFF (untuk development)
   - **Minimum password length**: 6 atau 8
   - **Enable sign ups**: ✅ ON

---

## 🧪 Test Setelah Konfigurasi

### 1. Clear Browser Cache
```
Ctrl + Shift + Delete
```
- Clear cookies
- Clear cached images and files

### 2. Restart Dev Server
```powershell
# Stop server (Ctrl+C)
npm run dev
```

### 3. Test Register
1. Buka `http://localhost:3000/register`
2. Isi form:
   - Nama: Test User
   - Email: test@example.com
   - Password: password123
   - Konfirmasi: password123
3. Klik "Daftar"
4. **Expected**: Toast "Registrasi berhasil" muncul
5. Redirect ke `/login`

### 4. Verify di Supabase
1. Buka Supabase Dashboard → **Authentication** → **Users**
2. User `test@example.com` muncul
3. Status: **Confirmed** (hijau) atau **Unconfirmed** (kuning)
4. Buka **Table Editor** → **users** table
5. User ada dengan `role = 'user'`

---

## 🐛 Troubleshooting

### Error: "Email not confirmed"
**Fix:**
- Disable email confirmation di Supabase (lihat step 1)
- Atau manually confirm user di Supabase Dashboard

### Error: "Invalid login credentials"
**Fix:**
- Pastikan password minimal 6-8 karakter
- Cek email typo
- Cek user sudah ter-create di Supabase

### Error: "User already registered"
**Fix:**
- Email sudah digunakan
- Gunakan email lain
- Atau delete user di Supabase Dashboard → Authentication → Users

### Error: "Failed to fetch"
**Fix:**
- Cek internet connection
- Cek Supabase project masih aktif
- Cek `.env` credentials benar

### Error: "Invalid API key"
**Fix:**
- Cek `.env` file:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- Restart dev server setelah update `.env`

---

## 📝 Alternative: Manual User Creation

Jika register masih error, buat user manual:

### 1. Via Supabase Dashboard
1. Buka **Authentication** → **Users**
2. Klik **"Add user"** → **"Create new user"**
3. Isi:
   - Email: `test@example.com`
   - Password: `password123`
   - Auto Confirm User: ✅ YES
4. Klik **Create user**

### 2. Via SQL
```sql
-- Insert ke auth.users (Supabase internal)
-- Ini akan otomatis trigger function handle_new_user()
-- yang akan create record di public.users table

-- Atau langsung insert ke public.users (setelah user dibuat via dashboard)
INSERT INTO public.users (id, name, email, role)
VALUES (
  'user-uuid-from-auth-users',
  'Test User',
  'test@example.com',
  'user'
);
```

---

## ✅ Expected Behavior After Fix

### Register Flow:
1. User isi form register
2. Submit form
3. Supabase create user di `auth.users`
4. Trigger `handle_new_user()` function
5. Auto create record di `public.users` table dengan `role = 'user'`
6. Toast "Registrasi berhasil" muncul
7. Redirect ke `/login`
8. User bisa login langsung (no email confirmation)

### Login Flow:
1. User isi email & password
2. Submit form
3. Supabase verify credentials
4. Get user role dari `public.users` table
5. Redirect based on role:
   - `role = 'admin'` → `/admin/dashboard`
   - `role = 'user'` → `/dashboard`

---

## 🎯 Next Steps

Setelah fix:
1. ✅ Test register user biasa
2. ✅ Test register admin (+ update role via SQL)
3. ✅ Test login user biasa
4. ✅ Test login admin
5. ✅ Test protected routes
6. ✅ Lanjut ke Phase 3

---

Last Updated: 2024-12-20
