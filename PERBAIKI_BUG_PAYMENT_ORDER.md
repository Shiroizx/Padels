# 🐛 Perbaiki Bug Payment Proof Order

## Masalah
User upload bukti pembayaran order, tapi:
- ❌ File masuk ke storage ✅
- ❌ Database `payment_proof` tetap NULL ❌
- ❌ Order tidak muncul di Admin → Payments ❌

## Penyebab
**RLS Policy kurang!** User tidak punya izin untuk update order mereka sendiri.

## Solusi Cepat

### Langkah 1: Tambah RLS Policy
1. Buka Supabase Dashboard → SQL Editor
2. Copy paste SQL ini:

```sql
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

3. Klik **Run**
4. Tunggu sampai sukses

### Langkah 2: Fix Order #1 yang Sudah Ada
Order #1 sudah punya file `order-1-1778509619931.PNG` di storage, tapi database masih NULL.

Jalankan SQL ini:

```sql
UPDATE orders 
SET payment_proof = 'order-1-1778509619931.PNG'
WHERE id = 1;
```

### Langkah 3: Test
1. Refresh halaman **Admin → Payments**
2. Order #1 seharusnya muncul di tab "Order"
3. Gambar bukti pembayaran seharusnya tampil

### Langkah 4: Test Upload Baru
1. Login sebagai user biasa
2. Buat order baru
3. Upload bukti pembayaran
4. Sekarang seharusnya berhasil! ✅

## Kenapa Ini Terjadi?
Supabase RLS (Row Level Security) memblokir semua operasi by default. Kita lupa bikin policy untuk **users update their own orders**.

Policy yang ada:
- ✅ Users bisa baca order sendiri
- ✅ Users bisa buat order baru
- ❌ **KURANG: Users bisa update order sendiri** ← ini yang bikin bug!
- ✅ Admin bisa update semua order

## File SQL
Saya sudah buatkan file SQL siap pakai:
- 📄 `fix-order-payment-proof-rls.sql` - Tambah policy
- 📄 `fix-existing-order-payment.sql` - Fix order #1
- 📄 `supabase-setup.sql` - Sudah di-update

## Setelah Fix
✅ User bisa upload payment proof
✅ Database ter-update dengan benar
✅ Order muncul di Admin → Payments
✅ Gambar tampil dengan benar

---

**PENTING:** Jalankan SQL di Step 1 dulu sebelum test upload lagi!
