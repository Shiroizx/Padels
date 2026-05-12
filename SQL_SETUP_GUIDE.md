# 📋 SQL Setup Guide - Checkout & Orders

## ⚠️ Apakah Perlu Running SQL?

**Jawaban: YA, jika Anda belum menjalankan script sebelumnya.**

Cek dulu apakah sudah ada dengan query ini:

```sql
-- Cek apakah payment_method_id sudah ada
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'orders' 
AND column_name = 'payment_method_id';
```

**Hasil:**
- ✅ **Ada hasil** → Tidak perlu running SQL, skip ke Testing
- ❌ **Tidak ada hasil** → Perlu running SQL di bawah

---

## 🚀 Cara Running SQL

### **Opsi 1: Via Supabase Dashboard (Recommended)**

1. **Login ke Supabase Dashboard**
   - Buka https://supabase.com
   - Login dengan akun Anda
   - Pilih project Anda

2. **Buka SQL Editor**
   - Klik menu **SQL Editor** di sidebar kiri
   - Atau klik icon **</> SQL**

3. **Copy & Paste SQL**
   - Copy semua isi file `REQUIRED_SQL_UPDATES.sql`
   - Paste ke SQL Editor

4. **Run SQL**
   - Klik tombol **Run** atau tekan `Ctrl+Enter`
   - Tunggu sampai selesai

5. **Cek Output**
   - Lihat hasil di bagian bawah
   - Pastikan tidak ada error (warna merah)
   - Lihat NOTICE messages untuk konfirmasi

---

## 📝 SQL Yang Perlu Dijalankan

### **File: REQUIRED_SQL_UPDATES.sql**

Script ini akan:
1. ✅ Menambahkan kolom `payment_method_id` ke tabel `orders`
2. ✅ Rename `total_price` ke `total_amount` (jika perlu)
3. ✅ Membuat storage bucket `qr-codes` (untuk QR code payment)
4. ✅ Membuat storage bucket `payment-proofs` (untuk bukti transfer)
5. ✅ Membuat storage policies
6. ✅ Verifikasi semua sudah benar

**Aman untuk dijalankan berkali-kali** karena menggunakan:
- `IF NOT EXISTS` checks
- `ON CONFLICT DO NOTHING`
- `DO $$ BEGIN ... END $$` blocks

---

## 🔍 Verifikasi Setelah Running

### **1. Cek Kolom Orders Table**

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

**Expected Output:**
```
column_name          | data_type
---------------------|------------
id                   | integer
user_id              | uuid
order_number         | text
total_amount         | numeric      ✅ (bukan total_price)
payment_method       | text
payment_proof        | text
status               | text
customer_name        | text
customer_phone       | text
customer_address     | text
payment_method_id    | bigint       ✅ (harus ada)
notes                | text
created_at           | timestamp
updated_at           | timestamp
```

### **2. Cek Storage Buckets**

```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE name IN ('qr-codes', 'payment-proofs');
```

**Expected Output:**
```
id              | name            | public
----------------|-----------------|--------
qr-codes        | qr-codes        | true   ✅
payment-proofs  | payment-proofs  | true   ✅
```

### **3. Cek Payment Methods**

```sql
SELECT id, name, type, is_active 
FROM payment_methods 
ORDER BY display_order;
```

**Expected Output:**
```
id | name                  | type          | is_active
---|----------------------|---------------|----------
1  | Transfer Bank BCA    | bank_transfer | true
2  | Transfer Bank Mandiri| bank_transfer | true
3  | GoPay                | e_wallet      | true
4  | QRIS                 | qris          | true
5  | Cash                 | cash          | true
```

---

## ⚠️ Troubleshooting

### **Error: "relation orders does not exist"**

**Solusi:** Jalankan `supabase-setup.sql` terlebih dahulu untuk membuat tabel orders.

```sql
-- Cek apakah tabel orders ada
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'orders'
);
```

### **Error: "column payment_method_id already exists"**

**Solusi:** Ini bukan error, artinya kolom sudah ada. Skip saja.

### **Error: "permission denied for table orders"**

**Solusi:** Pastikan Anda login sebagai admin atau owner project di Supabase.

### **Error: "bucket qr-codes already exists"**

**Solusi:** Ini bukan error, artinya bucket sudah ada. Skip saja.

---

## 🧪 Testing Setelah Setup

### **1. Test Order Creation**

1. Buka aplikasi Anda
2. Login sebagai user
3. Tambahkan produk ke cart
4. Klik "Lanjut ke Checkout"
5. Isi form pengiriman
6. Pilih metode pembayaran
7. Upload bukti (optional)
8. Klik "Buat Pesanan"

**Expected:**
- ✅ Redirect ke success page
- ✅ Confetti animation muncul
- ✅ Order ID ditampilkan
- ✅ Tidak ada error di console

### **2. Verify in Database**

```sql
-- Cek order terakhir
SELECT 
    id,
    user_id,
    customer_name,
    customer_phone,
    customer_address,
    payment_method_id,  -- ✅ Harus terisi
    total_amount,
    status,
    created_at
FROM orders
ORDER BY created_at DESC
LIMIT 1;
```

### **3. Test Order Detail Page**

1. Dari success page, klik "Lihat Detail Pesanan"
2. Atau buka `/orders/[order-id]`

**Expected:**
- ✅ Customer name ditampilkan
- ✅ Customer phone ditampilkan
- ✅ Customer address ditampilkan
- ✅ Payment method ditampilkan
- ✅ Order items ditampilkan
- ✅ Tidak ada error

---

## 📊 Summary Checklist

Sebelum testing, pastikan:

- [ ] SQL `REQUIRED_SQL_UPDATES.sql` sudah dijalankan
- [ ] Kolom `payment_method_id` ada di tabel `orders`
- [ ] Kolom `total_amount` ada (bukan `total_price`)
- [ ] Storage bucket `qr-codes` sudah dibuat
- [ ] Storage bucket `payment-proofs` sudah dibuat
- [ ] Payment methods sudah ada di database
- [ ] Code sudah di-deploy/restart dev server

---

## 🎯 Quick Start (TL;DR)

**Jika Anda baru setup atau belum pernah running SQL sebelumnya:**

1. **Buka Supabase Dashboard → SQL Editor**
2. **Copy paste isi file `REQUIRED_SQL_UPDATES.sql`**
3. **Klik Run**
4. **Tunggu sampai selesai**
5. **Cek output, pastikan tidak ada error**
6. **Test checkout di aplikasi**
7. **Done!** ✅

---

## 📞 Need Help?

Jika masih ada error setelah running SQL:

1. Screenshot error message
2. Copy output dari SQL Editor
3. Cek console browser (F12)
4. Share error details untuk troubleshooting

---

**Created:** May 2026
**Last Updated:** May 2026
**Status:** Ready to Use
