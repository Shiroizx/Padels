-- Script untuk update payment methods dengan QR code dan informasi lengkap

-- Update GoPay dengan nomor telepon
UPDATE payment_methods 
SET 
  phone_number = '081234567890',
  instructions = 'Transfer ke nomor GoPay atau scan QR code di bawah'
WHERE name = 'GoPay';

-- Update QRIS dengan instruksi
UPDATE payment_methods 
SET 
  instructions = 'Scan QR code menggunakan aplikasi pembayaran favorit Anda (GoPay, OVO, Dana, ShopeePay, dll)'
WHERE name = 'QRIS';

-- Contoh: Update payment method dengan QR code image
-- Catatan: Upload QR code image ke storage bucket 'qr-codes' terlebih dahulu
-- Kemudian update dengan path file

-- Update GoPay dengan QR code
UPDATE payment_methods 
SET qr_code_image = 'gopay-qr.png'
WHERE name = 'GoPay';

-- Update QRIS dengan QR code
UPDATE payment_methods 
SET qr_code_image = 'qris-code.png'
WHERE name = 'QRIS';

-- Contoh: Menambahkan payment method baru dengan QR code
INSERT INTO payment_methods (
  name, 
  type, 
  phone_number, 
  qr_code_image, 
  instructions, 
  display_order,
  is_active
) VALUES (
  'OVO',
  'e_wallet',
  '081234567890',
  'ovo-qr.png',
  'Transfer ke nomor OVO atau scan QR code',
  6,
  true
);

-- Contoh: Menambahkan payment method Dana
INSERT INTO payment_methods (
  name, 
  type, 
  phone_number, 
  qr_code_image, 
  instructions, 
  display_order,
  is_active
) VALUES (
  'DANA',
  'e_wallet',
  '081234567890',
  'dana-qr.png',
  'Transfer ke nomor DANA atau scan QR code',
  7,
  true
);

-- Contoh: Menambahkan payment method ShopeePay
INSERT INTO payment_methods (
  name, 
  type, 
  phone_number, 
  qr_code_image, 
  instructions, 
  display_order,
  is_active
) VALUES (
  'ShopeePay',
  'e_wallet',
  '081234567890',
  'shopeepay-qr.png',
  'Transfer ke nomor ShopeePay atau scan QR code',
  8,
  true
);

-- Lihat semua payment methods
SELECT 
  id,
  name,
  type,
  account_number,
  account_name,
  bank_name,
  phone_number,
  qr_code_image,
  instructions,
  is_active,
  display_order
FROM payment_methods
ORDER BY display_order;
