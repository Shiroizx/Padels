# 🎾 Padels - Court Booking & E-Commerce Platform

Platform all-in-one untuk booking lapangan padel/tenis dan belanja produk olahraga dengan sistem penunjang keputusan (SPK). Dibangun dengan Next.js 16, TypeScript, Supabase, dan Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🏟️ Court Booking System
- **Real-time Availability** - Lihat jadwal lapangan secara real-time
- **Time Slot Selector** - Pilih slot waktu dengan UI yang intuitif
- **Flexible Scheduling** - Booking dari 09:00 - 22:00
- **Multiple Payment Methods** - Transfer Bank, E-wallet, QRIS, Cash
- **Payment Proof Upload** - Upload bukti pembayaran dengan secure storage
- **Booking History** - Riwayat booking lengkap dengan status tracking
- **Upcoming Bookings** - Notifikasi booking yang akan datang

### 🛒 E-Commerce
- **Product Catalog** - Raket, bola, dan aksesoris olahraga
- **Shopping Cart** - Keranjang belanja dengan Zustand state management
- **3-Step Checkout** - Checkout flow modern dengan animasi
- **Order Management** - Kelola pesanan dengan status tracking
- **Product Images** - Upload dan display gambar produk dengan optimasi
- **Order Success Page** - Konfirmasi pesanan dengan confetti animation

### 👨‍💼 Admin Dashboard
- **Court Management** - CRUD lapangan dengan upload gambar
- **Booking Management** - Kelola dan approve booking
- **Product Management** - CRUD produk dengan stock management
- **Order Management** - Kelola pesanan customer
- **Payment Methods** - Kelola metode pembayaran dengan QR code
- **Payment Approval** - Verifikasi bukti pembayaran
- **User Management** - Edit user dan reset password
- **Court Availability** - Visualisasi ketersediaan lapangan real-time
- **📊 SPK Analysis** - Sistem Penunjang Keputusan dengan metode SAW

### 📊 SPK (Sistem Penunjang Keputusan)
- **SAW Method** - Simple Additive Weighting untuk prioritas transaksi
- **Multi-Criteria Analysis** - Analisis berdasarkan Amount, Waiting Time, Payment Proof
- **Combined Analysis** - Analisis orders dan bookings dalam satu dashboard
- **4 Tabs Dashboard**:
  - Overview - Statistik keseluruhan
  - Orders - Analisis pesanan produk
  - Bookings - Analisis booking lapangan
  - Ranking SAW - Ranking prioritas transaksi
- **Real-time Statistics** - Revenue tracking dan conversion rate
- **Visual Analytics** - Charts dan progress bars

### 🎨 Modern UI/UX
- **Fully Responsive** - Perfect di mobile, tablet, dan desktop
- **Mobile-First Design** - Optimized untuk mobile devices
- **Smooth Animations** - Framer Motion untuk animasi yang engaging
- **Modern Landing Page** - Hero section, features, testimonials
- **Split Layout Auth** - Login/Register dengan branding section
- **Gradient Design** - Modern gradient backgrounds dan buttons
- **Touch-Friendly** - Touch targets minimal 44x44px untuk mobile
- **Sticky Navigation** - Navbar yang selalu terlihat saat scroll
- **Mobile Menu** - Hamburger menu dengan smooth animation

### 🔒 Security
- **Row Level Security (RLS)** - Supabase RLS policies untuk data protection
- **Signed URLs** - Secure image access untuk private buckets
- **Authentication** - Supabase Auth dengan role-based access
- **Input Validation** - Zod schema validation
- **Middleware Protection** - Route protection dengan Next.js middleware

## 🚀 Tech Stack

### Frontend
- **Next.js 16.2.6** - React framework dengan App Router & Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Shadcn/ui** - Re-usable UI components
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Zustand** - State management untuk cart
- **Lucide React** - Icon library

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage (Images)
  - Row Level Security
  - Real-time subscriptions

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Git** - Version control
- **Turbopack** - Fast bundler

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Supabase account

### 1. Clone Repository
```bash
git clone https://github.com/Shiroizx/Padels.git
cd Padels
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Setup Database
Jalankan SQL scripts di Supabase SQL Editor (folder `sql/`):

1. **supabase-setup.sql** - Setup tables, RLS policies, triggers
2. **admin-user-management-setup.sql** - Setup user management
3. **payment-methods-setup.sql** - Setup payment methods

### 5. Setup Storage Buckets
Di Supabase Dashboard → Storage, buat 3 buckets:

1. **court-images** (Public)
2. **product-images** (Public)
3. **payment-proofs** (Private)

### 6. Run Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### 7. Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
padels/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth pages (Login, Register)
│   │   ├── admin/               # Admin pages
│   │   │   ├── dashboard/       # Admin dashboard
│   │   │   ├── courts/          # Court management
│   │   │   ├── bookings/        # Booking management
│   │   │   ├── products/        # Product management
│   │   │   ├── orders/          # Order management
│   │   │   ├── payments/        # Payment approval
│   │   │   ├── payment-methods/ # Payment methods CRUD
│   │   │   ├── users/           # User management
│   │   │   └── spk/             # SPK Analysis Dashboard
│   │   ├── api/                 # API routes
│   │   │   └── admin/           # Admin API endpoints
│   │   ├── bookings/            # User booking pages
│   │   ├── courts/              # Court listing & detail
│   │   ├── products/            # Product listing & detail
│   │   ├── cart/                # Shopping cart
│   │   ├── checkout/            # Checkout pages
│   │   │   └── success/         # Order success page
│   │   ├── orders/              # Order history
│   │   ├── dashboard/           # User dashboard
│   │   └── page.tsx             # Landing page
│   ├── components/
│   │   ├── admin/               # Admin components
│   │   ├── bookings/            # Booking components
│   │   ├── cart/                # Cart components
│   │   ├── checkout/            # Checkout components
│   │   ├── courts/              # Court components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── layouts/             # Layout components (Navbar)
│   │   ├── orders/              # Order components
│   │   ├── products/            # Product components
│   │   ├── shared/              # Shared components
│   │   └── ui/                  # UI components (Shadcn)
│   ├── lib/
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand stores
│   │   ├── supabase/            # Supabase clients
│   │   └── utils/               # Utility functions
│   └── types/                   # TypeScript types
├── docs/                        # Documentation
│   ├── SPK_SAW_DOCUMENTATION.md
│   ├── ADMIN_USER_MANAGEMENT.md
│   ├── PAYMENT_QR_SETUP_GUIDE.md
│   ├── CHECKOUT_USER_GUIDE.md
│   ├── RESPONSIVE_IMPROVEMENTS_PLAN.md
│   ├── COMPLETE_REDESIGN_SUMMARY.md
│   ├── QUICK_REFERENCE.md
│   ├── SPK_HOW_IT_WORKS.md
│   └── SQL_SETUP_GUIDE.md
├── sql/                         # SQL scripts
│   ├── supabase-setup.sql
│   ├── admin-user-management-setup.sql
│   ├── payment-methods-setup.sql
│   └── update-payment-methods-qr.sql
├── public/                      # Static assets
├── middleware.ts                # Next.js middleware
├── .env.example                 # Environment variables example
└── README.md                    # This file
```

## 🎯 Key Features Explained

### SPK (Sistem Penunjang Keputusan)
Admin dapat menganalisis transaksi dengan metode SAW:
- **Kriteria 1**: Amount (40%) - Nilai transaksi
- **Kriteria 2**: Waiting Time (35%) - Lama menunggu
- **Kriteria 3**: Payment Proof (25%) - Bukti pembayaran

Sistem memberikan ranking prioritas untuk membantu admin memproses transaksi yang paling urgent.

### Court Availability Dashboard
Admin dapat melihat:
- Lapangan mana yang kosong/terisi
- Tingkat penggunaan per lapangan (%)
- Jadwal booking detail
- Slot waktu yang tersedia

### Real-time Schedule
User dapat melihat:
- Jadwal booking yang sudah terisi
- Slot waktu yang masih tersedia
- Booking sendiri di-highlight
- Time slot selector yang intuitif

### Payment Methods Management
Admin dapat:
- Tambah/edit/hapus metode pembayaran
- Upload QR code untuk QRIS/E-wallet
- Set instruksi pembayaran
- Aktifkan/nonaktifkan metode

### User Management
Admin dapat:
- Edit informasi user (nama, email, role)
- Reset password user
- View semua users
- Manage user roles (user/admin)

### 3-Step Checkout
1. **Shipping Info** - Isi data pengiriman
2. **Payment Method** - Pilih metode dan upload bukti
3. **Review** - Review pesanan sebelum submit

### Payment Proof System
- Upload bukti pembayaran (PNG, JPG, JPEG)
- Stored di private bucket dengan signed URLs
- Admin approve/reject payment
- Secure access dengan RLS policies

### Shopping Cart
- Add/remove products
- Update quantity
- Persistent dengan Zustand
- Checkout flow yang smooth

## 🔐 User Roles

### Admin
- Full access ke admin dashboard
- Manage courts, products, bookings, orders
- Manage payment methods
- Manage users
- Approve payments
- View SPK analytics

### User
- Browse courts & products
- Make bookings
- Shop products
- View order history
- Upload payment proofs
- View upcoming bookings

## 📱 Responsive Design

### Mobile (< 768px)
- Hamburger menu navigation
- Single column layouts
- Touch-friendly buttons (44x44px+)
- Optimized images
- Collapsible sections

### Tablet (768px - 1024px)
- 2-column grids
- Adaptive navigation
- Balanced layouts

### Desktop (> 1024px)
- Full navigation bar
- Multi-column grids
- Sidebar layouts
- Hover effects

## 🎨 Design System

### Colors
- **Primary**: Green/Emerald (#10b981)
- **Secondary**: Blue, Purple, Orange, Teal, Rose
- **Neutral**: Gray scale
- **Gradients**: Modern multi-color gradients

### Typography
- **Font**: System fonts (sans-serif)
- **Mobile**: text-2xl (24px) headings
- **Desktop**: text-4xl (36px) headings
- **Body**: text-base (16px)

### Components
- **Cards**: Rounded-3xl, shadows, hover effects
- **Buttons**: Gradient backgrounds, smooth transitions
- **Forms**: Clean inputs dengan validation
- **Badges**: Colored status indicators
- **Animations**: Framer Motion transitions

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables
Set di Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Build Command
```bash
npm run build
```

### Output Directory
```
.next
```

## 📚 Documentation

Dokumentasi lengkap tersedia di folder `docs/`:

- **SPK_SAW_DOCUMENTATION.md** - Panduan lengkap SPK
- **ADMIN_USER_MANAGEMENT.md** - User management guide
- **PAYMENT_QR_SETUP_GUIDE.md** - Setup payment methods
- **CHECKOUT_USER_GUIDE.md** - Checkout flow guide
- **RESPONSIVE_IMPROVEMENTS_PLAN.md** - Responsive design plan
- **COMPLETE_REDESIGN_SUMMARY.md** - UI/UX redesign summary
- **QUICK_REFERENCE.md** - Quick reference guide
- **SPK_HOW_IT_WORKS.md** - How SPK works
- **SQL_SETUP_GUIDE.md** - Database setup guide

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
```

## 🐛 Known Issues

None at the moment. Report issues di [GitHub Issues](https://github.com/Shiroizx/Padels/issues).

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Shiroizx**
- GitHub: [@Shiroizx](https://github.com/Shiroizx)
- Email: kzxxx01@gmail.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide](https://lucide.dev/) - Icon library
- [Zustand](https://zustand-demo.pmnd.rs/) - State management

## 📞 Support

Jika ada pertanyaan atau butuh bantuan:
- Open an issue di [GitHub](https://github.com/Shiroizx/Padels/issues)
- Email: kzxxx01@gmail.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Payment gateway integration
- [ ] Loyalty program

---

Made with ❤️ by Shiroizx | © 2026 Padels Platform
