-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'bank_transfer', 'e_wallet', 'qris', 'cash'
  account_number VARCHAR(100), -- For bank transfer
  account_name VARCHAR(100), -- For bank transfer
  bank_name VARCHAR(100), -- For bank transfer
  qr_code_image TEXT, -- For QRIS (stored in storage)
  phone_number VARCHAR(20), -- For e-wallet
  instructions TEXT, -- Additional instructions
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active payment methods
CREATE INDEX idx_payment_methods_active ON payment_methods(is_active, display_order);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active payment methods
CREATE POLICY "Anyone can view active payment methods"
  ON payment_methods
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert payment methods
CREATE POLICY "Only admins can insert payment methods"
  ON payment_methods
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can update payment methods
CREATE POLICY "Only admins can update payment methods"
  ON payment_methods
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can delete payment methods
CREATE POLICY "Only admins can delete payment methods"
  ON payment_methods
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Insert default payment methods
INSERT INTO payment_methods (name, type, account_number, account_name, bank_name, instructions, display_order) VALUES
('Transfer Bank BCA', 'bank_transfer', '1234567890', 'PT Padel Court', 'BCA', 'Transfer ke rekening BCA dan upload bukti transfer', 1),
('Transfer Bank Mandiri', 'bank_transfer', '9876543210', 'PT Padel Court', 'Mandiri', 'Transfer ke rekening Mandiri dan upload bukti transfer', 2),
('GoPay', 'e_wallet', NULL, NULL, NULL, 'Scan QRIS atau transfer ke nomor 081234567890', 3),
('QRIS', 'qris', NULL, NULL, NULL, 'Scan QR Code untuk pembayaran', 4),
('Cash', 'cash', NULL, NULL, NULL, 'Bayar langsung di tempat saat datang', 5);

-- Create storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for QR codes
CREATE POLICY "Anyone can view QR codes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'qr-codes');

CREATE POLICY "Admins can upload QR codes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'qr-codes' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update QR codes"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'qr-codes' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete QR codes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'qr-codes' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
