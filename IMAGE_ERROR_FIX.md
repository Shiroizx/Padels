# Image Error Fix - Court Detail Page

## ✅ Problems Fixed

### 1. Event Handler Error
**Error:** `Event handlers cannot be passed to Client Component props`

**Solution:** 
- Created new client component: `CourtImage` 
- Moved `onError` handler to client component
- Updated court detail page to use the new component

### 2. Invalid Placeholder Image
**Error:** `The requested resource isn't a valid image for /placeholder-court.jpg`

**Solution:**
- Removed invalid placeholder file
- Changed to use online placeholder: `https://placehold.co`
- Fallback image: Gray placeholder with "No Image" text

---

## 📁 Files Changed

1. ✅ `src/components/shared/court-image.tsx` - NEW client component
2. ✅ `src/app/courts/[id]/page.tsx` - Use CourtImage component
3. ✅ `src/components/courts/court-card.tsx` - Use online placeholder
4. ✅ `public/placeholder-court.jpg` - DELETED (invalid file)

---

## 🧪 Test Now

1. **Refresh browser** (Ctrl+Shift+R)
2. **Go to** `/courts`
3. **Click any court card**
4. **Should see:**
   - ✅ Court detail page loads
   - ✅ No error in console
   - ✅ Image shows (or gray placeholder if no image)
   - ✅ All info displays correctly

---

## 🎯 Placeholder Images

**Court Card:**
- Size: 600x400
- URL: `https://placehold.co/600x400/e5e7eb/6b7280?text=No+Image`

**Court Detail:**
- Size: 800x600
- URL: `https://placehold.co/800x600/e5e7eb/6b7280?text=No+Image`

**Colors:**
- Background: `#e5e7eb` (gray-200)
- Text: `#6b7280` (gray-500)

---

## 📝 How It Works

### Before (Server Component with onError):
```tsx
<Image
  src={imageUrl}
  alt={court.name}
  fill
  onError={(e) => { ... }} // ❌ Error: Can't use event handlers
/>
```

### After (Client Component):
```tsx
// court-image.tsx
'use client'
export function CourtImage({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(src)
  
  return (
    <Image
      src={imgSrc}
      onError={() => setImgSrc('fallback-url')} // ✅ Works!
    />
  )
}
```

---

Last Updated: 2024-12-20
