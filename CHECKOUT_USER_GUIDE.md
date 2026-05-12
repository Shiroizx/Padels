# 🛍️ Panduan Checkout - User Guide

## 🎯 Cara Melakukan Checkout

### 1️⃣ **Dari Keranjang ke Checkout**

**Langkah:**
1. Buka halaman `/cart`
2. Review produk di keranjang Anda
3. Klik tombol **"Lanjut ke Checkout"**

**Fitur di Halaman Cart:**
- ✅ Update quantity produk
- ✅ Hapus produk dari keranjang
- ✅ Lihat subtotal per item
- ✅ Lihat total keseluruhan
- ✅ Informasi ongkir (GRATIS)

---

### 2️⃣ **Step 1: Informasi Pengiriman**

**Form yang harus diisi:**
- 📝 Nama Lengkap (required)
- 📧 Email (required)
- 📱 Nomor Telepon (required)
- 🏠 Alamat Lengkap (required)
- 🏙️ Kota (required)
- 🗺️ Provinsi (required)
- 📮 Kode Pos (optional)
- 📄 Catatan (optional)

**Tips:**
- Pastikan nomor telepon aktif untuk dihubungi kurir
- Tulis alamat selengkap mungkin (RT/RW, patokan)
- Gunakan catatan untuk instruksi khusus

**Tombol:**
- ➡️ **Lanjutkan** - Ke step berikutnya

---

### 3️⃣ **Step 2: Metode Pembayaran**

**Pilih Metode Pembayaran:**
- 💳 Transfer Bank
- 📱 E-Wallet (GoPay, OVO, Dana)
- 🔲 QRIS
- 💰 Cash on Delivery (COD)

**Upload Bukti Pembayaran:**
1. Pilih metode pembayaran
2. Lihat detail rekening/nomor
3. Lakukan transfer
4. Upload foto/screenshot bukti transfer
5. File akan ditampilkan setelah dipilih

**Format File:**
- ✅ JPG, JPEG, PNG
- ✅ Maksimal 5MB
- ✅ Foto harus jelas dan terbaca

**Tombol:**
- ⬅️ **Kembali** - Ke step sebelumnya
- ➡️ **Lanjutkan** - Ke step review

---

### 4️⃣ **Step 3: Review & Konfirmasi**

**Yang Ditampilkan:**

**📦 Alamat Pengiriman**
- Nama penerima
- Nomor telepon
- Email
- Alamat lengkap
- Catatan (jika ada)

**💳 Metode Pembayaran**
- Nama metode
- Detail rekening
- Status upload bukti

**Tombol Edit:**
- Klik **"Edit"** di setiap section untuk kembali ke step tersebut

**Tombol:**
- ⬅️ **Kembali** - Ke step pembayaran
- ✅ **Buat Pesanan** - Submit order

---

### 5️⃣ **Success Page**

**Setelah Order Berhasil:**
- 🎉 Confetti animation
- ✅ Nomor pesanan ditampilkan
- 📋 Langkah selanjutnya dijelaskan

**Langkah Selanjutnya:**
1. **Cek Email** - Konfirmasi dikirim ke email
2. **Lakukan Pembayaran** - Transfer & upload bukti
3. **Tunggu Konfirmasi** - Admin verifikasi (maks 1x24 jam)
4. **Pesanan Dikirim** - Produk dikirim ke alamat

**Tombol Aksi:**
- 📦 **Lihat Detail Pesanan** - Ke halaman order detail
- 🛍️ **Belanja Lagi** - Ke halaman produk
- 🏠 **Ke Dashboard** - Ke dashboard user

---

## 📱 Halaman Order Detail

### **Cara Akses:**
1. Dari success page → Klik "Lihat Detail Pesanan"
2. Dari dashboard → Menu "Pesanan Saya"
3. Dari URL: `/orders/[order-id]`

### **Informasi yang Ditampilkan:**

**📋 Header**
- Nomor pesanan
- Tanggal pembuatan
- Status pesanan (badge berwarna)
- Tombol share

**📦 Produk Pesanan**
- Foto produk
- Nama produk
- Kategori
- Quantity
- Harga per item
- Subtotal

**🚚 Informasi Pengiriman**
- Nama penerima
- Nomor telepon
- Alamat lengkap
- Catatan pengiriman

**💰 Ringkasan Pesanan**
- Subtotal
- Ongkir (GRATIS)
- Total pembayaran

**💳 Informasi Pembayaran**
- Metode pembayaran
- Bukti pembayaran (jika sudah upload)
- Status verifikasi

### **Status Pesanan:**

| Status | Warna | Arti |
|--------|-------|------|
| 🟡 Pending | Amber | Menunggu pembayaran |
| 🟢 Paid | Green | Pembayaran dikonfirmasi |
| 🔵 Processing | Blue | Pesanan sedang diproses |
| 🟣 Shipped | Purple | Pesanan dalam pengiriman |
| ✅ Delivered | Green | Pesanan selesai |
| 🔴 Cancelled | Red | Pesanan dibatalkan |

### **Fitur Tambahan:**
- 📤 **Share** - Bagikan link pesanan
- 💾 **Download** - Download bukti pembayaran
- 💬 **Hubungi CS** - Customer service

---

## 🎨 Fitur UI/UX

### **Animasi:**
- ✨ Smooth page transitions
- 🎯 Stagger animations untuk list
- 🔄 Loading states
- 🎊 Confetti celebration
- 💫 Hover effects

### **Responsive Design:**
- 📱 Mobile-friendly
- 💻 Tablet optimized
- 🖥️ Desktop enhanced
- 🔄 Auto-adjust layout

### **Accessibility:**
- ♿ Keyboard navigation
- 🎨 High contrast colors
- 📝 Clear labels
- 🔍 Focus indicators

---

## ⚠️ Troubleshooting

### **Tidak bisa lanjut ke step berikutnya?**
- ✅ Pastikan semua field required terisi
- ✅ Cek format email valid
- ✅ Nomor telepon minimal 10 digit

### **Upload bukti pembayaran gagal?**
- ✅ Cek ukuran file (max 5MB)
- ✅ Format harus JPG/PNG
- ✅ Pastikan koneksi internet stabil

### **Order tidak muncul?**
- ✅ Cek halaman "Pesanan Saya"
- ✅ Refresh halaman
- ✅ Cek email konfirmasi
- ✅ Hubungi customer service

### **Ingin ubah pesanan?**
- ⚠️ Pesanan tidak bisa diubah setelah dibuat
- 💬 Hubungi customer service untuk bantuan
- 🔄 Bisa cancel dan buat pesanan baru

---

## 📞 Bantuan

**Butuh Bantuan?**
- 💬 Chat customer service
- 📧 Email: support@example.com
- 📱 WhatsApp: +62xxx-xxxx-xxxx
- ⏰ Jam operasional: 08:00 - 20:00 WIB

---

## 🔒 Keamanan

**Transaksi Aman:**
- 🔐 SSL Encryption
- 🛡️ Data protection
- ✅ Verified payment methods
- 🔒 Secure file upload

**Privacy:**
- 🔐 Data pribadi dilindungi
- 🚫 Tidak dibagikan ke pihak ketiga
- ✅ Sesuai kebijakan privasi

---

**Last Updated:** May 2026
**Version:** 1.0.0
