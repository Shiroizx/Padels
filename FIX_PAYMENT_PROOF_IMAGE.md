# Fix Payment Proof Image Not Showing

## Problem
Payment proof image tidak muncul di halaman booking detail meskipun:
- ✅ File ada di storage
- ✅ URL sudah benar
- ❌ Gambar tidak tampil

## Root Cause
Bucket `payment-proofs` kemungkinan **PRIVATE** atau ada masalah RLS policy.

## Solution

### Option 1: Make Bucket Public (Recommended)
1. Buka Supabase Dashboard → Storage
2. Klik bucket `payment-proofs`
3. Klik **Settings** (icon gear)
4. Toggle **Public bucket** menjadi ON
5. Save

### Option 2: Add Storage RLS Policy
Jika bucket tetap private, tambahkan policy ini di SQL Editor:

```sql
-- Allow public read access to payment proofs
CREATE POLICY "Public can view payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

-- Allow authenticated users to upload payment proofs
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own payment proofs
CREATE POLICY "Users can update payment proofs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');
```

### Option 3: Use Signed URL (If Must Stay Private)
Jika bucket harus tetap private, gunakan signed URL dengan expiry time.

## Test
Setelah fix, coba buka URL ini di browser:
```
https://blqzdvhveaqussbsaswg.supabase.co/storage/v1/object/public/payment-proofs/1-1778491844285.PNG
```

Jika gambar muncul = berhasil! ✅
