-- V5: Add conversation_id column to messages table
-- This migration ensures the messages table has the conversation_id column

-- Add conversation_id column if it doesn't exist
ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(100);

-- Create indexes for faster queries if they don't exist
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
