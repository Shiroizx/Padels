# Admin User Management

## Overview
Fitur manajemen user untuk admin yang memungkinkan admin untuk:
1. Melihat daftar semua user
2. Edit informasi user (nama, email, role)
3. Reset password user

## Features

### 1. Daftar User (`/admin/users`)
**Halaman:** `src/app/admin/users/page.tsx`

Menampilkan tabel dengan informasi:
- Nama user
- Email
- Role (Admin/User) dengan badge berwarna
- Tanggal terdaftar
- Total booking (placeholder)
- Total order (placeholder)
- Tombol aksi: Edit dan Reset Password

**Fitur:**
- Sorting berdasarkan tanggal terdaftar (terbaru dulu)
- Badge role dengan warna berbeda (purple untuk admin, gray untuk user)
- Link ke admin dashboard

### 2. Edit User (`/admin/users/[id]/edit`)
**Halaman:** `src/app/admin/users/[id]/edit/page.tsx`
**Komponen:** `src/components/admin/edit-user-form.tsx`

**Form Fields:**
- **Nama** - Required, dapat diubah
- **Email** - Required, dapat diubah (dengan catatan)
- **Role** - Required, dropdown (User/Admin)

**Fitur:**
- Update nama dan role langsung ke database
- Update email menggunakan Supabase Auth Admin API
- Validasi form
- Loading state saat submit
- Toast notification untuk feedback
- Auto redirect ke daftar user setelah berhasil

**Catatan Email:**
- Perubahan email mungkin memerlukan verifikasi ulang
- Jika admin API tidak tersedia, akan muncul warning
- Untuk production, gunakan Supabase Dashboard untuk mengubah email

### 3. Reset Password (`/admin/users/[id]/reset-password`)
**Halaman:** `src/app/admin/users/[id]/reset-password/page.tsx`
**Komponen:** `src/components/admin/reset-password-form.tsx`
**API Route:** `src/app/api/admin/reset-password/route.ts`

**Form Fields:**
- **Password Baru** - Required, minimal 6 karakter
- **Konfirmasi Password** - Required, harus sama dengan password baru

**Fitur:**
- ✅ Generate password acak yang aman (12 karakter)
- ✅ Toggle show/hide password
- ✅ Copy password ke clipboard
- ✅ Indikator password match (hijau/merah)
- ✅ Validasi password minimal 6 karakter
- ✅ Warning untuk menyalin password sebelum menutup halaman
- ✅ Server-side API untuk keamanan
- ✅ Loading state dan error handling

**Security:**
- Password reset dilakukan melalui API route server-side
- Menggunakan Supabase Service Role Key
- Validasi admin role di server-side
- Password tidak disimpan di log atau history

## Technical Implementation

### Database
Tidak ada perubahan schema database. Menggunakan tabel `users` yang sudah ada.

### API Routes
**POST `/api/admin/reset-password`**
- Validasi admin authentication
- Validasi input (userId, newPassword)
- Menggunakan Supabase Admin API dengan service role key
- Return success/error response

**Request Body:**
```json
{
  "userId": "uuid",
  "newPassword": "string (min 6 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for password reset
```

**Important:** `SUPABASE_SERVICE_ROLE_KEY` harus ditambahkan ke environment variables untuk fitur reset password berfungsi.

### Security Considerations

1. **Server-Side Only:**
   - Password reset menggunakan API route (server-side)
   - Service role key tidak exposed ke client
   - Validasi admin di server-side

2. **Authentication:**
   - Cek user authenticated
   - Cek user role = admin
   - Validasi di setiap request

3. **Password Policy:**
   - Minimal 6 karakter (Supabase default)
   - Dapat ditingkatkan sesuai kebutuhan
   - Generate random password menggunakan charset yang aman

4. **Audit Trail:**
   - Console log untuk debugging
   - Toast notification untuk user feedback
   - Error handling yang proper

## Admin Dashboard Integration

Fitur user management telah ditambahkan ke admin dashboard:
- Card "Kelola User" di Quick Actions
- Stats card menampilkan total users
- Icon Users dengan warna teal

## Files Created/Modified

### New Files:
1. `src/app/admin/users/page.tsx` - Daftar user
2. `src/app/admin/users/[id]/edit/page.tsx` - Edit user page
3. `src/app/admin/users/[id]/reset-password/page.tsx` - Reset password page
4. `src/components/admin/edit-user-form.tsx` - Form edit user
5. `src/components/admin/reset-password-form.tsx` - Form reset password
6. `src/app/api/admin/reset-password/route.ts` - API route untuk reset password
7. `admin-user-management-setup.sql` - SQL setup (optional)
8. `ADMIN_USER_MANAGEMENT.md` - Dokumentasi

### Modified Files:
1. `src/app/admin/dashboard/page.tsx` - Tambah card user management dan stats

## Usage Guide

### Untuk Admin:

#### 1. Melihat Daftar User
1. Login sebagai admin
2. Buka Admin Dashboard
3. Klik "Kelola User" atau navigasi ke `/admin/users`
4. Lihat daftar semua user dengan informasi lengkap

#### 2. Edit User
1. Di daftar user, klik tombol "Edit" pada user yang ingin diubah
2. Ubah nama, email, atau role
3. Klik "Simpan Perubahan"
4. User akan di-redirect ke daftar user

#### 3. Reset Password User
1. Di daftar user, klik tombol "Reset" pada user yang ingin direset passwordnya
2. Pilih salah satu:
   - Ketik password baru manual
   - Klik "Generate Password Acak" untuk membuat password otomatis
3. Konfirmasi password
4. **PENTING:** Salin password dengan klik icon copy
5. Klik "Reset Password"
6. Berikan password baru kepada user

**Tips:**
- Gunakan "Generate Password Acak" untuk password yang lebih aman
- Selalu salin password sebelum submit
- Berikan password kepada user melalui channel yang aman (tidak melalui email)
- Minta user untuk mengubah password setelah login pertama kali

## Testing Checklist

- [x] Daftar user tampil dengan benar
- [x] Badge role tampil dengan warna yang tepat
- [x] Form edit user berfungsi
- [x] Update nama berhasil
- [x] Update role berhasil
- [x] Form reset password berfungsi
- [x] Generate password acak berfungsi
- [x] Copy password ke clipboard berfungsi
- [x] Toggle show/hide password berfungsi
- [x] Validasi password match berfungsi
- [x] API route reset password berfungsi
- [x] Admin authentication di-check
- [x] Error handling berfungsi
- [x] Toast notifications tampil
- [x] Redirect setelah success
- [x] No TypeScript errors

## Future Enhancements

1. **User Statistics:**
   - Tampilkan jumlah booking dan order yang sebenarnya
   - Grafik aktivitas user
   - Last login timestamp

2. **Bulk Actions:**
   - Select multiple users
   - Bulk role change
   - Bulk delete (soft delete)

3. **User Search & Filter:**
   - Search by name/email
   - Filter by role
   - Sort by various fields

4. **User Activity Log:**
   - Track user actions
   - Login history
   - Booking/order history

5. **Email Notifications:**
   - Send email when password is reset
   - Send welcome email for new users
   - Send notification when role is changed

6. **Advanced Password Policy:**
   - Require uppercase, lowercase, numbers, symbols
   - Password strength indicator
   - Password history (prevent reuse)

7. **Two-Factor Authentication:**
   - Enable/disable 2FA for users
   - Reset 2FA if user loses device

8. **User Suspension:**
   - Temporarily disable user account
   - Ban user with reason
   - Unban functionality

## Troubleshooting

### Password Reset Tidak Berfungsi
**Problem:** Error "Service role key not configured"
**Solution:** 
1. Tambahkan `SUPABASE_SERVICE_ROLE_KEY` ke `.env.local`
2. Restart development server
3. Untuk production, tambahkan ke environment variables di hosting platform

### Email Tidak Dapat Diubah
**Problem:** Warning "email tidak dapat diubah"
**Solution:**
1. Gunakan Supabase Dashboard untuk mengubah email
2. Atau setup Supabase Edge Function untuk handle email change
3. Atau gunakan service role key di server-side

### Unauthorized Error
**Problem:** User tidak dapat mengakses halaman admin
**Solution:**
1. Pastikan user login sebagai admin
2. Check role di database users table
3. Clear browser cache dan login ulang

## Conclusion

Fitur admin user management telah berhasil diimplementasi dengan:
✅ Daftar user dengan informasi lengkap
✅ Edit user (nama, email, role)
✅ Reset password dengan keamanan tinggi
✅ Generate password acak
✅ Copy password ke clipboard
✅ Server-side API untuk keamanan
✅ Validasi dan error handling yang baik
✅ UI/UX yang user-friendly

Admin sekarang dapat mengelola user dengan mudah dan aman!
