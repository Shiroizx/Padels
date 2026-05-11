# 🐛 Fix Order Payment Proof Bug

## Problem
User berhasil upload payment proof untuk order, tapi:
- ❌ File berhasil masuk ke storage bucket `payment-proofs`
- ❌ Database field `payment_proof` tetap NULL
- ❌ Order tidak muncul di halaman Admin → Payments

## Root Cause
**Missing RLS Policy!** 

Tabel `orders` tidak punya policy untuk **users update their own orders**. Jadi ketika user upload payment proof, file berhasil ke storage tapi update database gagal karena RLS block.

### Current Policies:
- ✅ Users can read own orders
- ✅ Users can create orders
- ❌ **MISSING: Users can update own orders**
- ✅ Admins can update orders

## Solution

### Step 1: Add Missing RLS Policy
Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Allow users to update their own orders (for payment proof upload)
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Atau jalankan file: `fix-order-payment-proof-rls.sql`

### Step 2: Fix Existing Order Data
Order #1 sudah punya file di storage tapi database masih NULL. Fix dengan SQL ini:

```sql
-- Update order #1 with correct payment_proof filename
UPDATE orders 
SET payment_proof = 'order-1-1778509619931.PNG'
WHERE id = 1 AND payment_proof IS NULL;
```

Atau jalankan file: `fix-existing-order-payment.sql`

### Step 3: Verify Fix
1. Refresh halaman Admin → Payments
2. Order #1 seharusnya muncul di tab "Order (1)"
3. Bukti pembayaran seharusnya tampil

### Step 4: Test Upload Lagi
1. Login sebagai user biasa
2. Buat order baru
3. Upload payment proof
4. Cek di Admin → Payments (seharusnya muncul)
5. Cek database (payment_proof seharusnya terisi)

## Prevention
File `supabase-setup.sql` sudah di-update dengan policy yang benar. Untuk project baru, policy ini akan otomatis ter-create.

## Technical Details

### Why This Happened
RLS (Row Level Security) di Supabase memblokir semua operasi by default. Kita harus explicitly membuat policy untuk setiap operasi (SELECT, INSERT, UPDATE, DELETE).

Policy yang ada hanya mengizinkan:
- Users: SELECT, INSERT
- Admins: SELECT, UPDATE

Tapi users juga perlu UPDATE untuk upload payment proof!

### The Fix
Tambahkan policy baru:
```sql
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Ini mengizinkan users untuk update orders mereka sendiri, dengan validasi:
- `USING`: User hanya bisa update order milik mereka
- `WITH CHECK`: Setelah update, order masih milik user yang sama

## Files Created
- ✅ `fix-order-payment-proof-rls.sql` - Add missing RLS policy
- ✅ `fix-existing-order-payment.sql` - Fix order #1 data
- ✅ `supabase-setup.sql` - Updated with correct policy

## After Fix
✅ Users can upload payment proof successfully
✅ Database updates correctly
✅ Orders appear in Admin → Payments
✅ Payment proof images display correctly
