# Courts Image Display Fix

## Problem
Images were not showing on the courts listing and detail pages.

## Root Cause
The component was looking for `court.image_url` but the database column is named `court.image`.

## Changes Made

### 1. Fixed `src/components/courts/courts-client.tsx`
- Changed interface from `image_url: string | null` to `image: string | null`
- Updated both grid and list view cards to use `court.image` instead of `court.image_url`
- Both views now correctly pass the image filename to the `CourtImage` component

### 2. Verified `src/components/courts/court-detail-client.tsx`
- Already using `court.image` correctly ✓
- No changes needed

### 3. Verified `src/components/shared/court-image.tsx`
- Component correctly handles the `imageUrl` prop ✓
- Fetches signed URLs from Supabase Storage ✓
- Shows loading spinner while fetching ✓
- Shows placeholder if image fails to load ✓

## How It Works Now

1. **Server Component** (`src/app/courts/page.tsx`):
   - Fetches courts from database with `image` column
   - Passes data to client component

2. **Client Component** (`src/components/courts/courts-client.tsx`):
   - Receives courts with `image` field
   - Passes `court.image` to `CourtImage` component via `imageUrl` prop

3. **Image Component** (`src/components/shared/court-image.tsx`):
   - Receives filename via `imageUrl` prop
   - Fetches signed URL from Supabase Storage bucket `court-images`
   - Displays image with Next.js Image optimization

## Testing Checklist

### Courts Listing Page (`/courts`)
- [ ] Images display in grid view
- [ ] Images display in list view
- [ ] Images have hover effects (scale on hover)
- [ ] Loading spinner shows while images load
- [ ] Placeholder shows if court has no image
- [ ] Search and filter work correctly
- [ ] View mode toggle (grid/list) works smoothly

### Court Detail Page (`/courts/[id]`)
- [ ] Hero image displays correctly
- [ ] Image has gradient overlay
- [ ] Court name and location overlay on image
- [ ] Availability badge shows
- [ ] Description section displays
- [ ] Facilities grid displays (if available)
- [ ] Today's schedule shows time slots
- [ ] Booked slots are grayed out
- [ ] Available slots are green
- [ ] Booking card is sticky on scroll
- [ ] "Booking Sekarang" button works
- [ ] Benefits section displays
- [ ] Back button works

### Responsive Design
- [ ] Mobile view (< 768px) looks good
- [ ] Tablet view (768px - 1024px) looks good
- [ ] Desktop view (> 1024px) looks good
- [ ] All animations work smoothly
- [ ] No layout shifts when images load

## Database Schema Reference

```sql
CREATE TABLE courts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_per_hour DECIMAL(10,2) NOT NULL,
  location TEXT,
  image TEXT,  -- ← This is the column name
  is_available BOOLEAN DEFAULT TRUE,
  facilities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Supabase Storage

Images are stored in the `court-images` bucket. The `image` column stores just the filename, and the `CourtImage` component fetches a signed URL for secure access.

Example:
- Database: `image = "court-1.jpg"`
- Storage: `court-images/court-1.jpg`
- Component: Fetches signed URL and displays

## Next Steps

If images still don't show:
1. Check if images exist in Supabase Storage bucket `court-images`
2. Verify bucket permissions allow authenticated users to read
3. Check browser console for any errors
4. Verify the `image` column in database has valid filenames
5. Test with a fresh court entry with a new image upload
