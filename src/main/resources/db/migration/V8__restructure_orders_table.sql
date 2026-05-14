-- V8__restructure_orders_table.sql
-- Restructure orders table to support OrderItem relationship properly

-- Add new columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(255) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);

-- Migrate data from old columns to new columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='status') THEN
        UPDATE orders SET order_status = status WHERE order_status IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total_price') THEN
        UPDATE orders SET total_amount = total_price WHERE total_amount IS NULL;
    END IF;
END $$;

-- Drop old columns if they exist
ALTER TABLE orders DROP COLUMN IF EXISTS status;
ALTER TABLE orders DROP COLUMN IF EXISTS total_price;

-- Ensure new columns have proper NOT NULL constraints
ALTER TABLE orders ALTER COLUMN order_status SET NOT NULL;
ALTER TABLE orders ALTER COLUMN payment_status SET NOT NULL;
ALTER TABLE orders ALTER COLUMN total_amount SET NOT NULL;

-- Update order_items table if needed
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Remove quantity and product_id from orders table if they exist (moved to order_items)
ALTER TABLE orders DROP COLUMN IF EXISTS quantity;
ALTER TABLE orders DROP COLUMN IF EXISTS product_id;
