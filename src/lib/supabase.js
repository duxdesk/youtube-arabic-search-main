import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqmbggjbrhofxsmosgww.supabase.co';  // Paste your URL here
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbWJnZ2picmhvZnhzbW9zZ3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTc5ODYsImV4cCI6MjA4MDYzMzk4Nn0.NgBWfpVjr1SFxDxnQQ7Hx18PjWcoAgEhWX3s-soK2gI';  // Paste your anon key here

export const supabase = createClient(supabaseUrl, supabaseKey);
