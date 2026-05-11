# Fix Login Error - "Module not found: zustand"

## ✅ Problem Solved!

Error terjadi karena package `zustand` tidak terinstall dengan benar.

---

## 🔧 Solution Applied

```bash
npm install zustand
```

Zustand sudah terinstall. Sekarang aplikasi seharusnya berjalan normal.

---

## 🧪 Test Login Sekarang

### 1. Refresh Browser
- Tekan `Ctrl + Shift + R` (hard refresh)
- Atau clear cache: `Ctrl + Shift + Delete`

### 2. Test Login
1. Buka `http://localhost:3000/login`
2. Login dengan akun yang sudah didaftarkan:
   - Email: `user@test.com` (atau email yang Anda gunakan saat register)
   - Password: `password123` (atau password yang Anda gunakan)
3. Klik "Login"

### 3. Expected Result
- ✅ Toast notification "Login berhasil" muncul
- ✅ Redirect ke `/dashboard`
- ✅ Navbar menampilkan nama user
- ✅ Menu "Lapangan", "Produk", "Cart" muncul
- ✅ Cart icon dengan counter (0) muncul
- ✅ No error di console

---

## 🎯 Next: Test Complete Flow

### A. Test User Flow
1. ✅ Register user baru (sudah berhasil)
2. ✅ Login user (test sekarang)
3. ⏳ Logout
4. ⏳ Login lagi

### B. Test Admin Flow
1. ⏳ Register admin
2. ⏳ Update role ke 'admin' via SQL:
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'admin@padels.com';
   ```
3. ⏳ Login sebagai admin
4. ⏳ Verify redirect ke `/admin/dashboard`

---

## 🐛 If Still Error

### Error: "Invalid login credentials"
**Possible causes:**
1. Email atau password salah
2. User belum ter-create di database
3. Password tidak match

**Fix:**
1. Cek di Supabase Dashboard → Authentication → Users
2. Pastikan user ada
3. Coba register ulang dengan email baru
4. Atau reset password di Supabase

### Error: "User not found in users table"
**Possible causes:**
1. Trigger `handle_new_user()` tidak jalan
2. User ada di `auth.users` tapi tidak di `public.users`

**Fix:**
1. Buka Supabase Dashboard → SQL Editor
2. Cek user di `public.users`:
   ```sql
   SELECT * FROM users WHERE email = 'user@test.com';
   ```
3. Jika tidak ada, insert manual:
   ```sql
   -- Get user ID dari auth.users
   SELECT id, email FROM auth.users WHERE email = 'user@test.com';
   
   -- Insert ke public.users (ganti 'user-id-here' dengan ID dari query di atas)
   INSERT INTO users (id, name, email, role)
   VALUES (
     'user-id-here',
     'Test User',
     'user@test.com',
     'user'
   );
   ```

### Error: Still "Module not found"
**Fix:**
1. Stop dev server (Ctrl+C)
2. Clear cache:
   ```bash
   Remove-Item -Recurse -Force .next
   Remove-Item -Recurse -Force node_modules
   npm install
   ```
3. Restart:
   ```bash
   npm run dev
   ```

---

## ✅ Verification Checklist

After login success:

**User Dashboard:**
- [ ] URL: `http://localhost:3000/dashboard`
- [ ] Navbar shows user name
- [ ] Menu: Lapangan, Produk, Cart visible
- [ ] Cart icon with counter (0)
- [ ] Stats: Total Booking (0), Total Order (0)
- [ ] 4 quick action cards
- [ ] No error in console

**Admin Dashboard:**
- [ ] URL: `http://localhost:3000/admin/dashboard`
- [ ] Navbar shows admin name + "Admin" badge
- [ ] No Lapangan/Produk/Cart menu
- [ ] Stats: Total Lapangan, Booking, Produk, Order
- [ ] 5 quick action cards
- [ ] No error in console

---

## 🚀 Ready for Phase 3?

Jika semua test di atas ✅, kita siap lanjut ke **Phase 3: Courts & Bookings**!

Phase 3 akan include:
- Courts list page dengan grid view
- Court detail page
- Booking form dengan validation
- Availability check
- Booking history
- Payment proof upload

---

Last Updated: 2024-12-20
