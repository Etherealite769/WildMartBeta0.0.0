-- V10__add_likes_and_reviews_updates.sql
-- Add missing columns to likes and reviews tables

-- Add liked_at column to likes table if missing
ALTER TABLE likes ADD COLUMN IF NOT EXISTS liked_at TIMESTAMP DEFAULT NOW();

-- Add review_text column to reviews table if comment column doesn't exist
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_text TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Drop old comment column if it exists (only if review_text is already populated)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='comment') THEN
        UPDATE reviews SET review_text = comment WHERE review_text IS NULL AND comment IS NOT NULL;
        ALTER TABLE reviews DROP COLUMN comment;
    END IF;
END $$;
