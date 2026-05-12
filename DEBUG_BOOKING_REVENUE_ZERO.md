# Debug: Booking Revenue Showing Rp 0

## Problem
Halaman SPK menampilkan:
- Total Bookings: 4
- Revenue Bookings: **Rp 0** ❌
- Conversion Rate: 100.0%

Ini berarti ada 4 bookings, tapi revenue-nya 0.

## Possible Causes

### 1. Column Name Mismatch
Database mungkin menggunakan nama kolom yang berbeda:
- ❌ `total_price` (yang kita gunakan)
- ✅ `price` atau `total_amount` atau `amount` (yang sebenarnya ada)

### 2. Null Values
Semua bookings memiliki `total_price = NULL`

### 3. Data Type Issue
`total_price` mungkin disimpan sebagai string, bukan number

### 4. Validation Too Strict
Kode kita skip bookings yang `total_price == null`, mungkin terlalu strict

## Debugging Steps

### Step 1: Check Console Logs
Saya sudah menambahkan console.log di kode. Setelah restart dev server:

1. Buka browser console (F12)
2. Navigate ke `/admin/spk`
3. Lihat output console:

```javascript
// Should see:
Booking Revenue Calculation: {
  totalBookings: 4,
  bookingRevenue: 0,  // <-- Ini yang jadi masalah
  sampleBooking: { ... }  // <-- Cek struktur data booking
}

// Jika ada booking dengan null price:
Booking with null total_price: <booking_id> { ... }

// Jika ada booking yang di-skip:
Skipping booking due to missing data: <booking_id>
```

### Step 2: Run SQL Query
Jalankan query di `check-bookings-data.sql` di Supabase SQL Editor:

```sql
-- Check all bookings
SELECT 
  id,
  customer_name,
  total_price,
  status,
  created_at
FROM bookings
ORDER BY created_at DESC;
```

**Expected Output:**
- Jika `total_price` ada dan berisi angka → Masalah di kode
- Jika `total_price` NULL → Masalah di database
- Jika kolom `total_price` tidak ada → Masalah nama kolom

### Step 3: Check Database Schema
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings' 
  AND column_name LIKE '%price%';
```

Ini akan menampilkan semua kolom yang mengandung kata "price".

## Solutions Based on Findings

### Solution A: Column Name is Different
Jika kolom sebenarnya bernama `price` atau `amount`:

**Update `src/app/admin/spk/page.tsx`:**
```typescript
// Tambahkan alias di query
const { data: bookings } = await supabase
  .from('bookings')
  .select(`
    *,
    price as total_price,  // <-- Alias kolom yang benar
    courts (
      id,
      name,
      price_per_hour
    )
  `)
```

**Or update interface di `spk-client.tsx`:**
```typescript
interface Booking {
  // ... other fields
  price: number  // <-- Ganti dari total_price ke price
}

// Then update usage:
amount: Number(booking.price) || 0
```

### Solution B: Values are NULL
Jika `total_price` memang NULL, perlu update database:

```sql
-- Calculate total_price from duration and court price
UPDATE bookings b
SET total_price = (
  SELECT 
    EXTRACT(EPOCH FROM (b.end_time::time - b.start_time::time)) / 3600 * c.price_per_hour
  FROM courts c
  WHERE c.id = b.court_id
)
WHERE total_price IS NULL;
```

### Solution C: Data Type is String
Jika `total_price` adalah string:

```typescript
// More aggressive conversion
const bookingRevenue = bookings.reduce((sum, b) => {
  // Try multiple conversions
  const amount = parseFloat(String(b.total_price || '0').replace(/[^0-9.-]/g, ''))
  return sum + (isNaN(amount) ? 0 : amount)
}, 0)
```

### Solution D: Remove Strict Validation
Jika validasi terlalu ketat, relax it:

```typescript
// Process bookings - less strict validation
bookings.forEach(booking => {
  // Only skip if ID is missing
  if (!booking.id) {
    return
  }

  // Use 0 for missing price instead of skipping
  const amount = Number(booking.total_price) || 0
  
  allTransactions.push({
    id: booking.id,
    type: 'booking',
    customerName: booking.customer_name || 'Unknown Customer',
    amount: amount,  // <-- Will be 0 if null, but still included
    // ...
  })
})
```

## Quick Test

### Test 1: Check Raw Data
Tambahkan ini di `src/app/admin/spk/page.tsx` sebelum return:

```typescript
console.log('Raw bookings data:', bookings)
console.log('First booking:', bookings?.[0])
```

### Test 2: Check in Browser
1. Restart dev server
2. Open `/admin/spk`
3. Open console (F12)
4. Look for the logs above
5. Check struktur data booking

### Test 3: Manual Calculation
Di console browser, jalankan:

```javascript
// Assuming bookings data is available
const total = bookings.reduce((sum, b) => {
  console.log('Booking:', b.id, 'Price:', b.total_price)
  return sum + (Number(b.total_price) || 0)
}, 0)
console.log('Manual total:', total)
```

## Next Steps

1. **Restart dev server** untuk apply console.log
2. **Check browser console** untuk melihat output debug
3. **Run SQL query** di Supabase untuk cek data
4. **Report findings** - paste console output atau SQL result
5. **Apply appropriate solution** based on findings

## Files to Check
- ✅ `src/components/admin/spk-client.tsx` - Added debug logs
- ✅ `check-bookings-data.sql` - SQL queries to check data
- 📝 `src/app/admin/spk/page.tsx` - May need to update query

## Common Issues

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Console shows "null total_price" | Database has NULL values | Run UPDATE query |
| Console shows "Skipping booking" | Validation too strict | Relax validation |
| Console shows wrong column name | Column name mismatch | Update query/interface |
| Console shows string values | Data type issue | Add parseFloat conversion |

---

**ACTION REQUIRED:** 
1. Restart dev server
2. Check browser console
3. Share the console output here so we can identify the exact issue
