-- Sushi Counter App Database Schema

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  venmo_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create individual_orders table
CREATE TABLE IF NOT EXISTS individual_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  three_roll_combo TEXT[],
  single_roll TEXT,
  beverage TEXT,
  miso_soup BOOLEAN NOT NULL DEFAULT FALSE,
  total NUMERIC(10, 2) NOT NULL,
  packaged BOOLEAN NOT NULL DEFAULT FALSE,
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_individual_orders_order_id ON individual_orders(order_id);

-- Enable Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_orders ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since this is a collaborative app)
-- Anyone can read menu items
CREATE POLICY "Allow public read access to menu_items" ON menu_items
  FOR SELECT USING (true);

-- Anyone can insert/update/delete menu items
CREATE POLICY "Allow public write access to menu_items" ON menu_items
  FOR ALL USING (true);

-- Anyone can read orders
CREATE POLICY "Allow public read access to orders" ON orders
  FOR SELECT USING (true);

-- Anyone can insert/update orders
CREATE POLICY "Allow public write access to orders" ON orders
  FOR ALL USING (true);

-- Anyone can read individual orders
CREATE POLICY "Allow public read access to individual_orders" ON individual_orders
  FOR SELECT USING (true);

-- Anyone can insert/update individual orders
CREATE POLICY "Allow public write access to individual_orders" ON individual_orders
  FOR ALL USING (true);

-- Insert default menu items
INSERT INTO menu_items (name, description) VALUES
  ('Spicy salmon', 'Fresh salmon with spicy mayo'),
  ('Volcano', 'Tempura shrimp with spicy sauce'),
  ('Cooked tuna', 'Seared tuna with teriyaki'),
  ('Teriyaki chicken', 'Grilled chicken teriyaki'),
  ('Miso eggplant', 'Grilled miso eggplant'),
  ('Avo & cucumber', 'Fresh avocado and cucumber'),
  ('Salmon', 'Classic salmon roll'),
  ('Spicy shrimp', 'Shrimp with spicy mayo'),
  ('Tempura shrimp', 'Crispy tempura shrimp'),
  ('Sunshine', 'Mango and avocado'),
  ('Spicy tuna', 'Fresh tuna with spicy mayo')
ON CONFLICT DO NOTHING;

