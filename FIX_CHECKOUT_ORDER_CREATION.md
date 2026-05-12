# 🔧 Fix: Checkout Order Creation Error

## 🐛 Problem
Error saat membuat pesanan di checkout:
```
Error creating order: {
  code: 'PGRST204',
  message: "Could not find the 'shipping_address' column of 'orders' in the schema cache"
}
```

## 🔍 Root Cause
Komponen checkout menggunakan nama kolom yang salah:
- ❌ `shipping_address` (tidak ada di database)
- ❌ `shipping_name` (tidak ada di database)
- ❌ `shipping_phone` (tidak ada di database)

Nama kolom yang benar di tabel `orders`:
- ✅ `customer_address`
- ✅ `customer_name`
- ✅ `customer_phone`

## ✅ Solution

### **1. Update Checkout Client**

**File:** `src/components/checkout/checkout-client.tsx`

**Before:**
```typescript
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    total_amount: getTotalPrice(),
    status: 'pending',
    shipping_address: `${shippingData.address}...`,  // ❌ Wrong
    shipping_name: shippingData.fullName,            // ❌ Wrong
    shipping_phone: shippingData.phone,              // ❌ Wrong
    notes: shippingData.notes
  })
```

**After:**
```typescript
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    total_amount: getTotalPrice(),
    status: 'pending',
    customer_address: `${shippingData.address}...`,  // ✅ Correct
    customer_name: shippingData.fullName,            // ✅ Correct
    customer_phone: shippingData.phone,              // ✅ Correct
    payment_method_id: paymentData.methodId,         // ✅ Added
    notes: shippingData.notes
  })
```

### **2. Update Order Detail Client**

**File:** `src/components/orders/order-detail-client.tsx`

**Interface Update:**
```typescript
// Before
interface Order {
  shipping_name: string      // ❌ Wrong
  shipping_phone: string     // ❌ Wrong
  shipping_address: string   // ❌ Wrong
}

// After
interface Order {
  customer_name: string      // ✅ Correct
  customer_phone: string     // ✅ Correct
  customer_address: string   // ✅ Correct
}
```

**Display Update:**
```typescript
// Before
<p>{order.shipping_name}</p>      // ❌ Wrong
<p>{order.shipping_phone}</p>     // ❌ Wrong
<p>{order.shipping_address}</p>   // ❌ Wrong

// After
<p>{order.customer_name}</p>      // ✅ Correct
<p>{order.customer_phone}</p>     // ✅ Correct
<p>{order.customer_address}</p>   // ✅ Correct
```

## 📊 Database Schema

### **Orders Table Structure:**
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_name TEXT NOT NULL,           -- ✅ Use this
  customer_phone TEXT NOT NULL,          -- ✅ Use this
  customer_address TEXT NOT NULL,        -- ✅ Use this
  payment_method_id BIGINT REFERENCES payment_methods(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 Changes Summary

### **Files Modified:**
1. ✅ `src/components/checkout/checkout-client.tsx`
   - Fixed column names in order insert
   - Added `payment_method_id`

2. ✅ `src/components/orders/order-detail-client.tsx`
   - Fixed interface Order
   - Fixed display fields

3. ✅ `fix-orders-table.sql` (New)
   - Verification script
   - Ensure payment_method_id exists

## 🧪 Testing

### **Test Order Creation:**
1. Add items to cart
2. Go to checkout
3. Fill shipping information
4. Select payment method
5. Upload payment proof (optional)
6. Click "Buat Pesanan"
7. ✅ Should redirect to success page
8. ✅ Order should be created in database

### **Verify Database:**
```sql
-- Check latest order
SELECT 
  id,
  user_id,
  customer_name,
  customer_phone,
  customer_address,
  payment_method_id,
  total_amount,
  status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 1;
```

### **Test Order Detail Page:**
1. Go to `/orders/[order-id]`
2. ✅ Customer name should display
3. ✅ Customer phone should display
4. ✅ Customer address should display
5. ✅ No console errors

## 📝 Column Mapping Reference

| Frontend Variable | Database Column | Type |
|------------------|-----------------|------|
| `shippingData.fullName` | `customer_name` | TEXT |
| `shippingData.phone` | `customer_phone` | TEXT |
| `shippingData.address` | `customer_address` | TEXT |
| `paymentData.methodId` | `payment_method_id` | BIGINT |
| `shippingData.notes` | `notes` | TEXT |

## 🚀 Deployment

### **Steps:**
1. ✅ Deploy code changes
2. ✅ Run `fix-orders-table.sql` (if needed)
3. ✅ Test order creation
4. ✅ Verify order detail page

### **Rollback (if needed):**
No database changes were made, only code fixes.
Simply revert the code changes if issues occur.

## ⚠️ Important Notes

### **Column Naming Convention:**
- Orders table uses `customer_*` prefix
- Bookings table might use different naming
- Always check schema before using columns

### **Payment Method:**
- `payment_method_id` is now saved with order
- Links to `payment_methods` table
- Used for displaying payment method details

### **Backward Compatibility:**
- No breaking changes to database
- Only code-level fixes
- Existing orders not affected

## 🎯 Prevention

### **Best Practices:**
1. ✅ Always check database schema before coding
2. ✅ Use TypeScript interfaces that match DB schema
3. ✅ Test insert/update operations in development
4. ✅ Use database migrations for schema changes
5. ✅ Document column names in README

### **Type Safety:**
```typescript
// Create type from database schema
type OrderInsert = {
  user_id: string
  total_amount: number
  status: string
  customer_name: string      // Not shipping_name
  customer_phone: string     // Not shipping_phone
  customer_address: string   // Not shipping_address
  payment_method_id?: number
  notes?: string
}
```

## 📚 Related Files

- ✅ `src/components/checkout/checkout-client.tsx` - Fixed
- ✅ `src/components/orders/order-detail-client.tsx` - Fixed
- ✅ `fix-orders-table.sql` - Verification script
- ✅ `supabase-setup.sql` - Original schema
- ✅ `add-payment-method-id.sql` - Payment method column

---

**Fixed:** May 2026
**Status:** ✅ Resolved
**Impact:** Critical - Order creation now works
**Breaking Changes:** None
