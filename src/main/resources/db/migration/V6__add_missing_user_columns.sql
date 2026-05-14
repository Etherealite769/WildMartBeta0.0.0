-- V6__add_missing_user_columns.sql
-- Add missing columns to users table and rename password column

-- First, rename password column to password_hash
ALTER TABLE users RENAME COLUMN password TO password_hash;

-- Add missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_info_encrypted TEXT;
