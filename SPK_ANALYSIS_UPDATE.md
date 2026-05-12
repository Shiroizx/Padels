# 📊 SPK Analysis - Orders & Bookings

## 🎯 Overview
SPK (Sistem Penunjang Keputusan) telah diupdate menjadi **halaman analisis lengkap** yang mencakup **Orders** dan **Bookings** dengan metode SAW untuk ranking prioritas.

## ✨ Fitur Baru

### **1. Multi-Tab Interface**
- 📊 **Overview** - Statistik keseluruhan
- 🛒 **Orders** - Analisis orders
- 📅 **Bookings** - Analisis bookings  
- 🏆 **Ranking SAW** - Complete ranking semua transaksi

### **2. Overview Tab**

#### **Statistics Cards:**
- **Total Transaksi** - Orders + Bookings
- **Total Revenue** - Gabungan revenue
- **Conversion Rate** - Paid / Total
- **Pending** - Menunggu pembayaran

#### **Revenue Comparison:**
- Orders Revenue dengan progress bar
- Bookings Revenue dengan progress bar
- Persentase kontribusi masing-masing
- Breakdown: Total, Paid, Pending

#### **Top 5 Transactions:**
- Ranking berdasarkan SAW score
- Gabungan orders dan bookings
- Medal badges (🥇🥈🥉)
- SAW score display

### **3. Orders Tab**

#### **Statistics:**
- Total Orders
- Revenue Orders
- Conversion Rate Orders

#### **Top 3 Orders:**
- Ranking berdasarkan SAW
- Detail: Amount, Status, Payment Proof
- Green gradient design

### **4. Bookings Tab**

#### **Statistics:**
- Total Bookings
- Revenue Bookings
- Conversion Rate Bookings

#### **Top 3 Bookings:**
- Ranking berdasarkan SAW
- Detail: Amount, Status, Payment Proof
- Blue gradient design

### **5. Ranking SAW Tab**

#### **Complete List:**
- Semua transaksi (orders + bookings)
- Sorted by SAW score
- Rank badges dengan gradient
- Type badges (Order/Booking)
- Detailed information

## 🔢 SAW Calculation

### **Kriteria (Simplified):**

1. **Amount (40%)** - Benefit
   - Semakin besar nilai transaksi, semakin tinggi prioritas
   
2. **Waiting Time (35%)** - Cost
   - Semakin lama menunggu, semakin tinggi prioritas
   
3. **Payment Proof (25%)** - Benefit
   - Sudah upload bukti = prioritas lebih tinggi

### **Formula:**

```
Normalisasi:
- Amount (Benefit): R = X / Max(X)
- Waiting Time (Cost): R = Min(X) / X
- Payment Proof (Benefit): R = 1 (ada) atau 0 (tidak ada)

Final Score:
V = (R_amount × 0.40) + (R_waiting × 0.35) + (R_proof × 0.25)
```

### **Contoh:**

**Transaction A (Order):**
- Amount: Rp 1,000,000 → Normalized: 1.00
- Waiting: 2 jam → Normalized: 0.50
- Proof: Yes → Normalized: 1.00
- **Score: (1.00 × 0.40) + (0.50 × 0.35) + (1.00 × 0.25) = 0.825**

**Transaction B (Booking):**
- Amount: Rp 500,000 → Normalized: 0.50
- Waiting: 1 jam → Normalized: 1.00
- Proof: No → Normalized: 0.00
- **Score: (0.50 × 0.40) + (1.00 × 0.35) + (0.00 × 0.25) = 0.550**

**Ranking: A > B**

## 🎨 Design Features

### **Color Schemes:**

**Orders:**
- Primary: Green/Emerald gradient
- Cards: from-green-50 to-emerald-50
- Icons: Green tones

**Bookings:**
- Primary: Blue/Cyan gradient
- Cards: from-blue-50 to-cyan-50
- Icons: Blue tones

**Combined:**
- Header: Blue-Indigo-Purple gradient
- Ranking: Purple tones
- Medals: Gold, Silver, Bronze

### **Animations:**
- Framer Motion entrance
- Smooth transitions
- Hover effects
- Tab switching animations

### **Responsive:**
- Mobile: Single column
- Tablet: 2 columns
- Desktop: 3-4 columns
- Adaptive cards

## 📊 Use Cases

### **1. Business Intelligence**
- Compare orders vs bookings performance
- Identify revenue sources
- Track conversion rates
- Monitor pending transactions

### **2. Priority Management**
- See which transactions need attention
- Prioritize based on multiple factors
- Fair and objective ranking

### **3. Performance Monitoring**
- Track KPIs (conversion, revenue)
- Identify trends
- Compare periods
- Optimize operations

### **4. Decision Making**
- Data-driven decisions
- Objective prioritization
- Resource allocation
- Customer segmentation

## 📈 Metrics Tracked

### **Revenue Metrics:**
- Total Revenue (Orders + Bookings)
- Orders Revenue
- Bookings Revenue
- Revenue Distribution (%)

### **Transaction Metrics:**
- Total Transactions
- Total Orders
- Total Bookings
- Transaction Mix

### **Conversion Metrics:**
- Overall Conversion Rate
- Orders Conversion Rate
- Bookings Conversion Rate
- Payment Proof Rate

### **Status Metrics:**
- Paid/Confirmed Count
- Pending Count
- Cancelled Count (if any)
- Status Distribution

## 🎯 Benefits

### **For Admin:**
- ✅ Comprehensive overview
- ✅ Easy comparison (orders vs bookings)
- ✅ Objective prioritization
- ✅ Quick insights

### **For Business:**
- ✅ Revenue optimization
- ✅ Better resource allocation
- ✅ Improved decision making
- ✅ Performance tracking

### **For Operations:**
- ✅ Clear priorities
- ✅ Fair processing order
- ✅ Efficient workflow
- ✅ Reduced waiting time

## 🚀 Future Enhancements

- [ ] Date range filter
- [ ] Export to PDF/Excel
- [ ] Charts and graphs
- [ ] Trend analysis
- [ ] Predictive analytics
- [ ] Custom criteria weights
- [ ] Real-time updates
- [ ] Email notifications
- [ ] Mobile app
- [ ] API endpoints

## 📱 Access

**URL:** `/admin/spk`

**Requirements:**
- Admin role
- Authenticated user

**Navigation:**
- Admin Dashboard → SPK
- Or direct URL access

## 🔧 Technical Details

### **Data Sources:**
```typescript
// Orders
const { data: orders } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      id,
      quantity,
      price
    )
  `)

// Bookings
const { data: bookings } = await supabase
  .from('bookings')
  .select(`
    *,
    courts (
      id,
      name,
      price_per_hour
    )
  `)
```

### **SAW Implementation:**
```typescript
// Combine all transactions
const allTransactions = [...orders, ...bookings]

// Normalize
const normalized = allTransactions.map(t => ({
  ...t,
  normalizedAmount: t.amount / maxAmount,
  normalizedWaiting: minWaiting / t.waiting,
  normalizedProof: t.hasProof ? 1 : 0
}))

// Calculate score
const scored = normalized.map(t => ({
  ...t,
  score: (t.normalizedAmount * 0.40) +
         (t.normalizedWaiting * 0.35) +
         (t.normalizedProof * 0.25)
}))

// Rank
const ranked = scored.sort((a, b) => b.score - a.score)
```

## 📚 References

- **SAW Method:** Simple Additive Weighting
- **MCDM:** Multi-Criteria Decision Making
- **BI:** Business Intelligence
- **KPI:** Key Performance Indicators

---

**Created:** May 2026
**Type:** Analysis Dashboard
**Method:** SAW (Simple Additive Weighting)
**Status:** ✅ Production Ready
**Access:** Admin Only
