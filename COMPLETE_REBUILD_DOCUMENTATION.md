# Prompt: Rebuild Padels App dari Flutter + Laravel ke Next.js + Supabase + Vercel

## ðŸ“‹ OVERVIEW PROYEK

Anda diminta untuk merebuild aplikasi **Padels** (aplikasi booking lapangan padel/tenis dan e-commerce produk olahraga) dari stack teknologi lama ke stack modern:

**Stack Lama:**
- Frontend: Flutter (Web/Mobile)
- Backend: Laravel 12 (PHP)
- Database: MySQL
- Authentication: Laravel Sanctum

**Stack Baru (Target):**
- Frontend & Backend: Next.js 14+ (App Router)
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Deployment: Vercel
- File Storage: Supabase Storage

---

## ðŸŽ¯ FITUR UTAMA APLIKASI

### 1. **Authentication & Authorization**
- Register user baru (default role: `user`)
- Login dengan email & password
- Logout
- Role-based access: `admin` dan `user`
- Protected routes berdasarkan role

### 2. **User Features**
#### A. Court Booking (Booking Lapangan)
- Lihat daftar lapangan tersedia
- Lihat detail lapangan (nama, deskripsi, harga per jam, lokasi, fasilitas, gambar)
- Booking lapangan dengan:
  - Nama booking (5-15 karakter)
  - Pilih tanggal (minimal hari ini)
  - Pilih waktu mulai dan selesai
  - Pilih metode pembayaran: `transfer`, `e_wallet`, `qris`, `credit_card`, `cash`
  - Opsi sembunyikan nama (hide_name)
  - Catatan tambahan (opsional)
- Cek ketersediaan lapangan (tidak boleh bentrok dengan booking lain)
- Upload bukti pembayaran (untuk non-cash payment)
- Lihat kode pembayaran (untuk cash payment)
- Lihat history booking

#### B. E-Commerce (Produk)
- Lihat daftar produk
- Filter produk berdasarkan kategori
- Tambah produk ke keranjang
- Lihat keranjang belanja
- Checkout dengan:
  - Nama pelanggan
  - Nomor telepon
  - Alamat pengiriman
  - Metode pembayaran
  - Catatan (opsional)
- Upload bukti pembayaran order
- Lihat history order

### 3. **Admin Features**
#### A. Court Management
- CRUD lapangan (Create, Read, Update, Delete)
- Upload/update gambar lapangan
- Set harga per jam
- Set status ketersediaan (available/unavailable)
- Kelola fasilitas lapangan

#### B. Booking Management
- Lihat semua booking
- Filter booking berdasarkan status
- Approve/reject bukti pembayaran
- Update status booking
- Lihat detail booking dengan informasi user

#### C. Product Management
- CRUD produk
- Upload/update gambar produk
- Kelola stok
- Set kategori
- Set status ketersediaan

#### D. Order Management
- Lihat semua order
- Approve/reject bukti pembayaran order
- Update status order (pending, paid, processing, shipped, delivered, cancelled)
- Lihat detail order dengan items

#### E. Payment Approval
- Dashboard untuk approve/reject pembayaran booking
- Dashboard untuk approve/reject pembayaran order
- Lihat bukti pembayaran yang diupload user

---

## ðŸ“Š DATABASE SCHEMA

### **Users Table**
```sql
- id: integer (PK)
- name: string
- email: string (unique)
- password: string (hashed)
- role: enum('admin', 'user') default 'user'
- email_verified_at: timestamp (nullable)
- created_at: timestamp
- updated_at: timestamp
```

### **Courts Table** (Lapangan)
```sql
- id: integer (PK)
- name: string
- description: text (nullable)
- price_per_hour: decimal(10,2)
- location: string (nullable)
- image: string (nullable) - path to image file
- is_available: boolean default true
- facilities: text (nullable) - JSON array atau comma-separated
- created_at: timestamp
- updated_at: timestamp
```

### **Bookings Table**
```sql
- id: integer (PK)
- user_id: integer (FK to users)
- court_id: integer (FK to courts, nullable)
- court_name: string
- booking_name: string (5-15 chars)
- booking_date: date
- start_time: time
- end_time: time
- price: decimal(10,2)
- payment_method: enum('transfer', 'e_wallet', 'qris', 'credit_card', 'cash')
- payment_code: string (nullable) - untuk cash payment
- payment_proof: string (nullable) - path to image file
- status: enum('pending', 'confirmed', 'cancelled') default 'pending'
- notes: text (nullable)
- hide_name: boolean default false
- created_at: timestamp
- updated_at: timestamp
```

**Business Rules:**
- Tidak boleh ada booking yang bentrok (same court, same date, overlapping time)
- Cash payment generate payment_code otomatis (format: YYYY-MM-DD-XXXX)
- Non-cash payment harus upload payment_proof
- Admin bisa approve/reject payment

### **Products Table**
```sql
- id: integer (PK)
- name: string
- description: text (nullable)
- price: decimal(10,2)
- stock: integer default 0
- category: string (nullable)
- image: string (nullable) - path to image file
- is_available: boolean default true
- created_at: timestamp
- updated_at: timestamp
```

### **Orders Table**
```sql
- id: integer (PK)
- user_id: integer (FK to users)
- order_number: string (unique)
- total_price: decimal(10,2)
- payment_method: string
- payment_proof: string (nullable) - path to image file
- status: enum('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') default 'delivered'
- customer_name: string
- customer_phone: string
- customer_address: text
- notes: text (nullable)
- created_at: timestamp
- updated_at: timestamp
```

### **Order_Items Table**
```sql
- id: integer (PK)
- order_id: integer (FK to orders)
- product_id: integer (FK to products)
- quantity: integer
- price: decimal(10,2)
- subtotal: decimal(10,2)
- created_at: timestamp
- updated_at: timestamp
```

---

## ðŸ” API ENDPOINTS (Laravel - untuk referensi)

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (auth required)
- `GET /api/auth/user` - Get current user (auth required)

### Courts (Auth required)
- `GET /api/courts` - List all courts
- `POST /api/courts` - Create court (admin only)
- `GET /api/courts/{id}` - Get court detail
- `PUT /api/courts/{id}` - Update court (admin only)
- `DELETE /api/courts/{id}` - Delete court (admin only)
- `GET /api/courts/{id}/image` - Get court image (public)
- `GET /api/courts/{id}/availability` - Check availability
- `GET /api/courts/{id}/bookings` - Get court bookings

### Bookings (Auth required)
- `GET /api/bookings` - List bookings (user: own bookings, admin: all)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/{id}` - Get booking detail
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Delete booking
- `GET /api/bookings/pending-payments` - Get pending payments (admin only)
- `POST /api/bookings/{id}/payment-proof` - Upload payment proof
- `POST /api/bookings/{id}/approve-payment` - Approve payment (admin only)
- `POST /api/bookings/{id}/reject-payment` - Reject payment (admin only)
- `GET /api/bookings/{id}/payment-proof` - Get payment proof image (public)

### Products (Auth required)
- `GET /api/products` - List all products
- `POST /api/products` - Create product (admin only)
- `GET /api/products/{id}` - Get product detail
- `PUT /api/products/{id}` - Update product (admin only)
- `DELETE /api/products/{id}` - Delete product (admin only)
- `GET /api/products/{id}/image` - Get product image (public)

### Orders (Auth required)
- `GET /api/orders` - List orders (user: own orders, admin: all)
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order detail
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Delete order
- `GET /api/orders/pending-payments` - Get pending payments (admin only)
- `POST /api/orders/{id}/payment-proof` - Upload payment proof
- `POST /api/orders/{id}/approve-payment` - Approve payment (admin only)
- `POST /api/orders/{id}/reject-payment` - Reject payment (admin only)
- `GET /api/orders/{id}/payment-proof` - Get payment proof image (public)

---

## ðŸŽ¨ UI/UX REQUIREMENTS

### Design System
- **Theme**: Modern, clean, sporty
- **Colors**: 
  - Primary: Hijau (#4CAF50 atau sesuai tema olahraga)
  - Secondary: Abu-abu gelap
  - Accent: Orange/Kuning untuk CTA
- **Typography**: Sans-serif modern (Inter, Poppins, atau Roboto)
- **Responsive**: Mobile-first design

### Key Screens

#### User Side:
1. **Login/Register Page**
2. **Home Dashboard** - Overview dengan quick actions
3. **Courts List** - Grid/list view dengan filter
4. **Court Detail** - Detail lengkap + booking form
5. **Booking Form** - Multi-step form
6. **Booking History** - List dengan status badges
7. **Products List** - Grid view dengan filter kategori
8. **Product Detail** - Detail + add to cart
9. **Cart** - List items dengan quantity control
10. **Checkout** - Form checkout
11. **Order History** - List dengan status tracking
12. **Upload Payment Proof** - Upload image untuk booking/order

#### Admin Side:
1. **Admin Dashboard** - Statistics overview
2. **Courts Management** - CRUD table dengan actions
3. **Bookings Management** - Table dengan filter status
4. **Products Management** - CRUD table
5. **Orders Management** - Table dengan order details
6. **Payment Approval** - Tabs untuk booking & order payments
7. **Image Preview** - Modal untuk lihat bukti pembayaran

### UI Components Needed:
- Navigation bar (responsive)
- Bottom navigation (mobile)
- Cards (court, product)
- Forms (dengan validasi)
- Tables (admin management)
- Modals/Dialogs
- Image upload component
- Date/time picker
- Status badges
- Loading states
- Error states
- Empty states
- Toast notifications

---

## ðŸ› ï¸ TECHNICAL REQUIREMENTS

### Next.js Implementation

#### 1. **Project Structure**
```
/app
  /(auth)
    /login
    /register
  /(user)
    /dashboard
    /courts
    /bookings
    /products
    /cart
    /orders
  /(admin)
    /dashboard
    /courts
    /bookings
    /products
    /orders
    /payments
  /api
    /auth
    /courts
    /bookings
    /products
    /orders
/components
  /ui (shadcn/ui components)
  /forms
  /layouts
/lib
  /supabase
  /utils
  /validations
/types
/hooks
/public
```

#### 2. **Tech Stack Details**
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (recommended)
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: Zustand atau React Context
- **Data Fetching**: Server Components + Server Actions
- **Image Upload**: Supabase Storage
- **Authentication**: Supabase Auth

#### 3. **Supabase Setup**

**Database Tables**: Buat semua tabel sesuai schema di atas

**Row Level Security (RLS) Policies**:
```sql
-- Users table
- Users can read their own data
- Admins can read all users

-- Courts table
- Everyone can read courts
- Only admins can insert/update/delete

-- Bookings table
- Users can read their own bookings
- Admins can read all bookings
- Users can create bookings
- Users can update their own bookings
- Admins can update all bookings

-- Products table
- Everyone can read products
- Only admins can insert/update/delete

-- Orders table
- Users can read their own orders
- Admins can read all orders
- Users can create orders
- Admins can update orders
```

**Storage Buckets**:
- `court-images` (public)
- `product-images` (public)
- `payment-proofs` (private, authenticated users only)

#### 4. **Authentication Flow**
- Gunakan Supabase Auth
- Simpan role di `users` table
- Middleware untuk protect routes
- Redirect logic berdasarkan role

#### 5. **File Upload**
- Validasi: max 5MB, format: jpeg, png, jpg, gif, webp
- Resize image sebelum upload (optional, untuk optimasi)
- Generate unique filename
- Store di Supabase Storage
- Simpan path di database

#### 6. **Validation**
Gunakan Zod untuk validasi:
- Email format
- Password min 8 karakter
- Booking name 5-15 karakter
- Date tidak boleh masa lalu
- Time format HH:mm
- Price min 0
- Stock min 0
- Required fields

#### 7. **Error Handling**
- Try-catch untuk semua async operations
- User-friendly error messages
- Toast notifications untuk feedback
- Logging untuk debugging

#### 8. **Performance Optimization**
- Image optimization dengan Next.js Image
- Lazy loading untuk images
- Pagination untuk lists
- Caching dengan React Query (optional)
- Server Components untuk data fetching

---

## ðŸ“ IMPLEMENTATION STEPS

### Phase 1: Setup & Infrastructure
1. Create Next.js project dengan TypeScript
2. Setup Tailwind CSS
3. Install shadcn/ui
4. Setup Supabase project
5. Create database tables dengan migrations
6. Setup RLS policies
7. Create storage buckets
8. Setup environment variables

### Phase 2: Authentication
1. Implement Supabase Auth
2. Create login page
3. Create register page
4. Create middleware untuk protected routes
5. Implement logout functionality
6. Create auth context/hooks

### Phase 3: User Features - Courts & Bookings
1. Create courts list page
2. Create court detail page
3. Implement booking form dengan validasi
4. Implement availability check
5. Create booking history page
6. Implement payment proof upload
7. Implement payment code display (cash)

### Phase 4: User Features - Products & Orders
1. Create products list page
2. Create product detail page
3. Implement cart functionality (state management)
4. Create cart page
5. Create checkout page
6. Implement order creation
7. Create order history page
8. Implement order payment proof upload

### Phase 5: Admin Features
1. Create admin dashboard
2. Implement courts CRUD
3. Implement bookings management
4. Implement products CRUD
5. Implement orders management
6. Create payment approval pages
7. Implement approve/reject payment logic

### Phase 6: UI/UX Polish
1. Add loading states
2. Add error states
3. Add empty states
4. Implement toast notifications
5. Add animations (optional)
6. Mobile responsive testing
7. Accessibility improvements

### Phase 7: Testing & Deployment
1. Test all user flows
2. Test all admin flows
3. Test authentication & authorization
4. Test file uploads
5. Test responsive design
6. Deploy to Vercel
7. Setup environment variables di Vercel
8. Test production deployment

---

## ðŸš€ DEPLOYMENT CHECKLIST

### Supabase
- [ ] Database tables created
- [ ] RLS policies configured
- [ ] Storage buckets created
- [ ] Auth providers configured
- [ ] API keys noted

### Vercel
- [ ] Project connected to Git
- [ ] Environment variables set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (untuk server-side operations)
- [ ] Build settings configured
- [ ] Domain configured (optional)

### Testing
- [ ] Test login/register
- [ ] Test user booking flow
- [ ] Test user order flow
- [ ] Test admin CRUD operations
- [ ] Test payment approval flow
- [ ] Test file uploads
- [ ] Test responsive design
- [ ] Test error handling

---

## ðŸ“š ADDITIONAL NOTES

### Default Users (untuk testing)
Buat seeder atau manual insert:
```
Admin:
- Email: admin@padels.com
- Password: password
- Role: admin

Test User:
- Email: user@padels.com
- Password: password
- Role: user
```

### Payment Methods
- `transfer`: Bank Transfer
- `e_wallet`: E-Wallet (GoPay, OVO, Dana, dll)
- `qris`: QRIS
- `credit_card`: Credit Card
- `cash`: Cash (Bayar di tempat)

### Booking Status
- `pending`: Menunggu konfirmasi pembayaran
- `confirmed`: Pembayaran dikonfirmasi, booking aktif
- `cancelled`: Booking dibatalkan

### Order Status
- `pending`: Menunggu pembayaran
- `paid`: Sudah dibayar
- `processing`: Sedang diproses
- `shipped`: Sedang dikirim
- `delivered`: Sudah diterima
- `cancelled`: Dibatalkan

### Image Handling
- Court images: Tampilkan di list dan detail
- Product images: Tampilkan di list dan detail
- Payment proofs: Hanya admin yang bisa lihat

### Conflict Detection (Booking)
Cek overlap dengan query:
```sql
WHERE court_id = ? 
AND booking_date = ?
AND status != 'cancelled'
AND (
  (start_time <= ? AND end_time > ?) OR
  (start_time < ? AND end_time >= ?) OR
  (start_time >= ? AND end_time <= ?) OR
  (start_time <= ? AND end_time >= ?)
)
```

---

## ðŸŽ¯ SUCCESS CRITERIA

Proyek dianggap berhasil jika:
1. âœ… Semua fitur user berfungsi dengan baik
2. âœ… Semua fitur admin berfungsi dengan baik
3. âœ… Authentication & authorization bekerja dengan benar
4. âœ… File upload berfungsi (images, payment proofs)
5. âœ… Responsive di mobile dan desktop
6. âœ… Tidak ada bug critical
7. âœ… Performance baik (loading time < 3s)
8. âœ… Deployed successfully di Vercel
9. âœ… Database RLS policies configured dengan benar
10. âœ… User experience smooth dan intuitif

---

## ðŸ“ž SUPPORT & RESOURCES

### Documentation Links
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev

### Supabase Helpers
```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => {
  return createServerComponentClient({ cookies })
}
```

### Example RLS Policy
```sql
-- Users can read their own bookings
CREATE POLICY "Users can read own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

-- Admins can read all bookings
CREATE POLICY "Admins can read all bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

---

## ðŸŽ‰ GOOD LUCK!

Anda sekarang memiliki semua informasi yang dibutuhkan untuk merebuild aplikasi Padels dari Flutter + Laravel ke Next.js + Supabase + Vercel. 

**Tips:**
- Mulai dari setup infrastructure dulu
- Test setiap fitur sebelum lanjut ke fitur berikutnya
- Gunakan TypeScript untuk type safety
- Implement error handling dari awal
- Commit code secara berkala
- Deploy early, deploy often

Selamat coding! ðŸš€
# Technical Reference - Padels App (Flutter + Laravel)

## ðŸ“± FLUTTER APP STRUCTURE

### Models

#### User Model
```dart
class User {
  final int id;
  final String name;
  final String email;
  final String role; // 'admin' or 'user'
}
```

#### Court Model
```dart
class Court {
  final int id;
  final String name;
  final String? description;
  final double pricePerHour;
  final String? location;
  final String? image;
  final bool isAvailable;
  final List<String>? facilities; // Array atau comma-separated
  final DateTime createdAt;
  final DateTime updatedAt;
  
  // Image URL: http://localhost:8000/api/courts/{id}/image
}
```

#### Booking Model
```dart
class Booking {
  final int id;
  final int userId;
  final String? bookingName; // 5-15 characters
  final String courtName;
  final DateTime bookingDate;
  final String startTime; // Format: "HH:mm"
  final String endTime; // Format: "HH:mm"
  final double price;
  final String? paymentMethod; // transfer, e_wallet, qris, credit_card, cash
  final String? paymentCode; // Auto-generated untuk cash payment
  final String? paymentProof; // Path to uploaded image
  final String status; // pending, confirmed, cancelled
  final String? notes;
  final bool hideName; // Opsi untuk sembunyikan nama di public view
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? user; // Relasi ke user
}
```

#### Product Model
```dart
class Product {
  final int id;
  final String name;
  final String? description;
  final double price;
  final int stock;
  final String? category;
  final String? image;
  final String? imageUrl; // http://localhost:8000/api/products/{id}/image
  final bool isAvailable;
  final DateTime createdAt;
  final DateTime updatedAt;
}
```

#### Order Model
```dart
class Order {
  final int id;
  final int userId;
  final String orderNumber; // Unique
  final double totalPrice;
  final String paymentMethod;
  final String? paymentProof;
  final String status; // pending, paid, processing, shipped, delivered, cancelled
  final String customerName;
  final String customerPhone;
  final String customerAddress;
  final String? notes;
  final List<OrderItem> items;
  final DateTime createdAt;
  final DateTime updatedAt;
}

class OrderItem {
  final int id;
  final int orderId;
  final int productId;
  final int quantity;
  final double price;
  final double subtotal;
}
```

### Services

#### AuthService
```dart
class AuthService {
  // Login
  Future<Map<String, dynamic>> login(String email, String password)
  
  // Register
  Future<Map<String, dynamic>> register(String name, String email, String password)
  
  // Logout
  Future<void> logout()
  
  // Get current user
  Future<User?> getCurrentUser()
  
  // Check if logged in
  Future<bool> isLoggedIn()
  
  // Get token
  Future<String?> getToken()
}
```

#### ApiService
```dart
class ApiService {
  static String baseUrl = 'http://localhost:8000/api';
  
  // Generic methods
  Future<dynamic> get(String endpoint, {Map<String, String>? headers})
  Future<dynamic> post(String endpoint, {Map<String, dynamic>? body, Map<String, String>? headers})
  Future<dynamic> put(String endpoint, {Map<String, dynamic>? body, Map<String, String>? headers})
  Future<dynamic> delete(String endpoint, {Map<String, String>? headers})
  
  // Multipart (untuk upload file)
  Future<dynamic> postMultipart(String endpoint, {
    Map<String, String>? fields,
    Map<String, File>? files,
  })
}
```

#### CartService (State Management)
```dart
class CartService extends ChangeNotifier {
  List<CartItem> _items = [];
  
  void addItem(Product product, int quantity)
  void removeItem(int productId)
  void updateQuantity(int productId, int quantity)
  void clear()
  
  double get totalPrice
  int get itemCount
  List<CartItem> get items
}

class CartItem {
  final Product product;
  int quantity;
  
  double get subtotal => product.price * quantity;
}
```

### Key Screens

#### LoginScreen
- Form: email, password
- Validasi: email format, password required
- Submit â†’ AuthService.login()
- Success â†’ Navigate to HomeScreen
- Error â†’ Show error message

#### RegisterScreen
- Form: name, email, password, password_confirmation
- Validasi: name required, email format, password min 8 chars, passwords match
- Submit â†’ AuthService.register()
- Success â†’ Navigate to HomeScreen
- Error â†’ Show error message

#### UserCourtsScreen
- Fetch courts dari API
- Display grid/list of courts
- Filter by availability
- Click court â†’ Navigate to CourtDetailScreen

#### CourtDetailScreen
- Display court details
- Show available time slots
- Button "Book Now" â†’ Navigate to UserBookingScreen

#### UserBookingScreen
- Form:
  - Court selection (dropdown atau pre-selected)
  - Booking name (5-15 chars)
  - Date picker (min: today)
  - Start time picker
  - End time picker
  - Payment method selection
  - Hide name checkbox
  - Notes (optional)
- Calculate price based on hours
- Check availability before submit
- Submit â†’ Create booking
- Success:
  - If cash â†’ Show payment code
  - If non-cash â†’ Navigate to upload payment proof
- Error â†’ Show error message

#### UserBookingHistoryScreen
- Fetch user's bookings
- Display list with status badges
- Filter by status
- Click booking â†’ Show detail
- Button "Upload Payment Proof" (if pending & non-cash)
- Button "View Payment Code" (if cash)

#### AdminCourtsScreen
- Fetch all courts
- Display table with actions
- Button "Add Court" â†’ Navigate to CourtFormScreen
- Button "Edit" â†’ Navigate to CourtFormScreen with data
- Button "Delete" â†’ Confirm & delete
- Image upload/preview

#### AdminBookingsScreen
- Fetch all bookings
- Display table with user info
- Filter by status
- Button "Edit" â†’ Navigate to BookingFormScreen
- Button "Delete" â†’ Confirm & delete
- Show payment proof (if uploaded)

#### AdminPaymentApprovalScreen
- Tabs: Bookings, Orders
- Fetch pending payments
- Display list with payment proof preview
- Button "Approve" â†’ Update status to confirmed/paid
- Button "Reject" â†’ Remove payment proof, keep status pending

### Utilities

#### CurrencyFormatter
```dart
String formatCurrency(double amount) {
  return 'Rp ${amount.toStringAsFixed(0).replaceAllMapped(
    RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
    (Match m) => '${m[1]}.',
  )}';
}
```

#### DateFormatter
```dart
String formatDate(DateTime date) {
  return '${date.day}/${date.month}/${date.year}';
}

String formatTime(String time) {
  // Convert "HH:mm:ss" to "HH:mm"
  return time.substring(0, 5);
}
```

---

## ðŸ”§ LARAVEL BACKEND DETAILS

### Controllers Logic

#### AuthController
```php
// Register
- Validate: name, email (unique), password (min 8, confirmed)
- Create user with role 'user'
- Hash password
- Generate Sanctum token
- Return: user data + token

// Login
- Validate: email, password
- Check credentials
- Generate Sanctum token
- Return: user data + token

// Logout
- Delete current access token
- Return: success message

// Get User
- Return: current authenticated user data
```

#### BookingController
```php
// Index
- If admin: return all bookings with user & court relations
- If user: return only user's bookings
- Filter by status (optional)
- Paginate 15 per page
- Order by booking_date desc, start_time desc

// Store
- Validate all fields
- If court_id provided:
  - Check court exists & available
  - Check for conflicting bookings (same court, date, overlapping time)
  - Get court name from court
- If payment_method = 'cash':
  - Generate payment_code (format: YYYY-MM-DD-XXXX)
- Create booking
- Return: booking with relations

// Update
- Check authorization (owner or admin)
- Validate fields
- If court_id changed: check availability & conflicts
- Update booking
- Return: updated booking

// Upload Payment Proof
- Check authorization (owner only)
- Validate: image, max 5MB
- Delete old payment proof if exists
- Store new image in storage/payment_proofs
- Update booking.payment_proof
- Return: success message

// Approve Payment
- Check authorization (admin only)
- Check payment_proof exists (for non-cash)
- Update status to 'confirmed'
- Return: success message

// Reject Payment
- Check authorization (admin only)
- Delete payment proof file
- Set payment_proof to null
- Keep status 'pending'
- Return: success message

// Get Pending Payments
- Check authorization (admin only)
- Get bookings with status 'pending' AND (payment_proof exists OR payment_method = 'cash')
- Return: bookings list

// Conflict Detection Query
WHERE court_id = ?
AND booking_date = ?
AND status != 'cancelled'
AND (
  (start_time <= ? AND end_time > ?) OR
  (start_time < ? AND end_time >= ?) OR
  (start_time >= ? AND end_time <= ?) OR
  (start_time <= ? AND end_time >= ?)
)
```

#### ProductController
```php
// Index
- Filter by category (optional)
- Filter by is_available (optional)
- Paginate 15 per page
- Add image_url to each product
- Return: products list

// Store
- Validate all fields
- If image uploaded:
  - Store in storage/products
  - Save path to database
- Create product
- Return: product with image_url

// Update
- Validate fields
- If new image uploaded:
  - Delete old image
  - Store new image
  - Update path
- Update product
- Return: updated product

// Delete
- Delete image file if exists
- Delete product
- Return: success message

// Get Image
- Check image exists
- Read file from storage
- Return: file with CORS headers
```

#### OrderController
```php
// Store
- Validate: items array, customer info, payment_method
- Generate unique order_number
- Calculate total_price from items
- Create order
- Create order_items
- Reduce product stock
- Return: order with items

// Upload Payment Proof
- Similar to BookingController
- Store in storage/order_payment_proofs

// Approve Payment
- Check authorization (admin only)
- Update status to 'paid'
- Return: success message

// Get Pending Payments
- Similar to BookingController
- Get orders with status 'pending' AND payment_proof exists
```

### Middleware

#### auth:sanctum
- Check Bearer token in Authorization header
- Validate token
- Load user
- Attach to request

#### Role Check (Custom)
```php
// In controller methods
if ($request->user()->role !== 'admin') {
    return response()->json(['message' => 'Unauthorized'], 403);
}
```

### File Storage

#### Configuration (config/filesystems.php)
```php
'disks' => [
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],
],
```

#### Storage Structure
```
storage/app/public/
  â”œâ”€â”€ products/
  â”‚   â””â”€â”€ {filename}.jpg
  â”œâ”€â”€ courts/
  â”‚   â””â”€â”€ {filename}.jpg
  â”œâ”€â”€ payment_proofs/
  â”‚   â””â”€â”€ {filename}.jpg
  â””â”€â”€ order_payment_proofs/
      â””â”€â”€ {filename}.jpg
```

#### Symbolic Link
```bash
php artisan storage:link
# Creates: public/storage -> storage/app/public
```

### CORS Configuration

#### config/cors.php
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'], // In production: specify frontend URL
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

### Database Seeders

#### DatabaseSeeder
```php
// Create admin user
User::create([
    'name' => 'Admin',
    'email' => 'admin@padels.com',
    'password' => Hash::make('password'),
    'role' => 'admin',
]);

// Create test users
User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'password' => Hash::make('password'),
    'role' => 'user',
]);

// Create sample courts
Court::create([
    'name' => 'Court A',
    'description' => 'Indoor court with AC',
    'price_per_hour' => 150000,
    'location' => 'Building 1, Floor 2',
    'facilities' => 'AC,Shower,Locker',
    'is_available' => true,
]);

// Create sample products
Product::create([
    'name' => 'Padel Racket Pro',
    'description' => 'Professional padel racket',
    'price' => 1500000,
    'stock' => 10,
    'category' => 'Rackets',
    'is_available' => true,
]);
```

---

## ðŸ”„ API REQUEST/RESPONSE EXAMPLES

### Login
**Request:**
```json
POST /api/auth/login
{
  "email": "admin@padels.com",
  "password": "password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@padels.com",
    "role": "admin"
  },
  "token": "1|abc123..."
}
```

### Create Booking
**Request:**
```json
POST /api/bookings
Authorization: Bearer {token}
{
  "court_id": 1,
  "booking_name": "John Doe",
  "booking_date": "2024-12-25",
  "start_time": "10:00",
  "end_time": "12:00",
  "price": 300000,
  "payment_method": "transfer",
  "hide_name": false,
  "notes": "Please prepare the court"
}
```

**Response:**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": 1,
    "user_id": 2,
    "court_id": 1,
    "booking_name": "John Doe",
    "court_name": "Court A",
    "booking_date": "2024-12-25",
    "start_time": "10:00:00",
    "end_time": "12:00:00",
    "price": 300000,
    "payment_method": "transfer",
    "payment_code": null,
    "payment_proof": null,
    "status": "pending",
    "notes": "Please prepare the court",
    "hide_name": false,
    "created_at": "2024-12-20T10:00:00.000000Z",
    "updated_at": "2024-12-20T10:00:00.000000Z",
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "court": {
      "id": 1,
      "name": "Court A",
      "price_per_hour": 150000
    }
  }
}
```

### Upload Payment Proof
**Request:**
```
POST /api/bookings/1/payment-proof
Authorization: Bearer {token}
Content-Type: multipart/form-data

payment_proof: [image file]
```

**Response:**
```json
{
  "message": "Bukti pembayaran berhasil diupload",
  "booking": {
    "id": 1,
    "payment_proof": "payment_proofs/abc123.jpg",
    ...
  }
}
```

### Create Order
**Request:**
```json
POST /api/orders
Authorization: Bearer {token}
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 1500000
    }
  ],
  "payment_method": "transfer",
  "customer_name": "John Doe",
  "customer_phone": "081234567890",
  "customer_address": "Jl. Example No. 123",
  "notes": "Please pack carefully"
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "user_id": 2,
    "order_number": "ORD-20241220-0001",
    "total_price": 3000000,
    "payment_method": "transfer",
    "status": "pending",
    "customer_name": "John Doe",
    "customer_phone": "081234567890",
    "customer_address": "Jl. Example No. 123",
    "notes": "Please pack carefully",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 1500000,
        "subtotal": 3000000,
        "product": {
          "id": 1,
          "name": "Padel Racket Pro"
        }
      }
    ],
    "created_at": "2024-12-20T10:00:00.000000Z"
  }
}
```

---

## ðŸŽ¯ BUSINESS LOGIC HIGHLIGHTS

### Booking Conflict Detection
```
Booking A: 10:00 - 12:00
Booking B: 11:00 - 13:00
Result: CONFLICT (overlap)

Booking A: 10:00 - 12:00
Booking B: 12:00 - 14:00
Result: NO CONFLICT (end time = start time is allowed)

Booking A: 10:00 - 12:00
Booking B: 08:00 - 10:00
Result: NO CONFLICT (end time = start time is allowed)
```

### Payment Code Generation (Cash)
```
Format: YYYY-MM-DD-XXXX
Example: 2024-12-20-0001

Logic:
1. Get current date
2. Count bookings created today with cash payment
3. Increment count + 1
4. Pad with zeros to 4 digits
5. Combine: year-month-day-sequence
```

### Order Number Generation
```
Format: ORD-YYYYMMDD-XXXX
Example: ORD-20241220-0001

Logic:
1. Get current date
2. Count orders created today
3. Increment count + 1
4. Pad with zeros to 4 digits
5. Combine: ORD-date-sequence
```

### Stock Management
```
When order created:
- Reduce product.stock by order_item.quantity
- Check stock availability before creating order
- If stock insufficient, return error

When order cancelled:
- Restore product.stock by order_item.quantity
```

### Image URL Construction
```
Court Image:
- Stored: storage/app/public/courts/abc123.jpg
- URL: http://localhost:8000/api/courts/1/image

Product Image:
- Stored: storage/app/public/products/xyz789.jpg
- URL: http://localhost:8000/api/products/1/image

Payment Proof:
- Stored: storage/app/public/payment_proofs/proof123.jpg
- URL: http://localhost:8000/api/bookings/1/payment-proof
```

---

## ðŸ” SECURITY CONSIDERATIONS

### Authentication
- Passwords hashed dengan bcrypt
- Tokens generated dengan Sanctum
- Tokens stored in localStorage (Flutter web) atau SharedPreferences (Flutter mobile)
- Token sent in Authorization header: `Bearer {token}`

### Authorization
- Role-based access control (admin vs user)
- Owner-based access (user can only access their own data)
- Admin can access all data

### File Upload
- Validate file type (image only)
- Validate file size (max 5MB)
- Generate unique filename to prevent overwrite
- Store in non-public directory, serve via controller with auth check (for payment proofs)

### Input Validation
- Server-side validation di Laravel
- Client-side validation di Flutter
- Sanitize input untuk prevent XSS
- Use parameterized queries untuk prevent SQL injection (handled by Eloquent)

### CORS
- Configure allowed origins
- In production: whitelist frontend domain only
- Allow credentials untuk Sanctum

---

## ðŸ“Š PERFORMANCE CONSIDERATIONS

### Database
- Index pada foreign keys
- Index pada frequently queried columns (email, status, booking_date)
- Eager loading untuk relations (with(['user', 'court']))
- Pagination untuk large datasets

### Images
- Resize images before upload (optional)
- Serve images via CDN (optional, untuk production)
- Lazy loading di frontend
- Cache images di browser

### API
- Pagination untuk list endpoints
- Filter/search untuk reduce data transfer
- Compress responses (gzip)
- Rate limiting untuk prevent abuse

---

Gunakan referensi ini untuk memahami detail implementasi saat merebuild ke Next.js + Supabase!
# Next.js Code Examples for Padels App

## ðŸš€ Quick Start Commands

```bash
# Create Next.js project
npx create-next-app@latest padels-nextjs --typescript --tailwind --app

# Install dependencies
cd padels-nextjs
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install react-hook-form zod @hookform/resolvers
npm install zustand
npm install date-fns
npm install lucide-react

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card form select textarea
npx shadcn-ui@latest add table dialog toast tabs badge
```

---

## ðŸ“ Project Structure

```
padels-nextjs/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ (auth)/
â”‚   â”‚   â”œâ”€â”€ login/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â””â”€â”€ register/
â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”œâ”€â”€ (user)/
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”œâ”€â”€ courts/
â”‚   â”‚   â”œâ”€â”€ bookings/
â”‚   â”‚   â”œâ”€â”€ products/
â”‚   â”‚   â”œâ”€â”€ cart/
â”‚   â”‚   â””â”€â”€ orders/
â”‚   â”œâ”€â”€ (admin)/
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”œâ”€â”€ courts/
â”‚   â”‚   â”œâ”€â”€ bookings/
â”‚   â”‚   â”œâ”€â”€ products/
â”‚   â”‚   â”œâ”€â”€ orders/
â”‚   â”‚   â””â”€â”€ payments/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”œâ”€â”€ courts/
â”‚   â”‚   â”œâ”€â”€ bookings/
â”‚   â”‚   â”œâ”€â”€ products/
â”‚   â”‚   â””â”€â”€ orders/
â”‚   â”œâ”€â”€ layout.tsx
â”‚   â””â”€â”€ page.tsx
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ ui/
â”‚   â”œâ”€â”€ forms/
â”‚   â”œâ”€â”€ layouts/
â”‚   â””â”€â”€ shared/
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ supabase/
â”‚   â”‚   â”œâ”€â”€ client.ts
â”‚   â”‚   â”œâ”€â”€ server.ts
â”‚   â”‚   â””â”€â”€ middleware.ts
â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”œâ”€â”€ currency.ts
â”‚   â”‚   â”œâ”€â”€ date.ts
â”‚   â”‚   â””â”€â”€ validation.ts
â”‚   â””â”€â”€ store/
â”‚       â””â”€â”€ cart.ts
â”œâ”€â”€ types/
â”‚   â””â”€â”€ index.ts
â””â”€â”€ middleware.ts
```

---

## ðŸ”§ Configuration Files

### .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### lib/supabase/client.ts
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const createClient = () => {
  return createClientComponentClient<Database>()
}
```

### lib/supabase/server.ts
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}
```

### middleware.ts
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
```

---

## ðŸ“Š TypeScript Types

### types/index.ts
```typescript
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface Court {
  id: number
  name: string
  description?: string
  price_per_hour: number
  location?: string
  image?: string
  is_available: boolean
  facilities?: string[]
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  user_id: string
  court_id?: number
  court_name: string
  booking_name: string
  booking_date: string
  start_time: string
  end_time: string
  price: number
  payment_method: 'transfer' | 'e_wallet' | 'qris' | 'credit_card' | 'cash'
  payment_code?: string
  payment_proof?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
  hide_name: boolean
  created_at: string
  updated_at: string
  user?: User
  court?: Court
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  category?: string
  image?: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user_id: string
  order_number: string
  total_price: number
  payment_method: string
  payment_proof?: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  customer_name: string
  customer_phone: string
  customer_address: string
  notes?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  subtotal: number
  product?: Product
}

export interface CartItem {
  product: Product
  quantity: number
}
```

---

## ðŸŽ¨ Utility Functions

### lib/utils/currency.ts
```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
```

### lib/utils/date.ts
```typescript
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd MMMM yyyy', { locale: id })
}

export function formatTime(time: string): string {
  return time.substring(0, 5) // HH:mm
}

export function formatDateTime(datetime: string): string {
  return format(parseISO(datetime), 'dd MMM yyyy HH:mm', { locale: id })
}
```

### lib/utils/validation.ts
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Password tidak cocok',
  path: ['password_confirmation'],
})

export const bookingSchema = z.object({
  court_id: z.number().optional(),
  booking_name: z.string().min(5, 'Minimal 5 karakter').max(15, 'Maksimal 15 karakter'),
  booking_date: z.string().min(1, 'Tanggal harus diisi'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu: HH:mm'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu: HH:mm'),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  payment_method: z.enum(['transfer', 'e_wallet', 'qris', 'credit_card', 'cash']),
  hide_name: z.boolean().optional(),
  notes: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Nama produk harus diisi'),
  description: z.string().optional(),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  stock: z.number().int().min(0, 'Stok tidak boleh negatif'),
  category: z.string().optional(),
  is_available: z.boolean().optional(),
})
```

---

## ðŸ›’ Cart Store (Zustand)

### lib/store/cart.ts
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { product, quantity }],
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
```

---

## ðŸ” Authentication Pages

### app/(auth)/login/page.tsx
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { loginSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) throw authError

      // Get user role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (userError) throw userError

      toast({
        title: 'Login berhasil',
        description: 'Selamat datang kembali!',
      })

      // Redirect based on role
      if (userData.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Login gagal',
        description: error.message || 'Email atau password salah',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Padels</h1>
          <p className="mt-2 text-gray-600">Login ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

---

## ðŸ“‹ Example: Courts List Page

### app/(user)/courts/page.tsx
```typescript
import { createServerClient } from '@/lib/supabase/server'
import { Court } from '@/types'
import { formatCurrency } from '@/lib/utils/currency'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'

export default async function CourtsPage() {
  const supabase = createServerClient()

  const { data: courts, error } = await supabase
    .from('courts')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error loading courts</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Daftar Lapangan</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courts?.map((court: Court) => (
          <Card key={court.id}>
            <CardHeader>
              {court.image && (
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/court-images/${court.image}`}
                    alt={court.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">{court.name}</CardTitle>
              <p className="mb-4 text-sm text-gray-600">{court.description}</p>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(court.price_per_hour)}/jam
                </p>
                {court.location && (
                  <p className="text-sm text-gray-500">ðŸ“ {court.location}</p>
                )}
                {court.facilities && (
                  <div className="flex flex-wrap gap-1">
                    {court.facilities.map((facility, index) => (
                      <Badge key={index} variant="secondary">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/courts/${court.id}`} className="w-full">
                <Button className="w-full">Lihat Detail</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## ðŸŽ¯ Example: Booking Form

### app/(user)/bookings/new/page.tsx
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { bookingSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/use-toast'

export default function NewBookingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(bookingSchema),
  })

  const startTime = watch('start_time')
  const endTime = watch('end_time')
  const pricePerHour = 150000 // Get from court

  // Calculate total price
  const calculatePrice = () => {
    if (!startTime || !endTime) return 0
    const [startHour] = startTime.split(':').map(Number)
    const [endHour] = endTime.split(':').map(Number)
    const hours = endHour - startHour
    return hours * pricePerHour
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      // Check availability first
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('*')
        .eq('court_id', data.court_id)
        .eq('booking_date', data.booking_date)
        .neq('status', 'cancelled')
        .or(`start_time.lte.${data.start_time},end_time.gt.${data.start_time}`)

      if (conflicts && conflicts.length > 0) {
        toast({
          title: 'Lapangan tidak tersedia',
          description: 'Waktu yang dipilih sudah dibooking',
          variant: 'destructive',
        })
        return
      }

      // Create booking
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          ...data,
          price: calculatePrice(),
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Booking berhasil',
        description: 'Silakan upload bukti pembayaran',
      })

      router.push(`/bookings/${booking.id}`)
    } catch (error: any) {
      toast({
        title: 'Booking gagal',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Booking Lapangan</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Form fields here */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Buat Booking'}
        </Button>
      </form>
    </div>
  )
}
```

---

## ðŸ—„ï¸ Supabase SQL Setup

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courts table
CREATE TABLE courts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_per_hour DECIMAL(10,2) NOT NULL,
  location TEXT,
  image TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  facilities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  court_id INTEGER REFERENCES courts(id),
  court_name TEXT NOT NULL,
  booking_name TEXT NOT NULL CHECK (LENGTH(booking_name) BETWEEN 5 AND 15),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('transfer', 'e_wallet', 'qris', 'credit_card', 'cash')),
  payment_code TEXT,
  payment_proof TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes TEXT,
  hide_name BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Everyone can read courts
CREATE POLICY "Anyone can read courts" ON courts
  FOR SELECT USING (TRUE);

-- Only admins can modify courts
CREATE POLICY "Admins can modify courts" ON courts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Users can read their own bookings
CREATE POLICY "Users can read own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all bookings
CREATE POLICY "Admins can read all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

Gunakan contoh-contoh kode ini sebagai starting point untuk implementasi Next.js Anda!
# Deployment Checklist - Padels Next.js App

## ðŸ“‹ Pre-Deployment Checklist

### 1. Supabase Setup âœ…

#### Database Tables
- [ ] Create `users` table with RLS policies
- [ ] Create `courts` table with RLS policies
- [ ] Create `bookings` table with RLS policies
- [ ] Create `products` table with RLS policies
- [ ] Create `orders` table with RLS policies
- [ ] Create `order_items` table with RLS policies
- [ ] Add indexes on foreign keys
- [ ] Add indexes on frequently queried columns (email, status, booking_date)

#### Storage Buckets
- [ ] Create `court-images` bucket (public)
- [ ] Create `product-images` bucket (public)
- [ ] Create `payment-proofs` bucket (private, authenticated only)
- [ ] Configure bucket policies

#### Authentication
- [ ] Enable Email/Password authentication
- [ ] Configure email templates (optional)
- [ ] Set up redirect URLs
- [ ] Configure site URL

#### Seed Data
- [ ] Create admin user (admin@padels.com)
- [ ] Create test user (user@padels.com)
- [ ] Create sample courts (optional)
- [ ] Create sample products (optional)

### 2. Next.js Project Setup âœ…

#### Dependencies
- [ ] Install all required packages
- [ ] Configure TypeScript
- [ ] Setup Tailwind CSS
- [ ] Install shadcn/ui components
- [ ] Install form libraries (react-hook-form, zod)
- [ ] Install state management (zustand)
- [ ] Install date utilities (date-fns)

#### Environment Variables
- [ ] Create `.env.local` file
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Add to `.gitignore`

#### Configuration Files
- [ ] Configure `next.config.js` for images
- [ ] Setup `middleware.ts` for auth
- [ ] Configure `tailwind.config.js`
- [ ] Setup `tsconfig.json`

### 3. Feature Implementation âœ…

#### Authentication
- [ ] Login page
- [ ] Register page
- [ ] Logout functionality
- [ ] Protected routes middleware
- [ ] Role-based redirects
- [ ] Auth context/hooks

#### User Features - Courts & Bookings
- [ ] Courts list page
- [ ] Court detail page
- [ ] Booking form with validation
- [ ] Availability check logic
- [ ] Booking history page
- [ ] Payment proof upload
- [ ] Payment code display (cash)
- [ ] Booking status tracking

#### User Features - Products & Orders
- [ ] Products list page
- [ ] Product detail page
- [ ] Cart functionality (Zustand)
- [ ] Cart page
- [ ] Checkout form
- [ ] Order creation
- [ ] Order history page
- [ ] Order payment proof upload
- [ ] Order status tracking

#### Admin Features
- [ ] Admin dashboard with stats
- [ ] Courts CRUD operations
- [ ] Court image upload
- [ ] Bookings management table
- [ ] Booking filters (status, date)
- [ ] Products CRUD operations
- [ ] Product image upload
- [ ] Orders management table
- [ ] Order details view
- [ ] Payment approval page (bookings)
- [ ] Payment approval page (orders)
- [ ] Approve/reject payment logic
- [ ] View payment proofs

#### UI/UX
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Toast notifications
- [ ] Form validations
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Image optimization

### 4. Testing âœ…

#### Authentication Flow
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Protected route access
- [ ] Admin route access (admin only)
- [ ] User route access (user only)

#### User Booking Flow
- [ ] View courts list
- [ ] View court detail
- [ ] Create booking (all payment methods)
- [ ] Check availability validation
- [ ] Upload payment proof
- [ ] View payment code (cash)
- [ ] View booking history
- [ ] Filter bookings by status

#### User Order Flow
- [ ] View products list
- [ ] Add to cart
- [ ] Update cart quantity
- [ ] Remove from cart
- [ ] Checkout
- [ ] Create order
- [ ] Upload order payment proof
- [ ] View order history
- [ ] Track order status

#### Admin Flow
- [ ] Create court
- [ ] Update court
- [ ] Delete court
- [ ] Upload court image
- [ ] View all bookings
- [ ] Approve booking payment
- [ ] Reject booking payment
- [ ] Create product
- [ ] Update product
- [ ] Delete product
- [ ] Upload product image
- [ ] View all orders
- [ ] Approve order payment
- [ ] Reject order payment
- [ ] Update order status

#### Edge Cases
- [ ] Booking conflict detection
- [ ] Out of stock products
- [ ] Invalid date/time selections
- [ ] File upload size limits
- [ ] File upload type validation
- [ ] Network errors
- [ ] Database errors
- [ ] Unauthorized access attempts

### 5. Performance Optimization âœ…

- [ ] Image optimization (Next.js Image component)
- [ ] Lazy loading for images
- [ ] Code splitting
- [ ] Server Components for data fetching
- [ ] Client Components only when needed
- [ ] Database query optimization
- [ ] Pagination for large lists
- [ ] Caching strategies
- [ ] Bundle size analysis

### 6. Security âœ…

- [ ] RLS policies configured correctly
- [ ] Input validation (client & server)
- [ ] SQL injection prevention (Supabase handles this)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] File upload validation
- [ ] Rate limiting (Supabase handles this)
- [ ] Environment variables secured
- [ ] No sensitive data in client code
- [ ] HTTPS only (Vercel handles this)

---

## ðŸš€ Vercel Deployment Steps

### 1. Prepare Repository
```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Padels Next.js app"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/padels-nextjs.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: padels-nextjs
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

#### Option B: Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables (see below)
6. Click "Deploy"

### 3. Configure Environment Variables in Vercel

Go to Project Settings â†’ Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** Add these for all environments (Production, Preview, Development)

### 4. Configure Supabase for Production

#### Update Supabase Auth Settings
1. Go to Supabase Dashboard â†’ Authentication â†’ URL Configuration
2. Add your Vercel domain to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

#### Update CORS Settings (if needed)
1. Go to Supabase Dashboard â†’ Settings â†’ API
2. Add your Vercel domain to allowed origins

### 5. Test Production Deployment

- [ ] Visit your Vercel URL
- [ ] Test login/register
- [ ] Test user booking flow
- [ ] Test user order flow
- [ ] Test admin features
- [ ] Test image uploads
- [ ] Test on mobile devices
- [ ] Test on different browsers

### 6. Custom Domain (Optional)

1. Go to Vercel Project Settings â†’ Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Supabase redirect URLs with custom domain

---

## ðŸ”§ Troubleshooting

### Common Issues

#### 1. "Invalid API key" error
**Solution:** Check environment variables in Vercel are correct and deployed

#### 2. Images not loading
**Solution:** 
- Check Supabase storage bucket is public
- Verify image URLs are correct
- Check Next.js image domains configuration

#### 3. Authentication not working
**Solution:**
- Verify Supabase redirect URLs include Vercel domain
- Check middleware.ts is configured correctly
- Verify cookies are being set

#### 4. RLS policy errors
**Solution:**
- Check RLS policies are enabled
- Verify policies allow the intended operations
- Test policies in Supabase SQL editor

#### 5. Build fails on Vercel
**Solution:**
- Check build logs for errors
- Verify all dependencies are in package.json
- Test build locally: `npm run build`
- Check TypeScript errors

#### 6. Booking conflicts not detected
**Solution:**
- Verify conflict detection query logic
- Check time format consistency
- Test with various time ranges

#### 7. File upload fails
**Solution:**
- Check file size limits
- Verify storage bucket policies
- Check file type validation
- Verify storage bucket exists

---

## ðŸ“Š Post-Deployment Monitoring

### Vercel Analytics
- [ ] Enable Vercel Analytics
- [ ] Monitor page load times
- [ ] Track Core Web Vitals
- [ ] Monitor error rates

### Supabase Monitoring
- [ ] Monitor database usage
- [ ] Check storage usage
- [ ] Monitor API requests
- [ ] Review auth logs

### User Feedback
- [ ] Set up error reporting (Sentry, optional)
- [ ] Monitor user complaints
- [ ] Track feature usage
- [ ] Collect user feedback

---

## ðŸ”„ Continuous Deployment

### Automatic Deployments
Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel will automatically:
# 1. Build your app
# 2. Run tests (if configured)
# 3. Deploy to preview URL (for branches)
# 4. Deploy to production (for main branch)
```

### Preview Deployments
- Every branch gets a preview URL
- Test changes before merging to main
- Share preview URLs with team

### Rollback
If something goes wrong:
1. Go to Vercel Dashboard â†’ Deployments
2. Find previous working deployment
3. Click "..." â†’ "Promote to Production"

---

## ðŸ“ Maintenance Checklist

### Weekly
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Review user feedback
- [ ] Check database usage

### Monthly
- [ ] Update dependencies
- [ ] Review and optimize database queries
- [ ] Check storage usage
- [ ] Review security logs
- [ ] Backup database (Supabase handles this)

### Quarterly
- [ ] Review and update RLS policies
- [ ] Audit user permissions
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Update documentation

---

## ðŸŽ‰ Success Criteria

Your deployment is successful when:

âœ… All features work in production
âœ… No console errors
âœ… Page load time < 3 seconds
âœ… Mobile responsive
âœ… Authentication works correctly
âœ… File uploads work
âœ… Admin features accessible only to admins
âœ… User features accessible to authenticated users
âœ… Payment approval flow works
âœ… Booking conflict detection works
âœ… Order creation and tracking works
âœ… Images load correctly
âœ… Forms validate properly
âœ… Error handling works
âœ… Toast notifications appear
âœ… No security vulnerabilities

---

## ðŸ“ž Support Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

### Community
- Next.js Discord: https://nextjs.org/discord
- Supabase Discord: https://discord.supabase.com
- Stack Overflow: Tag with `nextjs`, `supabase`, `vercel`

### Debugging Tools
- Vercel Logs: Project â†’ Deployments â†’ Click deployment â†’ Logs
- Supabase Logs: Dashboard â†’ Logs
- Browser DevTools: Console, Network, Application tabs
- React DevTools: Component tree and state inspection

---

## ðŸŽ¯ Next Steps After Deployment

1. **Monitor Performance**
   - Set up analytics
   - Track user behavior
   - Monitor error rates

2. **Gather Feedback**
   - Ask users for feedback
   - Track feature usage
   - Identify pain points

3. **Iterate and Improve**
   - Fix bugs
   - Add requested features
   - Optimize performance
   - Improve UX

4. **Scale**
   - Optimize database queries
   - Add caching
   - Consider CDN for images
   - Monitor costs

5. **Marketing**
   - Share with users
   - Create documentation
   - Make tutorial videos
   - Promote on social media

---

**Congratulations on deploying your Padels app! ðŸŽ‰**

Remember: Deployment is not the end, it's the beginning of your app's journey. Keep iterating, improving, and listening to your users!
