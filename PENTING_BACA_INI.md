# 🚨 PENTING: Setup Database Dulu!

## Masalah Sekarang
Error 404 yang kamu alami disebabkan karena **tabel database belum dibuat**. 

Error log menunjukkan:
```
relation "public.bookings" does not exist
```

Artinya: tabel `bookings` tidak ada di database Supabase kamu.

## Solusi: Jalankan SQL Setup

### Langkah 1: Buka Supabase Dashboard
1. Buka https://supabase.com/dashboard
2. Pilih project kamu
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**

### Langkah 2: Jalankan File SQL
1. Buka file `supabase-setup.sql` di VS Code
2. Copy **SEMUA** kode SQL nya (Ctrl+A, Ctrl+C)
3. Paste ke Supabase SQL Editor (Ctrl+V)
4. Klik tombol **Run** (atau tekan Ctrl+Enter)
5. Tunggu sampai muncul pesan sukses

### Langkah 3: Cek Tabel Sudah Dibuat
Jalankan query ini untuk memastikan:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Harus muncul 6 tabel:
- ✅ users
- ✅ courts
- ✅ bookings
- ✅ products
- ✅ orders
- ✅ order_items

### Langkah 4: Restart Server
```bash
# Tekan Ctrl+C untuk stop server
# Lalu jalankan lagi:
npm run dev
```

### Langkah 5: Test Lagi
1. Login sebagai admin
2. Buka Admin Dashboard → Bookings
3. Sekarang harusnya tidak ada error 404 lagi!

## Kenapa Ini Terjadi?
Aplikasi Next.js sudah jadi, tapi database Supabase masih kosong. File `supabase-setup.sql` itu harus dijalankan **sekali** di awal untuk membuat semua tabel dan policy.

## Setelah Setup Database
Kalau sudah berhasil, kamu bisa:
1. ✅ Buat lapangan baru (Admin → Courts → Create)
2. ✅ Buat produk baru (Admin → Products → Create)
3. ✅ Test booking sebagai user biasa
4. ✅ Lihat booking di Admin → Bookings (sekarang harusnya work!)

## Masih Error?
Kalau masih error setelah jalankan SQL:
1. Screenshot error message di SQL Editor
2. Cek apakah kamu login sebagai owner project
3. Pastikan project Supabase tidak di-pause
4. Kirim screenshot error nya ke sini

---

**File lengkap ada di: `DATABASE_SETUP_INSTRUCTIONS.md` (versi English)**
