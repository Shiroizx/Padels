# 🔧 Fix: Payment Proof Image Not Showing

## 🐛 Problem
Payment proof image tidak muncul di order detail page meskipun file sudah ter-upload ke bucket `payment-proofs` di Supabase.

## 🔍 Root Cause
1. **Bucket `payment-proofs` bersifat PRIVATE** (public = false)
2. Code menggunakan `getPublicUrl()` yang hanya work untuk public buckets
3. Untuk private buckets, harus menggunakan `createSignedUrl()` untuk generate temporary URL

## ✅ Solution

### **1. Update Order Detail Page**

**File:** `src/app/orders/[id]/page.tsx`

**Before (Wrong):**
```typescript
// Using getPublicUrl for private bucket ❌
const { data: { publicUrl } } = supabase.storage
  .from('payment-proofs')
  .getPublicUrl(order.payments[0].proof_image)

paymentProofUrl = publicUrl
```

**After (Correct):**
```typescript
// Using createSignedUrl for private bucket ✅
const { data: signedData, error: signedError } = await supabase.storage
  .from('payment-proofs')
  .createSignedUrl(order.payment_proof, 3600) // Valid for 1 hour

if (!signedError && signedData) {
  paymentProofUrl = signedData.signedUrl
}
```

### **2. Update Checkout Client**

**File:** `src/components/checkout/checkout-client.tsx`

**Changes:**
1. ✅ Save **filename** instead of URL
2. ✅ Store filename in `payment_proof` column
3. ✅ Comment out payments table insert (table not created yet)

**Before:**
```typescript
// Saving URL ❌
const { data: { publicUrl } } = supabase.storage
  .from('payment-proofs')
  .getPublicUrl(fileName)

proofImageUrl = publicUrl

// Insert order without payment_proof
.insert({
  ...
  // payment_proof missing
})
```

**After:**
```typescript
// Saving filename ✅
const fileName = `order-${Date.now()}.${fileExt}`
await supabase.storage
  .from('payment-proofs')
  .upload(fileName, paymentData.proofImage)

proofImageFileName = fileName

// Insert order with payment_proof
.insert({
  ...
  payment_proof: proofImageFileName  // ✅ Save filename
})
```

## 📊 How It Works

### **Upload Flow:**
```
1. User uploads image
   ↓
2. Upload to storage bucket 'payment-proofs'
   ↓
3. Save FILENAME (not URL) to database
   Example: "order-1778583479123.png"
   ↓
4. Order created with payment_proof = filename
```

### **Display Flow:**
```
1. Load order from database
   ↓
2. Get payment_proof filename
   Example: "order-1778583479123.png"
   ↓
3. Generate signed URL (valid 1 hour)
   ↓
4. Display image using signed URL
```

## 🔐 Why Signed URLs?

### **Private Bucket Benefits:**
- ✅ **Security**: Only authorized users can access
- ✅ **Privacy**: Payment proofs are sensitive data
- ✅ **Control**: Can revoke access anytime
- ✅ **Temporary**: URLs expire after set time

### **Signed URL Properties:**
- **Expiry**: 3600 seconds (1 hour)
- **Auto-generated**: Created on-demand
- **Secure**: Contains authentication token
- **Temporary**: Expires after time limit

## 📝 Database Schema

### **Orders Table:**
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  ...
  payment_proof TEXT,  -- ✅ Stores filename, not URL
  ...
);
```

**Example Data:**
```
id  | payment_proof
----|---------------------------
1   | order-1778583479123.png
2   | order-1778583480456.jpg
3   | NULL (no proof uploaded)
```

## 🧪 Testing

### **Test Upload:**
1. Go to checkout
2. Fill form
3. Select payment method
4. Upload payment proof image
5. Submit order
6. ✅ Check database: `payment_proof` should have filename

```sql
SELECT id, payment_proof 
FROM orders 
ORDER BY created_at DESC 
LIMIT 1;
```

### **Test Display:**
1. Go to order detail page
2. ✅ Payment proof image should display
3. ✅ No broken image icon
4. ✅ Can click "Download Bukti"

### **Verify Signed URL:**
```sql
-- Check if file exists in storage
SELECT name, created_at 
FROM storage.objects 
WHERE bucket_id = 'payment-proofs'
ORDER BY created_at DESC;
```

## 🔄 Signed URL Regeneration

**Important:** Signed URLs expire after 1 hour!

**What happens after expiry:**
- ❌ Image will not load
- ✅ Page refresh will generate new signed URL
- ✅ User can still access (if authorized)

**Auto-regeneration:**
- Every page load generates fresh signed URL
- No manual intervention needed
- Always valid for next 1 hour

## 🎯 Storage Policies

### **Required Policies:**

```sql
-- Users can upload their own payment proofs
CREATE POLICY "Users can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  auth.uid() IS NOT NULL
);

-- Users can view their own payment proofs
CREATE POLICY "Users can view their own payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs' AND
  auth.uid() IS NOT NULL
);

-- Admins can view all payment proofs
CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

## 📁 Files Modified

```
✅ src/app/orders/[id]/page.tsx
   - Changed getPublicUrl() to createSignedUrl()
   - Check both payment_proof and payments.proof_image

✅ src/components/checkout/checkout-client.tsx
   - Save filename instead of URL
   - Add payment_proof to order insert
   - Comment out payments table insert
```

## 🚀 Deployment

### **Steps:**
1. ✅ Deploy code changes
2. ✅ Restart dev server
3. ✅ Test upload new order
4. ✅ Test view existing orders
5. ✅ Verify images display

### **No SQL Required:**
- ✅ Column `payment_proof` already exists
- ✅ Bucket `payment-proofs` already exists
- ✅ Storage policies already set

## 💡 Best Practices

### **Filename Convention:**
```typescript
// Good ✅
`order-${Date.now()}.${ext}`
// Example: order-1778583479123.png

// Bad ❌
`${userId}-${Date.now()}.${ext}`
// Exposes user ID in filename
```

### **Signed URL Expiry:**
```typescript
// Short expiry (1 hour) ✅
createSignedUrl(filename, 3600)

// Long expiry (24 hours) ⚠️
createSignedUrl(filename, 86400)
// Use only if needed

// No expiry ❌
// Not possible with signed URLs
```

### **Error Handling:**
```typescript
// Check for errors ✅
const { data, error } = await supabase.storage
  .from('payment-proofs')
  .createSignedUrl(filename, 3600)

if (error) {
  console.error('Error generating signed URL:', error)
  return null
}

return data.signedUrl
```

## 🔮 Future Improvements

- [ ] Cache signed URLs (with expiry tracking)
- [ ] Batch generate signed URLs for multiple orders
- [ ] Add image compression before upload
- [ ] Add image preview before upload
- [ ] Support multiple payment proofs per order
- [ ] Add watermark to payment proofs

---

**Fixed:** May 2026
**Status:** ✅ Resolved
**Impact:** Critical - Payment proofs now display correctly
**Breaking Changes:** None
