-- Create leads table for Real Estate CRM
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'New',
  source VARCHAR(100) DEFAULT 'Website',
  ai_summary TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Add row level security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for anon users (read-only)
CREATE POLICY "Allow read for anon users" ON leads
  FOR SELECT
  TO anon
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed some sample data for development
INSERT INTO leads (name, email, phone, status, source, ai_summary, notes) VALUES
('Test User 1', 'test1@example.com', '+1234567890', 'New', 'Website', 'Lead extraído automáticamente: Interesado en casas de 3 habitaciones cerca de escuela.', 'Sample note 1'),
('Test User 2', 'test2@example.com', '+0987654321', 'Contacted', 'WhatsApp', 'Lead extraído automáticamente: Cliente busca apartamento en zona céntrica.', 'Sample note 2'),
('Test User 3', 'test3@example.com', NULL, 'Qualified', 'Referral', 'Lead extraído automáticamente: Inversionista interesado en propiedades comerciales.', 'Sample note 3')
ON CONFLICT (email) DO NOTHING;