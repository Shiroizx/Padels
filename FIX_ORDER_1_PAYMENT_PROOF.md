# Fix Order #1 Payment Proof Image

## Problem
Order #1 payment proof tidak muncul dengan error:
```
Failed to generate signed URL for order 1: Object not found
Payment proof path: order-1-1778509619931.PNG
```

## Root Cause
File `order-1-1778509619931.PNG` tidak ditemukan di storage, meskipun terlihat di Supabase Dashboard. Kemungkinan:
1. **Case sensitivity issue** - File di storage: `order-1-1778509619931.png` (lowercase) tapi database: `.PNG` (uppercase)
2. **File di subfolder** yang tidak terdeteksi
3. **File corrupt** atau tidak ter-sync

## Solution

### Option 1: Re-upload Payment Proof (Recommended)
1. Login sebagai user yang buat order #1
2. Buka `/orders/1`
3. Upload ulang bukti pembayaran
4. File baru akan otomatis pakai lowercase extension (`.png`)
5. Refresh Admin → Payments (seharusnya muncul)

### Option 2: Fix Database Manually
Jika file di storage sebenarnya ada tapi dengan nama berbeda:

1. **Cek nama file yang benar** di Supabase SQL Editor:
```sql
SELECT name, created_at
FROM storage.objects
WHERE bucket_id = 'payment-proofs'
  AND name LIKE '%order-1%'
ORDER BY created_at DESC;
```

2. **Update database** dengan nama file yang benar:
```sql
-- Ganti 'NAMA_FILE_YANG_BENAR' dengan hasil query di atas
UPDATE orders 
SET payment_proof = 'NAMA_FILE_YANG_BENAR'
WHERE id = 1;
```

### Option 3: Delete & Re-upload
1. **Delete file lama** di Supabase Storage:
   - Go to Storage → payment-proofs
   - Delete `order-1-1778509619931.PNG`

2. **Delete database record**:
```sql
UPDATE orders 
SET payment_proof = NULL
WHERE id = 1;
```

3. **Upload ulang** dari user interface

## Prevention
Kode sudah di-update untuk selalu gunakan **lowercase extension**:
```typescript
const fileExt = selectedFile.name.split('.').pop()?.toLowerCase()
```

Ini mencegah case sensitivity issues di masa depan.

## Files Updated
- ✅ `src/components/orders/upload-order-payment-proof.tsx` - Lowercase extension
- ✅ `src/components/bookings/upload-payment-proof.tsx` - Lowercase extension
- ✅ `src/app/admin/payments/page.tsx` - Error logging

## Test
Setelah fix, test dengan:
1. Upload payment proof baru
2. Cek Admin → Payments (gambar harus muncul)
3. Cek console (tidak ada error "Object not found")
