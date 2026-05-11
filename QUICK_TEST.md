# Quick Test Guide

## 🚀 Server Status
✅ Development server running at: **http://localhost:3000**

---

## 📝 Test Checklist

### 1. Landing Page
- [ ] Buka http://localhost:3000
- [ ] Cek tampilan landing page
- [ ] Klik tombol "Login" → redirect ke `/login`
- [ ] Klik tombol "Daftar Sekarang" → redirect ke `/register`

### 2. Register (Buat User Biasa)
- [ ] Buka http://localhost:3000/register
- [ ] Isi form:
  - Nama: Test User
  - Email: user@test.com
  - Password: password123
  - Konfirmasi Password: password123
- [ ] Klik "Daftar"
- [ ] Cek toast notification "Registrasi berhasil"
- [ ] Redirect ke `/login`

### 3. Register (Buat Admin)
- [ ] Buka http://localhost:3000/register
- [ ] Isi form:
  - Nama: Admin
  - Email: admin@padels.com
  - Password: password123
  - Konfirmasi Password: password123
- [ ] Klik "Daftar"
- [ ] Buka Supabase Dashboard → SQL Editor
- [ ] Jalankan query:
  ```sql
  UPDATE users 
  SET role = 'admin' 
  WHERE email = 'admin@padels.com';
  ```

### 4. Login sebagai User
- [ ] Buka http://localhost:3000/login
- [ ] Login dengan:
  - Email: user@test.com
  - Password: password123
- [ ] Cek redirect ke `/dashboard`
- [ ] Cek navbar menampilkan nama user
- [ ] Cek ada menu: Lapangan, Produk, Cart
- [ ] Cek ada 4 card: Booking Lapangan, History Booking, Belanja Produk, History Order

### 5. Login sebagai Admin
- [ ] Logout dulu (klik tombol Logout di navbar)
- [ ] Login dengan:
  - Email: admin@padels.com
  - Password: password123
- [ ] Cek redirect ke `/admin/dashboard`
- [ ] Cek navbar menampilkan badge "Admin"
- [ ] Cek ada stats: Total Lapangan, Total Booking, Total Produk, Total Order
- [ ] Cek ada 5 card: Kelola Lapangan, Kelola Booking, Kelola Produk, Kelola Order, Approve Pembayaran

### 6. Protected Routes
- [ ] Logout
- [ ] Coba akses http://localhost:3000/dashboard → redirect ke `/login`
- [ ] Coba akses http://localhost:3000/admin/dashboard → redirect ke `/login`
- [ ] Login sebagai user biasa
- [ ] Coba akses http://localhost:3000/admin/dashboard → redirect ke `/dashboard`

---

## ✅ Expected Results

### Landing Page
- Hero section dengan judul "Padels"
- 3 feature cards (Booking Lapangan, E-Commerce, Fasilitas Lengkap)
- CTA section "Siap Bermain?"
- Footer

### Register Page
- Form dengan 4 fields (Nama, Email, Password, Konfirmasi Password)
- Validasi:
  - Nama required
  - Email format valid
  - Password min 8 karakter
  - Password harus match
- Toast notification setelah berhasil
- Link ke login page

### Login Page
- Form dengan 2 fields (Email, Password)
- Validasi:
  - Email format valid
  - Password required
- Toast notification setelah berhasil
- Link ke register page
- Redirect berdasarkan role

### User Dashboard
- Navbar dengan menu: Lapangan, Produk, Cart (dengan counter)
- Stats: Total Booking, Total Order
- 4 quick action cards
- Nama user di navbar
- Tombol logout

### Admin Dashboard
- Navbar dengan badge "Admin"
- Stats: Total Lapangan, Total Booking, Total Produk, Total Order (dengan pending count)
- 5 quick action cards
- Nama admin di navbar
- Tombol logout

---

## 🐛 Troubleshooting

### Error: Module not found
```bash
# Clear cache dan restart
Remove-Item -Recurse -Force .next
npm run dev
```

### Error: Supabase connection
- Cek `.env` file ada dan benar
- Cek Supabase project masih aktif
- Cek internet connection

### Error: User role tidak berubah
- Pastikan query UPDATE dijalankan di Supabase SQL Editor
- Refresh browser atau logout/login lagi

### Error: Redirect loop
- Clear browser cache
- Clear cookies untuk localhost:3000
- Restart browser

---

## 📞 Next Steps After Testing

Jika semua test berhasil:
1. ✅ Buat storage buckets di Supabase
2. ✅ Lanjut ke Phase 3: Courts & Bookings

Jika ada error:
1. Screenshot error message
2. Cek browser console (F12)
3. Cek terminal output
4. Report ke developer

---

Last Updated: 2024-12-20
