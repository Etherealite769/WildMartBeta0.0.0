-- V4__add_delivery_confirmation_image_to_orders.sql

-- Add delivery_confirmation_image column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_confirmation_image TEXT;