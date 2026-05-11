# Padels App - Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (https://supabase.com)
- Git installed

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a new project at https://supabase.com
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy the contents of `supabase-setup.sql` and run it
4. Go to **Storage** and create these buckets:
   - `court-images` (public)
   - `product-images` (public)
   - `payment-proofs` (private, authenticated users only)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get these values from:
- Supabase Dashboard → Settings → API

### 4. Create Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Email: `admin@padels.com`
4. Password: `password` (or your choice)
5. After user is created, go to **SQL Editor** and run:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@padels.com';
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Default Login Credentials

**Admin:**
- Email: admin@padels.com
- Password: password

**Test User:**
- Register a new account at /register

## 📁 Project Structure

```
padels-nextjs/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (user)/            # User pages
│   ├── (admin)/           # Admin pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities & configurations
│   ├── supabase/         # Supabase clients
│   ├── store/            # Zustand stores
│   └── utils/            # Helper functions
├── types/                 # TypeScript types
└── middleware.ts          # Auth middleware
```

## 🎯 Features Implemented

### Phase 1: Infrastructure ✅
- [x] Project setup
- [x] Supabase configuration
- [x] Database schema
- [x] RLS policies
- [x] Authentication middleware
- [x] TypeScript types
- [x] Utility functions

### Phase 2: Authentication (Next)
- [ ] Login page
- [ ] Register page
- [ ] Logout functionality
- [ ] Protected routes
- [ ] Role-based access

### Phase 3: User Features - Courts & Bookings
- [ ] Courts list
- [ ] Court detail
- [ ] Booking form
- [ ] Booking history
- [ ] Payment proof upload

### Phase 4: User Features - Products & Orders
- [ ] Products list
- [ ] Cart functionality
- [ ] Checkout
- [ ] Order history

### Phase 5: Admin Features
- [ ] Admin dashboard
- [ ] Courts management
- [ ] Bookings management
- [ ] Products management
- [ ] Orders management
- [ ] Payment approval

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **Deployment:** Vercel

## 📚 Documentation

- [Complete Rebuild Documentation](./COMPLETE_REBUILD_DOCUMENTATION.md)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

## 🐛 Troubleshooting

### "Invalid API key" error
- Check your `.env.local` file has correct Supabase credentials
- Restart the development server after changing env variables

### Authentication not working
- Verify Supabase URL configuration in Settings → API → Configuration
- Check that the `users` table trigger is created correctly

### RLS policy errors
- Make sure you ran the complete `supabase-setup.sql` script
- Check that RLS is enabled on all tables

## 📞 Support

For issues or questions, refer to:
- [Supabase Discord](https://discord.supabase.com)
- [Next.js Discord](https://nextjs.org/discord)
