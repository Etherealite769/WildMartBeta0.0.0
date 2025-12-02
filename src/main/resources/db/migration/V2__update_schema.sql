-- V2__update_schema.sql

-- Drop existing foreign keys and constraints before altering column types if necessary
-- Note: PostgreSQL automatically manages sequences for SERIAL/IDENTITY columns.
-- Changing primary key types might require more careful handling, often dropping and recreating.
-- For simplicity and to avoid data loss on an existing DB, we might usually
-- create new columns, migrate data, and then drop old columns.
-- However, for a fresh development setup, direct type alteration is often acceptable.

-- This script assumes the database is either new or can handle direct ALTER TYPE.
-- If not, a more robust migration strategy would be needed (e.g., new columns, data migration, rename, drop old).

-- Update Users table
ALTER TABLE users ALTER COLUMN user_id TYPE INTEGER;
ALTER TABLE users DROP COLUMN IF EXISTS bio;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('BUYER', 'SELLER');
    END IF;
END
$$;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role_enum NOT NULL DEFAULT 'BUYER';
ALTER TABLE users ALTER COLUMN shipping_address TYPE VARCHAR(255);

-- Update Products table
ALTER TABLE products ALTER COLUMN product_id TYPE INTEGER;
ALTER TABLE products ALTER COLUMN description TYPE TEXT; -- Re-add TEXT columnDefinition
-- No change needed for view_count, like_count, average_rating as they exist.

-- Create Vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    discount_id SERIAL PRIMARY KEY,
    discount_code VARCHAR(255) UNIQUE NOT NULL,
    discount_type VARCHAR(255) NOT NULL,
    discount_value DECIMAL(15, 2) NOT NULL,
    minimum_order_amount DECIMAL(15, 2),
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Update Orders table
ALTER TABLE orders ALTER COLUMN order_id TYPE INTEGER;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_seller; -- Drop old FK to seller
ALTER TABLE orders DROP COLUMN IF EXISTS seller_id; -- Remove seller_id column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_id INTEGER;
ALTER TABLE orders ADD CONSTRAINT fk_orders_discount FOREIGN KEY (discount_id) REFERENCES vouchers (discount_id);
ALTER TABLE orders ALTER COLUMN shipping_address TYPE VARCHAR(255);

-- Update Carts table
ALTER TABLE carts ALTER COLUMN cart_id TYPE INTEGER;
ALTER TABLE carts ADD COLUMN IF NOT EXISTS status VARCHAR(255) NOT NULL DEFAULT 'active';
ALTER TABLE carts
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Update Likes table
ALTER TABLE likes ALTER COLUMN like_id TYPE INTEGER;
ALTER TABLE likes ALTER COLUMN user_id TYPE INTEGER;
ALTER TABLE likes ALTER COLUMN product_id TYPE INTEGER;

-- Update Reviews table
ALTER TABLE reviews ALTER COLUMN review_id TYPE INTEGER;
ALTER TABLE reviews ALTER COLUMN product_id TYPE INTEGER;
ALTER TABLE reviews ALTER COLUMN user_id TYPE INTEGER;

-- Update Order_Items table
ALTER TABLE order_items ALTER COLUMN order_item_id TYPE INTEGER;
ALTER TABLE order_items ALTER COLUMN order_id TYPE INTEGER;
ALTER TABLE order_items ALTER COLUMN product_id TYPE INTEGER;

-- Drop Views table if exists
DROP TABLE IF EXISTS views;
