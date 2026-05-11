# Setup Image Upload - PENTING! 🚨

## Error yang Terjadi
```
StorageApiError: new row violates row-level security policy
Could not find the 'images' column of 'courts' in the schema cache
```

## Penyebab
1. Kolom `images` belum ada di tabel `courts`
2. Storage buckets belum punya RLS policies yang benar

## Cara Memperbaiki

### Step 1: Buat Storage Buckets (Jika Belum Ada)

1. Buka **Supabase Dashboard** → **Storage**
2. Klik **New Bucket** dan buat 3 buckets berikut:

**Bucket 1: court-images**
- Name: `court-images`
- Public: ✅ **YES** (centang)
- File size limit: 5MB
- Allowed MIME types: `image/*`

**Bucket 2: product-images**
- Name: `product-images`
- Public: ✅ **YES** (centang)
- File size limit: 5MB
- Allowed MIME types: `image/*`

**Bucket 3: payment-proofs**
- Name: `payment-proofs`
- Public: ✅ **YES** (centang)
- File size limit: 5MB
- Allowed MIME types: `image/*`

### Step 2: Jalankan Migration SQL

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Klik **New Query**
3. Copy semua isi file `supabase-migration-images.sql`
4. Paste ke SQL Editor
5. Klik **Run** atau tekan `Ctrl+Enter`

### Step 3: Verifikasi

**Cek Kolom `images`:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courts' AND column_name = 'images';
```

Harusnya return:
```
column_name | data_type
images      | ARRAY
```

**Cek Storage Policies:**
```sql
SELECT * FROM storage.policies 
WHERE bucket_id IN ('court-images', 'product-images', 'payment-proofs');
```

Harusnya ada policies untuk INSERT, SELECT, DELETE.

### Step 4: Test Upload

1. Login sebagai admin
2. Buka `/admin/courts/create`
3. Isi form dan upload gambar
4. Klik "Tambah Lapangan"
5. Seharusnya berhasil tanpa error!

## Troubleshooting

### Error: "bucket not found"
**Solusi:** Pastikan bucket sudah dibuat dengan nama yang **EXACT**:
- `court-images` (bukan `court_images` atau `courtimages`)
- `product-images` (bukan `product_images`)
- `payment-proofs` (bukan `payment_proofs`)

### Error: "new row violates row-level security policy"
**Solusi:** Jalankan ulang migration SQL, khususnya bagian Storage RLS Policies.

### Error: "Could not find the 'images' column"
**Solusi:** 
1. Cek apakah kolom sudah ada:
   ```sql
   SELECT * FROM information_schema.columns WHERE table_name = 'courts';
   ```
2. Jika belum ada, jalankan:
   ```sql
   ALTER TABLE courts ADD COLUMN images TEXT[];
   ```

### Error: "permission denied for bucket"
**Solusi:** Pastikan bucket di-set sebagai **PUBLIC** di Supabase Dashboard.

## Setelah Setup Berhasil

Anda bisa:
- ✅ Upload gambar saat create/edit court
- ✅ Upload gambar saat create/edit product
- ✅ Upload bukti pembayaran untuk booking
- ✅ Upload bukti pembayaran untuk order
- ✅ Preview gambar sebelum submit
- ✅ Remove gambar sebelum submit

## File yang Perlu Dijalankan

1. **`supabase-migration-images.sql`** - Jalankan di Supabase SQL Editor

Setelah migration berhasil, refresh browser dan coba lagi! 🚀
