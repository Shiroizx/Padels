# 📱 Panduan Setup QR Code untuk Payment Methods

## 🎯 Overview
Panduan lengkap untuk menambahkan QR code ke metode pembayaran (QRIS, GoPay, OVO, DANA, dll) agar ditampilkan di halaman checkout.

---

## 📋 Langkah-Langkah Setup

### 1️⃣ **Persiapan QR Code Image**

**Format yang Disarankan:**
- ✅ Format: PNG atau JPG
- ✅ Ukuran: 500x500px atau 1000x1000px (square)
- ✅ Background: Putih atau transparan
- ✅ Resolusi: High quality untuk scanning
- ✅ Nama file: `gopay-qr.png`, `qris-code.png`, `ovo-qr.png`, dll

**Contoh Nama File:**
```
gopay-qr.png
qris-code.png
ovo-qr.png
dana-qr.png
shopeepay-qr.png
```

---

### 2️⃣ **Upload QR Code ke Supabase Storage**

#### **Opsi A: Via Supabase Dashboard**

1. Login ke Supabase Dashboard
2. Pilih project Anda
3. Klik menu **Storage** di sidebar
4. Pilih bucket **`qr-codes`** (jika belum ada, buat dulu)
5. Klik tombol **Upload**
6. Pilih file QR code Anda
7. Upload file
8. Copy nama file yang ter-upload

#### **Opsi B: Via Admin Panel (Jika Sudah Ada)**

1. Login sebagai admin
2. Buka halaman **Payment Methods**
3. Edit payment method yang ingin ditambahkan QR
4. Upload QR code image
5. Save

#### **Opsi C: Via Code/Script**

```typescript
// Upload QR code programmatically
const supabase = createClient()

const file = // your file object
const fileName = 'gopay-qr.png'

const { data, error } = await supabase.storage
  .from('qr-codes')
  .upload(fileName, file, {
    cacheControl: '3600',
    upsert: true
  })

if (error) {
  console.error('Upload error:', error)
} else {
  console.log('Uploaded:', data.path)
}
```

---

### 3️⃣ **Update Payment Method di Database**

#### **Via SQL (Supabase SQL Editor)**

```sql
-- Update GoPay dengan QR code
UPDATE payment_methods 
SET 
  qr_code_image = 'gopay-qr.png',
  phone_number = '081234567890',
  instructions = 'Transfer ke nomor GoPay atau scan QR code di bawah'
WHERE name = 'GoPay';

-- Update QRIS dengan QR code
UPDATE payment_methods 
SET 
  qr_code_image = 'qris-code.png',
  instructions = 'Scan QR code menggunakan aplikasi pembayaran favorit Anda'
WHERE name = 'QRIS';

-- Update OVO dengan QR code
UPDATE payment_methods 
SET 
  qr_code_image = 'ovo-qr.png',
  phone_number = '081234567890',
  instructions = 'Transfer ke nomor OVO atau scan QR code'
WHERE name = 'OVO';
```

#### **Via Admin Panel**

1. Login sebagai admin
2. Buka **Payment Methods**
3. Klik **Edit** pada payment method
4. Isi field:
   - **QR Code Image**: Nama file yang sudah diupload
   - **Phone Number**: Nomor e-wallet (jika ada)
   - **Instructions**: Instruksi pembayaran
5. Klik **Save**

---

### 4️⃣ **Verifikasi Setup**

#### **Cek di Database:**

```sql
SELECT 
  id,
  name,
  type,
  phone_number,
  qr_code_image,
  instructions,
  is_active
FROM payment_methods
WHERE type IN ('qris', 'e_wallet')
ORDER BY display_order;
```

#### **Cek di Frontend:**

1. Buka halaman `/checkout`
2. Pilih metode pembayaran QRIS/GoPay/OVO
3. QR code harus muncul di bawah pilihan
4. Pastikan QR code bisa di-scan

---

## 🎨 Tampilan di Checkout

### **Untuk QRIS:**
```
┌─────────────────────────────────────┐
│  ○ QRIS                             │
│    Scan QR code menggunakan         │
│    aplikasi pembayaran favorit      │
│                                     │
│  ┌───────────────────────────┐     │
│  │                           │     │
│  │      [QR CODE IMAGE]      │     │
│  │                           │     │
│  └───────────────────────────┘     │
│  Scan QR code di atas              │
└─────────────────────────────────────┘
```

### **Untuk E-Wallet (GoPay/OVO/DANA):**
```
┌─────────────────────────────────────┐
│  ○ GoPay                            │
│    Nomor: 081234567890              │
│    Transfer atau scan QR code       │
│                                     │
│  ┌───────────────────────────┐     │
│  │                           │     │
│  │      [QR CODE IMAGE]      │     │
│  │                           │     │
│  └───────────────────────────┘     │
│  Scan QR code di atas              │
└─────────────────────────────────────┘
```

### **Untuk Bank Transfer:**
```
┌─────────────────────────────────────┐
│  ○ Transfer Bank BCA                │
│    BCA                              │
│    1234567890 - PT Padel Court      │
│                                     │
│  ┌───────────────────────────┐     │
│  │ Bank: BCA                 │     │
│  │ Nomor: 1234567890         │     │
│  │ Atas Nama: PT Padel Court │     │
│  │ Jumlah: Rp 150.000        │     │
│  └───────────────────────────┘     │
└─────────────────────────────────────┘
```

---

## 📝 Contoh Data Payment Methods

### **QRIS:**
```json
{
  "name": "QRIS",
  "type": "qris",
  "qr_code_image": "qris-code.png",
  "instructions": "Scan QR code menggunakan aplikasi pembayaran favorit Anda (GoPay, OVO, Dana, ShopeePay, dll)",
  "is_active": true,
  "display_order": 4
}
```

### **GoPay:**
```json
{
  "name": "GoPay",
  "type": "e_wallet",
  "phone_number": "081234567890",
  "qr_code_image": "gopay-qr.png",
  "instructions": "Transfer ke nomor GoPay atau scan QR code di bawah",
  "is_active": true,
  "display_order": 3
}
```

### **OVO:**
```json
{
  "name": "OVO",
  "type": "e_wallet",
  "phone_number": "081234567890",
  "qr_code_image": "ovo-qr.png",
  "instructions": "Transfer ke nomor OVO atau scan QR code",
  "is_active": true,
  "display_order": 5
}
```

### **Bank Transfer:**
```json
{
  "name": "Transfer Bank BCA",
  "type": "bank_transfer",
  "account_number": "1234567890",
  "account_name": "PT Padel Court",
  "bank_name": "BCA",
  "instructions": "Transfer ke rekening BCA dan upload bukti transfer",
  "is_active": true,
  "display_order": 1
}
```

---

## 🔧 Troubleshooting

### **QR Code Tidak Muncul?**

**Cek:**
1. ✅ File sudah ter-upload di bucket `qr-codes`
2. ✅ Nama file di database sesuai dengan file di storage
3. ✅ Bucket `qr-codes` bersifat public
4. ✅ Field `qr_code_image` tidak null/empty
5. ✅ Payment method `is_active = true`

**Solusi:**
```sql
-- Cek data payment method
SELECT * FROM payment_methods WHERE name = 'QRIS';

-- Cek file di storage (via Supabase Dashboard)
-- Storage > qr-codes > lihat file list

-- Update jika nama file salah
UPDATE payment_methods 
SET qr_code_image = 'nama-file-yang-benar.png'
WHERE name = 'QRIS';
```

### **QR Code Tidak Bisa Di-scan?**

**Cek:**
1. ✅ Resolusi image cukup tinggi (min 500x500px)
2. ✅ QR code tidak blur atau pecah
3. ✅ Background kontras (putih lebih baik)
4. ✅ QR code masih valid/aktif

**Solusi:**
- Generate ulang QR code dengan resolusi lebih tinggi
- Upload ulang dengan nama yang sama (upsert: true)

### **Nomor E-Wallet Tidak Muncul?**

**Cek:**
```sql
SELECT phone_number FROM payment_methods WHERE name = 'GoPay';
```

**Update:**
```sql
UPDATE payment_methods 
SET phone_number = '081234567890'
WHERE name = 'GoPay';
```

---

## 🚀 Best Practices

### **QR Code Image:**
1. ✅ Gunakan format PNG untuk transparansi
2. ✅ Ukuran square (1:1 ratio)
3. ✅ Resolusi minimal 500x500px
4. ✅ File size < 500KB
5. ✅ Background putih atau transparan

### **Naming Convention:**
```
[payment-method]-qr.[ext]

Contoh:
- gopay-qr.png
- qris-code.png
- ovo-qr.png
- dana-qr.png
```

### **Instructions:**
- ✅ Jelas dan singkat
- ✅ Bahasa Indonesia
- ✅ Mencantumkan alternatif (nomor atau QR)
- ✅ Friendly tone

### **Testing:**
1. ✅ Test scan QR code dengan berbagai apps
2. ✅ Test di mobile dan desktop
3. ✅ Test dengan berbagai browser
4. ✅ Verify payment flow end-to-end

---

## 📱 Supported Payment Apps

QR code yang di-generate harus bisa di-scan oleh:
- ✅ GoPay
- ✅ OVO
- ✅ DANA
- ✅ ShopeePay
- ✅ LinkAja
- ✅ Bank apps (BCA Mobile, Mandiri Online, dll)

---

## 🔐 Security Notes

1. **QR Code Bucket Public** - Bucket `qr-codes` harus public agar bisa diakses user
2. **Static QR** - Gunakan static QR untuk merchant account
3. **Dynamic QR** - Untuk amount-specific, generate per transaction
4. **Expiry** - Set expiry untuk dynamic QR codes
5. **Monitoring** - Monitor usage dan fraud detection

---

## 📚 Resources

**Generate QR Code:**
- https://www.qr-code-generator.com/
- https://qrcode.tec-it.com/
- API: https://goqr.me/api/

**QR Code Best Practices:**
- Size: 2cm x 2cm minimum for print
- Error correction: Level M (15%) or H (30%)
- Quiet zone: 4 modules around QR

---

**Created:** May 2026
**Last Updated:** May 2026
**Status:** ✅ Production Ready
