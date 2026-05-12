# Quick Reference Guide - UI/UX Redesign

## 🎨 Color Themes by Section

### Courts & Dashboard
```
Gradient: from-emerald-600 via-teal-600 to-cyan-600
Primary: emerald-600 (#059669)
Secondary: teal-600 (#0d9488)
Accent: cyan-600 (#0891b2)
```

### Products & Cart
```
Gradient: from-purple-600 via-pink-600 to-rose-600
Primary: purple-600 (#9333ea)
Secondary: pink-600 (#db2777)
Accent: rose-600 (#e11d48)
```

### Bookings
```
Gradient: from-blue-600 via-emerald-600 to-cyan-600
Primary: blue-600 (#2563eb)
Secondary: emerald-600 (#059669)
Accent: cyan-600 (#0891b2)
```

### Orders
```
Primary: green-600 (#16a34a)
Secondary: purple-600 (#9333ea)
```

---

## 📁 File Structure

### Courts
```
src/app/courts/
├── page.tsx (server)
└── [id]/page.tsx (server)

src/components/courts/
├── courts-client.tsx (client)
└── court-detail-client.tsx (client)
```

### Bookings
```
src/app/bookings/
├── page.tsx (server)
├── new/page.tsx (server)
└── [id]/page.tsx (server)

src/components/bookings/
├── bookings-history-client.tsx (client)
├── time-slot-selector.tsx (client)
└── booking-detail-client.tsx (client)
```

### Products
```
src/app/products/
├── page.tsx (server)
└── [id]/page.tsx (server)

src/components/products/
├── products-client.tsx (client)
└── product-detail-client.tsx (client)
```

### Cart
```
src/app/cart/
└── page.tsx (server)

src/components/cart/
└── cart-client.tsx (client)
```

### Dashboard
```
src/app/dashboard/
└── page.tsx (server)

src/components/dashboard/
└── dashboard-client.tsx (client)
```

### Orders
```
src/app/orders/
├── page.tsx (server)
└── [id]/page.tsx (server)
```

---

## 🎭 Common Animation Patterns

### Container with Stagger
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}
```

### Item Entrance
```tsx
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}
```

### Card Hover
```tsx
<motion.div whileHover={{ y: -8 }}>
  {/* Card content */}
</motion.div>
```

### Exit Animation
```tsx
<AnimatePresence mode="popLayout">
  <motion.div
    exit={{ opacity: 0, scale: 0.95, x: -100 }}
  >
    {/* Content */}
  </motion.div>
</AnimatePresence>
```

---

## 🧩 Common Component Patterns

### Hero Section
```tsx
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-12 text-white shadow-2xl">
  {/* Decorative blur circles */}
  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
  
  <div className="relative z-10">
    {/* Content */}
  </div>
</div>
```

### Modern Card
```tsx
<div className="group rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 p-6">
  {/* Card content */}
</div>
```

### Status Badge
```tsx
<Badge className={
  status === 'confirmed' ? 'bg-green-500' :
  status === 'pending' ? 'bg-yellow-500' :
  status === 'cancelled' ? 'bg-red-500' :
  'bg-gray-500'
}>
  {statusLabel}
</Badge>
```

### Empty State
```tsx
<div className="rounded-3xl bg-white border-2 border-dashed border-gray-200 p-12 text-center">
  <div className="inline-flex p-6 rounded-full bg-gray-100 mb-6">
    <Icon className="h-16 w-16 text-gray-400" />
  </div>
  <h2 className="text-3xl font-bold text-gray-900 mb-3">
    Empty State Title
  </h2>
  <p className="text-gray-600 mb-8 text-lg">
    Empty state description
  </p>
  <Button>Call to Action</Button>
</div>
```

---

## 🔧 Common Utilities

### Format Currency
```tsx
import { formatCurrency } from '@/lib/utils/currency'

formatCurrency(50000) // "Rp 50.000"
```

### Format Date
```tsx
import { formatDate, formatTime } from '@/lib/utils/date'

formatDate('2024-01-15') // "15 Jan 2024"
formatTime('14:30:00') // "14:30"
```

### Cart Store
```tsx
import { useCartStore } from '@/lib/store/cart'

const { items, addItem, removeItem, updateQuantity, getTotalPrice, getItemCount } = useCartStore()
```

### Toast Notifications
```tsx
import { toast } from 'sonner'

toast.success('Success message')
toast.error('Error message')
toast.info('Info message')
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile First
className="text-sm md:text-base lg:text-lg"

// Grid Responsive
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

// Flex Responsive
className="flex flex-col sm:flex-row"

// Padding Responsive
className="p-4 md:p-6 lg:p-8"

// Text Responsive
className="text-2xl md:text-3xl lg:text-4xl"
```

---

## 🎯 Status Colors

### Booking Status
```tsx
confirmed: 'bg-green-500'
pending: 'bg-yellow-500'
cancelled: 'bg-red-500'
expired: 'bg-gray-500'
```

### Order Status
```tsx
paid: 'bg-green-500'
pending: 'bg-yellow-500'
processing: 'bg-blue-500'
shipped: 'bg-purple-500'
delivered: 'bg-green-500'
cancelled: 'bg-red-500'
```

### Stock Status
```tsx
available: 'bg-green-500'
low_stock: 'bg-yellow-500'
out_of_stock: 'bg-red-500'
```

---

## 🚀 Quick Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Type Checking
```bash
npx tsc --noEmit     # Check TypeScript errors
```

---

## 📊 Page Routes

### Public Routes
```
/                    # Home page
/login               # Login page
/register            # Register page
```

### User Routes
```
/dashboard           # User dashboard
/courts              # Courts listing
/courts/[id]         # Court detail
/bookings            # Booking history
/bookings/new        # New booking form
/bookings/[id]       # Booking detail
/products            # Products listing
/products/[id]       # Product detail
/cart                # Shopping cart
/orders              # Orders history
/orders/[id]         # Order detail
```

### Admin Routes
```
/admin/dashboard     # Admin dashboard
/admin/courts        # Manage courts
/admin/bookings      # Manage bookings
/admin/products      # Manage products
/admin/orders        # Manage orders
/admin/users         # Manage users
/admin/payments      # Manage payments
/admin/payment-methods # Manage payment methods
```

---

## 🎨 Icon Usage

### Common Icons
```tsx
import {
  Calendar,      // Dates, bookings
  Clock,         // Time, duration
  MapPin,        // Location
  User,          // User profile
  ShoppingCart,  // Cart, shopping
  Package,       // Products, orders
  CreditCard,    // Payment
  CheckCircle,   // Success, confirmed
  XCircle,       // Error, cancelled
  AlertCircle,   // Warning, pending
  ArrowRight,    // Navigation, CTA
  ChevronRight,  // Navigation, expand
  Search,        // Search functionality
  Filter,        // Filter functionality
  Grid3x3,       // Grid view
  List,          // List view
  Plus,          // Add, increase
  Minus,         // Remove, decrease
  Trash2,        // Delete
  Edit,          // Edit
  Eye,           // View
  Download,      // Download
  Upload,        // Upload
  Star,          // Rating, favorite
  Heart,         // Wishlist, like
  Share2,        // Share
  Sparkles,      // Special, featured
  TrendingUp,    // Growth, stats
  Truck,         // Delivery, shipping
  Shield,        // Security, guarantee
  Award,         // Quality, certification
} from 'lucide-react'
```

---

## 🔍 Search & Filter Patterns

### Real-time Search
```tsx
const [searchQuery, setSearchQuery] = useState('')

const filtered = items.filter(item =>
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
)
```

### Category Filter
```tsx
const [selectedCategory, setSelectedCategory] = useState('all')

const filtered = items.filter(item =>
  selectedCategory === 'all' || item.category === selectedCategory
)
```

### Status Filter
```tsx
const [selectedStatus, setSelectedStatus] = useState('all')

const filtered = items.filter(item =>
  selectedStatus === 'all' || item.status === selectedStatus
)
```

### Sort
```tsx
const [sortBy, setSortBy] = useState('name')

const sorted = [...items].sort((a, b) => {
  if (sortBy === 'name') return a.name.localeCompare(b.name)
  if (sortBy === 'price-low') return a.price - b.price
  if (sortBy === 'price-high') return b.price - a.price
  return 0
})
```

---

## 💡 Best Practices

### Component Structure
1. ✅ Split server and client components
2. ✅ Use TypeScript for type safety
3. ✅ Implement proper error handling
4. ✅ Add loading states
5. ✅ Include empty states

### Styling
1. ✅ Use Tailwind utility classes
2. ✅ Follow responsive design patterns
3. ✅ Maintain consistent spacing
4. ✅ Use design system colors
5. ✅ Add hover and focus states

### Performance
1. ✅ Optimize images with Next.js Image
2. ✅ Use lazy loading for heavy components
3. ✅ Implement proper caching
4. ✅ Minimize re-renders
5. ✅ Use proper key props in lists

### Accessibility
1. ✅ Add alt text to images
2. ✅ Use semantic HTML
3. ✅ Include ARIA labels
4. ✅ Ensure keyboard navigation
5. ✅ Maintain color contrast

---

## 🐛 Common Issues & Solutions

### Issue: Hydration Error
**Solution:** Use `useState` with `mounted` flag
```tsx
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
```

### Issue: Image Not Loading
**Solution:** Check Supabase storage permissions and use signed URLs

### Issue: Animation Lag
**Solution:** Use GPU-accelerated properties (transform, opacity)

### Issue: Cart Not Updating
**Solution:** Ensure Zustand store is properly configured

### Issue: Form Not Submitting
**Solution:** Check form validation and error handling

---

## 📚 Documentation Files

1. `COMPLETE_REDESIGN_SUMMARY.md` - Overall summary
2. `PRODUCTS_REDESIGN_COMPLETE.md` - Products section
3. `COURTS_AND_BOOKING_REDESIGN_SUMMARY.md` - Courts & Bookings
4. `DASHBOARD_UI_REDESIGN.md` - Dashboard
5. `QUICK_REFERENCE.md` - This file

---

## ✅ Checklist for New Features

### Before Starting
- [ ] Read existing code patterns
- [ ] Check design system colors
- [ ] Review animation patterns
- [ ] Understand component structure

### During Development
- [ ] Use TypeScript types
- [ ] Follow naming conventions
- [ ] Add proper error handling
- [ ] Include loading states
- [ ] Add empty states
- [ ] Implement animations
- [ ] Make it responsive

### Before Committing
- [ ] Run type check
- [ ] Run linter
- [ ] Test on mobile
- [ ] Test on tablet
- [ ] Test on desktop
- [ ] Check accessibility
- [ ] Verify animations
- [ ] Test edge cases

---

## 🎉 Quick Wins

### Add a New Status Badge
```tsx
<Badge className={getStatusColor(status)}>
  {getStatusLabel(status)}
</Badge>
```

### Add a New Card
```tsx
<motion.div
  whileHover={{ y: -8 }}
  className="rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 p-6"
>
  {/* Content */}
</motion.div>
```

### Add a New Hero Section
```tsx
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-12 text-white shadow-2xl">
  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
  <div className="relative z-10">
    <h1 className="text-3xl md:text-5xl font-bold mb-3">
      Title
    </h1>
    <p className="text-lg md:text-xl opacity-90">
      Description
    </p>
  </div>
</div>
```

### Add Toast Notification
```tsx
import { toast } from 'sonner'

toast.success('Success!', {
  description: 'Operation completed successfully',
})
```

---

**Happy Coding! 🚀**

