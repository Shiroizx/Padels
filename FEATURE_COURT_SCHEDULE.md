# Feature: Jadwal Booking Lapangan

## Overview
Menambahkan informasi jadwal booking yang sudah terisi untuk membantu user melihat slot waktu yang tersedia sebelum dan sesudah melakukan booking.

## Fitur yang Ditambahkan

### 1. Jadwal di Halaman Detail Booking (`/bookings/[id]`)
**Lokasi:** `src/app/bookings/[id]/page.tsx`

**Fitur:**
- Menampilkan semua booking untuk lapangan yang sama pada tanggal yang sama
- Highlight booking user saat ini dengan badge "Booking Anda"
- Menampilkan status setiap booking (Confirmed/Pending)
- Menampilkan nama booking (atau "Private" jika hide_name = true)
- Informasi jam operasional (09:00 - 22:00)
- Info slot yang masih tersedia

**Tampilan:**
```
┌─────────────────────────────────────┐
│ Jadwal Lapangan                     │
│ Jadwal booking untuk Lapangan A    │
│ pada 12 Mei 2026                    │
├─────────────────────────────────────┤
│ 🕐 09:00 - 11:00                    │
│    Ridwan              [Booking Anda]│
│                        [Pending]     │
├─────────────────────────────────────┤
│ 🕐 14:00 - 16:00                    │
│    John Doe            [Confirmed]   │
├─────────────────────────────────────┤
│ ℹ️ Jam Operasional                  │
│    09:00 - 22:00                    │
│    Slot yang tidak tertera masih    │
│    tersedia untuk booking           │
└─────────────────────────────────────┘
```

### 2. Jadwal di Halaman Detail Court (`/courts/[id]`)
**Lokasi:** 
- `src/app/courts/[id]/page.tsx` (server component)
- `src/components/courts/court-schedule.tsx` (client component)

**Fitur:**
- **Date picker** untuk memilih tanggal yang ingin dilihat
- Default tanggal = hari ini
- Real-time loading state saat fetch data
- Menampilkan jadwal terisi dengan visual merah (booked)
- Menampilkan jumlah slot tersedia
- List jam-jam yang masih tersedia
- Informasi jam operasional dan aturan booking

**Tampilan:**
```
┌─────────────────────────────────────┐
│ Jadwal Booking                      │
│ Lihat jadwal yang sudah terisi      │
├─────────────────────────────────────┤
│ Pilih Tanggal                       │
│ 📅 [12/05/2026]                     │
├─────────────────────────────────────┤
│ Jadwal Terisi (2)                   │
│                                     │
│ 🕐 09:00 - 11:00                    │
│    Ridwan              [Pending]    │
│                                     │
│ 🕐 14:00 - 16:00                    │
│    Private             [Confirmed]  │
├─────────────────────────────────────┤
│ ℹ️ Slot Tersedia (11)               │
│    11:00, 12:00, 13:00, 16:00,     │
│    17:00, +6 lainnya               │
├─────────────────────────────────────┤
│ Jam Operasional                     │
│ 09:00 - 22:00                       │
│ Booking minimal 1 jam, maksimal     │
│ 5 jam per booking                   │
└─────────────────────────────────────┘
```

**Jika Tidak Ada Booking:**
```
┌─────────────────────────────────────┐
│ ✅ Semua Slot Tersedia!             │
│    Belum ada booking untuk          │
│    tanggal ini                      │
└─────────────────────────────────────┘
```

## Technical Details

### Query untuk Fetch Schedule
```typescript
const { data: courtSchedule } = await supabase
  .from('bookings')
  .select('id, start_time, end_time, status, booking_name, hide_name')
  .eq('court_id', booking.court_id)
  .eq('booking_date', booking.booking_date)
  .in('status', ['pending', 'confirmed'])
  .order('start_time', { ascending: true })
```

**Filter:**
- Hanya booking dengan status `pending` atau `confirmed`
- Booking yang `cancelled` tidak ditampilkan
- Diurutkan berdasarkan `start_time` ascending

### Client Component Features
**File:** `src/components/courts/court-schedule.tsx`

**State Management:**
```typescript
const [selectedDate, setSelectedDate] = useState<string>('')
const [schedule, setSchedule] = useState<BookingSlot[]>([])
const [loading, setLoading] = useState(false)
```

**Auto-fetch on Date Change:**
```typescript
useEffect(() => {
  if (!selectedDate) return
  fetchSchedule()
}, [selectedDate, courtId])
```

**Available Slots Calculation:**
- Operating hours: 09:00 - 22:00
- Loop through each hour
- Check if hour is booked
- Return list of available hours

## User Benefits

### Sebelum Booking (Court Detail Page)
1. ✅ User bisa lihat jadwal yang sudah terisi
2. ✅ User bisa pilih tanggal untuk cek ketersediaan
3. ✅ User tahu jam berapa yang masih tersedia
4. ✅ Mengurangi booking yang bentrok
5. ✅ User bisa planning waktu booking dengan lebih baik

### Setelah Booking (Booking Detail Page)
1. ✅ User bisa lihat booking lain di lapangan yang sama
2. ✅ User tahu apakah lapangan ramai atau sepi
3. ✅ User bisa koordinasi dengan booking lain (misal: turnamen)
4. ✅ Transparansi jadwal lapangan

## Privacy & Security

### Hide Name Feature
- Jika `hide_name = true`, tampilkan "Private" bukan nama booking
- Tetap tampilkan jam booking (untuk transparansi ketersediaan)
- User lain tidak bisa tahu siapa yang booking

### Authorization
- Semua user authenticated bisa lihat jadwal
- Tidak ada data sensitif yang ditampilkan
- Hanya menampilkan: waktu, status, nama (atau "Private")

## Styling & UX

### Color Coding
- **Blue** = Booking user saat ini (di booking detail page)
- **Red** = Slot terisi/booked
- **Green** = Slot tersedia / confirmed
- **Yellow** = Pending
- **Gray** = Info umum

### Responsive Design
- Mobile-friendly
- Card layout yang clean
- Icons untuk visual clarity
- Badge untuk status

## Future Enhancements (Optional)

1. **Real-time Updates**
   - Gunakan Supabase Realtime untuk auto-refresh jadwal
   - User langsung lihat booking baru tanpa refresh

2. **Calendar View**
   - Tampilan kalender bulanan
   - Click tanggal untuk lihat detail

3. **Quick Book from Schedule**
   - Click slot tersedia langsung redirect ke booking form
   - Pre-fill tanggal dan waktu

4. **Booking Heatmap**
   - Visual heatmap untuk lihat hari/jam paling ramai
   - Rekomendasi waktu booking terbaik

5. **Recurring Bookings**
   - Lihat pola booking berulang
   - Booking mingguan/bulanan

## Testing Checklist

- [ ] Buka `/courts/[id]` - jadwal muncul dengan benar
- [ ] Pilih tanggal berbeda - jadwal update
- [ ] Buka `/bookings/[id]` - jadwal untuk tanggal booking muncul
- [ ] Booking user di-highlight dengan "Booking Anda"
- [ ] Hide name = true menampilkan "Private"
- [ ] Slot tersedia dihitung dengan benar
- [ ] Loading state muncul saat fetch
- [ ] Responsive di mobile
- [ ] Tidak ada error di console

## Files Modified/Created

### Created:
- `src/components/courts/court-schedule.tsx` - Client component untuk jadwal interaktif

### Modified:
- `src/app/courts/[id]/page.tsx` - Tambah CourtSchedule component
- `src/app/bookings/[id]/page.tsx` - Tambah jadwal booking section

### No Changes Needed:
- Database schema (menggunakan tabel bookings yang sudah ada)
- API routes (menggunakan Supabase client-side query)
- Types (menggunakan types yang sudah ada)
