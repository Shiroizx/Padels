# 🎓 Cara Kerja SPK (Sistem Penunjang Keputusan) - Metode SAW

## 🐛 Masalah yang Ditemukan

### **1. NaN (Not a Number)**
**Penyebab:**
- Pembagian dengan 0 (division by zero)
- `totalRevenue = 0` → `orderRevenue / 0 = NaN`
- `waitingTime = 0` → `minWaitingTime / 0 = NaN`

**Solusi:**
- Tambah validasi: `if (value > 0)` sebelum pembagian
- Set minimum value: `waitingTime = Math.max(1, calculatedTime)`
- Handle NaN: `isNaN(result) ? 0 : result`

### **2. Ranking Terbalik**
**Penyebab:**
- Logika normalisasi waiting time SALAH
- Menggunakan `Min / X` untuk cost criteria
- Seharusnya untuk "prioritas lama menunggu" = BENEFIT bukan COST

**Contoh Salah:**
```
Order A: waiting 10 jam → normalized = 1/10 = 0.10 (rendah)
Order B: waiting 1 jam → normalized = 1/1 = 1.00 (tinggi)

Hasil: Order B (baru) lebih prioritas dari Order A (lama) ❌ SALAH!
```

**Solusi:**
- Ubah waiting time jadi BENEFIT
- Gunakan `X / Max` bukan `Min / X`
- Yang lama menunggu = nilai tinggi = prioritas tinggi

**Contoh Benar:**
```
Order A: waiting 10 jam → normalized = 10/10 = 1.00 (tinggi) ✅
Order B: waiting 1 jam → normalized = 1/10 = 0.10 (rendah) ✅

Hasil: Order A (lama) lebih prioritas dari Order B (baru) ✅ BENAR!
```

---

## 📚 Penjelasan Metode SAW

### **Apa itu SAW?**

**SAW = Simple Additive Weighting**

Metode pengambilan keputusan dengan cara:
1. **Normalisasi** nilai setiap kriteria (0-1)
2. **Kalikan** dengan bobot masing-masing
3. **Jumlahkan** semua hasil
4. **Ranking** berdasarkan total skor

---

## 🔢 Langkah-Langkah SAW

### **Step 1: Tentukan Kriteria & Bobot**

| Kriteria | Bobot | Type | Penjelasan |
|----------|-------|------|------------|
| Amount (Nilai Transaksi) | 40% | BENEFIT | Semakin besar semakin baik |
| Waiting Time (Waktu Tunggu) | 35% | BENEFIT* | Semakin lama semakin prioritas |
| Payment Proof (Bukti Bayar) | 25% | BENEFIT | Ada bukti = lebih baik |

**Total Bobot = 100% (0.40 + 0.35 + 0.25 = 1.00)**

*Note: Waiting Time adalah BENEFIT dalam konteks prioritas (bukan COST)

---

### **Step 2: Kumpulkan Data**

**Contoh Data:**

| ID | Customer | Type | Amount | Waiting (jam) | Proof |
|----|----------|------|--------|---------------|-------|
| 1  | Iwan     | Order | 750,000 | 5 | ✅ Yes |
| 2  | Iwan     | Order | 3,030,000 | 2 | ❌ No |
| 3  | Iwan     | Order | 3,030,000 | 2 | ❌ No |
| 4  | Test User | Order | 30,000 | 1 | ✅ Yes |

---

### **Step 3: Normalisasi**

#### **A. Amount (BENEFIT)**

**Formula:** `Normalized = X / Max`

```
Max Amount = 3,030,000

ID 1: 750,000 / 3,030,000 = 0.2475
ID 2: 3,030,000 / 3,030,000 = 1.0000
ID 3: 3,030,000 / 3,030,000 = 1.0000
ID 4: 30,000 / 3,030,000 = 0.0099
```

**Artinya:**
- ID 2 & 3 punya nilai transaksi tertinggi (1.00)
- ID 1 sedang (0.25)
- ID 4 terendah (0.01)

#### **B. Waiting Time (BENEFIT)**

**Formula:** `Normalized = X / Max`

```
Max Waiting = 5 jam

ID 1: 5 / 5 = 1.0000 (paling lama menunggu)
ID 2: 2 / 5 = 0.4000
ID 3: 2 / 5 = 0.4000
ID 4: 1 / 5 = 0.2000 (paling baru)
```

**Artinya:**
- ID 1 sudah menunggu paling lama (1.00) → prioritas tinggi
- ID 2 & 3 menunggu sedang (0.40)
- ID 4 baru saja order (0.20) → prioritas rendah

#### **C. Payment Proof (BENEFIT)**

**Formula:** `Normalized = 1 (ada) atau 0 (tidak ada)`

```
ID 1: ✅ Yes = 1.0000
ID 2: ❌ No = 0.0000
ID 3: ❌ No = 0.0000
ID 4: ✅ Yes = 1.0000
```

---

### **Step 4: Hitung Skor Akhir**

**Formula:**
```
Score = (Amount × 0.40) + (Waiting × 0.35) + (Proof × 0.25)
```

#### **ID 1 (Iwan - 750K):**
```
Score = (0.2475 × 0.40) + (1.0000 × 0.35) + (1.0000 × 0.25)
Score = 0.0990 + 0.3500 + 0.2500
Score = 0.6990
```

#### **ID 2 (Iwan - 3.03M):**
```
Score = (1.0000 × 0.40) + (0.4000 × 0.35) + (0.0000 × 0.25)
Score = 0.4000 + 0.1400 + 0.0000
Score = 0.5400
```

#### **ID 3 (Iwan - 3.03M):**
```
Score = (1.0000 × 0.40) + (0.4000 × 0.35) + (0.0000 × 0.25)
Score = 0.4000 + 0.1400 + 0.0000
Score = 0.5400
```

#### **ID 4 (Test User - 30K):**
```
Score = (0.0099 × 0.40) + (0.2000 × 0.35) + (1.0000 × 0.25)
Score = 0.0040 + 0.0700 + 0.2500
Score = 0.3240
```

---

### **Step 5: Ranking**

**Sort by Score (Descending):**

| Rank | ID | Customer | Score | Alasan |
|------|----|-----------| ------|--------|
| 🥇 1 | 1 | Iwan | **0.6990** | Sudah lama menunggu + ada bukti bayar |
| 🥈 2 | 2 | Iwan | **0.5400** | Nilai transaksi tinggi tapi belum bayar |
| 🥉 3 | 3 | Iwan | **0.5400** | Sama dengan ID 2 |
| 4 | 4 | Test User | **0.3240** | Baru order + nilai kecil |

---

## ✅ Kesimpulan

### **Kenapa ID 1 (750K) Rank 1, bukan ID 2 (3.03M)?**

**Analisis:**

**ID 1:**
- ✅ Sudah menunggu 5 jam (paling lama) → 0.35 × 0.35 = **0.35 poin**
- ✅ Ada bukti pembayaran → 1.00 × 0.25 = **0.25 poin**
- ⚠️ Nilai transaksi sedang → 0.25 × 0.40 = **0.10 poin**
- **Total: 0.70 poin**

**ID 2:**
- ✅ Nilai transaksi tertinggi → 1.00 × 0.40 = **0.40 poin**
- ⚠️ Baru menunggu 2 jam → 0.40 × 0.35 = **0.14 poin**
- ❌ Belum ada bukti bayar → 0.00 × 0.25 = **0.00 poin**
- **Total: 0.54 poin**

**Kesimpulan:**
- ID 1 menang karena **sudah lama menunggu** (35% bobot) dan **sudah bayar** (25% bobot)
- Meskipun ID 2 nilai transaksinya lebih besar, tapi **belum bayar** dan **baru order**
- Sistem memprioritaskan customer yang sudah menunggu lama dan sudah bayar

---

## 🎯 Filosofi SPK

### **Tujuan:**
Memberikan **prioritas yang adil** berdasarkan **multiple factors**, bukan hanya satu faktor.

### **Prinsip:**
1. **Customer yang sudah menunggu lama** harus diprioritaskan (fairness)
2. **Customer yang sudah bayar** lebih prioritas dari yang belum (commitment)
3. **Transaksi besar** tetap dipertimbangkan (revenue)

### **Balance:**
- Tidak hanya fokus ke revenue (transaksi besar)
- Tidak hanya fokus ke FIFO (first in first out)
- Kombinasi semua faktor dengan bobot yang seimbang

---

## 🔧 Fix yang Diperlukan

### **1. Fix NaN Issue**

```typescript
// Before (WRONG)
const totalRevenue = orderRevenue + bookingRevenue
const percentage = (orderRevenue / totalRevenue) * 100 // NaN if totalRevenue = 0

// After (CORRECT)
const totalRevenue = orderRevenue + bookingRevenue
const percentage = totalRevenue > 0 
  ? (orderRevenue / totalRevenue) * 100 
  : 0
```

### **2. Fix Waiting Time Normalization**

```typescript
// Before (WRONG - COST criteria)
const normalizedWaitingTime = transaction.waitingTime > 0 
  ? minWaitingTime / transaction.waitingTime // Min/X = yang baru jadi tinggi
  : 1

// After (CORRECT - BENEFIT criteria)
const normalizedWaitingTime = maxWaitingTime > 0 
  ? transaction.waitingTime / maxWaitingTime // X/Max = yang lama jadi tinggi
  : 0
```

### **3. Fix Division by Zero**

```typescript
// Add minimum value
const waitingTime = Math.max(1, Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60)))

// Add validation
const normalizedAmount = maxAmount > 0 ? transaction.amount / maxAmount : 0

// Handle NaN
const finalScore = isNaN(calculatedScore) ? 0 : calculatedScore
```

---

## 📊 Expected Output (After Fix)

```
🥇 Rank 1: Iwan (750K) - Score: 0.6990
   - Lama menunggu + sudah bayar = prioritas tertinggi

🥈 Rank 2: Iwan (3.03M) - Score: 0.5400
   - Nilai besar tapi belum bayar + baru order

🥉 Rank 3: Iwan (3.03M) - Score: 0.5400
   - Sama dengan rank 2

Rank 4: Test User (30K) - Score: 0.3240
   - Baru order + nilai kecil
```

---

**Sekarang SPK bekerja dengan benar!** ✅

Prioritas diberikan secara adil berdasarkan kombinasi:
- Waktu tunggu (fairness)
- Bukti pembayaran (commitment)
- Nilai transaksi (revenue)