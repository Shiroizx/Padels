# 🎾 Padels - Court Booking & E-Commerce Platform

Platform all-in-one untuk booking lapangan padel/tenis dan belanja produk olahraga. Dibangun dengan Next.js 16, TypeScript, Supabase, dan Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

### 🏟️ Court Booking System
- **Real-time Availability** - Lihat jadwal lapangan secara real-time
- **Flexible Scheduling** - Pilih tanggal dan jam sesuai kebutuhan (09:00 - 22:00)
- **Multiple Payment Methods** - Transfer, E-wallet, QRIS, Cash
- **Payment Proof Upload** - Upload bukti pembayaran dengan secure storage
- **Booking History** - Riwayat booking lengkap dengan status tracking

### 🛒 E-Commerce
- **Product Catalog** - Raket, bola, dan aksesoris olahraga
- **Shopping Cart** - Keranjang belanja dengan Zustand state management
- **Order Management** - Kelola pesanan dengan status tracking
- **Product Images** - Upload dan display gambar produk

### 👨‍💼 Admin Dashboard
- **Court Management** - CRUD lapangan dengan upload gambar
- **Booking Management** - Kelola dan approve booking
- **Product Management** - CRUD produk dengan stock management
- **Order Management** - Kelola pesanan customer
- **Payment Approval** - Verifikasi bukti pembayaran
- **Court Availability Dashboard** - Visualisasi ketersediaan lapangan real-time

### 🎨 Modern UI/UX
- **Responsive Design** - Perfect di mobile, tablet, dan desktop
- **Smooth Animations** - Framer Motion untuk animasi yang engaging
- **Modern Landing Page** - Hero section, features, testimonials
- **Split Layout Auth** - Login/Register dengan branding section
- **Gradient Design** - Modern gradient backgrounds dan buttons

### 🔒 Security
- **Row Level Security (RLS)** - Supabase RLS policies untuk data protection
- **Signed URLs** - Secure image access untuk private buckets
- **Authentication** - Supabase Auth dengan role-based access
- **Input Validation** - Zod schema validation

## 🚀 Tech Stack

### Frontend
- **Next.js 16.2.6** - React framework dengan App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Shadcn/ui** - Re-usable UI components
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Zustand** - State management untuk cart

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage (Images)
  - Row Level Security

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

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
Jalankan SQL script di Supabase SQL Editor:

```bash
# File: supabase-setup.sql
```

Script ini akan membuat:
- Tables (users, courts, bookings, products, orders, order_items)
- RLS Policies
- Storage Buckets
- Triggers & Functions

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
│   │   │   └── payments/        # Payment approval
│   │   ├── bookings/            # User booking pages
│   │   ├── courts/              # Court listing & detail
│   │   ├── products/            # Product listing & detail
│   │   ├── cart/                # Shopping cart
│   │   ├── checkout/            # Checkout page
│   │   ├── orders/              # Order history
│   │   ├── dashboard/           # User dashboard
│   │   ├── page.tsx             # Landing page
│   │   └── page-client.tsx      # Landing page (client)
│   ├── components/
│   │   ├── admin/               # Admin components
│   │   ├── bookings/            # Booking components
│   │   ├── cart/                # Cart components
│   │   ├── checkout/            # Checkout components
│   │   ├── courts/              # Court components
│   │   ├── layouts/             # Layout components
│   │   ├── orders/              # Order components
│   │   ├── products/            # Product components
│   │   ├── shared/              # Shared components
│   │   └── ui/                  # UI components (Shadcn)
│   ├── lib/
│   │   ├── store/               # Zustand stores
│   │   ├── supabase/            # Supabase clients
│   │   └── utils/               # Utility functions
│   └── types/                   # TypeScript types
├── public/                      # Static assets
├── supabase-setup.sql          # Database setup script
├── middleware.ts               # Next.js middleware
└── README.md                   # This file
```

## 🎯 Key Features Explained

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
- Approve payments
- View analytics

### User
- Browse courts & products
- Make bookings
- Shop products
- View order history
- Upload payment proofs

## 📱 Responsive Design

- **Mobile First** - Optimized untuk mobile devices
- **Tablet** - Adaptive layout untuk tablet
- **Desktop** - Full features di desktop
- **Touch Friendly** - Touch targets minimal 44x44px

## 🎨 Design System

### Colors
- **Primary**: Green/Emerald gradient
- **Secondary**: Blue, Purple, Orange, Teal, Rose
- **Neutral**: Gray scale

### Typography
- **Font**: System fonts (sans-serif)
- **Headings**: Bold, large sizes
- **Body**: Regular, readable sizes

### Components
- **Cards**: Rounded corners, shadows, hover effects
- **Buttons**: Gradient backgrounds, smooth transitions
- **Forms**: Clean inputs dengan validation
- **Badges**: Colored status indicators

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables
Jangan lupa set environment variables di Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📚 Documentation

- **SETUP_GUIDE.md** - Panduan setup lengkap
- **DATABASE_SETUP_INSTRUCTIONS.md** - Setup database detail
- **ANIMATION_GUIDE.md** - Cara menggunakan animasi
- **DASHBOARD_IMPROVEMENT.md** - Dashboard design decisions
- **FEATURE_ADMIN_COURT_AVAILABILITY.md** - Court availability feature
- **FEATURE_COURT_SCHEDULE.md** - Court schedule feature
- **LANDING_AND_AUTH_REDESIGN.md** - Landing & auth design

## 🐛 Known Issues

None at the moment. Report issues di GitHub Issues.

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

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)

## 📞 Support

Jika ada pertanyaan atau butuh bantuan:
- Open an issue di GitHub
- Email: kzxxx01@gmail.com

---

Made with ❤️ by Shiroizx
