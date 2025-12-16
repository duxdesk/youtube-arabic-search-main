-- Create YouTubers Table in Supabase (with all 10 columns)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS youtubers (
  id BIGSERIAL PRIMARY KEY,
  arabic_name TEXT,
  english_name TEXT,
  channel_url TEXT,
  description TEXT,
  avatar_url TEXT,
  original_id TEXT,
  created_date TIMESTAMP,
  update_date TIMESTAMP,
  created_by_id TEXT,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster searching
CREATE INDEX IF NOT EXISTS idx_youtubers_arabic_name ON youtubers(arabic_name);
CREATE INDEX IF NOT EXISTS idx_youtubers_english_name ON youtubers(english_name);
CREATE INDEX IF NOT EXISTS idx_youtubers_original_id ON youtubers(original_id);

-- Enable Row Level Security
ALTER TABLE youtubers ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON youtubers
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated insert" ON youtubers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON youtubers
  FOR UPDATE USING (auth.role() = 'authenticated');
