# 📊 Sistem Penunjang Keputusan (SPK) - Metode SAW

## 🎯 Overview
Sistem Penunjang Keputusan menggunakan metode **SAW (Simple Additive Weighting)** untuk menentukan prioritas order yang harus diproses terlebih dahulu oleh admin.

## 📋 Kriteria Penilaian

### **1. Total Pembelian (35%)**
- **Type:** Benefit (semakin besar semakin baik)
- **Bobot Default:** 0.35
- **Deskripsi:** Order dengan total pembelian lebih besar mendapat prioritas lebih tinggi
- **Alasan:** Customer dengan pembelian besar = revenue lebih tinggi

### **2. Waktu Tunggu (30%)**
- **Type:** Cost (semakin kecil semakin baik)
- **Bobot Default:** 0.30
- **Deskripsi:** Order yang sudah menunggu lebih lama mendapat prioritas lebih tinggi
- **Alasan:** Menghindari customer menunggu terlalu lama

### **3. Jumlah Item (20%)**
- **Type:** Benefit (semakin besar semakin baik)
- **Bobot Default:** 0.20
- **Deskripsi:** Order dengan jumlah item lebih banyak mendapat prioritas lebih tinggi
- **Alasan:** Kompleksitas packing dan processing

### **4. Bukti Pembayaran (15%)**
- **Type:** Benefit (ada lebih baik dari tidak ada)
- **Bobot Default:** 0.15
- **Deskripsi:** Order yang sudah upload bukti pembayaran mendapat prioritas lebih tinggi
- **Alasan:** Sudah ada konfirmasi pembayaran

## 🔢 Metode SAW (Simple Additive Weighting)

### **Langkah 1: Normalisasi**

**Untuk Kriteria Benefit:**
```
R[i,j] = X[i,j] / Max(X[j])
```

**Untuk Kriteria Cost:**
```
R[i,j] = Min(X[j]) / X[i,j]
```

Dimana:
- `R[i,j]` = Nilai normalisasi alternatif i pada kriteria j
- `X[i,j]` = Nilai alternatif i pada kriteria j
- `Max(X[j])` = Nilai maksimum kriteria j
- `Min(X[j])` = Nilai minimum kriteria j

### **Langkah 2: Perhitungan Skor Akhir**

```
V[i] = Σ (W[j] × R[i,j])
```

Dimana:
- `V[i]` = Skor akhir alternatif i
- `W[j]` = Bobot kriteria j
- `R[i,j]` = Nilai normalisasi alternatif i pada kriteria j
- `Σ W[j] = 1` (Total bobot harus 1)

### **Langkah 3: Ranking**

Alternatif diurutkan berdasarkan nilai `V[i]` dari tertinggi ke terendah.

## 📊 Contoh Perhitungan

### **Data Order:**

| Order | Total (Rp) | Waktu (jam) | Item | Bukti |
|-------|-----------|-------------|------|-------|
| #1    | 500,000   | 2           | 5    | Ya    |
| #2    | 1,000,000 | 5           | 3    | Tidak |
| #3    | 750,000   | 1           | 8    | Ya    |

### **Step 1: Normalisasi**

**Total Pembelian (Benefit):**
- Max = 1,000,000
- R1 = 500,000 / 1,000,000 = 0.50
- R2 = 1,000,000 / 1,000,000 = 1.00
- R3 = 750,000 / 1,000,000 = 0.75

**Waktu Tunggu (Cost):**
- Min = 1
- R1 = 1 / 2 = 0.50
- R2 = 1 / 5 = 0.20
- R3 = 1 / 1 = 1.00

**Jumlah Item (Benefit):**
- Max = 8
- R1 = 5 / 8 = 0.625
- R2 = 3 / 8 = 0.375
- R3 = 8 / 8 = 1.00

**Bukti Pembayaran (Benefit):**
- R1 = 1 (Ya)
- R2 = 0 (Tidak)
- R3 = 1 (Ya)

### **Step 2: Perhitungan Skor**

**Order #1:**
```
V1 = (0.50 × 0.35) + (0.50 × 0.30) + (0.625 × 0.20) + (1 × 0.15)
V1 = 0.175 + 0.150 + 0.125 + 0.150
V1 = 0.600
```

**Order #2:**
```
V2 = (1.00 × 0.35) + (0.20 × 0.30) + (0.375 × 0.20) + (0 × 0.15)
V2 = 0.350 + 0.060 + 0.075 + 0.000
V2 = 0.485
```

**Order #3:**
```
V3 = (0.75 × 0.35) + (1.00 × 0.30) + (1.00 × 0.20) + (1 × 0.15)
V3 = 0.263 + 0.300 + 0.200 + 0.150
V3 = 0.913
```

### **Step 3: Ranking**

| Rank | Order | Skor  | Prioritas |
|------|-------|-------|-----------|
| 🥇 1 | #3    | 0.913 | Tertinggi |
| 🥈 2 | #1    | 0.600 | Tinggi    |
| 🥉 3 | #2    | 0.485 | Sedang    |

**Kesimpulan:** Order #3 harus diproses terlebih dahulu!

## 🎨 Fitur UI/UX

### **1. Header Dashboard**
- Gradient background (indigo-purple-pink)
- Floating decorative elements
- Total order counter
- Animated entrance

### **2. Settings Panel**
- Adjustable weights untuk setiap kriteria
- Real-time weight validation
- Auto-normalization button
- Benefit/Cost badge
- Info panel tentang SAW

### **3. Results Panel**
- Ranking cards dengan gradient
- Medal badges (🥇🥈🥉)
- Score breakdown dengan progress bars
- Detailed calculation display
- Action buttons per order

### **4. Visual Indicators**
- **Rank 1:** Yellow/Gold gradient
- **Rank 2:** Silver/Gray gradient
- **Rank 3:** Bronze/Orange gradient
- **Others:** Blue gradient

### **5. Animations**
- Framer Motion entrance animations
- Stagger effect untuk list items
- Smooth transitions
- Hover effects

## 📱 Responsive Design

### **Desktop (lg):**
- 3-column layout (1 sidebar + 2 main)
- Full settings panel visible
- Large cards with detailed info

### **Tablet (md):**
- 2-column layout
- Collapsible settings
- Medium cards

### **Mobile:**
- Single column
- Compact cards
- Scrollable results

## 🔧 Customization

### **Mengubah Bobot Kriteria:**

1. Klik "Tampilkan" di panel Pengaturan Kriteria
2. Adjust slider atau input nilai bobot (0-1)
3. Pastikan total bobot = 1.00
4. Klik "Normalisasi Bobot" jika perlu
5. Hasil ranking akan update otomatis

### **Menambah Kriteria Baru:**

Edit `src/components/admin/spk-client.tsx`:

```typescript
const [criteriaWeights, setCriteriaWeights] = useState<Criteria[]>([
  // ... existing criteria
  {
    name: 'Kriteria Baru',
    weight: 0.10,
    type: 'benefit', // or 'cost'
    icon: YourIcon,
    description: 'Deskripsi kriteria'
  }
])
```

Tambahkan perhitungan di `sawResults`:

```typescript
const newCriteria = // calculate value
const normalizedNewCriteria = // normalize value

// Add to finalScore calculation
const finalScore = 
  // ... existing calculations
  + (normalizedNewCriteria * criteriaWeights[4].weight)
```

## 📊 Use Cases

### **1. Prioritas Processing Order**
- Admin melihat order mana yang harus diproses duluan
- Berdasarkan multiple factors (bukan hanya FIFO)
- Optimasi kepuasan customer

### **2. Resource Allocation**
- Assign staff ke order prioritas tinggi
- Alokasi packaging materials
- Scheduling pengiriman

### **3. Performance Monitoring**
- Track average processing time per priority level
- Identify bottlenecks
- Improve SLA compliance

### **4. Customer Segmentation**
- Identify VIP customers (high value orders)
- Prioritize repeat customers
- Loyalty program targeting

## 🎯 Benefits

### **Untuk Admin:**
- ✅ Keputusan objektif (data-driven)
- ✅ Tidak perlu manual sorting
- ✅ Transparent reasoning
- ✅ Customizable weights

### **Untuk Business:**
- ✅ Optimasi revenue (prioritize high-value)
- ✅ Customer satisfaction (reduce waiting time)
- ✅ Efficient resource allocation
- ✅ Better SLA compliance

### **Untuk Customer:**
- ✅ Fair prioritization
- ✅ Faster processing untuk urgent orders
- ✅ Predictable service level

## 🚀 Future Enhancements

- [ ] Machine Learning untuk auto-adjust weights
- [ ] Historical data analysis
- [ ] Predictive analytics
- [ ] Multi-criteria decision making (MCDM) methods
- [ ] Export ranking results to PDF/Excel
- [ ] Real-time notifications untuk top priority orders
- [ ] Integration dengan inventory system
- [ ] Customer feedback loop

## 📚 References

- **SAW Method:** Fishburn, P. C. (1967). Additive Utilities with Incomplete Product Set
- **MCDM:** Hwang, C. L., & Yoon, K. (1981). Multiple Attribute Decision Making
- **Decision Support Systems:** Turban, E., & Aronson, J. E. (2001). Decision Support Systems and Intelligent Systems

---

**Created:** May 2026
**Method:** SAW (Simple Additive Weighting)
**Status:** ✅ Production Ready
**Access:** Admin Only
