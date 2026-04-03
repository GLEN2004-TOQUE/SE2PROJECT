const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dvglcyzwjbyigdvxitvx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2Z2xjeXp3amJ5aWdkdnhpdHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MDMwMDcsImV4cCI6MjA4NzQ3OTAwN30.0I-SLxF4x94frEZ7MUD_ybYwxfWr0roPZozi3l1bNao';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2Z2xjeXp3amJ5aWdkdnhpdHZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkwMzAwNywiZXhwIjoyMDg3NDc5MDA3fQ.ZVDRAAFKcardzO8szCpZmKOVLXnQhYNO7h8XSdF-oNo';

// Admin client 
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Anon client - for public/frontend use
const supabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY
);

module.exports = { supabase, supabaseAdmin };